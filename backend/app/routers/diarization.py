import threading

from fastapi import APIRouter, HTTPException, Request

from .. import db
from ..models import DiarizeRequest
from ..services import diarization
from .auth import ensure_session_owner, user_id_from_request
from .uploads import ensure_local_audio

router = APIRouter(prefix="/api")


def _run_diarization(session_id: str, num_speakers: int) -> None:
    try:
        session = db.get_session(session_id)
        if not session:
            return
        db.update_session(session_id, status="diarizing", error=None)
        audio_file = ensure_local_audio(session)
        segments, speakers = diarization.diarize(
            str(audio_file), session.get("segments", []), num_speakers
        )
        db.update_session(session_id, status="done", segments=segments, speakers=speakers)
    except Exception as exc:
        print(f"Diarization error for {session_id}: {exc}")
        session = db.get_session(session_id) or {}
        segments = session.get("segments", [])
        for seg in segments:
            if not seg.get("speaker"):
                seg["speaker"] = "Speaker 1"
        db.update_session(
            session_id,
            status="done",
            segments=segments,
            speakers=[{"id": "s1", "name": "Speaker 1", "color": "#2563eb"}],
        )


@router.post("/sessions/{session_id}/diarize")
def start_diarization(session_id: str, req: DiarizeRequest, request: Request = None):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    user_id = user_id_from_request(request) if request else None
    ensure_session_owner(session, user_id)
    if session["status"] == "diarizing":
        return {"ok": True, "status": "diarizing"}
    thread = threading.Thread(
        target=_run_diarization, args=(session_id, req.num_speakers), daemon=True
    )
    thread.start()
    return {"ok": True, "status": "diarizing"}