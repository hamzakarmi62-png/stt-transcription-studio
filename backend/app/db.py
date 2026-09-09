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

    # دائماً احفظ المستخدم محلياً كنسخة احتياطية حتى لو تم الحفظ في Supabase
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
            # استخدام صيغة PostgREST الصحيحة مع URL encoding
            from urllib.parse import quote
            encoded_id = quote(identifier)
            url = (
                f"{settings.supabase_url}/rest/v1/users"
                f"?or=(username.eq.{encoded_id},email.eq.{encoded_id})&select=*"
            )
            r = requests.get(url, headers=_headers(), timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data and len(data) > 0:
                    return data[0]
            else:
                print(f"Supabase get_user status {r.status_code}: {r.text}")
        except Exception as e:
            print("Supabase get_user error:", e)

    # البحث دائماً في قاعدة البيانات المحلية كنسخة احتياطية
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


def _cloud_headers():
    return {
        "apikey": settings.supabase_key,
        "Authorization": f"Bearer {settings.supabase_key}",
        "Content-Type": "application/json",
    }


def _save_session_cloud_meta(session_dict: dict):
    if not _supabase_enabled():
        return
    try:
        sid = session_dict["id"]
        url = f"{settings.supabase_url}/storage/v1/object/uploads/meta_{sid}.json"
        data = json.dumps(session_dict, ensure_ascii=False).encode("utf-8")
        headers = _cloud_headers()
        r = requests.post(url, headers=headers, data=data, timeout=5)
        if r.status_code in (400, 409):
            requests.put(url, headers=headers, data=data, timeout=5)
        
        # Update cloud catalog
        catalog = _list_session_cloud_meta()
        catalog_dict = {s["id"]: s for s in catalog}
        catalog_dict[sid] = session_dict
        sorted_list = sorted(catalog_dict.values(), key=lambda s: s.get("created_at", ""), reverse=True)
        cat_url = f"{settings.supabase_url}/storage/v1/object/uploads/sessions_catalog.json"
        cat_data = json.dumps(sorted_list, ensure_ascii=False).encode("utf-8")
        r_cat = requests.post(cat_url, headers=headers, data=cat_data, timeout=5)
        if r_cat.status_code in (400, 409):
            requests.put(cat_url, headers=headers, data=cat_data, timeout=5)
    except Exception as e:
        print("Cloud meta save error:", e)


def _get_session_cloud_meta(session_id: str) -> dict | None:
    if not _supabase_enabled():
        return None
    try:
        url = f"{settings.supabase_url}/storage/v1/object/public/uploads/meta_{session_id}.json"
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            return r.json()
    except Exception as e:
        print("Cloud meta get error:", e)
    return None


def _list_session_cloud_meta() -> list[dict]:
    if not _supabase_enabled():
        return []
    try:
        cat_url = f"{settings.supabase_url}/storage/v1/object/public/uploads/sessions_catalog.json"
        r = requests.get(cat_url, timeout=5)
        if r.status_code == 200 and isinstance(r.json(), list):
            return r.json()
    except Exception as e:
        print("Cloud catalog read error:", e)
    return []


def _delete_session_cloud_meta(session_id: str):
    if not _supabase_enabled():
        return
    try:
        url = f"{settings.supabase_url}/storage/v1/object/uploads/meta_{session_id}.json"
        headers = _cloud_headers()
        requests.delete(url, headers=headers, timeout=5)
        
        # Update catalog
        catalog = _list_session_cloud_meta()
        filtered = [s for s in catalog if s.get("id") != session_id]
        cat_url = f"{settings.supabase_url}/storage/v1/object/uploads/sessions_catalog.json"
        cat_data = json.dumps(filtered, ensure_ascii=False).encode("utf-8")
        r_cat = requests.post(cat_url, headers=headers, data=cat_data, timeout=5)
        if r_cat.status_code in (400, 409):
            requests.put(cat_url, headers=headers, data=cat_data, timeout=5)
    except Exception as e:
        print("Cloud meta delete error:", e)


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
                formatted = _format_session(sess_data)
                _save_session_cloud_meta(formatted)
                return formatted
        except Exception as e:
            print("Supabase create_session error:", e)

    formatted = _format_session(sess_data)
    _save_session_cloud_meta(formatted)

    with _lock:
        conn = _local_conn()
        conn.execute(
            "INSERT OR REPLACE INTO sessions (id, filename, audio_path, created_at) VALUES (?, ?, ?, ?)",
            (session_id, filename, audio_path, now),
        )
        conn.commit()
        conn.close()

    return formatted


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

    cloud_data = _get_session_cloud_meta(session_id)
    if cloud_data:
        return _format_session(cloud_data)

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
                if data is not None and isinstance(data, list) and len(data) > 0:
                    return [_format_session(item) for item in data]
        except Exception as e:
            print("Supabase list_sessions error:", e)

    cloud_list = _list_session_cloud_meta()
    if cloud_list:
        return [_format_session(item) for item in cloud_list]

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
        update_data[key] = value

    if not update_data:
        return get_session(session_id)

    sql_updates = {}
    for k, v in update_data.items():
        if isinstance(v, (list, dict)):
            sql_updates[k] = json.dumps(v, ensure_ascii=False)
        else:
            sql_updates[k] = v

    current_sess = None
    with _lock:
        conn = _local_conn()
        sets = [f"{k} = ?" for k in sql_updates.keys()]
        values = list(sql_updates.values())
        values.append(session_id)
        conn.execute(f"UPDATE sessions SET {', '.join(sets)} WHERE id = ?", values)
        conn.commit()
        cur = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            current_sess = _format_session(dict(row))

    if not current_sess:
        current_sess = _get_session_cloud_meta(session_id) or {"id": session_id}
        for k, v in update_data.items():
            current_sess[k] = v
        current_sess = _format_session(current_sess)

    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}"
            requests.patch(url, headers=_headers(), json=sql_updates, timeout=5)
        except Exception as e:
            pass

    _save_session_cloud_meta(current_sess)
    return current_sess


def delete_session(session_id: str) -> bool:
    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}"
            r = requests.delete(url, headers=_headers(), timeout=5)
            if r.status_code in (200, 204):
                pass
        except Exception as e:
            print("Supabase delete_session error:", e)

    _delete_session_cloud_meta(session_id)

    with _lock:
        conn = _local_conn()
        cur = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        affected = cur.rowcount if hasattr(cur, "rowcount") else 1
        conn.close()
        return affected > 0

