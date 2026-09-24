"""Object storage for uploaded media: keeps it off this machine.

Two drivers sit behind one API:

  * "b2"       — Backblaze B2 via its NATIVE API (plain HTTPS, short timeouts).
                 The S3-compatible gateway proved intermittently unreachable from
                 server hosts and stalled login; the native API has been stable.
                 Multi-GB objects upload through the part-based API so nothing
                 large ever sits in RAM.
  * "supabase" — the project's Supabase Storage REST API. Needs no second
                 account and no card, which is what makes the free plan usable.

Whichever is active, the bucket is the source of truth and local disk is only a
cache, so an upload survives the machine being switched off or redeployed.
"""

import hashlib
import os
import threading
import time
from pathlib import Path
from urllib.parse import quote

import requests

from ..config import settings

CHUNK_SIZE = 8 * 1024 * 1024
BUCKET = "uploads"
UPLOAD_ERROR = "فشل رفع الملف إلى التخزين السحابي"
PRESIGN_ERROR = "فشل إنشاء رابط مؤقت للملف"

_client = None
_client_lock = threading.Lock()


def _s3_configured() -> bool:
    return bool(
        settings.s3_endpoint
        and settings.s3_bucket
        and settings.s3_access_key
        and settings.s3_secret_key
    )


def _supabase_configured() -> bool:
    return bool(settings.supabase_url and settings.supabase_key)


def driver() -> str:
    """Which backend is live: "s3", "supabase", or "" when media stays local."""
    mode = settings.storage_backend.strip().lower()
    if mode == "s3":
        return "s3" if _s3_configured() else ""
    if mode == "supabase":
        return "supabase" if _supabase_configured() else ""
    if mode == "local":
        return ""
    # "auto": prefer a dedicated bucket, fall back to Supabase Storage.
    if _s3_configured():
        return "s3"
    return "supabase" if _supabase_configured() else ""


def enabled() -> bool:
    return driver() != ""


def bucket_label() -> str:
    """Human-readable target, for logs and the migration script."""
    active = driver()
    if active == "s3":
        return f"{settings.s3_bucket} @ {settings.s3_endpoint}"
    if active == "supabase":
        return f"Supabase Storage/{BUCKET} @ {settings.supabase_url}"
    return "التخزين المحلي (لا سحابة)"


def audio_only() -> bool:
    """Whether the bucket is too small to hold original videos.

    Supabase's free tier is 1 GB for the whole project, so a 558 MB recording
    cannot be archived as-is — its mono 16 kHz mp3 track is ~15 MB and is all
    transcription needs. A dedicated S3 bucket has no such cap.
    """
    return driver() == "supabase"


# ── B2 driver (native API) ───────────────────────────────────────────────────
# The S3-compatible gateway (s3.<region>.backblazeb2.com) proved intermittently
# unreachable from server hosts, stalling login for minutes. The native B2 API
# (api.backblazeb2.com + the per-pod upload/download hosts) has been reliable,
# so the "s3" driver now speaks B2-native over plain HTTPS with short timeouts.

_b2_lock = threading.Lock()
_b2 = {"token": None, "accountId": None, "api": None, "dl": None, "bucketId": None, "expires": 0.0}

B2_AUTH_URL = "https://api.backblazeb2.com/b2api/v3/b2_authorize_account"
LARGE_FILE_THRESHOLD = 200 * 1024 * 1024  # above this, use the part-based upload
PART_SIZE = 100 * 1024 * 1024


def _b2_authorize(force: bool = False) -> dict:
    with _b2_lock:
        now = time.time()
        if not force and _b2["token"] and now < _b2["expires"] - 120:
            return _b2
        r = requests.get(B2_AUTH_URL, auth=(settings.s3_access_key, settings.s3_secret_key), timeout=15)
        r.raise_for_status()
        data = r.json()
        sa = data["apiInfo"]["storageApi"]
        _b2.update({
            "token": data["authorizationToken"],
            "accountId": data["accountId"],
            "api": sa["apiUrl"],
            "dl": sa["downloadUrl"],
            # A bucket-scoped application key embeds its bucket right here —
            # b2_list_buckets without that filter would 401 for such keys.
            "bucketId": sa.get("bucketId"),
            "expires": now + 20 * 3600,
        })
        return _b2


def _b2_call(path: str, payload: dict | None = None):
    """One authenticated B2 API call; re-authorizes once on token expiry."""
    b = _b2_authorize()
    r = requests.post(f"{b['api']}{path}", headers={"Authorization": b["token"]}, json=payload or {}, timeout=30)
    if r.status_code == 401:
        b = _b2_authorize(force=True)
        r = requests.post(f"{b['api']}{path}", headers={"Authorization": b["token"]}, json=payload or {}, timeout=30)
    r.raise_for_status()
    return r.json()


