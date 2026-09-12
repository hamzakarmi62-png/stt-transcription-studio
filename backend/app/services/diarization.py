import logging

from ..config import settings
from ..services import speakers as speakers_service
from ..services.audio import detect_speech_turns

logger = logging.getLogger(__name__)

TURN_GAP_SECONDS = 0.7
MIN_SILENCE_SECONDS = 0.5
MAX_MERGE_GAP_SECONDS = 1.0


def diarize(audio_path: str, segments: list[dict], num_speakers: int = 2) -> tuple[list[dict], list[dict]]:
    method = settings.diarization_method
    if method == "auto":
        method = "pyannote" if _pyannote_ready() else "simple"

    if method == "pyannote":
        try:
            annotations = _diarize_pyannote(audio_path, num_speakers)
            _assign_from_annotations(segments, annotations)
        except Exception as exc:
            logger.warning("pyannote diarization failed (%s), falling back to simple", exc)
            _assign_simple(audio_path, segments, num_speakers)
    else:
        _assign_simple(audio_path, segments, num_speakers)

    merged = _merge_same_speaker_blocks(segments)
    return speakers_service.finalize_speakers(merged)


def _assign_simple(audio_path: str, segments: list[dict], num_speakers: int) -> None:
    if not _assign_energy_turns(audio_path, segments, num_speakers):
        _assign_turn_based(segments, num_speakers)


def _pyannote_ready() -> bool:
    if not settings.hf_token:
        return False
    try:
        import pyannote.audio  # noqa: F401
        return True
    except Exception:
        return False


def _diarize_pyannote(audio_path: str, num_speakers: int) -> list[tuple[float, float, str]]:
    from pyannote.audio import Pipeline

    pipeline = Pipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1", use_auth_token=settings.hf_token
    )
    diarization = pipeline(audio_path, num_speakers=num_speakers)
    out = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        out.append((round(turn.start, 3), round(turn.end, 3), speaker))
    return out


def _assign_from_annotations(segments: list[dict], annotations: list[tuple[float, float, str]]) -> None:
    overlap = {}
    for ann_start, ann_end, speaker in annotations:
        for seg in segments:
            o = min(seg["end"], ann_end) - max(seg["start"], ann_start)
            if o > 0 and o > overlap.get(seg["id"], (0, None))[0]:
                overlap[seg["id"]] = (o, speaker)
    labels = sorted({spk for _, _, spk in annotations})
    for seg in segments:
        _, label = overlap.get(seg["id"], (0, None))
        if label:
            seg["speaker"] = f"Speaker {labels.index(label) + 1}"


def _detect_turns(audio_path: str) -> list[tuple[float, float]]:
    return detect_speech_turns(audio_path, min_silence=MIN_SILENCE_SECONDS)


def _assign_energy_turns(audio_path: str, segments: list[dict], num_speakers: int) -> bool:
    turns = _detect_turns(audio_path)
    if not turns:
        return False
    turn_of = []
    for seg in segments:
        best = 0
        best_overlap = -1.0
        for i, (ts, te) in enumerate(turns):
            overlap = min(seg["end"], te) - max(seg["start"], ts)
            if overlap > best_overlap:
                best_overlap = overlap
                best = i
        turn_of.append(best)

    used_turns = sorted(set(turn_of))
    labels = _label_turns_by_voice(audio_path, [turns[i] for i in used_turns], num_speakers)
    if labels is None:
        # Voice fingerprinting unavailable (no usable pitch) — alternate turns.
        labels = {pos: f"Speaker {(pos % max(num_speakers, 1)) + 1}" for pos in range(len(used_turns))}
    label_by_turn = {turn_idx: labels[pos] for pos, turn_idx in enumerate(used_turns)}
    for seg, ti in zip(segments, turn_of):
        seg["speaker"] = label_by_turn.get(ti, "Speaker 1")
    return True


def _label_turns_by_voice(audio_path: str, turns, num_speakers: int):
    """Cluster speech turns into speakers by median pitch (F0), so the same
    voice keeps one label even across long silences. None when pitch is
    unusable and the caller should fall back to alternation."""
    if num_speakers < 2 or len(turns) < 2:
        return {i: "Speaker 1" for i in range(len(turns))} if turns else None
    try:
        pitches = _turn_pitch(audio_path, turns)
    except Exception as exc:
        logger.warning("Pitch estimation failed: %s", exc)
        return None
    voiced = [i for i, f0 in enumerate(pitches) if f0]
    if len(voiced) < 2:
        return None

    # 1-D k-means over log pitch, seeded at quantiles so two clear voice
    # registers split even when turns are imbalanced.
    import math

    values = sorted(math.log2(pitches[i]) for i in voiced)
    k = min(num_speakers, len(values))
    centers = [values[int((idx + 0.5) * len(values) / k)] for idx in range(k)]
    for _ in range(12):
        clusters = [[] for _ in range(k)]
        for v in values:
            c = min(range(k), key=lambda j: abs(v - centers[j]))
            clusters[c].append(v)
        centers = [sum(c) / len(c) if c else centers[j] for j, c in enumerate(clusters)]

    def cluster_of(turn_i: int):
        if not pitches[turn_i]:
            return None
        v = math.log2(pitches[turn_i])
        return min(range(k), key=lambda j: abs(v - centers[j]))

    # Number clusters by mean pitch (low voice = Speaker 1) for stable naming.
    order = sorted(range(k), key=lambda j: centers[j])
    rank = {c: r for r, c in enumerate(order)}
    labels = {}
    for i in range(len(turns)):
        c = cluster_of(i)
        if c is not None:
            labels[i] = f"Speaker {rank[c] + 1}"
    # Unvoiced turns inherit the nearest voiced turn in time.
    for i in range(len(turns)):
        if i in labels:
            continue
        voiced_sorted = sorted(voiced, key=lambda j: abs(j - i))
        if voiced_sorted:
            labels[i] = labels.get(voiced_sorted[0], f"Speaker 1")
    return labels if len({l for l in labels.values()}) > 1 else None


