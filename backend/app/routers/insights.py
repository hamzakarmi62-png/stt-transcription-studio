"""Post-transcription insights: translation, AI summary, speaking stats.

Strictly additive layer on top of finished sessions — segments produced by
the transcription pipeline are only READ here, never rewritten.
"""

import re
import threading

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .. import db
from ..services import groq_llm

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


def _get(session_id: str):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
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


def _run_translate(session_id: str, language: str) -> None:
    try:
        session = _get(session_id)
        segments = session.get("segments") or []
        texts = [str(s.get("text") or "").strip() for s in segments]
        total = len(texts)
        out = []
        for start in range(0, total, BATCH):
            chunk = texts[start:start + BATCH]
            numbered = "\n".join(f"{i + 1}. {t}" for i, t in enumerate(chunk) if t)
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
            for i, original in enumerate(chunk):
                seg = segments[start + i]
                out.append(
                    {
                        "start": seg.get("start"),
                        "end": seg.get("end"),
                        "speaker": seg.get("speaker"),
                        "text": parsed.get(i + 1, original),
                    }
                )
            sm = dict(_get(session_id).get("settings") or {})
            job = dict(sm.get("translate_job") or {})
            job["progress"] = min(start + BATCH, total)
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


def _run_summary(session_id: str) -> None:
    try:
        session = _get(session_id)
        speakers = {s.get("id"): s.get("name") for s in (session.get("speakers") or [])}
        lines = []
        for s in session.get("segments") or []:
            who = speakers.get(s.get("speaker"), "?")
            lines.append(f"[{_fmt(s.get('start'))}] {who}: {s.get('text')}")
        body = "\n".join(lines)[:60000]
        content = groq_llm.chat(
            [
                {
                    "role": "system",
                    "content": (
                        "Tu es un analyste professionnel. Résume cette transcription "
                        "en français : 6 à 10 points clés (liste à puces « • »), puis une "
                        "section « Actions » avec les actions à entreprendre si pertinentes. "
                        "Réponds en texte brut, sans titres markdown."
                    ),
                },
                {"role": "user", "content": body},
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        sm = dict(_get(session_id).get("settings") or {})
        sm["summary"] = {"language": "fr", "text": content.strip()}
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
def start_translation(session_id: str, req: TranslateRequest):
    if req.language not in LANGS:
        raise HTTPException(400, "Langue non supportée")
    session = _get(session_id)
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
def translation_status(session_id: str):
    session = _get(session_id)
    sm = dict(session.get("settings") or {})
    return {
        "job": sm.get("translate_job") or {"status": "idle"},
        "translations": sm.get("translations") or {},
    }


@router.post("/summary")
def start_summary(session_id: str):
    session = _get(session_id)
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
def summary_status(session_id: str):
    session = _get(session_id)
    sm = dict(session.get("settings") or {})
    return {
        "job": sm.get("summary_job") or {"status": "idle"},
        "summary": sm.get("summary"),
    }


@router.get("/stats")
def speaking_stats(session_id: str):
    session = _get(session_id)
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
