from fastapi import APIRouter, HTTPException, Request

from .. import db
from ..models import SessionUpdate
from .auth import ensure_session_owner, user_id_from_request

router = APIRouter(prefix="/api")


@router.get("/sessions")
def get_sessions(request: Request):
    user_id = user_id_from_request(request)
    return db.list_sessions(user_id=user_id)


@router.get("/sessions/{session_id}")
def get_session(session_id: str, request: Request):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    ensure_session_owner(session, user_id_from_request(request))
    return session


@router.put("/sessions/{session_id}")
def update_session(session_id: str, payload: SessionUpdate, request: Request):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    ensure_session_owner(session, user_id_from_request(request))
    return db.update_session(
        session_id,
        segments=[s.model_dump() for s in payload.segments],
        speakers=[s.model_dump() for s in payload.speakers],
        settings=payload.settings,
        language=payload.language,
        duration=payload.duration if payload.duration is not None else session["duration"],
    )


@router.post("/sessions/{session_id}/save")
def save_session(session_id: str, payload: SessionUpdate, request: Request):
    return update_session(session_id, payload, request)