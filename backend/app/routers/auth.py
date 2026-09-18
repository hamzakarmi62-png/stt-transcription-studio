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
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5)
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
        if not EMAIL_RE.match(req.email.strip()):
            raise HTTPException(status_code=400, detail="Adresse e-mail invalide.")

        existing_username = get_user_by_username_or_email(req.username)
        if existing_username:
            raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris.")

        existing_email = get_user_by_username_or_email(req.email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Cette adresse e-mail est déjà utilisée.")

        user_id = uuid.uuid4().hex[:12]
        profile = {
            "full_name": req.full_name.strip(),
            "phone": req.phone.strip(),
            "country": req.country.strip(),
        }
        user = create_user(user_id, req.username.strip(), req.email.strip(), req.password, profile)
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
