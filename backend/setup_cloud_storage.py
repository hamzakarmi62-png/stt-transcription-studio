"""Move the existing library into permanent object storage.

Run once after filling the S3_* values in backend/.env:

    python setup_cloud_storage.py            # verify + migrate everything
    python setup_cloud_storage.py --check    # verify connectivity only, change nothing

Resumable: objects already in the bucket are skipped, so it is safe to re-run
after an interruption. Local files are never deleted — they become a cache.
"""

import sqlite3
import sys
import time
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

# The Windows console defaults to cp1252, which cannot encode Arabic output.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

import requests  # noqa: E402

from app.config import settings  # noqa: E402
from app.services import storage  # noqa: E402

CATALOGS = ("users_catalog.json", "sessions_catalog.json")


def human(n: float) -> str:
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if abs(n) < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} PB"


def missing_config() -> list[str]:
    gaps = []
    if settings.storage_backend.strip().lower() != "s3":
        gaps.append("STORAGE_BACKEND=s3")
    for env, value in (
        ("S3_ENDPOINT", settings.s3_endpoint),
        ("S3_BUCKET", settings.s3_bucket),
        ("S3_ACCESS_KEY", settings.s3_access_key),
        ("S3_SECRET_KEY", settings.s3_secret_key),
    ):
        if not value:
            gaps.append(env)
    return gaps


def self_test() -> bool:
    """Round-trip a tiny object so a bad key fails here, not mid-migration."""
    probe = BACKEND_DIR / ".storage_probe.tmp"
    probe.write_bytes(b"stt-studio-probe")
    key = ".probe/self-test.txt"
    try:
        storage.put_file(probe, key, "text/plain")
        if not storage.exists(key):
            print("  ✗ الملف لم يظهر في الدلو بعد رفعه")
            return False
        url = storage.presign_get(key, expires=60)
        got = requests.get(url, timeout=30)
        if got.status_code != 200 or got.content != b"stt-studio-probe":
            print(f"  ✗ الرابط المؤقت أرجع HTTP {got.status_code}")
            return False
        anon = requests.get(
            f"{settings.s3_endpoint.rstrip('/')}/{settings.s3_bucket}/{key}", timeout=30
        )
        if anon.status_code == 200:
            print("  ⚠ الدلو يقرأ بدون توقيع — اجعله خاصاً (private)")
        storage.delete(key)
        return True
    except Exception as exc:
        print(f"  ✗ {exc}")
        return False
    finally:
        probe.unlink(missing_ok=True)


def local_sessions() -> list[sqlite3.Row]:
    db_path = settings.database_path
    if not db_path.exists():
        return []
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        return conn.execute("SELECT * FROM sessions").fetchall()
    except sqlite3.OperationalError:
        return []
    finally:
        conn.close()


def copy_catalogs_from_supabase() -> None:
    """Accounts currently live in Supabase storage; carry them into the bucket."""
    if not (settings.supabase_url and settings.supabase_key):
        return
    headers = {
        "apikey": settings.supabase_key,
        "Authorization": f"Bearer {settings.supabase_key}",
    }
    for name in CATALOGS:
        if storage.exists(name):
            print(f"  = {name} موجود مسبقاً في الدلو")
            continue
        url = f"{settings.supabase_url}/storage/v1/object/uploads/{name}"
        try:
            r = requests.get(url, headers=headers, timeout=15)
        except requests.exceptions.RequestException as exc:
            print(f"  ! تعذّر قراءة {name}: {exc}")
            continue
        if r.status_code != 200 or not r.content:
            print(f"  - {name} غير موجود في Supabase (HTTP {r.status_code})")
            continue
        if storage.put_bytes(name, r.content):
            print(f"  ✓ {name} نُقل إلى الدلو ({human(len(r.content))})")


