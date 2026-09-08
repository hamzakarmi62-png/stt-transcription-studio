import os
import shutil
import threading
import uuid
from pathlib import Path

import requests
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from .. import db
from ..config import settings

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

MAX_BYTES = 2000 * 1024 * 1024


def _upload_to_supabase(local_path: str, stored_name: str, mime_type: str):
    url = f"{settings.supabase_url}/storage/v1/object/uploads/{stored_name}"
    headers = {
        "apikey": settings.supabase_key,
        "Authorization": f"Bearer {settings.supabase_key}",
        "Content-Type": mime_type,
    }
    try:
        with open(local_path, "rb") as f:
            data = f.read()
        res = requests.post(url, headers=headers, data=data, timeout=60)
        return res.status_code in (200, 201)
    except Exception as e:
        print("Supabase upload error:", e)
        return False


def _validate_and_save(file: UploadFile) -> tuple[str, str, str]:
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
        shutil.copyfileobj(file.file, out)
        size = dest.stat().st_size
    if size > MAX_BYTES:
        dest.unlink(missing_ok=True)
        raise HTTPException(413, "File too large")
    
    mime_type = MIME_BY_EXT.get(ext, "application/octet-stream")
    _upload_to_supabase(str(dest), stored_name, mime_type)

    return session_id, filename, str(dest)


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    session_id, filename, path = _validate_and_save(file)
    session = db.create_session(session_id, filename, path)
    return session


def ensure_local_audio(session_or_path) -> Path:
    if isinstance(session_or_path, dict):
        raw_path = session_or_path.get("audio_path", "")
    else:
        raw_path = str(session_or_path)
    
    path = Path(raw_path)
    if not path.is_absolute():
        path = settings.upload_path / path.name
    
    if path.exists() and path.stat().st_size > 0:
        return path

    path.parent.mkdir(parents=True, exist_ok=True)
    if settings.supabase_url and settings.supabase_key:
        stored_name = path.name
        headers = {
            "apikey": settings.supabase_key,
            "Authorization": f"Bearer {settings.supabase_key}",
        }
        try:
            # First try authenticated storage endpoint
            auth_url = f"{settings.supabase_url}/storage/v1/object/uploads/{stored_name}"
            r = requests.get(auth_url, headers=headers, timeout=40)
            if r.status_code == 200 and len(r.content) > 0:
                with open(path, "wb") as f:
                    f.write(r.content)
                return path

            # Fallback to public storage endpoint
            pub_url = f"{settings.supabase_url}/storage/v1/object/public/uploads/{stored_name}"
            r_pub = requests.get(pub_url, timeout=40)
            if r_pub.status_code == 200 and len(r_pub.content) > 0:
                with open(path, "wb") as f:
                    f.write(r_pub.content)
                return path
        except Exception as e:
            print("Failed downloading audio from Supabase:", e)
    return path


@router.get("/sessions/{session_id}/audio")
def get_audio(session_id: str):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    path = ensure_local_audio(session)
    if not path.exists() or path.stat().st_size == 0:
        raise HTTPException(404, "Audio file not found on disk or cloud")
            
    ext = path.suffix.lower().lstrip(".")
    media_type = MIME_BY_EXT.get(ext, "application/octet-stream")
    return FileResponse(path, media_type=media_type, filename=session["filename"])


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    Path(session["audio_path"]).unlink(missing_ok=True)
    if settings.supabase_url and settings.supabase_key:
        try:
            stored_name = Path(session["audio_path"]).name
            url = f"{settings.supabase_url}/storage/v1/object/uploads/{stored_name}"
            headers = {
                "apikey": settings.supabase_key,
                "Authorization": f"Bearer {settings.supabase_key}",
            }
            requests.delete(url, headers=headers, timeout=5)
        except Exception as e:
            print("Supabase cloud audio delete error:", e)
    db.delete_session(session_id)
    return {"ok": True}


@router.post("/jobs/refresh")
def _noop():
    return {"ok": True, "threads": threading.active_count()}
