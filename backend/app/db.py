import hashlib
import json
import os
import secrets
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
import requests

from .config import settings

_lock = threading.Lock()
VIDEO_EXTS = {"mp4", "webm", "mov", "m4v", "mkv", "avi"}


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("ascii"), 100000).hex()
    return f"{salt}${pwd_hash}"


def verify_password(stored: str, password: str) -> bool:
    try:
        salt, pwd_hash = stored.split("$")
        check_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("ascii"), 100000).hex()
        return secrets.compare_digest(pwd_hash, check_hash)
    except Exception:
        return False


def media_kind(path: str) -> str:
    ext = Path(path).suffix.lower().lstrip(".")
    return "video" if ext in VIDEO_EXTS else "audio"


def _headers():
    return {
        "apikey": settings.supabase_key,
        "Authorization": f"Bearer {settings.supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _supabase_enabled() -> bool:
    return bool(settings.supabase_url and settings.supabase_key)


def _local_conn():
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    try:
        with _lock:
            conn = _local_conn()
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    filename TEXT NOT NULL,
                    audio_path TEXT NOT NULL,
                    duration REAL DEFAULT 0,
                    language TEXT,
                    status TEXT DEFAULT 'uploaded',
                    error TEXT,
                    segments TEXT DEFAULT '[]',
                    speakers TEXT DEFAULT '[]',
                    settings TEXT DEFAULT '{}',
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.commit()
            conn.close()
    except Exception as e:
        print("Error in local init_db:", e)


def create_user(user_id: str, username: str, email: str, password: str) -> dict:
    init_db()
    pwd_hash = hash_password(password)
    now = datetime.now(timezone.utc).isoformat()
    user_dict = {"id": user_id, "username": username, "email": email, "password_hash": pwd_hash, "created_at": now}

    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/users"
            r = requests.post(url, headers=_headers(), json=user_dict, timeout=5)
            if r.status_code in (200, 201):
                return {"id": user_id, "username": username, "email": email, "created_at": now}
        except Exception as e:
            print("Supabase create_user error:", e)

    with _lock:
        conn = _local_conn()
        conn.execute(
            "INSERT OR REPLACE INTO users (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, username, email, pwd_hash, now),
        )
        conn.commit()
        conn.close()
    return {"id": user_id, "username": username, "email": email, "created_at": now}


def get_user_by_username_or_email(identifier: str) -> dict | None:
    init_db()
    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/users?or=(username.eq.{identifier},email.eq.{identifier})&select=*"
            r = requests.get(url, headers=_headers(), timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data and len(data) > 0:
                    return data[0]
        except Exception as e:
            print("Supabase get_user error:", e)

    with _lock:
        conn = _local_conn()
        try:
            cur = conn.execute("SELECT * FROM users WHERE username = ? OR email = ?", (identifier, identifier))
            row = cur.fetchone()
            conn.close()
            return dict(row) if row else None
        except Exception as e:
            conn.close()
            print("Local get_user error:", e)
            return None


def _format_session(data: dict) -> dict:
    segments = data.get("segments", "[]")
    if isinstance(segments, str):
        try:
            segments = json.loads(segments)
        except Exception:
            segments = []

    speakers = data.get("speakers", "[]")
    if isinstance(speakers, str):
        try:
            speakers = json.loads(speakers)
        except Exception:
            speakers = []

    sess_settings = data.get("settings", "{}")
    if isinstance(sess_settings, str):
        try:
            sess_settings = json.loads(sess_settings)
        except Exception:
            sess_settings = {}

    audio_path = data.get("audio_path", "")
    return {
        "id": data["id"],
        "filename": data.get("filename", "audio"),
        "audio_path": audio_path,
        "kind": media_kind(audio_path),
        "audio_url": f"/api/sessions/{data['id']}/audio",
        "duration": float(data.get("duration") or 0),
        "language": data.get("language"),
        "status": data.get("status", "uploaded"),
        "error": data.get("error"),
        "segments": segments,
        "speakers": speakers,
        "settings": sess_settings,
        "created_at": data.get("created_at", ""),
    }


def create_session(session_id: str, filename: str, audio_path: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    sess_data = {
        "id": session_id,
        "filename": filename,
        "audio_path": audio_path,
        "duration": 0,
        "language": None,
        "status": "uploaded",
        "error": None,
        "segments": "[]",
        "speakers": "[]",
        "settings": "{}",
        "created_at": now,
    }

    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions"
            r = requests.post(url, headers=_headers(), json=sess_data, timeout=5)
            if r.status_code in (200, 201):
                return _format_session(sess_data)
        except Exception as e:
            print("Supabase create_session error:", e)

    with _lock:
        conn = _local_conn()
        conn.execute(
            "INSERT OR REPLACE INTO sessions (id, filename, audio_path, created_at) VALUES (?, ?, ?, ?)",
            (session_id, filename, audio_path, now),
        )
        conn.commit()
        conn.close()

    return _format_session(sess_data)


def get_session(session_id: str) -> dict | None:
    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}&select=*"
            r = requests.get(url, headers=_headers(), timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data and len(data) > 0:
                    return _format_session(data[0])
        except Exception as e:
            print("Supabase get_session error:", e)

    with _lock:
        conn = _local_conn()
        cur = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = cur.fetchone()
        conn.close()
        return _format_session(dict(row)) if row else None


def list_sessions() -> list[dict]:
    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?select=*&order=created_at.desc"
            r = requests.get(url, headers=_headers(), timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data is not None and isinstance(data, list):
                    return [_format_session(item) for item in data]
        except Exception as e:
            print("Supabase list_sessions error:", e)

    with _lock:
        conn = _local_conn()
        cur = conn.execute("SELECT * FROM sessions ORDER BY created_at DESC")
        rows = cur.fetchall()
        conn.close()
        return [_format_session(dict(r)) for r in rows]


def update_session(session_id: str, **fields) -> dict | None:
    allowed = {"duration", "language", "status", "error", "segments", "speakers", "settings"}
    update_data = {}
    for key, value in fields.items():
        if key not in allowed:
            continue
        if isinstance(value, (list, dict)):
            value = json.dumps(value, ensure_ascii=False)
        update_data[key] = value

    if not update_data:
        return get_session(session_id)

    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}"
            r = requests.patch(url, headers=_headers(), json=update_data, timeout=5)
            if r.status_code in (200, 204):
                return get_session(session_id)
        except Exception as e:
            print("Supabase update_session error:", e)

    sets = [f"{k} = ?" for k in update_data.keys()]
    values = list(update_data.values())
    values.append(session_id)

    with _lock:
        conn = _local_conn()
        conn.execute(f"UPDATE sessions SET {', '.join(sets)} WHERE id = ?", values)
        conn.commit()
        conn.close()

    return get_session(session_id)


def delete_session(session_id: str) -> bool:
    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}"
            r = requests.delete(url, headers=_headers(), timeout=5)
            if r.status_code in (200, 204):
                pass
        except Exception as e:
            print("Supabase delete_session error:", e)

    with _lock:
        conn = _local_conn()
        cur = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        affected = cur.rowcount if hasattr(cur, "rowcount") else 1
        conn.close()
        return affected > 0
