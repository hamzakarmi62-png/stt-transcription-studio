"""Object storage for uploaded media: keeps it off this machine.

Two drivers sit behind one API:

  * "s3"       — any S3-compatible host (Cloudflare R2, Backblaze B2, Oracle
                 Object Storage, Wasabi, Storj, Supabase's own S3 endpoint) via
                 boto3. Path-style addressing and SigV4 are forced because R2 and
                 most non-AWS hosts require them, and uploads go through boto3's
                 managed transfer so a multi-GB object is split into parts that
                 retry independently.
  * "supabase" — the project's Supabase Storage REST API. Needs no second
                 account and no card, which is what makes the free plan usable.

Whichever is active, the bucket is the source of truth and local disk is only a
cache, so an upload survives the machine being switched off or redeployed.
"""

import os
import threading
import time
from pathlib import Path
from urllib.parse import quote

import requests
from boto3.s3.transfer import TransferConfig
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError

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


# ── S3 driver ────────────────────────────────────────────────────────────────

def _get_client():
    """One client per process; rebuilding it per request wastes connections."""
    global _client
    with _client_lock:
        if _client is None:
            import boto3

            _client = boto3.client(
                "s3",
                endpoint_url=settings.s3_endpoint,
                aws_access_key_id=settings.s3_access_key,
                aws_secret_access_key=settings.s3_secret_key,
                region_name=settings.s3_region or "auto",
                config=Config(
                    signature_version="s3v4",
                    s3={"addressing_style": "path"},
                    retries={"max_attempts": 5, "mode": "standard"},
                    max_pool_connections=4,
                ),
            )
    return _client


def _transfer_config() -> TransferConfig:
    return TransferConfig(
        multipart_threshold=CHUNK_SIZE,
        multipart_chunksize=CHUNK_SIZE,
        max_concurrency=2,
        use_threads=True,
    )


def _s3_put_file(local_path: Path, key: str, mime_type: str) -> None:
    client = _get_client()
    try:
        with local_path.open("rb") as fh:
            client.upload_fileobj(
                fh,
                settings.s3_bucket,
                key,
                Config=_transfer_config(),
                ExtraArgs={"ContentType": mime_type},
            )
    except (ClientError, BotoCoreError) as exc:
        raise RuntimeError(f"{UPLOAD_ERROR}: {exc}") from exc


def _s3_presign_get(key: str, expires: int) -> str:
    client = _get_client()
    try:
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": key},
            ExpiresIn=expires,
        )
    except (ClientError, BotoCoreError) as exc:
        raise RuntimeError(f"{PRESIGN_ERROR}: {exc}") from exc


def _s3_get_to_file(key: str, path: Path, tmp: Path) -> bool:
    client = _get_client()
    try:
        with tmp.open("wb") as fh:
            client.download_fileobj(settings.s3_bucket, key, fh, Config=_transfer_config())
    except ClientError as exc:
        code = str(exc.response.get("Error", {}).get("Code", ""))
        if code not in ("404", "NoSuchKey", "NotFound"):
            print("Object storage download failed:", exc)
        return False
    except (BotoCoreError, OSError) as exc:
        print("Object storage download failed:", exc)
        return False
    return True


def _s3_put_bytes(key: str, data: bytes, mime_type: str) -> bool:
    try:
        _get_client().put_object(
            Bucket=settings.s3_bucket, Key=key, Body=data, ContentType=mime_type
        )
        return True
    except (ClientError, BotoCoreError) as exc:
        print(f"Object storage write failed for {key}:", exc)
        return False


def _s3_get_bytes(key: str) -> bytes | None:
    client = _get_client()
    try:
        res = client.get_object(Bucket=settings.s3_bucket, Key=key)
    except ClientError as exc:
        code = str(exc.response.get("Error", {}).get("Code", ""))
        if code not in ("404", "NoSuchKey", "NotFound"):
            print(f"Object storage read failed for {key}:", exc)
        return None
    except BotoCoreError as exc:
        print(f"Object storage read failed for {key}:", exc)
        return None

    try:
        with res["Body"] as stream:
            return stream.read()
    except (OSError, BotoCoreError) as exc:
        print(f"Object storage read failed for {key}:", exc)
        return None


def _s3_exists(key: str) -> bool:
    try:
        _get_client().head_object(Bucket=settings.s3_bucket, Key=key)
        return True
    except (ClientError, BotoCoreError):
        return False


def _s3_ensure_bucket() -> str:
    client = _get_client()
    try:
        client.head_bucket(Bucket=settings.s3_bucket)
        return ""
    except (ClientError, BotoCoreError):
        pass

    try:
        region = settings.s3_region or "auto"
        kwargs = {"Bucket": settings.s3_bucket}
        # AWS rejects a LocationConstraint for us-east-1; R2 wants none at all.
        if region and region != "us-east-1":
            kwargs["CreateBucketConfiguration"] = {"LocationConstraint": region}
        client.create_bucket(**kwargs)
        return ""
    except (ClientError, BotoCoreError) as exc:
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
            _get_client().delete_object(Bucket=settings.s3_bucket, Key=key)
        except (ClientError, BotoCoreError) as exc:
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
