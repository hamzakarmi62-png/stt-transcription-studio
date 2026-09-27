import os
import re
import shutil
import tempfile
import threading
import time
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, StreamingResponse
from pydantic import BaseModel

import requests

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

class _AudioHealth:
    """Is the active bucket serving downloads right now? Cached briefly so a
    blocked window (B2 daily cap) doesn't add a probe to every request."""

    state = "unknown"
    until = 0.0


_audio_health = _AudioHealth()

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

    # The bucket is now the source of truth. Free the ephemeral-disk copy once
    # transcription has finished, so a heavy upload day can't fill the small
    # free-instance disk — ensure_local_audio re-fetches on demand.
    if not temporary and (session or {}).get("status") == "done":
        try:
            dest.unlink(missing_ok=True)
            print(f"Freed local disk copy of {session_id} after cloud archival")
        except OSError:
            pass


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
        # When the active bucket temporarily refuses downloads (B2 daily cap,
        # outage) pre-migration media still plays from its Supabase copy.
        _b2_health = {"state": "unknown", "until": 0.0}
        try:
            import time as _time

            now = _time.time()
            healthy = getattr(_audio_health, "state", "unknown")
            if now < getattr(_audio_health, "until", 0):
                healthy = getattr(_audio_health, "state")
            else:
                try:
                    probe_url = storage.presign_get(key)
                    probe = requests.get(probe_url, timeout=15, headers={"Range": "bytes=0-0"})
                    healthy = "ok" if probe.status_code in (200, 206) else "blocked"
                except Exception:
                    # the bucket cannot even hand out a download URL right now
                    healthy = "blocked"
                _audio_health.state = healthy
                _audio_health.until = now + (300 if healthy == "ok" else 120)
        except Exception:
            healthy = "unknown"

        if healthy != "blocked":
            try:
                return RedirectResponse(url=storage.presign_get(key), status_code=302)
            except Exception as exc:
                print("Signed URL failed, falling back to local file:", exc)
        else:
            print("Active bucket downloads are blocked — trying the Supabase copy")
            try:
                if storage._sb_exists(key):
                    return RedirectResponse(url=storage._sb_presign_get(key, 3600), status_code=302)
            except Exception as exc:
                print("Supabase fallback failed:", exc)

    # Fallback: serve from local disk with Range support
    path = ensure_local_audio(session)
    if not path.exists() or path.stat().st_size == 0:
        raise HTTPException(404, "Audio file not found on disk or cloud")    # Taken from the file actually served: an audio-only archive is an mp3 even
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


# ── Import from an internet link (direct media URL or YouTube etc.) ──────────

class FromUrlRequest(BaseModel):
    url: str

_BLOCKED_HOSTS = ("localhost", "127.", "10.", "192.168.", "172.16.", "172.17.",
                  "172.18.", "172.19.", "172.2", "172.30.", "172.31.", "169.254.", "[::1]")