def _b2_bucket_id() -> str:
    b = _b2_authorize()
    if b["bucketId"]:
        return b["bucketId"]
    data = _b2_call("/b2api/v3/b2_list_buckets", {"accountId": b["accountId"]})
    for bucket in data.get("buckets", []):
        if bucket["bucketName"] == settings.s3_bucket:
            b["bucketId"] = bucket["bucketId"]
            return b["bucketId"]
    created = _b2_call("/b2api/v3/b2_create_bucket", {
        "accountId": b["accountId"], "bucketName": settings.s3_bucket, "bucketType": "allPrivate",
    })
    b["bucketId"] = created["bucketId"]
    return b["bucket_id"]


def _b2_url(key: str, token: str | None = None) -> str:
    b = _b2_authorize()
    url = f"{b['dl']}/file/{quote(settings.s3_bucket)}/{quote(key)}"
    if token:
        url += f"?AuthorizationToken={quote(token)}"
    return url


def _b2_download(key: str, stream: bool = False):
    b = _b2_authorize()
    r = requests.get(_b2_url(key), headers={"Authorization": b["token"]}, timeout=60, stream=stream)
    if r.status_code == 401:
        b = _b2_authorize(force=True)
        r = requests.get(_b2_url(key), headers={"Authorization": b["token"]}, timeout=60, stream=stream)
    return r


def _b2_upload_simple(key: str, data: bytes, mime_type: str) -> bool:
    b = _b2_authorize()
    for _ in range(2):
        try:
            up = _b2_call("/b2api/v3/b2_get_upload_url", {"bucketId": _b2_bucket_id()})
        except Exception as exc:
            print(f"Object storage upload url failed for {key}:", exc)
            return False
        r = requests.post(up["uploadUrl"], data=data, timeout=300, headers={
            "Authorization": up["authorizationToken"],
            "X-Bz-File-Name": key,
            "Content-Type": mime_type or "application/octet-stream",
            "X-Bz-Content-Sha1": hashlib.sha1(data).hexdigest(),
        })
        if r.status_code == 401:
            _b2_authorize(force=True)
            continue
        if r.status_code >= 400:
            print(f"Object storage write failed for {key}: HTTP {r.status_code} {r.text[:120]}")
            return False
        return True
    return False


def _b2_upload_large(local_path: Path, key: str, mime_type: str) -> bool:
    """Part-based upload so a multi-GB video never sits in RAM."""
    b = _b2_authorize()
    size = local_path.stat().st_size
    started = _b2_call("/b2api/v3/b2_start_large_file", {
        "bucketId": _b2_bucket_id(), "fileName": key,
        "contentType": mime_type or "application/octet-stream",
    })
    file_id, part_no, sha_list, offset = started["fileId"], 1, [], 0
    try:
        while offset < size:
            with local_path.open("rb") as fh:
                fh.seek(offset)
                chunk = fh.read(PART_SIZE)
            up = _b2_call("/b2api/v3/b2_get_upload_part_url", {"fileId": file_id})
            r = requests.post(up["uploadUrl"], data=chunk, timeout=600, headers={
                "Authorization": up["authorizationToken"],
                "X-Bz-Part-Number": str(part_no),
                "X-Bz-Content-Sha1": hashlib.sha1(chunk).hexdigest(),
            })
            r.raise_for_status()
            sha_list.append(r.json()["contentSha1"])
            offset += len(chunk)
            part_no += 1
        _b2_call("/b2api/v3/b2_finish_large_file", {"fileId": file_id, "partSha1Array": sha_list})
        return True
    except Exception as exc:
        print(f"Large upload failed for {key}: {exc}")
        try:
            _b2_call("/b2api/v3/b2_cancel_large_file", {"fileId": file_id})
        except Exception:
            pass
        return False


def _s3_put_file(local_path: Path, key: str, mime_type: str) -> None:
    try:
        if local_path.stat().st_size > LARGE_FILE_THRESHOLD:
            ok = _b2_upload_large(local_path, key, mime_type)
        else:
            ok = _b2_upload_simple(key, local_path.read_bytes(), mime_type)
        if not ok:
            raise RuntimeError(UPLOAD_ERROR)
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"{UPLOAD_ERROR}: {exc}") from exc


