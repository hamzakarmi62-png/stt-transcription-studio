"""Cloud transcription via Groq's OpenAI-compatible audio API.

Groq rejects requests above 25 MB, so the source media is first reduced to mono
16 kHz mp3 (~4 KB/s, i.e. roughly 100 minutes per 24 MB) and split into chunks
only when that still overflows. Segment and word timestamps are re-offset by the
chunk's start time so callers see one continuous timeline.
"""

import logging
import shutil
import tempfile
import uuid
from pathlib import Path

import av
import requests

from ..config import settings
from .audio import AUDIO_BITRATE, SAMPLE_RATE, extract_audio_track

logger = logging.getLogger(__name__)

GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
MAX_CHUNK_BYTES = 24 * 1024 * 1024
BYTES_PER_SECOND = AUDIO_BITRATE / 8
REQUEST_TIMEOUT = (30, 900)


def _extract_audio(src: Path, dst: Path, start: float | None = None, end: float | None = None) -> float:
    """Decode src into mono 16 kHz mp3 at dst, keeping only [start, end)."""
    return extract_audio_track(src, dst, SAMPLE_RATE, AUDIO_BITRATE, start, end)


def _probe_duration(src: Path) -> float:
    container = av.open(str(src), metadata_errors="ignore")
    try:
        if container.duration:
            return container.duration / 1_000_000
        stream = container.streams.audio[0]
        if stream.duration and stream.time_base:
            return float(stream.duration * stream.time_base)
    finally:
        container.close()
    return 0.0


def _plan_chunks(duration: float) -> list[tuple[float | None, float | None]]:
    if duration <= 0:
        return [(None, None)]
    chunk_seconds = MAX_CHUNK_BYTES / BYTES_PER_SECOND
    if duration <= chunk_seconds:
        return [(None, None)]
    parts = []
    start = 0.0
    while start < duration:
        parts.append((start, min(start + chunk_seconds, duration)))
        start += chunk_seconds
    return parts


def _transcribe_chunk(path: Path, language: str | None) -> dict:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    data = {
        "model": settings.groq_model,
        "response_format": "verbose_json",
        "timestamp_granularities[]": ["segment", "word"],
    }
    if language:
        data["language"] = language

    with path.open("rb") as handle:
        response = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            data=data,
            files={"file": (path.name, handle, "audio/mpeg")},
            timeout=REQUEST_TIMEOUT,
        )

    if response.status_code != 200:
        raise RuntimeError(f"Groq transcription failed ({response.status_code}): {response.text[:300]}")
    return response.json()


def _shift_words(words: list[dict], offset: float) -> list[dict]:
    shifted = []
    for word in words or []:
        text = (word.get("word") or "").strip()
        if not text:
            continue
        shifted.append(
            {
                "word": word["word"],
                "start": round(float(word.get("start", 0.0)) + offset, 3),
                "end": round(float(word.get("end", 0.0)) + offset, 3),
            }
        )
    return shifted


def transcribe(audio_path: str, language: str | None = None) -> dict:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    src = Path(audio_path)
    work_dir = Path(tempfile.mkdtemp(prefix="groq_"))
    try:
        duration = _probe_duration(src)
        chunks = _plan_chunks(duration)
        if len(chunks) > 1:
            logger.info("Splitting %s (%.0f s) into %d chunks", src.name, duration, len(chunks))

        segments: list[dict] = []
        detected_language = language
        total_duration = 0.0

        for index, (start, end) in enumerate(chunks):
            offset = start or 0.0
            chunk_path = work_dir / f"chunk_{index:03d}.mp3"
            written = _extract_audio(src, chunk_path, start, end)
            total_duration = max(total_duration, offset + written)

            payload = _transcribe_chunk(chunk_path, language)
            detected_language = detected_language or payload.get("language")

            for raw in payload.get("segments") or []:
                text = (raw.get("text") or "").strip()
                if not text:
                    continue
                segments.append(
                    {
                        "id": uuid.uuid4().hex[:12],
                        "start": round(float(raw.get("start", 0.0)) + offset, 3),
                        "end": round(float(raw.get("end", 0.0)) + offset, 3),
                        "text": text,
                        "speaker": None,
                        "words": _shift_words(raw.get("words"), offset),
                    }
                )
            chunk_path.unlink(missing_ok=True)

        return {
            "segments": segments,
            "duration": round(max(total_duration, duration), 3),
            "language": detected_language,
        }
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
