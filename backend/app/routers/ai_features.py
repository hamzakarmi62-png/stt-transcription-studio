"""AI features layered on a finished transcript (strictly additive):

  * Highlights — auto-generated "moment" cards (title, summary, timestamps)
    rendered above the transcript; Preview seeks the media to that moment.
  * Ask — question answering over the transcript: long transcripts go through
    a retrieval pass per chunk, then one grounded answer.

Highlights run as a background thread and cache into session settings, so the
cards appear instantly on every later visit.
"""

import json
import re
import threading

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from .. import db
from ..services import groq_llm
from .auth import user_id_from_request
from .insights import _fmt, _get, _save_settings

router = APIRouter(prefix="/api/sessions/{session_id}")

HIGHLIGHT_CHUNK_CHARS = 9000
ASK_CHUNK_CHARS = 12000
RETRIEVED_CAP = 9000
MAX_HIGHLIGHTS = 12


class AskRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)


def _timestamp_lines(segments):
    """Transcript as [mm:ss] text lines (skips empties)."""
    lines = []
    for s in segments:
        text = (s.get("text") or "").strip()
        if text:
            lines.append(f"[{_fmt(s.get('start'))}] {text}")
    return lines


def _chunk_lines(lines, cap):
    chunks, cur, size = [], [], 0
    for line in lines:
        if cur and size + len(line) > cap:
            chunks.append("\n".join(cur))
            cur, size = [], 0
        cur.append(line)
        size += len(line) + 1
    if cur:
        chunks.append("\n".join(cur))
    return chunks


def _parse_seconds(stamp):
    m = re.match(r"^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$", str(stamp).strip())
    if not m:
        return None
    h = int(m.group(1) or 0)
    return h * 3600 + int(m.group(2)) * 60 + int(m.group(3))


def _extract_json_array(content):
    content = re.sub(r"^```(?:json)?|```$", "", content.strip(), flags=re.MULTILINE).strip()
    start, end = content.find("["), content.rfind("]")
    if start == -1 or end <= start:
        return []
    try:
        data = json.loads(content[start:end + 1])
        return data if isinstance(data, list) else []
    except ValueError:
        return []


def _duration_of(session):
    try:
        return float(session.get("duration") or 0)
    except (TypeError, ValueError):
        return 0.0


def _save_highlight_state(session_id, state):
    session = db.get_session(session_id)
    merged = dict((session or {}).get("settings") or {})
    merged["highlights"] = state
    _save_settings(session_id, merged)


def _run_highlights(session_id):
    try:
        session = db.get_session(session_id)
        if not session:
            return
        lines = _timestamp_lines(session.get("segments") or [])
        chunks = _chunk_lines(lines, HIGHLIGHT_CHUNK_CHARS)
        items = []
        for chunk in chunks:
            prompt = (
                "You are an editor creating highlight cards for a transcript. "
                "Below is a PORTION of a transcript where every line starts with its [mm:ss] timestamp.\n"
                "Pick the 2-4 most interesting, self-contained moments of THIS portion.\n"
                'For each moment return one JSON object: {"title": short catchy title in the SAME language as the transcript (max 60 chars), '
                '"summary": exactly 2 sentences in the same language, '
                '"start": the [mm:ss] timestamp where the moment begins (copy a real timestamp from the text), '
                '"end": a real timestamp after start where it ends}.\n'
                "Return ONLY the JSON array — no markdown fences, no commentary.\n\n"
                f"TRANSCRIPT PORTION:\n{chunk}"
            )
            try:
                content = groq_llm.chat(
                    [{"role": "user", "content": prompt}],
                    temperature=0.4,
                    max_tokens=1500,
                )
            except Exception:
                continue
            for item in _extract_json_array(content):
                if not isinstance(item, dict):
                    continue
                start = _parse_seconds(item.get("start"))
                end = _parse_seconds(item.get("end"))
                title = str(item.get("title") or "").strip()
                summary = str(item.get("summary") or "").strip()
                if start is None or title == "" or summary == "":
                    continue
                duration = _duration_of(session)
                end = end if (end is not None and end > start) else min(start + 120, max(start + 30, duration))
                start = max(0.0, min(start, max(0.0, duration - 5) if duration else start))
                end = min(end, duration) if duration else end
                if end - start < 5:
                    end = start + 30
                items.append({
                    "title": title[:90],
                    "summary": summary[:400],
                    "start": round(start, 2),
                    "end": round(end, 2),
                })
        items = sorted(items, key=lambda x: x["start"])[:MAX_HIGHLIGHTS]
        _save_highlight_state(session_id, {"status": "done", "items": items})
    except Exception as exc:
        _save_highlight_state(session_id, {"status": "error", "error": str(exc)[:200]})


