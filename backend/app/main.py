import threading
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import BACKEND_DIR, settings
from .db import init_db, recover_orphan_processing
from .routers import auth, diarization, export, sessions, transcription, uploads, insights, share
from .routers import ai_features

app = FastAPI(title="Speech-to-Text Transcription Studio", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(transcription.router)
app.include_router(diarization.router)
app.include_router(sessions.router)
app.include_router(export.router)
app.include_router(insights.router)
app.include_router(share.router)
app.include_router(ai_features.router)


@app.on_event("startup")
def on_startup():
    init_db()
    try:
        recovered = recover_orphan_processing()
        if recovered:
            print(f"Recovered {recovered} orphaned processing session(s)")
    except Exception as exc:
        print("Startup recovery failed:", exc)
    _load_bucket_secrets()
    _start_keepalive()
    _start_janitor()


def _start_janitor() -> None:
    """Self-healing: a session stuck in processing/diarizing/downloading for
    over 90 minutes gets ONE automatic retry; if it stalls again the user
    sees a clear error instead of an eternal spinner."""
    import time as _time

    from . import db

    def _loop() -> None:
        seen: dict[str, float] = {}
        retried: set[str] = set()
        while True:
            _time.sleep(600)
            try:
                stuck = {
                    s["id"]: s
                    for s in db.list_local_sessions_by_status(
                        ["processing", "diarizing", "downloading"]
                    )
                }
                now = _time.time()
                for sid in list(seen):
                    if sid not in stuck:
                        seen.pop(sid, None)
                for sid, sess in stuck.items():
                    first = seen.setdefault(sid, now)
                    if now - first < 90 * 60:
                        continue
                    if sess.get("status") == "downloading":
                        # a hung import cannot be fixed by re-running the
                        # transcription — fail it with a clear message
                        seen.pop(sid, None)
                        db.update_session(
                            sid,
                            status="error",
                            error="تعذّر تنزيل الملف من الرابط — جرّب رابطاً آخر أو ارفع الملف مباشرة. (Download stalled — try another link or upload the file.)",
                        )
                        print(f"[janitor] failed stuck download {sid}")
                        continue
                    if sid not in retried:
                        retried.add(sid)
                        seen.pop(sid, None)
                        print(f"[janitor] retrying stuck session {sid}")
                        try:
                            from .routers.transcription import _run_transcription
                            db.update_session(sid, status="processing", error=None)
                            threading.Thread(
                                target=_run_transcription, args=(sid, None), daemon=True
                            ).start()
                        except Exception as exc:
                            print(f"[janitor] retry failed for {sid}:", exc)
                    else:
                        seen.pop(sid, None)
                        db.update_session(
                            sid,
                            status="error",
                            error="توقفت المعالجة أكثر من اللازم — أعد المحاولة من الأرشيف. (Processing stalled — please retry.)",
                        )
                        print(f"[janitor] gave up on {sid} after retry")
            except Exception as exc:
                print("[janitor] loop error:", exc)

    threading.Thread(target=_loop, daemon=True, name="stuck-janitor").start()


def _start_keepalive() -> None:
    """Self keep-alive: the service pings its own public URL every few minutes.

    The request enters through Render's proxy, so it counts as inbound traffic
    and resets the free-tier idle timer — the app stays warm 24/7 regardless of
    whether the user's computer is on. Best-effort: failures are swallowed.
    """
    import threading
    import time

    def _loop():
        url = f"{settings.public_url.rstrip('/')}/api/health"
        time.sleep(45)
        while True:
            try:
                import requests as _requests

                code = _requests.get(url, timeout=30).status_code
                print(f"[keepalive] {url} -> {code}")
            except Exception as exc:
                print(f"[keepalive] failed: {exc}")
            time.sleep(max(60, settings.keepalive_seconds))

    threading.Thread(target=_loop, daemon=True, name="render-keepalive").start()
    print(f"[keepalive] self-ping enabled every {max(60, settings.keepalive_seconds)}s")


def _load_bucket_secrets() -> None:
    """Secrets that cannot ride in the repo (GitHub push protection blocks
    API keys) live as private objects in the app's own bucket. The dashboard
    env var, when set, always wins."""
    if settings.groq_api_key:
        return
    try:
        from .services import storage

        if not storage.enabled():
            return
        raw = storage.get_bytes("secrets/groq_api_key.txt")
        # The active bucket can momentarily refuse reads (B2 daily download
        # cap) — the secret also lives on the Supabase copy, outside that cap,
        # so transcription must never be left without its key.
        if not raw and storage.driver() != "supabase":
            raw = storage._sb_get_bytes("secrets/groq_api_key.txt")
            if raw:
                print("GROQ_API_KEY loaded from the Supabase fallback copy")
        value = (raw or b"").decode("utf-8", "ignore").strip()
        if value:
            settings.groq_api_key = value
            print("GROQ_API_KEY loaded from bucket secret")
    except Exception as exc:
        print("Bucket secret load failed:", exc)


@app.get("/api/health")
def health():
    # Node availability decides whether the bgutil PO-token provider can run
    # in-service (YouTube bot-check bypass for datacenter IPs).
    import shutil
    import subprocess
    node = shutil.which("node")
    node_ver = None
    if node:
        try:
            out = subprocess.run([node, "--version"], capture_output=True, text=True, timeout=10)
            node_ver = out.stdout.strip()
        except Exception:
            node_ver = None
    pot_server = BACKEND_DIR / "pot_server"
    diag = {
        "node": node_ver,
        "bgutil_script": (pot_server / "build" / "main.js").exists(),
        "bgutil_modules": (pot_server / "node_modules").exists(),
    }
    try:
        import yt_dlp_plugins.extractor.getpot_bgutil_http  # noqa: F401
        diag["bgutil_plugin"] = True
    except Exception:
        diag["bgutil_plugin"] = False
    try:
        from .routers.uploads import bgutil_status
        diag["bgutil"] = bgutil_status()
    except Exception:
        pass
    return {"ok": True, **diag}


# Serve Frontend Static Files
dist_path = str(BACKEND_DIR.parent / "frontend" / "dist")
if not os.path.exists(dist_path):
    dist_path = os.path.abspath("frontend/dist")
if not os.path.exists(dist_path):
    dist_path = os.path.abspath("../frontend/dist")

assets_path = os.path.join(dist_path, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")


@app.middleware("http")
async def cache_headers(request, call_next):
    """index.html must always be revalidated: it names the hashed bundle, and
    a stale cached copy points at a file the next deploy removes — a blank
    page for every returning visitor. Hashed /assets files are immutable, so
    they get the opposite: cache forever."""
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/api/") or path.startswith("/uploads/"):
        return response
    if path.startswith("/assets/"):
        response.headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")
    else:
        response.headers.setdefault("Cache-Control", "no-cache")
    return response


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("uploads/"):
        return JSONResponse({"error": "Not found"}, status_code=404)
    file_path = os.path.join(dist_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_file = os.path.join(dist_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"status": "Frontend dist is building or missing. Please ensure build command ran successfully."}
