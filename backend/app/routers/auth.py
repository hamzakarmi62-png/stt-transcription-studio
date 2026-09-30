import hashlib
import hmac
import os
import re
import time
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..db import create_user, get_user_by_username_or_email, public_user, verify_password
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    # Username is no longer asked in the signup form — when absent it is
    # derived from the email prefix (kept unique below). Login works by email.
    username: str = Field("", max_length=50)
    email: str = Field("", max_length=190)
    password: str = Field(..., min_length=6)
    full_name: str = Field("", max_length=120)
    phone: str = Field("", max_length=30)
    country: str = Field("", max_length=60)


class LoginRequest(BaseModel):
    identifier: str
    password: str


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# ── Lightweight signed tokens (HMAC) ─────────────────────────────────────────
# No server-side session store needed: the token carries the user id and an
# expiry, signed with a per-deployment secret. It survives Render restarts.

TOKEN_TTL = 60 * 60 * 24 * 30  # 30 days


def _secret() -> bytes:
    return (settings.auth_secret or settings.supabase_key or "aud-dev-secret").encode("utf-8")


def _sign(payload: str) -> str:
    return hmac.new(_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def make_token(user_id: str) -> str:
    exp = int(time.time()) + TOKEN_TTL
    payload = f"{user_id}.{exp}"
    return f"{payload}.{_sign(payload)}"


def verify_token(token: str) -> str | None:
    """Return the user id if the token is valid, else None."""
    try:
        user_id, exp, sig = token.split(".")
        if int(exp) < time.time():
            return None
        if not hmac.compare_digest(sig, _sign(f"{user_id}.{exp}")):
            return None
        return user_id
    except Exception:
        return None


# ── Share tokens ──────────────────────────────────────────────────────────────
# A share link must never grant account-wide access (the login token does), so
# sharing uses its own scope: an HMAC bound to exactly one session id, with no
# expiry — the recipient keeps access as long as the owner keeps the session.


def make_share_token(session_id: str) -> str:
    payload = f"share.{session_id}"
    return f"{payload}.{_sign(payload)}"


def verify_share_token(token: str, session_id: str) -> bool:
    """True only when `token` is the share capability for this exact session."""
    try:
        scope, sid, sig = token.strip().split(".")
        if scope != "share" or sid != session_id:
            return False
        return hmac.compare_digest(sig, _sign(f"share.{sid}"))
    except Exception:
        return False


def share_token_from_request(request) -> str | None:
    """Share capability from ?t= / ?token= (links) or a bearer header."""
    auth = request.headers.get("authorization") or request.headers.get("Authorization") or ""
    if auth.lower().startswith("bearer "):
        return auth[7:].strip() or None
    for param in ("t", "token"):
        try:
            value = request.query_params.get(param)
        except Exception:
            value = None
        if value:
            return value.strip()
    return None


def user_id_from_request(request) -> str | None:
    """Read the bearer token from a request; None when absent/invalid.

    Also accepts ?token= in the query string: <audio> tags and download
    links cannot send an Authorization header.
    """
    auth = request.headers.get("authorization") or request.headers.get("Authorization") or ""
    if auth.lower().startswith("bearer "):
        return verify_token(auth[7:].strip())
    try:
        query_token = request.query_params.get("token")
    except Exception:
        query_token = None
    if query_token:
        return verify_token(query_token.strip())
    return None


def ensure_session_owner(session: dict, user_id: str | None) -> None:
    """Strict per-account isolation: a session is reachable only by its owner.

    Anonymous callers are rejected outright, and a session that carries no
    owner is never exposed (init_db migrates legacy rows to the primary user).
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentification requise.")
    owner = session.get("user_id")
    if not owner or owner != user_id:
        raise HTTPException(status_code=403, detail="Access denied")


@router.post("/register")
def register(req: RegisterRequest):
    try:
        email_given = req.email.strip()
        if email_given and not EMAIL_RE.match(email_given):
            raise HTTPException(status_code=400, detail="Adresse e-mail invalide.")
        if email_given and get_user_by_username_or_email(email_given):
            raise HTTPException(status_code=400, detail="Cette adresse e-mail est déjà utilisée.")

        # Identity without a form field: the full name (or email prefix) seeds
        # a unique internal username/email pair the user never has to see.
        seed_source = email_given or req.full_name.strip() or "user"
        base = re.sub(r"[^a-zA-Z0-9._-]", "", seed_source.split("@", 1)[0].lower()) or "user"
        username = req.username.strip() or base
        email = email_given or f"{base}@users.aud.studio"
        n = 1
        while get_user_by_username_or_email(username) or get_user_by_username_or_email(email):
            n += 1
            username = f"{base}{n}"
            email = email_given or f"{username}@users.aud.studio"

        user_id = uuid.uuid4().hex[:12]
        profile = {
            "full_name": req.full_name.strip(),
            "phone": req.phone.strip(),
            "country": req.country.strip(),
        }
        user = create_user(user_id, username, email, req.password, profile)
        return {"success": True, "user": user, "token": make_token(user_id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du serveur: {str(e)}")


@router.post("/login")
def login(req: LoginRequest):
    try:
        user_row = get_user_by_username_or_email(req.identifier)
        if not user_row or not verify_password(user_row["password_hash"], req.password):
            raise HTTPException(
                status_code=401,
                detail="Identifiant ou mot de passe incorrect.",
            )

        return {"success": True, "user": public_user(user_row), "token": make_token(user_row["id"])}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du serveur: {str(e)}")
