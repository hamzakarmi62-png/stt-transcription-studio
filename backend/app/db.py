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
from .services import storage

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


def media_basename(path: str) -> str:
    """Filename from a stored audio_path, whatever OS wrote it.

    Existing rows hold Windows-style "uploads\\abc.wav". On a POSIX host
    Path.name treats the backslash as an ordinary character and returns the
    whole string, which would corrupt both the local lookup and the object key.
    """
    return (path or "").replace("\\", "/").rsplit("/", 1)[-1]


def _headers():
    return {
        "apikey": settings.supabase_key,
        "Authorization": f"Bearer {settings.supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _supabase_enabled() -> bool:
    return bool(settings.supabase_url and settings.supabase_key)


# ── Cloud persistence for the JSON catalogs ──────────────────────────────────
# These hold accounts and session metadata so data survives a redeploy.
# users_catalog.json contains every password hash, so it goes through the storage
# service, which authenticates every request and never uses a public URL.

def _catalog_enabled() -> bool:
    return storage.enabled()


def _catalog_read(name: str) -> bytes | None:
    return storage.get_bytes(name) if storage.enabled() else None


def _catalog_write(name: str, data: bytes) -> bool:
    return storage.put_bytes(name, data) if storage.enabled() else False


def _catalog_delete(name: str) -> None:
    if storage.enabled():
        storage.delete(name)


def _read_json(name: str):
    raw = _catalog_read(name)
    if raw is None:
        return None
    try:
        return json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeDecodeError) as e:
        print(f"Catalog parse error ({name}):", e)
        return None


def _write_json(name: str, payload) -> bool:
    return _catalog_write(
        name, json.dumps(payload, ensure_ascii=False).encode("utf-8")
    )


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
            try:
                conn.execute("ALTER TABLE users ADD COLUMN profile TEXT DEFAULT '{}'")
            except sqlite3.OperationalError:
                pass  # column already exists
            conn.commit()
            conn.close()
    except Exception as e:
        print("Error in local init_db:", e)


# ── User storage via Supabase Storage JSON (persists across Render restarts) ──

def _load_users_catalog() -> list[dict]:
    """Load all users from the cloud JSON catalog, then fall back to SQLite."""
    if _catalog_enabled():
        data = _read_json("users_catalog.json")
        if isinstance(data, list):
            return data
    # Fallback: load from local SQLite
    try:
        with _lock:
            conn = _local_conn()
            rows = conn.execute("SELECT * FROM users").fetchall()
            conn.close()
            return [dict(r) for r in rows]
    except Exception:
        return []


def _save_users_catalog(users: list[dict]) -> None:
    """Persist the users catalog to private cloud storage."""
    if not _catalog_enabled():
        return
    _write_json("users_catalog.json", users)


def create_user(user_id: str, username: str, email: str, password: str, profile: dict | None = None) -> dict:
    init_db()
    pwd_hash = hash_password(password)
    now = datetime.now(timezone.utc).isoformat()
    user_dict = {
        "id": user_id,
        "username": username,
        "email": email,
        "password_hash": pwd_hash,
        "full_name": (profile or {}).get("full_name", ""),
        "phone": (profile or {}).get("phone", ""),
        "country": (profile or {}).get("country", ""),
        "created_at": now,
    }

    # Save to the cloud catalog (survives a redeploy or an ephemeral disk)
    if _catalog_enabled():
        catalog = _load_users_catalog()
        # Remove any existing entry with same id/username/email
        catalog = [u for u in catalog if u["id"] != user_id
                   and u.get("username") != username
                   and u.get("email") != email]
        catalog.append(user_dict)
        _save_users_catalog(catalog)

    # Also save locally as fast-path cache
    with _lock:
        conn = _local_conn()
        try:
            conn.execute(
                "INSERT OR REPLACE INTO users (id, username, email, password_hash, created_at, profile) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, username, email, pwd_hash, now, json.dumps({k: user_dict[k] for k in ("full_name", "phone", "country")}, ensure_ascii=False)),
            )
            conn.commit()
        except Exception as e:
            print("Local create_user error:", e)
        finally:
            conn.close()

    return public_user(user_dict)


