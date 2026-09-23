import shutil
import tempfile
import threading
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, StreamingResponse
from pydantic import BaseModel

from .. import db
from ..config import settings
from ..services import storage
from ..services.audio import extract_audio_track
from .auth import ensure_session_owner, share_token_from_request, user_id_from_request, verify_share_token

router = APIRouter(prefix="/api")

ALLOWED_EXTENSIONS = {"mp3", "wav", "m4a", "ogg", "webm", "mp4", "aac", "flac"}

MIME_BY_EXT = {
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "m4a": "audio/mp4",
    "aac": "audio/aac",
    "flac": "audio/flac",
    "ogg": "audio/ogg",
    "webm": "video/webm",
    "mp4": "video/mp4",
}

MAX_BYTES = settings.max_upload_mb * 1024 * 1024

CHUNK_SIZE = 1024 * 1024

# ── Chunked Upload ─────────────────────────────────────────────────────────────
# Clients split large files into 5 MB slices, POST each to /api/upload/chunk,
# then POST to /api/upload/complete.  The server reassembles them locally before
# handing off to the normal session + cloud pipeline.

def _chunks_dir(upload_id: str) -> Path:
    safe_id = "".join(c for c in upload_id if c.isalnum() or c in "-_")
    chunks_root = settings.upload_path / "chunks"
    chunks_root.mkdir(parents=True, exist_ok=True)
    target = chunks_root / safe_id
    target.mkdir(parents=True, exist_ok=True)
    return target



class ChunkInitResponse(BaseModel):
    upload_id: str


class CompleteRequest(BaseModel):
    upload_id: str
    filename: str
    total_chunks: int


@router.post("/upload/init")
def init_chunked_upload():
    """Return a fresh upload_id the client will use for all subsequent chunk POSTs."""
    upload_id = uuid.uuid4().hex[:16]
    _chunks_dir(upload_id)
    return {"upload_id": upload_id}


@router.post("/upload/chunk")
async def upload_chunk(
    upload_id: str = Form(...),
    chunk_index: int = Form(...),
    file: UploadFile = File(...),
):
    """Receive one chunk and save it to a temp directory."""
    chunk_dir = _chunks_dir(upload_id)
    chunk_path = chunk_dir / f"{chunk_index:06d}"
    data = await file.read()
    chunk_path.write_bytes(data)
    return {"ok": True, "chunk_index": chunk_index, "bytes": len(data)}


@router.post("/upload/complete")
def complete_chunked_upload(req: CompleteRequest, request: Request):
    """Assemble all chunks into a single file and create a session."""
    user_id = user_id_from_request(request)
    if not user_id:
        raise HTTPException(401, "Authentification requise.")
    chunk_dir = _chunks_dir(req.upload_id)
    chunk_files = sorted(chunk_dir.glob("??????"))
    if not chunk_files:
        raise HTTPException(400, "لم يتم استلام أي أجزاء، يرجى إعادة المحاولة")

    filename = req.filename or "recording.webm"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "webm"
    if ext not in ALLOWED_EXTENSIONS:
        shutil.rmtree(chunk_dir, ignore_errors=True)
        raise HTTPException(400, f"Unsupported file type '.{ext}'")

    settings.upload_path.mkdir(parents=True, exist_ok=True)
    session_id = uuid.uuid4().hex[:12]
    stored_name = f"{session_id}.{ext}"
    dest = settings.upload_path / stored_name

    # Verify we received all expected chunks
    chunk_files = sorted(chunk_dir.glob("??????"))
    if len(chunk_files) != req.total_chunks:
        raise HTTPException(
            400,
            f"أجزاء مفقودة: استُقبل {len(chunk_files)} من أصل {req.total_chunks}"
        )

    # Merge
    total_size = 0
    with dest.open("wb") as out:
        for cf in chunk_files:
            data = cf.read_bytes()
            out.write(data)
            total_size += len(data)
            if total_size > MAX_BYTES:
                out.close()
                dest.unlink(missing_ok=True)
                shutil.rmtree(chunk_dir, ignore_errors=True)
                raise HTTPException(413, f"الملف أكبر من الحد المسموح ({settings.max_upload_mb} MB)")

    # Clean up temp chunks
    shutil.rmtree(chunk_dir, ignore_errors=True)

    mime_type = MIME_BY_EXT.get(ext, "application/octet-stream")
    session = db.create_session(session_id, filename, str(dest), user_id=user_id)
    threading.Thread(
        target=_publish_to_cloud, args=(session_id, dest, mime_type, total_size), daemon=True
    ).start()
    return session


