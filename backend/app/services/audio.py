import numpy as np
import av

FRAME_SECONDS = 0.03
SAMPLE_RATE = 16000
AUDIO_BITRATE = 32_000


def load_audio(path: str, sample_rate: int = 16000) -> np.ndarray:
    container = av.open(path, metadata_errors="ignore")
    stream = container.streams.audio[0]
    resampler = av.AudioResampler(format="s16", layout="mono", rate=sample_rate)
    chunks: list[np.ndarray] = []
    for frame in container.decode(stream):
        frame.pts = None
        for res in resampler.resample(frame):
            chunks.append(res.to_ndarray()[0].astype(np.float32))
    while True:
        out = resampler.resample(None)
        if not out:
            break
        for res in out:
            chunks.append(res.to_ndarray()[0].astype(np.float32))
    container.close()
    if not chunks:
        return np.zeros(0, dtype=np.float32)
    return np.concatenate(chunks) / 32768.0


def get_duration(path: str) -> float:
    try:
        container = av.open(path, metadata_errors="ignore")
        duration = container.duration
        container.close()
        if duration:
            return round(duration / 1_000_000, 3)
    except Exception:
        pass
    return round(len(load_audio(path)) / 16000.0, 3)


def _frame_energies(path: str, sample_rate: int = 16000) -> np.ndarray:
    """RMS energy per FRAME_SECONDS window, decoded incrementally.

    Decoding the whole file into one array costs ~0.5 GB per hour of audio and
    peaks far higher; faster-whisper then decodes it a second time, which kills
    the worker on long videos.
    """
    frame_len = max(1, int(FRAME_SECONDS * sample_rate))
    energies: list[float] = []
    buf = np.zeros(0, dtype=np.float32)

    def drain(resampled) -> None:
        nonlocal buf
        for res in resampled:
            buf = np.concatenate([buf, res.to_ndarray()[0].astype(np.float32) / 32768.0])
            while len(buf) >= frame_len:
                window = buf[:frame_len]
                energies.append(float(np.sqrt(np.mean(window ** 2))))
                buf = buf[frame_len:]

    container = av.open(path, metadata_errors="ignore")
    try:
        stream = container.streams.audio[0]
        resampler = av.AudioResampler(format="s16", layout="mono", rate=sample_rate)
        for frame in container.decode(stream):
            frame.pts = None
            drain(resampler.resample(frame))
        drain(resampler.resample(None))
    finally:
        container.close()

    return np.array(energies, dtype=np.float32)


def detect_speech_turns(path: str, min_silence: float = 0.4) -> list[tuple[float, float]]:
    energies = _frame_energies(path, 16000)
    n_frames = len(energies)
    if n_frames == 0:
        return []
    noise_floor = float(np.percentile(energies, 15))
    threshold = max(noise_floor * 4.0, 0.015)
    speech = energies > threshold
    speech[1:-1] = speech[1:-1] & (speech[:-2] | speech[2:])

    intervals: list[tuple[float, float]] = []
    in_speech = False
    start = 0
    for i, is_speech in enumerate(speech):
        if is_speech and not in_speech:
            start = i
            in_speech = True
        elif not is_speech and in_speech:
            intervals.append((start * FRAME_SECONDS, i * FRAME_SECONDS))
            in_speech = False
    if in_speech:
        intervals.append((start * FRAME_SECONDS, n_frames * FRAME_SECONDS))
    if not intervals:
        return []

    merged: list[list[float]] = [list(intervals[0])]
    for s, e in intervals[1:]:
        if s - merged[-1][1] < min_silence:
            merged[-1][1] = e
        else:
            merged.append([s, e])
    return [(round(a, 3), round(b, 3)) for a, b in merged]