def public_user(user_row: dict) -> dict:
    """User fields safe to expose to the client."""
    return {
        "id": user_row.get("id"),
        "username": user_row.get("username"),
        "email": user_row.get("email"),
        "full_name": user_row.get("full_name", ""),
        "phone": user_row.get("phone", ""),
        "country": user_row.get("country", ""),
        "created_at": user_row.get("created_at", ""),
    }


def _local_profile(row: sqlite3.Row) -> dict:
    try:
        data = json.loads(row["profile"] or "{}")
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def get_user_by_username_or_email(identifier: str) -> dict | None:
    init_db()
    identifier_lower = identifier.strip().lower()

    # 1. Try local SQLite first (fast cache)
    with _lock:
        conn = _local_conn()
        try:
            cur = conn.execute(
                "SELECT * FROM users WHERE lower(username) = ? OR lower(email) = ?",
                (identifier_lower, identifier_lower),
            )
            row = cur.fetchone()
            conn.close()
            if row:
                user = dict(row)
                user.update(_local_profile(row))
                return user
        except Exception as e:
            conn.close()
            print("Local get_user error:", e)

    # 2. Fall back to the cloud catalog (the source of truth on an ephemeral disk)
    if _catalog_enabled():
        catalog = _load_users_catalog()
        for u in catalog:
            if (u.get("username", "").lower() == identifier_lower
                    or u.get("email", "").lower() == identifier_lower):
                # Warm the local cache so next login is fast
                with _lock:
                    conn = _local_conn()
                    try:
                        profile = {k: u.get(k, "") for k in ("full_name", "phone", "country")}
                        conn.execute(
                            "INSERT OR REPLACE INTO users (id, username, email, password_hash, created_at, profile) VALUES (?, ?, ?, ?, ?, ?)",
                            (u["id"], u["username"], u["email"], u["password_hash"], u["created_at"], json.dumps(profile, ensure_ascii=False)),
                        )
                        conn.commit()
                    except Exception:
                        pass
                    finally:
                        conn.close()
                return u

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
    if not _catalog_enabled():
        return
    try:
        sid = session_dict["id"]
        _write_json(f"meta_{sid}.json", session_dict)

        catalog = _list_session_cloud_meta()
        catalog_dict = {s["id"]: s for s in catalog if isinstance(s, dict) and s.get("id")}
        catalog_dict[sid] = session_dict
        sorted_list = sorted(
            catalog_dict.values(), key=lambda s: s.get("created_at", ""), reverse=True
        )
        _write_json("sessions_catalog.json", sorted_list)
    except Exception as e:
        print("Cloud meta save error:", e)


def _get_session_cloud_meta(session_id: str) -> dict | None:
    if not _catalog_enabled():
        return None
    data = _read_json(f"meta_{session_id}.json")
    return data if isinstance(data, dict) else None


def _list_session_cloud_meta() -> list[dict]:
    if not _catalog_enabled():
        return []
    data = _read_json("sessions_catalog.json")
    return data if isinstance(data, list) else []


