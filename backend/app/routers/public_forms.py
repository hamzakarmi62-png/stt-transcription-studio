"""Public-site endpoints: contact, waitlist, careers applications, article
feedback, public config, and the optional guest demo (disabled by default).

Style follows the existing routers: APIRouter, pydantic bodies, settings from
config.py.  Submissions are stored in the existing SQLite database
(public_submissions table) and — when SMTP is configured through environment
variables — mirrored by one notification email per submission.
"""

import json
import re
import smtplib
import sqlite3
import time
import uuid
from collections import defaultdict
from datetime import datetime
from email.mime.text import MIMEText

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from ..config import settings
from ..db import init_db

router = APIRouter(prefix="/api/public", tags=["public"])

# ── basic in-memory per-IP rate limiting (single-instance free tier) ──────
_HITS: dict = defaultdict(list)
_LIMITS = {"contact": (5, 3600), "waitlist": (5, 3600), "careers": (5, 3600),
           "feedback": (30, 3600), "guest-demo": (settings.guest_demo_daily_limit, 86400)}


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return (fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "?"))


def _rate_ok(kind: str, ip: str) -> bool:
    limit, window = _LIMITS.get(kind, (10, 3600))
    now = time.time()
    hits = [t for t in _HITS[f"{kind}:{ip}"] if now - t < window]
    if len(hits) >= limit:
        _HITS[f"{kind}:{ip}"] = hits
        return False
    hits.append(now)
    _HITS[f"{kind}:{ip}"] = hits
    return True


def _save(kind: str, payload: dict, ip: str) -> None:
    init_db()  # cheap no-op when the table already exists
    conn = sqlite3.connect(settings.database_path)
    try:
        conn.execute(
            "INSERT INTO public_submissions (kind, payload, ip, created_at) VALUES (?, ?, ?, ?)",
            (kind, json.dumps(payload, ensure_ascii=False), ip, datetime.utcnow().isoformat()),
        )
        conn.commit()
    finally:
        conn.close()


def _notify(subject: str, body: str) -> None:
    """Send one notification email when SMTP is fully configured. Never raises."""
    if not (settings.smtp_host and settings.smtp_user and settings.smtp_pass and settings.notify_email):
        return
    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_user
        msg["To"] = settings.notify_email
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as srv:
            srv.starttls()
            srv.login(settings.smtp_user, settings.smtp_pass)
            srv.send_message(msg)
    except Exception as e:  # delivery is best-effort; the submission is stored anyway
        print("Public form notify skipped:", e)


_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")


def _check(email: str, text: str, max_len: int = 4000) -> None:
    if not _EMAIL.match(email or ""):
        raise HTTPException(422, "Please provide a valid email address.")
    if not (text or "").strip():
        raise HTTPException(422, "Please fill in the message field.")
    if len(text) > max_len:
        raise HTTPException(413, "The message is too long.")


def _honeypot(website: str) -> bool:
    """A filled honeypot means a bot — pretend success, store nothing."""
    return bool((website or "").strip())


# ── public config (tells the front-end whether the guest demo box shows) ──
@router.get("/config")
def public_config():
    return {"guest_demo": bool(settings.guest_demo_enabled)}


# ── contact ────────────────────────────────────────────────────────────────
@router.post("/contact")
def contact(request: Request, body: dict):
    ip = _client_ip(request)
    if not _rate_ok("contact", ip):
        raise HTTPException(429, "Too many messages from this address — please try again later.")
    if _honeypot(body.get("website", "")):
        return {"ok": True, "message": "Received — we reply by email."}
    _check(body.get("email", ""), body.get("message", ""))
    payload = {
        "name": str(body.get("name", ""))[:120],
        "email": body["email"][:200],
        "topic": str(body.get("topic", "Support"))[:60],
        "message": body["message"][:4000],
    }
    _save("contact", payload, ip)
    _notify(f"Aud contact — {payload['topic']}",
            f"From: {payload['name']} <{payload['email']}>\nTopic: {payload['topic']}\n\n{payload['message']}")
    return {"ok": True, "message": "Received — we reply by email."}


