import subprocess
import time
import re
import sys
import os

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
python_exe = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
if not os.path.exists(python_exe):
    python_exe = sys.executable

cloudflared_exe = os.path.join(root_dir, "cloudflared.exe")

print("Starting backend...", flush=True)
backend_proc = subprocess.Popen(
    [python_exe, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd=backend_dir
)

time.sleep(2)

print("Starting Cloudflare Tunnel...", flush=True)
tunnel_proc = subprocess.Popen(
    [cloudflared_exe, "tunnel", "--url", "http://127.0.0.1:8000"],
    stderr=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True,
    encoding="utf-8",
    errors="replace"
)

public_url = None
for _ in range(30):
    line = tunnel_proc.stderr.readline()
    if not line:
        time.sleep(0.5)
        continue
    match = re.search(r'(https://[a-zA-Z0-9-]+\.trycloudflare\.com)', line)
    if match:
        public_url = match.group(1)
        break

if public_url:
    print(f"\n>>> LIVE PUBLIC URL: {public_url} <<<\n", flush=True)
    with open("public_url.txt", "w", encoding="utf-8") as f:
        f.write(public_url)
else:
    print("Could not get URL", flush=True)

try:
    tunnel_proc.wait()
except Exception:
    backend_proc.terminate()
    tunnel_proc.terminate()