def _s3_presign_get(key: str, expires: int) -> str:
    try:
        auth = _b2_call("/b2api/v3/b2_get_download_authorization", {
            "bucketId": _b2_bucket_id(), "fileName": key,
            "validDurationInSeconds": max(60, min(expires, 604800)),
        })
        return _b2_url(key, auth["authorizationToken"])
    except Exception as exc:
        raise RuntimeError(f"{PRESIGN_ERROR}: {exc}") from exc


def _s3_get_to_file(key: str, path: Path, tmp: Path) -> bool:
    try:
        r = _b2_download(key, stream=True)
        if r.status_code == 404:
            return False
        r.raise_for_status()
        with tmp.open("wb") as fh:
            for chunk in r.iter_content(1024 * 1024):
                fh.write(chunk)
        return True
    except Exception as exc:
        print("Object storage download failed:", exc)
        return False


def _s3_put_bytes(key: str, data: bytes, mime_type: str) -> bool:
    return _b2_upload_simple(key, data, mime_type or "application/json")


def _s3_get_bytes(key: str) -> bytes | None:
    try:
        r = _b2_download(key)
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.content or None
    except Exception as exc:
        print(f"Object storage read failed for {key}:", exc)
        return None


def _s3_exists(key: str) -> bool:
    try:
        r = _b2_download(key)
        if r.status_code == 200:
            r.close()
            return True
        return False
    except Exception:
        return False


def _s3_ensure_bucket() -> str:
    try:
        _b2_bucket_id()
        return ""
    except Exception as exc:
        return str(exc)


# ── Supabase driver ──────────────────────────────────────────────────────────
# Every call is authenticated, so the bucket can be (and should be) private.

def _sb_url(kind: str, key: str) -> str:
    return f"{settings.supabase_url}/storage/v1/{kind}/{BUCKET}/{quote(key, safe='/')}"


def _sb_headers(mime: str = "application/octet-stream") -> dict:
    return {
        "apikey": settings.supabase_key,
        "Authorization": f"Bearer {settings.supabase_key}",
        "Content-Type": mime,
        # Newer Storage API versions ignore the ?upsert=true query param and
        # reject overwrites with KeyAlreadyExists unless this header is set.
        "x-upsert": "true",
    }


def _sb_missing(status: int) -> bool:
    # Supabase reports an absent object as 400 or 404 depending on the version.
    return status in (400, 404)


def _sb_put_file(local_path: Path, key: str, mime_type: str) -> None:
    url = _sb_url("object", key) + "?upsert=true"
    last_error = ""
    for attempt in range(3):
        try:
            # Streamed from disk: the file can be far larger than free RAM.
            with local_path.open("rb") as fh:
                res = requests.post(url, headers=_sb_headers(mime_type), data=fh, timeout=(60, None))
            if res.status_code in (200, 201):
                return
            last_error = f"HTTP {res.status_code}: {res.text[:200]}"
            if 400 <= res.status_code < 500:
                break
        except requests.exceptions.RequestException as exc:
            last_error = str(exc)
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"{UPLOAD_ERROR}: {last_error}")


def _sb_put_bytes(key: str, data: bytes, mime_type: str) -> None:
    res = requests.post(
        _sb_url("object", key) + "?upsert=true",
        headers=_sb_headers(mime_type),
        data=data,
        timeout=30,
    )
    if res.status_code not in (200, 201):
        raise RuntimeError(f"HTTP {res.status_code}: {res.text[:200]}")


def _sb_presign_get(key: str, expires: int) -> str:
    url = _sb_url("object/sign", key)
    try:
        res = requests.post(
            url,
            headers=_sb_headers("application/json"),
            json={"expiresIn": expires},
            timeout=15,
        )
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"{PRESIGN_ERROR}: {exc}") from exc

    if res.status_code != 200:
        raise RuntimeError(f"{PRESIGN_ERROR}: HTTP {res.status_code}: {res.text[:200]}")
    try:
        signed = (res.json() or {}).get("signedURL") or ""
    except ValueError as exc:
        raise RuntimeError(f"{PRESIGN_ERROR}: {exc}") from exc
    if not signed:
        raise RuntimeError(f"{PRESIGN_ERROR}: الاستجابة لا تحتوي رابطاً")

    base = f"{settings.supabase_url}/storage/v1"
    return base + signed if signed.startswith("/") else f"{base}/{signed}"


def _sb_stream_to(key: str, tmp: Path) -> bool:
    try:
        with requests.get(
            _sb_url("object", key), headers=_sb_headers(), stream=True, timeout=(30, None)
        ) as res:
            if _sb_missing(res.status_code):
                return False
            if res.status_code != 200:
                print(f"Supabase download failed for {key}: HTTP {res.status_code}")
                return False
            with tmp.open("wb") as fh:
                for chunk in res.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        fh.write(chunk)
    except requests.exceptions.RequestException as exc:
        print(f"Supabase download failed for {key}:", exc)
        return False
    return True


