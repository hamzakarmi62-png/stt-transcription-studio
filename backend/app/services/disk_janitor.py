"""Disk self-protection for the small ephemeral instance disk.

The bucket is the source of truth; the local disk is only a cache. This
janitor keeps the service alive no matter how much media flows through:

  * enforce()  — keeps a free-space reserve by evicting local copies of
                 cloud-backed media (oldest first). ensure_local_audio
                 transparently re-fetches an evicted file on demand, so
                 transcription, diarization and playback keep working.
  * clean_stale_chunks() — removes orphaned chunk directories left behind
                 by crashed or abandoned uploads.

A full disk otherwise breaks EVERYTHING (SQLite writes, uploads, logs), so
the janitor runs periodically and is also invoked inline before large
writes. Files without a cloud copy are never evicted — the bucket must
have the data first.
"""

import shutil
import threading
import time
from pathlib import Path

from .. import db
from ..config import settings

# A fresh upload (archival still running) is never touched.
_MIN_AGE_SECONDS = 10 * 60


def free_mb(path: Path | None = None) -> float:
    """Free space (MB) on the disk holding the uploads dir."""
    target = Path(path) if path else Path(settings.upload_path)
    try:
        target.mkdir(parents=True, exist_ok=True)
        total, _used, free = shutil.disk_usage(target)
        return free / (1024 * 1024)
    except Exception as exc:
        print("[disk-janitor] free_mb failed:", exc)
        return float("inf")


def _media_files() -> list[Path]:
    """Session media files in the uploads dir, oldest first."""
    root = Path(settings.upload_path)
    if not root.exists():
        return []
    files = [p for p in root.iterdir() if p.is_file() and p.stat().st_size > 0]
    files.sort(key=lambda p: p.stat().st_mtime)
    return files


def _cloud_backed(path: Path) -> bool:
    """True when the bucket safely holds this file (evictable)."""
    age = time.time() - path.stat().st_mtime
    if age < _MIN_AGE_SECONDS:
        return False
    session = db.get_session(path.stem)
    if not session:
        # No session row at all: an orphan from a deleted/crashed session.
        # Old enough orphans are safe to drop — nothing references them.
        return age > 60 * 60
    return bool((session.get("settings") or {}).get("cloud"))


def evict_cloud_backed(reserve_mb: float | None = None) -> int:
    """Unlink oldest cloud-backed local copies until the reserve is met."""
    reserve = settings.disk_reserve_mb if reserve_mb is None else reserve_mb
    evicted = 0
    for path in _media_files():
        if free_mb(path.parent) >= reserve:
            break
        try:
            if not _cloud_backed(path):
                continue
            size_mb = path.stat().st_size / (1024 * 1024)
            path.unlink(missing_ok=True)
            evicted += 1
            print(
                f"[disk-janitor] evicted {path.name} ({size_mb:.0f} MB) — "
                "cloud copy remains, re-fetched on demand"
            )
        except FileNotFoundError:
            continue
        except Exception as exc:
            print(f"[disk-janitor] evict failed for {path.name}:", exc)
    return evicted


def clean_stale_chunks() -> int:
    """Remove chunk directories idle past chunk_stale_hours."""
    root = Path(settings.upload_path) / "chunks"
    if not root.exists():
        return 0
    cutoff = time.time() - settings.chunk_stale_hours * 3600
    removed = 0
    for d in root.iterdir():
        try:
            if not d.is_dir():
                continue
            if d.stat().st_mtime < cutoff:
                shutil.rmtree(d, ignore_errors=True)
                removed += 1
        except Exception as exc:
            print(f"[disk-janitor] chunk cleanup failed for {d.name}:", exc)
    return removed


def ensure_room_for(incoming_bytes: int = 0) -> bool:
    """Make room for an incoming write. Returns False only when even after
    evicting every cloud-backed file the reserve cannot be met — the caller
    should then refuse the write with a clear message instead of letting the
    disk fill and crash the service."""
    reserve = settings.disk_reserve_mb
    need_mb = reserve + incoming_bytes / (1024 * 1024)
    if free_mb() >= need_mb:
        return True
    evict_cloud_backed(reserve_mb=need_mb)
    ok = free_mb() >= need_mb
    if not ok:
        print(
            f"[disk-janitor] insufficient space even after eviction "
            f"(need {need_mb:.0f} MB, free {free_mb():.0f} MB)"
        )
    return ok


def _loop() -> None:
    time.sleep(90)  # let the boot settle first
    while True:
        try:
            evicted = evict_cloud_backed()
            stale = clean_stale_chunks()
            if evicted or stale:
                print(
                    f"[disk-janitor] cycle: {evicted} media evicted, "
                    f"{stale} stale chunk dirs removed, "
                    f"{free_mb():.0f} MB free"
                )
        except Exception as exc:
            print("[disk-janitor] cycle error:", exc)
        time.sleep(max(60, settings.janitor_seconds))


def start_janitor() -> None:
    threading.Thread(target=_loop, daemon=True, name="disk-janitor").start()
    print(
        f"[disk-janitor] started — reserve {settings.disk_reserve_mb} MB, "
        f"cycle {max(60, settings.janitor_seconds)}s, "
        f"free now {free_mb():.0f} MB"
    )