def migrate_media(check_only: bool) -> tuple[int, int, int, int, int]:
    from app import db
    from app.routers.uploads import _local_path_for

    rows = local_sessions()
    total = len(rows)
    uploaded = skipped = missing = failed = 0
    bytes_sent = 0

    print(f"\nعدد الجلسات في قاعدة البيانات: {total}")
    for i, row in enumerate(rows, 1):
        sid = row["id"]
        path = _local_path_for(dict(row))
        key = db.media_basename(row["audio_path"] or "")
        if not key:
            missing += 1
            print(f"  [{i}/{total}] ✗ الجلسة {sid}: لا يوجد مسار ملف")
            continue

        if not path.exists() or path.stat().st_size == 0:
            if storage.exists(key):
                skipped += 1
            else:
                missing += 1
                print(f"  [{i}/{total}] ✗ {key}: الملف غير موجود محلياً ولا في الدلو")
            continue

        size = path.stat().st_size
        if storage.exists(key):
            skipped += 1
            continue

        if check_only:
            uploaded += 1
            bytes_sent += size
            print(f"  [{i}/{total}] … {key} ({human(size)}) سيُرفع")
            continue

        t0 = time.perf_counter()
        try:
            storage.put_file(path, key, "application/octet-stream")
        except Exception as exc:
            failed += 1
            print(f"  [{i}/{total}] ✗ {key}: {exc}")
            continue

        elapsed = time.perf_counter() - t0
        uploaded += 1
        bytes_sent += size
        speed = size / elapsed / (1024 * 1024) if elapsed else 0
        print(
            f"  [{i}/{total}] ✓ {key} ({human(size)}) في {elapsed:.0f}ث "
            f"({speed:.1f} MB/s)"
        )

        # Mark the session cloud-backed so playback uses a presigned URL.
        session = db.get_session(sid)
        merged = dict((session or {}).get("settings") or {})
        merged["cloud"] = "s3"
        db.update_session(sid, settings=merged)

    return uploaded, skipped, missing, failed, bytes_sent


def main() -> int:
    check_only = "--check" in sys.argv

    print("=" * 62)
    print("  نقل مكتبة الفيديوهات إلى تخزين سحابي دائم")
    print("=" * 62)

    gaps = missing_config()
    if gaps:
        print("\n✗ الإعدادات التالية ناقصة في backend/.env:")
        for g in gaps:
            print(f"    {g}")
        print("\nمثال (Cloudflare R2):")
        print("  STORAGE_BACKEND=s3")
        print("  S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com")
        print("  S3_REGION=auto")
        print("  S3_BUCKET=stt-media")
        print("  S3_ACCESS_KEY=...")
        print("  S3_SECRET_KEY=...")
        return 2

    print(f"\nالدلو      : {settings.s3_bucket}")
    print(f"النقطة     : {settings.s3_endpoint}")
    print(f"المنطقة    : {settings.s3_region or 'auto'}")
    print(f"قاعدة البيانات: {settings.database_path}")
    print(f"المجلد المحلي : {settings.upload_path}")

    print("\n[1/4] فحص الاتصال…")
    err = storage.ensure_bucket()
    if err:
        print(f"  ✗ تعذّر التأكد من الدلو: {err}")
        return 3
    print("  ✓ الدلو متاح")

    print("\n[2/4] اختبار رفع/قراءة/رابط مؤقت…")
    if not self_test():
        print("\n✗ الاختبار فشل — لن تتم أي عملية نقل.")
        return 4
    print("  ✓ نجح الاختبار")

    print("\n[3/4] نقل الحسابات والجلسات…")
    copy_catalogs_from_supabase()

    print("\n[4/4] نقل ملفات الصوت والفيديو…")
    if check_only:
        print("  (وضع الفحص فقط — لن يُرفع شيء)")
    uploaded, skipped, missing, failed, bytes_sent = migrate_media(check_only)

    print("\n" + "=" * 62)
    label = "سيُرفع" if check_only else "رُفع"
    print(f"  {label}        : {uploaded} ملف  ({human(bytes_sent)})")
    print(f"  موجود مسبقاً : {skipped}")
    print(f"  مفقود        : {missing}")
    print(f"  فشل          : {failed}")
    print("=" * 62)
    if failed:
        print("أعد تشغيل السكربت لإكمال ما فشل — الملفات المرفوعة لن تُعاد.")
        return 1
    print("\n✓ انتهى. الفيديوهات الآن في السحابة ولا تُحذف بإطفاء الحاسوب.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
