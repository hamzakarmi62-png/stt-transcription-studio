"""Post-transcription insights: translation, AI summary, speaking stats.

Strictly additive layer on top of finished sessions — segments produced by
the transcription pipeline are only READ here, never rewritten.
"""

import re
import threading

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from .. import db
from ..services import groq_llm
from .auth import ensure_session_owner, user_id_from_request

router = APIRouter(prefix="/api/sessions/{session_id}")

LANGS = {
    "fr": "Français",
    "en": "English",
    "ar": "العربية",
    "es": "Español",
    "de": "Deutsch",
    "tr": "Türkçe",
}

BATCH = 25


class TranslateRequest(BaseModel):
    language: str


def _fmt(t) -> str:
    try:
        t = float(t)
        m, s = divmod(int(t), 60)
        h, m = divmod(m, 60)
        return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"
    except Exception:
        return "00:00"


def _get(session_id: str, request: Request = None):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    # request is None only for internal background threads, which run on
    # behalf of the owner who already passed the HTTP check.
    if request is not None:
        ensure_session_owner(session, user_id_from_request(request))
    return session


def _save_settings(session_id: str, settings_map: dict) -> None:
    db.update_session(session_id, settings=settings_map)


def _parse_numbered(content: str, count: int) -> dict:
    out = {}
    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^(\d{1,4})[\).\-\s:]+(.*)$", line)
        if m:
            n = int(m.group(1))
            if 1 <= n <= count:
                out[n] = m.group(2).strip()
    return out


# Groq rejects oversized request bodies (413): cap every request's text and
# split oversized batches so long transcripts translate/summarize reliably.
MAX_CHUNK_CHARS = 8000
SUMMARY_CHUNK_CHARS = 12000


def _chunk_texts(texts):
    """Group texts into batches capped by count AND character size."""
    batches = []
    i = 0
    while i < len(texts):
        batch = texts[i:i + BATCH]
        while len(batch) > 1 and sum(len(t) for t in batch) + 10 * len(batch) > MAX_CHUNK_CHARS:
            batch = batch[:-1]
        batches.append(batch)
        i += len(batch)
    return batches


def _run_translate(session_id: str, language: str) -> None:
    try:
        session = _get(session_id)
        segments = session.get("segments") or []
        texts = [str(s.get("text") or "").strip() for s in segments]
        total = len(texts)
        out = []
        done = 0
        for chunk in _chunk_texts(texts):
            numbered = "\n".join(f"{j + 1}. {t}" for j, t in enumerate(chunk) if t)
            content = groq_llm.chat(
                [
                    {
                        "role": "system",
                        "content": (
                            "You are a professional subtitle translator. Translate every "
                            "numbered line faithfully and naturally into the requested "
                            "language. Reply with ONLY the numbered lines using the SAME "
                            "numbers, no commentary."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Target language: {LANGS.get(language, language)}\n\n{numbered}",
                    },
                ],
                temperature=0.15,
            )
            parsed = _parse_numbered(content, len(chunk))
            for j, original in enumerate(chunk):
                seg = segments[done + j]
                out.append(
                    {
                        "start": seg.get("start"),
                        "end": seg.get("end"),
                        "speaker": seg.get("speaker"),
                        "text": parsed.get(j + 1, original),
                    }
                )
            done += len(chunk)
            sm = dict(_get(session_id).get("settings") or {})
            job = dict(sm.get("translate_job") or {})
            job["progress"] = min(done, total)
            sm["translate_job"] = job
            _save_settings(session_id, sm)

        session = _get(session_id)
        sm = dict(session.get("settings") or {})
        tr = dict(sm.get("translations") or {})
        tr[language] = out
        sm["translations"] = tr
        job = dict(sm.get("translate_job") or {})
        job.update({"status": "done", "progress": total})
        sm["translate_job"] = job
        _save_settings(session_id, sm)
    except Exception as exc:
        try:
            sm = dict(_get(session_id).get("settings") or {})
            job = dict(sm.get("translate_job") or {})
            job.update({"status": "error", "error": str(exc)[:300]})
            sm["translate_job"] = job
            _save_settings(session_id, sm)
        except Exception:
            pass


def _summarize_body(body: str, partial: bool) -> str:
    if partial:
        system = (
            "Tu es un analyste professionnel. Résume cette PARTIE de transcription "
            "en français : les points clés (liste à puces « • ») puis les actions à "
            "entreprendre si pertinentes. Sois concis. Réponds en texte brut."
        )
    else:
        system = (
            "Tu es un analyste professionnel. Résume cette transcription "
            "en français : 6 à 10 points clés (liste à puces « • »), puis une "
            "section « Actions » avec les actions à entreprendre si pertinentes. "
            "Réponds en texte brut, sans titres markdown."
        )
    return groq_llm.chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": body},
        ],
        temperature=0.3,
        max_tokens=2048,
    )


