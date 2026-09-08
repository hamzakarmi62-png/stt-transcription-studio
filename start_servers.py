import subprocess
import time
import webbrowser
import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
frontend_dir = os.path.join(root_dir, "frontend")

python_exe = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
if not os.path.exists(python_exe):
    python_exe = sys.executable

print("1. Starting FastAPI Backend (Port 8000)...")
backend_process = subprocess.Popen(
    [python_exe, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd=backend_dir
)

print("2. Starting Frontend Preview (Port 4173)...")
frontend_process = subprocess.Popen(
    "npm run preview -- --port 4173 --strictPort --host 127.0.0.1",
    cwd=frontend_dir,
    shell=True
)

print("Waiting for servers to initialize...")
time.sleep(3)

url = "http://127.0.0.1:4173"
print(f"Opening browser at {url} (or http://127.0.0.1:8000)")
webbrowser.open(url)

try:
    backend_process.wait()
except KeyboardInterrupt:
    backend_process.terminate()
    frontend_process.terminate()

