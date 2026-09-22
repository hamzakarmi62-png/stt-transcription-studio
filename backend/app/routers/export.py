import json
from datetime import datetime, timezone
from xml.sax.saxutils import escape

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

from .. import db
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


def _export_json(session, speakers, include_speakers, include_timestamps):
    """Structured JSON for apps and integrations: metadata, speakers, and
    every segment with word-level timings when available."""
    speaker_names = {s.get("id"): s.get("name") for s in speakers}
    segs = []
    for s in session["segments"]:
        item = {}
        if include_timestamps:
            item["start"] = _seconds(s.get("start"))
            item["end"] = _seconds(s.get("end"))
        if include_speakers and s.get("speaker"):
            item["speaker_id"] = s.get("speaker")
            item["speaker"] = speaker_names.get(s.get("speaker"), s.get("speaker"))
        item["text"] = s.get("text", "")
        if s.get("words"):
            item["words"] = [
                {"word": w.get("word", ""), "start": _seconds(w.get("start")), "end": _seconds(w.get("end"))}
                for w in s["words"]
            ]
        segs.append(item)
    payload = {
        "file": session.get("filename", "transcript"),
        "language": session.get("language"),
        "duration": _seconds(session.get("duration")),
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "speakers": [
            {"id": s.get("id"), "name": s.get("name"), "color": s.get("color")}
            for s in speakers
        ] if include_speakers else [],
        "segments": segs,
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

    filename = f"{session['filename'].rsplit('.', 1)[0] or 'transcript'}.{format}"
    return Response(
        content=body,
        media_type=CONTENT_TYPES[format],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )