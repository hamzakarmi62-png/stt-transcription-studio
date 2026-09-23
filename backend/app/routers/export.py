import json
from datetime import datetime, timezone
from urllib.parse import quote
from xml.sax.saxutils import escape

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

from .. import db
from ..config import settings
from ..services import export as export_service
from .auth import ensure_session_owner, user_id_from_request

router = APIRouter(prefix="/api")

EXPORT_FORMATS = {"txt", "srt", "docx", "pdf", "json", "xml"}
CONTENT_TYPES = {
    "txt": "text/plain; charset=utf-8",
    "srt": "application/x-subrip; charset=utf-8",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "pdf": "application/pdf",
    "json": "application/json; charset=utf-8",
    "xml": "application/xml; charset=utf-8",
}


def _seconds(t):
    try:
        return round(float(t), 3)
    except (TypeError, ValueError):
        return 0.0


def _content_disposition(filename: str, ext: str) -> str:
    """Download header safe for any filename.

    HTTP header values must be latin-1 encodable, so an Arabic (or emoji)
    media name sent raw would raise UnicodeEncodeError inside Starlette and
    turn every export of that session into a 500. Send an ASCII fallback
    plus the RFC 5987 UTF-8 form, which browsers decode back to the real
    name when saving the file.
    """
    base = (filename or "transcript").rsplit(".", 1)[0].strip() or "transcript"
    base = "".join(ch for ch in base if ch.isprintable()).strip()
    ascii_name = base.encode("ascii", "ignore").decode()
    ascii_name = "".join(ch for ch in ascii_name if ch.isalnum() or ch in " -_.").strip(" -_.")
    if not any(ch.isalnum() for ch in ascii_name):
        ascii_name = "transcript"
    ascii_name = ascii_name.replace('"', "").replace("\\", "")[:80].strip() or "transcript"
    utf8_name = quote(base[:150], safe="")
    return f"attachment; filename=\"{ascii_name}.{ext}\"; filename*=UTF-8''{utf8_name}.{ext}"