def _turn_pitch(audio_path: str, turns, max_turns: int = 80, sample_seconds: float = 2.5):
    """Median F0 per turn from a single streaming decode pass."""
    import av
    import numpy as np

    analyzed = turns[:max_turns]
    sr = 16000
    wanted = []
    for ts, te in analyzed:
        start = ts + max(0.0, (te - ts - sample_seconds) / 2)
        wanted.append((int(start * sr), int(min(te, start + sample_seconds) * sr)))

    collected: list[list] = [[] for _ in analyzed]
    resampler = av.AudioResampler(format="s16", layout="mono", rate=sr)
    pos = 0
    container = av.open(audio_path, metadata_errors="ignore")
    try:
        for frame in container.decode(container.streams.audio[0]):
            frame.pts = None
            for res in resampler.resample(frame):
                samples = res.to_ndarray()[0]
                nxt = pos + len(samples)
                for slot, (lo, hi) in enumerate(wanted):
                    if nxt <= lo or pos >= hi:
                        continue
                    a = max(0, lo - pos)
                    b = min(len(samples), hi - pos)
                    collected[slot].append(samples[a:b])
                pos = nxt
                if pos >= max(hi for _, hi in wanted):
                    break
    finally:
        container.close()

    pitches = []
    for chunks in collected:
        f0 = _median_f0(np.concatenate(chunks) if chunks else np.zeros(0), sr)
        pitches.append(f0)
    # Turns beyond the analyzed window: no pitch (caller handles gaps).
    pitches.extend([0.0] * (len(turns) - len(analyzed)))
    return pitches


def _median_f0(samples, sr: int, frame: int = 640, hop: int = 320) -> float:
    """Autocorrelation pitch, keeping only clearly periodic frames."""
    import numpy as np

    lag_min, lag_max = sr // 400, sr // 60  # 60..400 Hz
    if len(samples) < frame + lag_max:
        return 0.0
    f0s = []
    rms = float(np.sqrt(np.mean(samples ** 2)))
    if rms < 0.01:
        return 0.0
    for i in range(0, len(samples) - frame - lag_max, hop):
        win = samples[i : i + frame + lag_max].astype("float32")
        seg = win[:frame]
        if float(np.sqrt(np.mean(seg ** 2))) < 0.02:
            continue
        seg = seg - seg.mean()
        energy = float(np.dot(seg, seg))
        if energy <= 0:
            continue
        ac = np.correlate(win, seg, mode="valid")[:lag_max]
        ac = ac / energy
        peak_region = ac[lag_min:lag_max]
        if len(peak_region) == 0 or float(peak_region.max()) < 0.5:
            continue
        lag = lag_min + int(peak_region.argmax())
        f0s.append(sr / lag)
    if len(f0s) < 5:
        return 0.0
    return float(np.median(f0s))


def _assign_turn_based(segments: list[dict], num_speakers: int) -> None:
    turns: list[list[dict]] = []
    current: list[dict] = []
    for seg in segments:
        if current and seg["start"] - current[-1]["end"] > TURN_GAP_SECONDS:
            turns.append(current)
            current = []
        current.append(seg)
    if current:
        turns.append(current)
    for i, turn in enumerate(turns):
        label = f"Speaker {(i % max(num_speakers, 1)) + 1}"
        for seg in turn:
            seg["speaker"] = label


def _merge_same_speaker_blocks(segments: list[dict]) -> list[dict]:
    merged: list[dict] = []
    for seg in segments:
        if (
            merged
            and merged[-1]["speaker"] == seg["speaker"]
            and seg["start"] - merged[-1]["end"] <= MAX_MERGE_GAP_SECONDS
        ):
            prev = merged[-1]
            prev["end"] = seg["end"]
            prev["text"] = f"{prev['text']} {seg['text']}".strip()
            prev["words"] = list(prev.get("words", [])) + list(seg.get("words", []))
        else:
            merged.append(dict(seg))
    return merged