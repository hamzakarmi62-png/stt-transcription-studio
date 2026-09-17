import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import BACKEND_DIR, settings
from .db import init_db, recover_orphan_processing
from .routers import auth, diarization, export, sessions, transcription, uploads, insights

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
        value = (raw or b"").decode("utf-8", "ignore").strip()
        if value:
            settings.groq_api_key = value
            print("GROQ_API_KEY loaded from bucket secret")
    except Exception as exc:
        print("Bucket secret load failed:", exc)


@app.get("/api/health")
def health():
    return {"ok": True}


# Serve Frontend Static Files
dist_path = str(BACKEND_DIR.parent / "frontend" / "dist")
if not os.path.exists(dist_path):
    dist_path = os.path.abspath("frontend/dist")
if not os.path.exists(dist_path):
    dist_path = os.path.abspath("../frontend/dist")

assets_path = os.path.join(dist_path, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")


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