def _hms(t) -> str:
    """Human-readable HH:MM:SS.mmm, so timestamps survive outside the app."""
    ms = int(round(max(0.0, float(t)) * 1000))
    h, rem = divmod(ms, 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def _export_json(session, speakers, include_speakers, include_timestamps):
    """Share-grade structured JSON: a self-describing package with metadata,
    per-speaker statistics, a plain-text copy for quick reading, and every
    segment with word-level timings — everything a person or another app
    needs to consume the transcript without this software."""
    speaker_names = {s.get("id"): s.get("name") for s in speakers}

    segs_out = []
    speaker_stats: dict[str, dict] = {}
    total_words = 0
    text_parts = []
    for i, s in enumerate(session["segments"], 1):
        text = s.get("text") or ""
        text_parts.append(text)
        words = [w for w in (s.get("words") or []) if isinstance(w, dict)]
        n_words = len(words) if words else len(text.split())
        total_words += n_words
        start, end = _seconds(s.get("start")), _seconds(s.get("end"))

        item = {"index": i}
        if include_timestamps:
            item["start"] = start
            item["end"] = end
            item["start_hms"] = _hms(start)
            item["end_hms"] = _hms(end)
        if include_speakers and s.get("speaker"):
            item["speaker_id"] = s.get("speaker")
            item["speaker"] = speaker_names.get(s.get("speaker"), s.get("speaker"))
            st = speaker_stats.setdefault(
                s.get("speaker"), {"segments": 0, "words": 0, "speaking_time": 0.0}
            )
            st["segments"] += 1
            st["words"] += n_words
            st["speaking_time"] += max(0.0, end - start)
        item["text"] = text
        if words:
            item["words"] = [
                {"word": w.get("word", ""), "start": _seconds(w.get("start")), "end": _seconds(w.get("end"))}
                for w in words
            ]
        segs_out.append(item)

    duration = _seconds(session.get("duration"))
    speakers_out = []
    if include_speakers:
        for s in speakers:
            st = speaker_stats.get(s.get("id"), {"segments": 0, "words": 0, "speaking_time": 0.0})
            speakers_out.append({
                "id": s.get("id"),
                "name": s.get("name"),
                "color": s.get("color"),
                "segments": st["segments"],
                "words": st["words"],
                "speaking_time": round(st["speaking_time"], 2),
            })

    payload = {
        "format": "aud-transcript",
        "version": "1.0",
        "generator": {"app": "Aud Studio", "url": settings.public_url},
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "media": {
            "file": session.get("filename", "transcript"),
            "type": session.get("kind") or "audio",
            "language": session.get("language"),
            "duration": duration,
            "duration_hms": _hms(duration),
        },
        "stats": {
            "segments": len(segs_out),
            "words": total_words,
            "speakers": len(speakers_out),
        },
        "speakers": speakers_out,
        "text": "\n\n".join(p for p in text_parts if p),
        "segments": segs_out,
    }
    return json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")


def _export_xml(session, speakers, include_speakers, include_timestamps):
    """Structured XML for apps and integrations, mirroring the JSON shape."""
    speaker_names = {s.get("id"): s.get("name") for s in speakers}
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append("<transcript>")
    lines.append(f"  <file>{escape(str(session.get('filename', 'transcript')))}</file>")
    if session.get("language"):
        lines.append(f"  <language>{escape(str(session['language']))}</language>")
    lines.append(f"  <duration>{_seconds(session.get('duration'))}</duration>")
    if include_speakers:
        lines.append("  <speakers>")
        for s in speakers:
            lines.append(
                f'    <speaker id="{escape(str(s.get("id")))}" color="{escape(str(s.get("color", "")))}">'
                f"{escape(str(s.get('name', '')))}</speaker>"
            )
        lines.append("  </speakers>")
    lines.append("  <segments>")
    for s in session["segments"]:
        attrs = []
        if include_timestamps:
            attrs.append(f'start="{_seconds(s.get("start"))}" end="{_seconds(s.get("end"))}"')
        if include_speakers and s.get("speaker"):
            attrs.append(
                f'speaker="{escape(str(speaker_names.get(s.get("speaker"), s.get("speaker"))))}"'
            )
        attr = (" " + " ".join(attrs)) if attrs else ""
        words = s.get("words") or []
        if words:
            lines.append(f"    <segment{attr}>")
            lines.append("      <text>%s</text>" % escape(str(s.get("text", ""))))
            lines.append("      <words>")
            for w in words:
                lines.append(
                    '        <word start="%s" end="%s">%s</word>'
                    % (_seconds(w.get("start")), _seconds(w.get("end")), escape(str(w.get("word", ""))))
                )
            lines.append("      </words>")
            lines.append("    </segment>")
        else:
            lines.append("    <segment%s>%s</segment>" % (attr, escape(str(s.get("text", "")))))
    lines.append("  </segments>")
    lines.append("</transcript>")
    return "\n".join(lines).encode("utf-8")


@router.get("/sessions/{session_id}/export")
def export_session(
    session_id: str,
    format: str = "txt",
    include_speakers: bool = True,
    include_timestamps: bool = True,
    request: Request = None,
):
    if format not in EXPORT_FORMATS:
        raise HTTPException(400, f"Unsupported format '{format}'. Use one of: {', '.join(sorted(EXPORT_FORMATS))}")
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    user_id = user_id_from_request(request) if request else None
    ensure_session_owner(session, user_id)
    segments = session["segments"]
    speakers = session["speakers"]

    if format == "txt":
        content = export_service.export_txt(segments, speakers, include_speakers, include_timestamps)
        body = content.encode("utf-8")
    elif format == "srt":
        content = export_service.export_srt(segments, speakers, include_speakers)
        body = content.encode("utf-8")
    elif format == "docx":
        body = export_service.export_docx(segments, speakers, include_speakers, include_timestamps)
    elif format == "json":
        body = _export_json(session, speakers, include_speakers, include_timestamps)
    elif format == "xml":
        body = _export_xml(session, speakers, include_speakers, include_timestamps)
    else:
        body = export_service.export_pdf(segments, speakers, include_speakers, include_timestamps)

    return Response(
        content=body,
        media_type=CONTENT_TYPES[format],
        headers={"Content-Disposition": _content_disposition(session["filename"], format)},
    )