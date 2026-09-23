from fastapi import APIRouter, HTTPException, Request

from .. import db
from ..config import settings
from .auth import (
    ensure_session_owner,
    make_share_token,
    share_token_from_request,
    verify_share_token,
)

router = APIRouter(prefix="/api")


def _require_share_access(session: dict, request: Request) -> None:
    """Only the exact per-session capability opens a shared transcript."""
    token = share_token_from_request(request)
    if not token or not verify_share_token(token, session["id"]):
        raise HTTPException(403, "Lien de partage invalide.")


@router.post("/sessions/{session_id}/share")
def create_share_link(session_id: str, request: Request):
    """Owner action: mint the (stable) share link for one transcript."""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    from .auth import user_id_from_request

    ensure_session_owner(session, user_id_from_request(request))

    token = make_share_token(session_id)
    base = settings.public_url.rstrip("/")
    return {
        "share_url": f"{base}/share/{session_id}?t={token}",
        "token": token,
    }


@router.get("/share/{session_id}")
def get_shared_session(session_id: str, request: Request):
    """Public read-only transcript payload for a valid share link.

    Exposes the transcript content only — never the owner id, storage paths,
    or any account information.
    """
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Lien de partage invalide.")
    _require_share_access(session, request)

    token = share_token_from_request(request)
    return {
        "id": session["id"],
        "filename": session.get("filename"),
        "kind": session.get("kind"),
        "duration": session.get("duration"),
        "language": session.get("language"),
        "created_at": session.get("created_at"),
        "speakers": session.get("speakers", []),
        "segments": session.get("segments", []),
        "audio_url": f"/api/share/{session_id}/audio?t={token}",
    }