@router.delete("/upload/abort/{upload_id}")
def abort_chunked_upload(upload_id: str):
    """Clean up a partial upload."""
    chunk_dir = _chunks_dir(upload_id)
    if chunk_dir.exists():
        shutil.rmtree(chunk_dir, ignore_errors=True)
    return {"ok": True}




def _validate_and_save(file: UploadFile) -> tuple[str, str, Path, str, int]:
    filename = file.filename or "recording.webm"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "webm"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '.{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}")
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    session_id = uuid.uuid4().hex[:12]
    stored_name = f"{session_id}.{ext}"
    dest = settings.upload_path / stored_name
    size = 0
    with dest.open("wb") as out:
        while True:
            chunk = file.file.read(CHUNK_SIZE)
            if not chunk:
                break
            out.write(chunk)
            size += len(chunk)
            if size > MAX_BYTES:
                out.close()
                dest.unlink(missing_ok=True)
                raise HTTPException(413, f"الملف أكبر من الحد المسموح ({settings.max_upload_mb} MB)")

    mime_type = MIME_BY_EXT.get(ext, "application/octet-stream")
    return session_id, filename, dest, mime_type, size


def _cloud_payload(session_id: str, dest: Path, mime_type: str, size: int):
    """What to archive: (path, object key, mime, is_temporary), or None to skip.

    Supabase's 1 GB bucket cannot hold every original, so media that exceeds
    the keep-limits falls back to a mono 16 kHz mp3 track. Anything that fits
    is archived as-is: original videos keep their picture (a <video> element
    fed an mp3 plays a black screen with sound), and audio uploads keep full
    quality instead of being re-encoded to telephone-grade mono.
    """
    if not storage.audio_only():
        return dest, dest.name, mime_type, False

    if db.media_kind(dest.name) == "video":
        keep_limit = settings.cloud_video_max_mb * 1024 * 1024
    else:
        keep_limit = settings.cloud_upload_max_mb * 1024 * 1024
    if size <= keep_limit:
        return dest, dest.name, mime_type, False

    tmp = Path(tempfile.gettempdir()) / f"{session_id}.cloud.mp3"
    try:
        extract_audio_track(dest, tmp)
        if tmp.exists() and tmp.stat().st_size > 0:
            return tmp, f"{session_id}.mp3", "audio/mpeg", True
    except Exception as exc:
        # No audio stream, or a container PyAV cannot open.
        print(f"Audio extraction failed for {dest.name}: {exc}")
    tmp.unlink(missing_ok=True)

    print(
        f"Cloud archival skipped for {dest.name}: "
        f"{size / (1024 * 1024):.0f} MB exceeds the {keep_limit / (1024 * 1024):.0f} MB limit"
    )
    return None


def _publish_to_cloud(session_id: str, dest: Path, mime_type: str, size: int) -> None:
    """Runs off the request path: a large file must not keep /upload open."""
    if not storage.enabled():
        return

    payload = _cloud_payload(session_id, dest, mime_type, size)
    if payload is None:
        return
    src, key, mime, temporary = payload

    try:
        storage.put_file(src, key, mime)
    except Exception as exc:
        print("Cloud upload failed:", exc)
        return
    finally:
        if temporary:
            src.unlink(missing_ok=True)

    session = db.get_session(session_id)
    merged = dict((session or {}).get("settings") or {})
    # Legacy sessions carry a bare True meaning supabase.
    merged["cloud"] = storage.driver()
    # Audio-only archival renames the object, so playback cannot derive the key
    # from audio_path any more.
    merged["cloud_key"] = key
    db.update_session(session_id, settings=merged)


def _cloud_backend(session: dict) -> str:
    flag = (session.get("settings") or {}).get("cloud")
    if flag in ("s3", "supabase"):
        return flag
    return "supabase" if flag else ""


def _cloud_key(session_or_path) -> str:
    """Object name in the bucket for a session."""
    if isinstance(session_or_path, dict):
        stored = (session_or_path.get("settings") or {}).get("cloud_key")
        if stored:
            return stored
        return db.media_basename(session_or_path.get("audio_path", ""))
    return db.media_basename(str(session_or_path))