def _delete_session_cloud_meta(session_id: str):
    if not _catalog_enabled():
        return
    try:
        _catalog_delete(f"meta_{session_id}.json")
        filtered = [
            s for s in _list_session_cloud_meta() if s.get("id") != session_id
        ]
        _write_json("sessions_catalog.json", filtered)
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
        except Exception as e:
            print("Supabase create_session error:", e)

    # The local row is the live source of truth for this worker: get_session
    # reads it first, so skipping this insert would leave every later status
    # update to fall through to a cloud copy that may lag behind.
    formatted = _format_session(sess_data)
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
    # 1. Local SQLite always carries the immediate live status on this worker
    with _lock:
        conn = _local_conn()
        cur = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            return _format_session(dict(row))

    # 2. Cloud metadata cache (for restarts or files created on other workers)
    cloud_data = _get_session_cloud_meta(session_id)
    if cloud_data:
        return _format_session(cloud_data)

    # 3. Supabase REST fallback
    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}&select=*"
            r = requests.get(url, headers=_headers(), timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data and len(data) > 0:
                    return _format_session(data[0])
        except Exception:
            pass

    return None


def list_sessions() -> list[dict]:
    """Merge every source, newest first.

    Each store used to short-circuit the others, so a stale cloud catalog hid
    sessions that existed only locally — and on a fresh deploy the reverse.
    Local rows win because they carry the media path and the latest results;
    the cloud copies supply anything this disk does not have.
    """
    merged: dict[str, dict] = {}

    def add(items) -> None:
        for item in items:
            try:
                session = _format_session(item)
            except Exception as e:
                print("list_sessions format error:", e)
                continue
            sid = session.get("id")
            if sid and sid not in merged:
                merged[sid] = session

    with _lock:
        conn = _local_conn()
        try:
            rows = conn.execute(
                "SELECT * FROM sessions ORDER BY created_at DESC"
            ).fetchall()
        except sqlite3.OperationalError as e:
            print("Local list_sessions error:", e)
            rows = []
        finally:
            conn.close()
    add([dict(r) for r in rows])

    add(_list_session_cloud_meta())

    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?select=*&order=created_at.desc"
            r = requests.get(url, headers=_headers(), timeout=5)
            if r.status_code == 200 and isinstance(r.json(), list):
                add(r.json())
        except Exception as e:
            print("Supabase list_sessions error:", e)

    return sorted(merged.values(), key=lambda s: s.get("created_at", ""), reverse=True)


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
        # No local row: merge onto the latest cloud copy. Fabricating a bare
        # {"id": ...} here would format every missing field with its default
        # (status "uploaded") and clobber a running transcription's state.
        cloud_sess = _get_session_cloud_meta(session_id)
        if not cloud_sess and _supabase_enabled():
            try:
                url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}&select=*"
                r = requests.get(url, headers=_headers(), timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    cloud_sess = data[0] if data else None
            except Exception:
                pass
        if not cloud_sess:
            # Session truly unknown here — persist only the patched fields.
            if _supabase_enabled():
                try:
                    url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}"
                    requests.patch(url, headers=_headers(), json=sql_updates, timeout=5)
                except Exception as e:
                    print("Supabase update_session error:", e)
            return None
        current_sess = _format_session(cloud_sess)
        for k, v in update_data.items():
            current_sess[k] = v

    if _supabase_enabled():
        try:
            url = f"{settings.supabase_url}/rest/v1/sessions?id=eq.{session_id}"
            requests.patch(url, headers=_headers(), json=sql_updates, timeout=5)
        except Exception as e:
            pass

    _save_session_cloud_meta(current_sess)
    return current_sess


RESTART_ERROR = "انقطعت المعالجة بسبب إعادة تشغيل الخادم (الخطة المجانية). يرجى إعادة تشغيل التفريغ."


def recover_orphan_processing() -> int:
    """On startup no worker thread exists yet, so every 'processing' row is an
    orphan from a previous instance (free plans restart often). Mark it failed
    instead of leaving the UI polling a status that will never change."""
    recovered = 0
    with _lock:
        conn = _local_conn()
        rows = conn.execute(
            "SELECT id FROM sessions WHERE status = 'processing'"
        ).fetchall()
        conn.close()
    for row in rows:
        update_session(row["id"], status="error", error=RESTART_ERROR)
        recovered += 1

    for sess in _list_session_cloud_meta():
        if sess.get("status") == "processing":
            update_session(sess["id"], status="error", error=RESTART_ERROR)
            recovered += 1
    return recovered


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