@router.post("/highlights")
def highlights(session_id: str, request: Request = None, force: bool = False):
    """Start (or return the cached) highlight cards. Poll this endpoint."""
    session = _get(session_id, request)
    if not groq_llm.available():
        raise HTTPException(503, "AI features are not configured (GROQ_API_KEY missing).")
    state = (session.get("settings") or {}).get("highlights") or {}
    if state.get("status") == "running":
        return {"status": "running"}
    if state.get("status") == "done" and state.get("items") and not force:
        return {"status": "done", "highlights": state["items"]}
    _save_highlight_state(session_id, {"status": "running"})
    threading.Thread(target=_run_highlights, args=(session_id,), daemon=True).start()
    return {"status": "running"}


@router.get("/highlights")
def highlights_status(session_id: str, request: Request = None):
    session = _get(session_id, request)
    state = (session.get("settings") or {}).get("highlights") or {}
    if state.get("status") == "done":
        return {"status": "done", "highlights": state.get("items", [])}
    return {"status": state.get("status") or "none"}


def _ask_answer(question: str, body: str) -> str:
    prompt = (
        "You answer questions strictly from the transcript provided. "
        "Do not invent anything that is not in it. "
        "Answer in the SAME LANGUAGE as the question. "
        "When you reference a moment, cite its [mm:ss] timestamp copied from the transcript. "
        "If the transcript does not contain the answer, say so honestly and briefly.\n\n"
        f"TRANSCRIPT:\n{body}\n\nQUESTION: {question}"
    )
    return groq_llm.chat([{"role": "user", "content": prompt}], temperature=0.2, max_tokens=1200)


@router.post("/ask")
def ask(session_id: str, req: AskRequest, request: Request = None):
    """Grounded Q&A over this transcript (retrieval pass for long ones)."""
    _get(session_id, request)
    if not groq_llm.available():
        raise HTTPException(503, "AI features are not configured (GROQ_API_KEY missing).")
    question = req.question.strip()
    lines = _timestamp_lines(db.get_session(session_id).get("segments") or [])
    total = sum(len(l) for l in lines)
    try:
        if total <= ASK_CHUNK_CHARS:
            answer = _ask_answer(question, "\n".join(lines))
        else:
            retrieved = []
            for chunk in _chunk_lines(lines, ASK_CHUNK_CHARS):
                prompt = (
                    "From the transcript portion below, copy VERBATIM every passage relevant to the question, "
                    "keeping their [mm:ss] timestamps. If nothing is relevant, reply exactly: NOTHING.\n\n"
                    f"TRANSCRIPT PORTION:\n{chunk}\n\nQUESTION: {question}"
                )
                try:
                    content = groq_llm.chat([{"role": "user", "content": prompt}], temperature=0.1, max_tokens=900)
                except Exception:
                    continue
                if content.strip() and "NOTHING" not in content.strip()[:30]:
                    retrieved.append(content.strip())
                if sum(len(r) for r in retrieved) > RETRIEVED_CAP:
                    break
            if not retrieved:
                answer = groq_llm.chat(
                    [{"role": "user", "content": (
                        f"Answer briefly in the same language as this question, saying the transcript does not cover it: {question}"
                    )}],
                    temperature=0.2, max_tokens=300,
                )
            else:
                body = "\n---\n".join(retrieved)[:RETRIEVED_CAP]
                answer = _ask_answer(question, body)
    except Exception as exc:
        raise HTTPException(502, f"AI request failed: {str(exc)[:160]}")
    return {"answer": answer.strip()}