# ── waitlist (human-verified services + reviewer interest) ─────────────────
@router.post("/waitlist")
def waitlist(request: Request, body: dict):
    ip = _client_ip(request)
    if not _rate_ok("waitlist", ip):
        raise HTTPException(429, "Too many requests from this address — please try again later.")
    if _honeypot(body.get("website", "")):
        return {"ok": True, "message": "You're on the list."}
    _check(body.get("email", ""), body.get("languages", "") or "—", max_len=500)
    payload = {
        "kind": str(body.get("kind", "service"))[:20],
        "service": str(body.get("service", ""))[:120],
        "email": body["email"][:200],
        "languages": str(body.get("languages", ""))[:300],
        "note": str(body.get("note", ""))[:1500],
    }
    _save("waitlist", payload, ip)
    _notify("Aud waitlist", json.dumps(payload, ensure_ascii=False, indent=2))
    return {"ok": True, "message": "You're on the list — we'll email you when the service goes live."}


# ── careers application ─────────────────────────────────────────────────────
@router.post("/careers")
def careers(request: Request, body: dict):
    ip = _client_ip(request)
    if not _rate_ok("careers", ip):
        raise HTTPException(429, "Too many applications from this address — please try again later.")
    if _honeypot(body.get("website", "")):
        return {"ok": True, "message": "Application received."}
    _check(body.get("email", ""), body.get("message", ""))
    payload = {
        "name": str(body.get("name", ""))[:120],
        "email": body["email"][:200],
        "role": str(body.get("role", "General application"))[:120],
        "message": body["message"][:4000],
    }
    _save("careers", payload, ip)
    _notify(f"Aud application — {payload['role']}",
            f"From: {payload['name']} <{payload['email']}>\nRole: {payload['role']}\n\n{payload['message']}")
    return {"ok": True, "message": "Application received — thank you."}


# ── article feedback (help center "Was this helpful?") ──────────────────────
@router.post("/feedback")
def feedback(request: Request, body: dict):
    ip = _client_ip(request)
    if not _rate_ok("feedback", ip):
        raise HTTPException(429, "Too many votes — please try again later.")
    article = str(body.get("article_id", ""))[:60]
    if not article:
        raise HTTPException(422, "Missing article id.")
    payload = {"article_id": article, "helpful": bool(body.get("helpful"))}
    _save("feedback", payload, ip)
    return {"ok": True, "message": "Thanks — your feedback was recorded."}


# ── optional guest demo (OFF unless GUEST_DEMO_ENABLED=true) ────────────────
@router.post("/guest-demo")
async def guest_demo(request: Request, file: UploadFile = File(...)):
    if not settings.guest_demo_enabled:
        raise HTTPException(403, "The guest demo is not enabled on this deployment.")
    ip = _client_ip(request)
    if not _rate_ok("guest-demo", ip):
        raise HTTPException(429, "Daily demo limit reached for this address — come back tomorrow.")

    data = await file.read()
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(413, "The demo accepts files up to 25 MB.")

    import tempfile
    from pathlib import Path

    suffix = Path(file.filename or "clip").suffix or ".mp3"
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / f"guest_{uuid.uuid4().hex[:8]}{suffix}"
        path.write_bytes(data)
        duration = _probe_seconds(str(path))
        if duration and duration > 60:
            raise HTTPException(413, "The demo accepts clips of at most 60 seconds.")
        try:
            text = _transcribe_guest(str(path))
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(502, f"The demo transcription failed: {e}")
    # TemporaryDirectory teardown removes the audio; nothing is persisted.
    return {"ok": True, "text": text.strip()[:5000]}


def _probe_seconds(path: str) -> float | None:
    """Duration via the existing audio service (PyAV/ffmpeg — no new deps)."""
    try:
        from ..services.audio import get_duration
        return get_duration(path)
    except Exception:
        return None


def _transcribe_guest(path: str) -> str:
    """Reuse the app's Groq/Whisper engine selection and transcribe() call."""
    from ..services import groq_stt, transcription

    name = settings.transcription_engine.strip().lower()
    if name == "whisper":
        engine = transcription
    elif name in ("groq", "auto") and settings.groq_api_key:
        engine = groq_stt
    else:
        engine = transcription
    result = engine.transcribe(path, language=None)
    return str((result or {}).get("text", "") if isinstance(result, dict) else result)