def _run_summary(session_id: str) -> None:
    try:
        session = _get(session_id)
        speakers = {s.get("id"): s.get("name") for s in (session.get("speakers") or [])}
        lines = []
        for s in session.get("segments") or []:
            who = speakers.get(s.get("speaker"), "?")
            lines.append(f"[{_fmt(s.get('start'))}] {who}: {s.get('text')}")

        # Long transcripts: map-reduce. Summarize each chunk, then a final
        # pass over the partial summaries. Groq rejects oversized bodies.
        chunks = []
        cur, cur_len = [], 0
        for line in lines:
            cur.append(line)
            cur_len += len(line) + 1
            if cur_len >= SUMMARY_CHUNK_CHARS:
                chunks.append("\n".join(cur))
                cur, cur_len = [], 0
        if cur:
            chunks.append("\n".join(cur))

        if len(chunks) <= 1:
            content = _summarize_body("\n".join(lines), partial=False).strip()
        else:
            partials = []
            for idx, ch in enumerate(chunks):
                partials.append(
                    "\u2014 Partie " + str(idx + 1) + "/" + str(len(chunks)) + " \u2014\n"
                    + _summarize_body(ch, partial=True).strip()
                )
                sm = dict(_get(session_id).get("settings") or {})
                job = dict(sm.get("summary_job") or {})
                job["progress"] = str(idx + 1) + "/" + str(len(chunks))
                sm["summary_job"] = job
                _save_settings(session_id, sm)
            combined = "\n\n".join(partials)
            try:
                content = _summarize_body(
                    "Voici les résumés partiels d'une longue transcription. "
                    "Fusionne-les en UN résumé global cohérent (points clés puis "
                    "Actions), sans répéter les parties.\n\n" + combined,
                    partial=False,
                ).strip()
            except Exception:
                content = combined

        sm = dict(_get(session_id).get("settings") or {})
        sm["summary"] = {"language": "fr", "text": content}
        job = dict(sm.get("summary_job") or {})
        job.update({"status": "done"})
        sm["summary_job"] = job
        _save_settings(session_id, sm)
    except Exception as exc:
        try:
            sm = dict(_get(session_id).get("settings") or {})
            job = dict(sm.get("summary_job") or {})
            job.update({"status": "error", "error": str(exc)[:300]})
            sm["summary_job"] = job
            _save_settings(session_id, sm)
        except Exception:
            pass


@router.post("/translate")
def start_translation(session_id: str, req: TranslateRequest, request: Request = None):
    if req.language not in LANGS:
        raise HTTPException(400, "Langue non supportée")
    session = _get(session_id, request)
    if not (session.get("segments") or []):
        raise HTTPException(400, "Aucun texte à traduire — transcrivez d'abord")
    if not groq_llm.available():
        raise HTTPException(503, "Clé GROQ absente côté serveur")

    sm = dict(session.get("settings") or {})
    job = dict(sm.get("translate_job") or {})
    if job.get("status") == "running":
        return {"ok": True, "job": job}

    tr = dict(sm.get("translations") or {})
    tr.pop(req.language, None)
    sm["translations"] = tr
    job = {"language": req.language, "status": "running", "progress": 0}
    sm["translate_job"] = job
    _save_settings(session_id, sm)
    threading.Thread(target=_run_translate, args=(session_id, req.language), daemon=True).start()
    return {"ok": True, "job": job}


@router.get("/translate/status")
def translation_status(session_id: str, request: Request = None):
    session = _get(session_id, request)
    sm = dict(session.get("settings") or {})
    return {
        "job": sm.get("translate_job") or {"status": "idle"},
        "translations": sm.get("translations") or {},
    }


@router.post("/summary")
def start_summary(session_id: str, request: Request = None):
    session = _get(session_id, request)
    if not (session.get("segments") or []):
        raise HTTPException(400, "Aucun texte à résumer — transcrivez d'abord")
    if not groq_llm.available():
        raise HTTPException(503, "Clé GROQ absente côté serveur")

    sm = dict(session.get("settings") or {})
    job = dict(sm.get("summary_job") or {})
    if job.get("status") == "running":
        return {"ok": True, "job": job}
    sm["summary_job"] = {"status": "running"}
    _save_settings(session_id, sm)
    threading.Thread(target=_run_summary, args=(session_id,), daemon=True).start()
    return {"ok": True, "job": sm["summary_job"]}


@router.get("/summary/status")
def summary_status(session_id: str, request: Request = None):
    session = _get(session_id, request)
    sm = dict(session.get("settings") or {})
    return {
        "job": sm.get("summary_job") or {"status": "idle"},
        "summary": sm.get("summary"),
    }


@router.get("/stats")
def speaking_stats(session_id: str, request: Request = None):
    session = _get(session_id, request)
    segments = session.get("segments") or []
    speakers = {s.get("id"): s.get("name", "?") for s in (session.get("speakers") or [])}
    per = {}
    words = 0
    duration = 0.0
    for s in segments:
        try:
            dur = max(0.0, float(s.get("end", 0)) - float(s.get("start", 0)))
        except Exception:
            dur = 0.0
        who = speakers.get(s.get("speaker"), "—")
        slot = per.setdefault(who, {"seconds": 0.0, "words": 0, "segments": 0})
        slot["seconds"] += dur
        slot["words"] += len(str(s.get("text") or "").split())
        slot["segments"] += 1
        words += len(str(s.get("text") or "").split())
        duration = max(duration, float(s.get("end", 0) or 0))
    return {
        "duration": duration,
        "segments": len(segments),
        "words": words,
        "speakers": [
            {"name": name, "seconds": round(v["seconds"], 1), "words": v["words"], "segments": v["segments"]}
            for name, v in sorted(per.items(), key=lambda kv: -kv[1]["seconds"])
        ],
    }