_MEDIA_EXTS = (".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".mp4", ".webm", ".mov", ".mkv")


# ── bgutil PO-token server (YouTube bot-check bypass) ───────────────────────

_bgutil_proc = None
_bgutil_lock = threading.Lock()
_bgutil_last_error = ""


def bgutil_status() -> dict:
    """Fast observability for /api/health: is the local PO-token server up,
    and if not, why did its last start attempt fail?"""
    base = (os.environ.get("BGUTIL_BASE_URL") or "http://127.0.0.1:4416").rstrip("/")
    up = False
    if base.startswith("http://127.0.0.1"):
        try:
            up = requests.get(f"{base}/ping", timeout=3).status_code == 200
        except Exception:
            up = False
    return {"up": up, "last_error": _bgutil_last_error[:200]}


def _ensure_bgutil() -> str:
    """Return the PO-token server base URL, starting it first if needed.
    The bgutil Node server runs in-container on localhost and issues the
    BotGuard attestation YouTube demands from datacenter IPs — without it
    every player client hits the "confirm you're not a bot" wall."""
    global _bgutil_last_error
    base = (os.environ.get("BGUTIL_BASE_URL") or "http://127.0.0.1:4416").rstrip("/")
    if not base.startswith("http://127.0.0.1"):
        return base  # external sidecar — managed elsewhere
    try:
        if requests.get(f"{base}/ping", timeout=3).status_code == 200:
            return base
    except Exception:
        pass
    global _bgutil_proc
    script = Path(__file__).resolve().parents[2] / "pot_server" / "build" / "main.js"
    node = shutil.which("node")
    if not script.exists() or not node:
        _bgutil_last_error = "script or node missing"
        return ""
    with _bgutil_lock:
        try:
            if requests.get(f"{base}/ping", timeout=3).status_code == 200:
                return base
        except Exception:
            pass
        import subprocess
        log_file = Path(tempfile.gettempdir()) / "bgutil_server.log"
        try:
            with log_file.open("w", encoding="utf-8") as lf:
                _bgutil_proc = subprocess.Popen(
                    [node, str(script), "--host", "127.0.0.1", "--port", "4416"],
                    stdout=lf,
                    stderr=subprocess.STDOUT,
                )
            for _ in range(15):
                try:
                    if requests.get(f"{base}/ping", timeout=3).status_code == 200:
                        print("bgutil PO-token server started on :4416")
                        return base
                except Exception:
                    pass
                time.sleep(2)
            tail = ""
            try:
                tail = log_file.read_text(encoding="utf-8", errors="ignore")[-300:]
            except Exception:
                pass
            _bgutil_last_error = f"no ping after spawn; log: {tail}"
            print("bgutil PO-token server failed to start:", _bgutil_last_error[:200])
        except Exception as exc:
            _bgutil_last_error = f"spawn failed: {exc}"
            print("bgutil spawn failed:", exc)
        return ""


class _PotCapture:
    """yt-dlp verbose logger keeping a bounded tail — enough to see whether
    the PO-token provider engaged and which player API responded."""

    def __init__(self):
        self.lines: list[str] = []

    def _keep(self, msg):
        try:
            self.lines.append(str(msg)[:220])
            if len(self.lines) > 400:
                del self.lines[:200]
        except Exception:
            pass

    def debug(self, msg):
        self._keep(msg)

    def info(self, msg):
        pass

    def warning(self, msg):
        self._keep("WARN " + str(msg))

    def error(self, msg):
        self._keep("ERR " + str(msg))


def _download_thread(session_id: str, url: str) -> None:
    """Runs off the request path: fetch the media, register it as the session's
    file, archive to the bucket — then the normal transcription flow takes over."""
    pot_cap, bgutil_url = None, ""
    try:
        upload_path = settings.upload_path
        upload_path.mkdir(parents=True, exist_ok=True)
        dest_base = str(upload_path / session_id)
        filename, dest = None, None

        is_yt = any(d in url for d in ("youtube.com/", "youtu.be/", "dailymotion.com/", "vimeo.com/", "facebook.com/", "tiktok.com/"))
        if is_yt:
            import yt_dlp

            def _hook(d):
                if d.get("status") == "finished":
                    print(f"URL import {session_id}: download finished")

            # Owner-provided YouTube cookies (secrets/youtube_cookies.txt in the
            # bucket) bypass the datacenter bot-check for EVERY user's import.
            cookie_tmp = None
            try:
                cdata = storage.get_bytes("secrets/youtube_cookies.txt")
                if cdata:
                    cookie_tmp = Path(tempfile.gettempdir()) / f"yt_cookies_{session_id}.txt"
                    cookie_tmp.write_bytes(cdata)
            except Exception:
                cookie_tmp = None

            # PO-token provider: bgutil generates the BotGuard attestation
            # YouTube demands from datacenter IPs.
            bgutil_url = _ensure_bgutil()
            pot_args = {"youtubepot-bgutilhttp": {"base_url": [bgutil_url]}} if bgutil_url else None
            if pot_args:
                print(f"URL import {session_id}: bgutil PO-token provider ready")

            # Datacenter IPs often trigger YouTube's bot check with the default
            # web client — fall back through alternate player clients.
            client_attempts = [
                None,
                {"youtube": {"player_client": ["web_embedded"]}},
                {"youtube": {"player_client": ["android_vr"]}},
                {"youtube": {"player_client": ["android"]}},
                {"youtube": {"player_client": ["ios"]}},
                {"youtube": {"player_client": ["tv"]}},
                {"youtube": {"player_client": ["mweb"]}},
            ]
            info, last_err = None, None
            pot_cap = _PotCapture()
            try:
                for extractor_args in client_attempts:
                    import imageio_ffmpeg
                    opts = {
                        "outtmpl": dest_base + ".%(ext)s",
                        # YouTube serves video-only + audio-only DASH streams for
                        # logged-in sessions — the bundled ffmpeg merges them.
                        "format": "bv*[height<=720]+ba/b",
                        "ffmpeg_location": imageio_ffmpeg.get_ffmpeg_exe(),
                        "max_filesize": settings.max_upload_mb * 1024 * 1024,
                        "noplaylist": True,
                        "progress_hooks": [_hook],
                        "logger": pot_cap,
                        # yt-dlp enables only deno for the JS n-challenge by
                        # default; node is what the container has.
                        "js_runtimes": {"node": {}},
                    }
                    if cookie_tmp and cookie_tmp.exists():
                        opts["cookiefile"] = str(cookie_tmp)
                    if extractor_args or pot_args:
                        merged = dict(extractor_args or {})
                        if pot_args:
                            merged.update(pot_args)
                        opts["extractor_args"] = merged
                    try:
                        with yt_dlp.YoutubeDL(opts) as ydl:
                            info = ydl.extract_info(url, download=True)
                        break
                    except Exception as exc:
                        last_err = exc
                        print(f"URL import {session_id}: player client failed ({str(exc)[:90]}), trying next")
                        continue
            finally:
                if cookie_tmp:
                    cookie_tmp.unlink(missing_ok=True)
            if info is None:
                raise RuntimeError(last_err)
            import glob
            candidates = [p for p in glob.glob(dest_base + ".*") if not p.endswith((".part", ".ytdl"))]
            if not candidates:
                raise RuntimeError("yt-dlp produced no file")
            dest = Path(candidates[0])
            filename = (info.get("title") or session_id)[:120] + dest.suffix
        else:
            # direct media link — stream to disk with a size guard
            import requests as rq
            with rq.get(url, stream=True, timeout=(15, 120), headers={"User-Agent": "Mozilla/5.0"}) as r:
                r.raise_for_status()
                size = 0
                dest = Path(dest_base + ".mp4")
                with dest.open("wb") as fh:
                    for chunk in r.iter_content(512 * 1024):
                        if not chunk:
                            continue
                        size += len(chunk)
                        if size > settings.max_upload_mb * 1024 * 1024:
                            raise RuntimeError(f"Le fichier dépasse {settings.max_upload_mb} MB")
                        fh.write(chunk)
            # extension from the URL path if it carries one
            from urllib.parse import urlparse
            path_ext = os.path.splitext(urlparse(url).path)[1].lower()
            if path_ext in _MEDIA_EXTS and dest.suffix != path_ext:
                renamed = dest.with_suffix(path_ext)
                dest.rename(renamed)
                dest = renamed

        size = dest.stat().st_size
        if size <= 0:
            raise RuntimeError("Le fichier téléchargé est vide.")
        mime = MIME_BY_EXT.get(dest.suffix.lower().lstrip("."), "application/octet-stream")
        safe_title = filename or (session_id + dest.suffix)
        db.update_session(session_id, filename=safe_title, audio_path=str(dest), status="uploaded")
        print(f"URL import {session_id}: {size / (1024 * 1024):.1f} MB archived as {dest.name}")
        threading.Thread(target=_publish_to_cloud, args=(session_id, dest, mime, size), daemon=True).start()
    except Exception as exc:
        msg = str(exc)
        interesting = []
        if pot_cap and pot_cap.lines:
            keys = ("pot", "token", "player", "format", "bot", "visitor", "fetching")
            for line in pot_cap.lines:
                low = line.lower()
                if any(k in low for k in keys):
                    interesting.append(line)
        pot_tail = " | ".join(interesting[-5:])
        diag = f" [bgutil={bgutil_url or 'off'}]" + (f" [pot: {pot_tail[:240]}]" if pot_tail else "")
        if "Sign in to confirm" in msg or "not a bot" in msg:
            user_msg = ("يوتيوب يطلب تحققاً أمنياً من خوادم السحابة لهذا الرابط. "
                        "حمّل الفيديو على جهازك وارفعه كملف، أو استخدم رابطاً مباشراً للملف (MP4/MP3).")
        elif "Sign in to confirm" in msg or "bot" in msg:
            user_msg = "المنصة المصدرة تطلب تحققاً أمنياً — حمّل الملف على جهازك وارفعه، أو استخدم رابطاً مباشراً."
        else:
            user_msg = f"فشل تحميل الرابط: {msg[:150]}"
        print(f"URL import failed for {session_id}: {msg[:200]}{diag[:300]}")
        db.update_session(session_id, status="error", error=user_msg)


@router.post("/sessions/from-url")
def create_from_url(req: FromUrlRequest, request: Request):
    """Create a session from an internet link; the download runs in the
    background and the session flips to 'uploaded' when ready to transcribe."""
    user_id = user_id_from_request(request)
    if not user_id:
        raise HTTPException(401, "Authentification requise.")
    url = (req.url or "").strip()
    if not re.match(r"^https?://", url, re.IGNORECASE):
        raise HTTPException(400, "الرابط غير صالح — يجب أن يبدأ بـ http أو https.")
    from urllib.parse import urlparse
    host = (urlparse(url).hostname or "").lower()
    if not host or any(host == b or host.startswith(b) for b in _BLOCKED_HOSTS):
        raise HTTPException(400, "الرابط غير مسموح به.")

    session_id = uuid.uuid4().hex[:12]
    # The request must answer immediately: the catalog sync is heavy (bucket
    # read-modify-write), so the session lands in local SQLite here and the
    # cloud copy catches up in the background.
    db.create_session(session_id, filename=url.rsplit("/", 1)[-1][:120] or url,
                      audio_path=str(settings.upload_path / session_id), user_id=user_id,
                      status="downloading", sync_cloud=False)
    threading.Thread(
        target=db.update_session, args=(session_id,), kwargs={"status": "downloading"},
        daemon=True,
    ).start()
    threading.Thread(target=_download_thread, args=(session_id, url), daemon=True).start()
    return {"ok": True, "id": session_id, "status": "downloading"}
