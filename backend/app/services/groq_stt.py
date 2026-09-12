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

# Whisper hallucinates fluent phrases over silence (music, applause, dead air).
# These alone prove nothing, so a segment made only of them inside a quiet
# region is dropped; elsewhere real speech may legitimately contain them.
_HALLUCINATION_TOKENS = {
    "thank", "thanks", "merci", "bye", "goodbye", "au revoir", "watching",
    "subscribe", "sous-titrage", "sous-titres", "stefan", "subtitle",
    "amara", "org", "music", "applause", "silence", "you",
}


def _is_silent(audio_path: Path, start: float, end: float, threshold: float = 0.008) -> bool:
    """True when [start, end) carries no meaningful signal energy."""
    try:
        import av as _av
        import numpy as _np

        container = _av.open(str(audio_path), metadata_errors="ignore")
        stream = container.streams.audio[0]
        resampler = _av.AudioResampler(format="s16", layout="mono", rate=16000)
        lo, hi = int(start * 16000), int(end * 16000)
        pos = 0
        peak = 0.0
        for frame in container.decode(stream):
            frame.pts = None
            for res in resampler.resample(frame):
                samples = res.to_ndarray()[0].astype("float32") / 32768.0
                nxt = pos + len(samples)
                if nxt < lo or pos > hi:
                    pos = nxt
                    continue
                a = max(0, lo - pos)
                b = min(len(samples), hi - pos)
                if b > a:
                    peak = max(peak, float(_np.max(_np.abs(samples[a:b]))))
                pos = nxt
                if pos > hi:
                    break
        container.close()
        return peak < threshold
    except Exception:
        return False


def _synthesize_words(text: str, start: float, end: float) -> list[dict]:
    """Word timings distributed across [start, end] by word length.

    whisper-large-v3-turbo does not return word timestamps (only large-v3
    does), so without this the frontend's word-by-word highlight has nothing
    to key on and never lights up.
    """
    parts = text.split()
    if not parts or end <= start:
        return []
    total_chars = sum(max(len(p), 1) for p in parts)
    span = end - start
    words = []
    cursor = start
    for i, part in enumerate(parts):
        dur = max(0.08, (max(len(part), 1) / total_chars) * span)
        w_start = cursor
        w_end = min(end, cursor + dur)
        if i == len(parts) - 1:
            w_end = end
        words.append(
            {"word": part, "start": round(w_start, 3), "end": round(max(w_end, w_start + 0.05), 3)}
        )
        cursor = w_end
    return words


def _clean_segments(raw_segments: list[dict], offset: float, duration: float, src: Path) -> list[dict]:
    """Offset, clamp to the real duration, and drop silence hallucinations."""
    out: list[dict] = []
    for raw in raw_segments:
        text = (raw.get("text") or "").strip()
        start = float(raw.get("start", 0.0)) + offset
        end = float(raw.get("end", 0.0)) + offset
        if end - start <= 0:
            continue
        # Whisper timestamps past the end of the audio are fabricated.
        if duration > 0:
            if start >= duration + 0.25:
                continue
            end = min(end, duration)
            start = max(start, offset)
        words = _shift_words(raw.get("words"), offset)
        if not words:
            words = _synthesize_words(text, start, end)
        tokens = {t.strip(".,!?…—-").lower() for t in text.split()}
        is_fillers = bool(tokens) and tokens.issubset(_HALLUCINATION_TOKENS)
        if is_fillers and _is_silent(src, start, end):
            logger.info("Dropped hallucinated segment over silence: %.1f-%.1fs %r", start, end, text[:40])
            continue
        if not text:
            continue
        out.append(
            {
                "id": uuid.uuid4().hex[:12],
                "start": round(start, 3),
                "end": round(end, 3),
                "text": text,
                "speaker": None,
                "words": words,
            }
        )
    return out


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

            segments.extend(
                _clean_segments(payload.get("segments") or [], offset, offset + (written or 0), src)
            )
            chunk_path.unlink(missing_ok=True)

        return {
            "segments": segments,
            "duration": round(max(total_duration, duration), 3),
            "language": detected_language,
        }
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