def _sb_get_bytes(key: str) -> bytes | None:
    try:
        res = requests.get(_sb_url("object", key), headers=_sb_headers(), timeout=15)
    except requests.exceptions.RequestException as exc:
        print(f"Supabase read failed for {key}:", exc)
        return None
    if _sb_missing(res.status_code):
        return None
    if res.status_code != 200:
        print(f"Supabase read failed for {key}: HTTP {res.status_code}")
        return None
    return res.content or None


def _sb_exists(key: str) -> bool:
    """List-and-match: Supabase's search is a substring filter, not an exact one."""
    parent, _, name = key.rpartition("/")
    url = f"{settings.supabase_url}/storage/v1/object/list/{BUCKET}"
    try:
        res = requests.post(
            url,
            headers=_sb_headers("application/json"),
            json={"prefix": parent, "search": name, "limit": 100},
            timeout=15,
        )
    except requests.exceptions.RequestException:
        return False
    if res.status_code != 200:
        return False
    try:
        items = res.json()
    except ValueError:
        return False
    if not isinstance(items, list):
        return False
    return any(isinstance(i, dict) and i.get("name") == name for i in items)


def _sb_ensure_bucket() -> str:
    url = f"{settings.supabase_url}/storage/v1/bucket/{BUCKET}"
    try:
        res = requests.get(url, headers=_sb_headers("application/json"), timeout=15)
    except requests.exceptions.RequestException as exc:
        return str(exc)
    if res.status_code == 200:
        return ""
    return f"HTTP {res.status_code}: {res.text[:200]}"


# ── Dispatch ─────────────────────────────────────────────────────────────────

def put_file(local_path: str | Path, key: str, mime_type: str = "application/octet-stream") -> None:
    """Copy a local file into the bucket. Raises RuntimeError on failure."""
    path = Path(local_path)
    if driver() == "s3":
        _s3_put_file(path, key, mime_type)
    else:
        _sb_put_file(path, key, mime_type)


def presign_get(key: str, expires: int | None = None) -> str:
    """Temporary URL for a private object, so the bucket never has to be public."""
    seconds = expires or settings.s3_presign_seconds
    if driver() == "s3":
        return _s3_presign_get(key, seconds)
    return _sb_presign_get(key, seconds)


def get_to_file(key: str, local_path: str | Path) -> bool:
    """Fetch an object into the local cache. False when it is not in the bucket."""
    path = Path(local_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".part")

    if driver() == "s3":
        ok = _s3_get_to_file(key, path, tmp)
    else:
        ok = _sb_stream_to(key, tmp)

    if not ok:
        tmp.unlink(missing_ok=True)
        return False
    os.replace(tmp, path)
    return path.exists() and path.stat().st_size > 0


def delete(key: str) -> None:
    if driver() == "s3":
        try:
            data = _b2_call("/b2api/v3/b2_list_file_names", {
                "bucketId": _b2_bucket_id(), "prefix": key, "maxFileCount": 50,
            })
            for f in data.get("files", []):
                if f["fileName"] == key:
                    _b2_call("/b2api/v3/b2_delete_file_version", {
                        "fileId": f["fileId"], "fileName": key,
                    })
                    break
        except Exception as exc:
            print("Object storage delete failed:", exc)
        return
    try:
        requests.delete(_sb_url("object", key), headers=_sb_headers(), timeout=10)
    except requests.exceptions.RequestException as exc:
        print("Supabase delete failed:", exc)


def put_bytes(key: str, data: bytes, mime_type: str = "application/json") -> bool:
    """Store a small object (the JSON catalogs). False on failure, never raises."""
    if driver() == "s3":
        return _s3_put_bytes(key, data, mime_type)
    try:
        _sb_put_bytes(key, data, mime_type)
        return True
    except RuntimeError as exc:
        print(f"Supabase write failed for {key}:", exc)
        return False


def get_bytes(key: str) -> bytes | None:
    """Read a small object back. None when absent or unreachable."""
    if driver() == "s3":
        return _s3_get_bytes(key)
    return _sb_get_bytes(key)


def exists(key: str) -> bool:
    if driver() == "s3":
        return _s3_exists(key)
    return _sb_exists(key)


def ensure_bucket() -> str:
    """Verify (or create) the bucket. Returns '' on success, else an error message."""
    if driver() == "s3":
        return _s3_ensure_bucket()
    return _sb_ensure_bucket()