def _extract_with_ffmpeg_cli(src, dst, sample_rate: int, bitrate: int,
                             start: float | None, end: float | None) -> float:
    """Forgiving fallback: the bundled ffmpeg CLI re-decodes files PyAV chokes
    on (partial downloads, odd headers). Raises a clear user-facing error when
    even ffmpeg cannot read the file."""
    import subprocess
    import shutil
    from ..config import settings  # noqa: F401  (kept for parity)
    ff = None
    try:
        import imageio_ffmpeg
        ff = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        ff = shutil.which("ffmpeg")
    if not ff:
        raise RuntimeError("ffmpeg unavailable")
    cmd = [ff, "-y", "-err_detect", "ignore_err", "-i", str(src), "-vn",
           "-ac", "1", "-ar", str(sample_rate), "-b:a", str(bitrate)]
    if start is not None:
        cmd += ["-ss", f"{max(0.0, start):.3f}"]
    if end is not None:
        cmd += ["-t", f"{max(0.0, end - (start or 0.0)):.3f}"]
    cmd += [str(dst)]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
    import av as _av
    dur = 0.0
    if proc.returncode == 0:
        try:
            with _av.open(str(dst)) as probe:
                dur = float(probe.duration or 0) / 1_000_000
        except Exception:
            dur = 0.0
    if proc.returncode != 0 or dur <= 0:
        raise RuntimeError(
            "الملف تالف أو غير قابل للقراءة — أعد تصديره أو جرّب ملفاً آخر. "
            "(The file appears corrupted or incomplete.)"
        )
    return dur


def extract_audio_track(
    src,
    dst,
    sample_rate: int = SAMPLE_RATE,
    bitrate: int = AUDIO_BITRATE,
    start: float | None = None,
    end: float | None = None,
) -> float:
    """Decode src into a mono mp3 at dst, keeping only [start, end).

    Returns the seconds written. Raises IndexError when the source has no audio
    stream at all. Decoding is incremental, so a multi-gigabyte video costs a
    constant amount of RAM. Files PyAV cannot fully decode fall back to the
    bundled ffmpeg CLI; what survives is kept (partial audio beats failure).
    """
    try:
        return _extract_pyav(src, dst, sample_rate, bitrate, start, end)
    except Exception:
        # partial output from the PyAV attempt still counts
        try:
            import os as _os
            if _os.path.exists(dst) and _os.path.getsize(dst) > 4096:
                with av.open(str(dst)) as probe:
                    if float(probe.duration or 0) > 0:
                        return float(probe.duration) / 1_000_000
        except Exception:
            pass
        dst_path = None if dst is None else str(dst)
        try:
            if dst_path and __import__("os").path.exists(dst_path):
                __import__("os").unlink(dst_path)
        except Exception:
            pass
        return _extract_with_ffmpeg_cli(src, dst, sample_rate, bitrate, start, end)


def _extract_pyav(
    src,
    dst,
    sample_rate: int = SAMPLE_RATE,
    bitrate: int = AUDIO_BITRATE,
    start: float | None = None,
    end: float | None = None,
) -> float:
    resampler = av.AudioResampler(format="s16", layout="mono", rate=sample_rate)
    samples_written = 0
    inp = av.open(str(src), metadata_errors="ignore")
    out = av.open(str(dst), "w", format="mp3")
    try:
        istream = inp.streams.audio[0]
        ostream = out.add_stream("libmp3lame", rate=sample_rate)
        ostream.bit_rate = bitrate
        ostream.codec_context.layout = "mono"

        def encode(frames) -> None:
            nonlocal samples_written
            for frame in frames:
                samples_written += frame.samples
                for packet in ostream.encode(frame):
                    out.mux(packet)

        try:
            for frame in inp.decode(istream):
                position = float(frame.pts * istream.time_base) if frame.pts is not None else None
                if position is not None:
                    if start is not None and position + float(frame.duration * istream.time_base) <= start:
                        continue
                    if end is not None and position >= end:
                        break
                frame.pts = None
                encode(resampler.resample(frame))
        except av.error.InvalidDataError:
            # corrupt tail/middle packets: keep whatever decoded cleanly —
            # a usable partial transcript beats a hard failure
            pass
        encode(resampler.resample(None))
        for packet in ostream.encode(None):
            out.mux(packet)
        if samples_written <= 0:
            raise RuntimeError("no decodable audio")
    finally:
        out.close()
        inp.close()

    return samples_written / sample_rate