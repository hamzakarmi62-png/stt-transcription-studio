from pathlib import Path

from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _anchored(value: str) -> Path:
    """Relative paths are resolved against the backend dir, never the CWD."""
    path = Path(value)
    return path if path.is_absolute() else BACKEND_DIR / path


class Settings(BaseSettings):
    whisper_model: str = "base"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"

    transcription_engine: str = "auto"
    groq_api_key: str = ""
    groq_model: str = "whisper-large-v3-turbo"

    # Public URL of this deployment — used by the self keep-alive pinger so the
    # Render free tier never spins the service down (even with the user's PC off).
    public_url: str = "https://stt-transcription-studio.onrender.com"

    # HMAC secret for bearer tokens; stable so tokens survive restarts.
    auth_secret: str = ""
    keepalive_seconds: int = 600

    diarization_method: str = "auto"
    hf_token: str = ""

    upload_dir: str = "uploads"
    db_path: str = "data/app.db"
    max_upload_mb: int = 2000
    cloud_upload_max_mb: int = 50
    # Original video files up to this size are archived as-is on the small
    # (1 GB) Supabase bucket, so playback keeps the picture; bigger ones fall
    # back to their mono mp3 track. Raise the env var if the bucket grows.
    cloud_video_max_mb: int = 120
    cors_origins: str = "http://localhost:5173"

    # Where uploaded media is kept. "auto" prefers a dedicated S3 bucket and
    # falls back to Supabase Storage; "s3" and "supabase" force one driver;
    # "local" opts out, leaving media on this machine only. Anything but "local"
    # makes the bucket the source of truth, so uploads survive a shutdown.
    storage_backend: str = "auto"
    s3_endpoint: str = ""
    s3_region: str = "auto"
    s3_bucket: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_presign_seconds: int = 3600

    supabase_url: str = ""
    # Supplied by backend/.env. Never commit the real key: it is a service_role
    # secret that bypasses row-level security.
    supabase_key: str = ""

    model_config = {"env_file": str(BACKEND_DIR / ".env"), "extra": "ignore"}

    @property
    def upload_path(self) -> Path:
        return _anchored(self.upload_dir)

    @property
    def database_path(self) -> Path:
        return _anchored(self.db_path)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()