@router.post("/upload")
def upload_audio(file: UploadFile = File(...), request: Request = None):
    user_id = user_id_from_request(request) if request else None
    if not user_id:
        raise HTTPException(401, "Authentification requise.")
    content_length = request.headers.get("content-length") if request else None
    if content_length and content_length.isdigit() and int(content_length) > MAX_BYTES + 1024 * 1024:
        raise HTTPException(413, f"الملف أكبر من الحد المسموح ({settings.max_upload_mb} MB)")
    session_id, filename, dest, mime_type, size = _validate_and_save(file)
    session = db.create_session(session_id, filename, str(dest), user_id=user_id)
    threading.Thread(
        target=_publish_to_cloud, args=(session_id, dest, mime_type, size), daemon=True
    ).start()
    return session


def _local_path_for(session_or_path) -> Path:
    """Where a session's media should live on this disk — no I/O, no network."""
    if isinstance(session_or_path, dict):
        raw_path = session_or_path.get("audio_path", "")
    else:
        raw_path = str(session_or_path)

    # A Windows-style path read on a POSIX host is not absolute there, so this
    # also relocates absolute Windows paths by filename.
    path = Path(raw_path)
    if not path.is_absolute():
        path = settings.upload_path / db.media_basename(raw_path)
    return path


def ensure_local_audio(session_or_path) -> Path:
    path = _local_path_for(session_or_path)

    if path.exists() and path.stat().st_size > 0:
        return path

    path.parent.mkdir(parents=True, exist_ok=True)

    if not storage.enabled():
        return path

    key = _cloud_key(session_or_path)
    if not key:
        return path

    # An audio-only archive is stored under its own name, so restoring it into the
    # original video's filename would leave the extension lying about the bytes.
    target = path if key == path.name else path.parent / key
    if target != path and target.exists() and target.stat().st_size > 0:
        return target

    # The bucket is the source of truth; local disk is only a cache. This is what
    # makes an upload survive the machine being switched off or redeployed.
    if storage.get_to_file(key, target):
        return target
    return path


@router.get("/sessions/{session_id}/audio")
def get_audio(session_id: str, request: Request):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    # Owner token OR a valid share link capability: shared transcripts play
    # their media without exposing the account.
    share_t = share_token_from_request(request)
    if not (share_t and verify_share_token(share_t, session_id)):
        ensure_session_owner(session, user_id_from_request(request))

    # Redirect to the cloud copy only once it actually exists, otherwise large
    # files would 404 and break playback. Signed, so the bucket can stay private.
    key = _cloud_key(session)
    if _cloud_backend(session) and key:
        try:
            return RedirectResponse(url=storage.presign_get(key), status_code=302)
        except Exception as exc:
            print("Signed URL failed, falling back to local file:", exc)

    # Fallback: serve from local disk with Range support
    path = ensure_local_audio(session)
    if not path.exists() or path.stat().st_size == 0:
        raise HTTPException(404, "Audio file not found on disk or cloud")

    # Taken from the file actually served: an audio-only archive is an mp3 even
    # though audio_path still names the original video.
    ext = path.suffix.lstrip(".").lower()
    media_type = MIME_BY_EXT.get(ext, "application/octet-stream")

    file_size = path.stat().st_size
    range_header = request.headers.get("range")
    if range_header:
        try:
            range_val = range_header.strip().replace("bytes=", "")
            start_str, end_str = range_val.split("-")
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1
            end = min(end, file_size - 1)
            length = end - start + 1

            def file_chunk():
                with open(path, "rb") as f:
                    f.seek(start)
                    remaining = length
                    while remaining > 0:
                        chunk = f.read(min(64 * 1024, remaining))
                        if not chunk:
                            break
                        remaining -= len(chunk)
                        yield chunk

            return StreamingResponse(
                file_chunk(),
                status_code=206,
                headers={
                    "Content-Range": f"bytes {start}-{end}/{file_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(length),
                    "Content-Type": media_type,
                },
                media_type=media_type,
            )
        except Exception:
            pass

    return FileResponse(
        path,
        media_type=media_type,
        filename=session["filename"],
        headers={"Accept-Ranges": "bytes", "Cache-Control": "private, max-age=3600"},
    )


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, request: Request = None):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    ensure_session_owner(session, user_id_from_request(request) if request else None)

    local = _local_path_for(session)
    key = _cloud_key(session)
    # An audio-only archive is cached under its own name beside the original.
    cache = local.parent / key if key and key != local.name else None

    local.unlink(missing_ok=True)
    if cache is not None:
        cache.unlink(missing_ok=True)
    if storage.enabled() and key:
        storage.delete(key)

    db.delete_session(session_id)
    return {"ok": True}


@router.post("/jobs/refresh")
def _noop():
    return {"ok": True, "threads": threading.active_count()}
