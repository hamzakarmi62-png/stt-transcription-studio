"""Assemble the demo frames into demo-aud.mp4 (Ken Burns + hard cuts)."""
import os
import subprocess

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
FRAMES = [
    ("1-landing.png", 4.0, 1.07),
    ("2-login.png", 3.0, 1.05),
    ("3-dashboard.png", 4.0, 1.07),
    ("4-transcribe.png", 4.0, 1.07),
    ("5-archive.png", 3.0, 1.05),
    ("6-transcript.png", 5.0, 1.03),
    ("7-export.png", 5.0, 1.03),
]
OUT = os.path.join("frontend", "public", "demo-aud.mp4")
TMP = "demo-frames"


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1200:])
        raise SystemExit(1)


segs = []
for i, (name, dur, zoom_max) in enumerate(FRAMES):
    src = os.path.join(TMP, name)
    seg = os.path.join(TMP, f"seg{i}.mp4")
    d = int(dur * 30)
    zmax = f"min(zoom+{(zoom_max - 1) / d:.6f},{zoom_max})"
    vf = (
        f"scale=1280:720,"
        f"zoompan=z='{zmax}':d={d}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":s=1280x720:fps=30"
    )
    run([FF, "-y", "-loop", "1", "-i", src, "-filter_complex", vf,
         "-t", str(dur), "-pix_fmt", "yuv420p", "-c:v", "libx264",
         "-preset", "fast", "-crf", "23", seg])
    segs.append(seg)
    print("segment", i, "ok")

lst = os.path.join(TMP, "list.txt")
with open(lst, "w", encoding="utf-8") as f:
    for s in segs:
        f.write(f"file '{os.path.abspath(s)}'\n")

run([FF, "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy",
     "-movflags", "+faststart", OUT])
print("OUT:", OUT, os.path.getsize(OUT) // 1024, "KB")
