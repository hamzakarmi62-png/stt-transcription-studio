"""End-to-end per-account isolation test.

Run with an isolated environment: no cloud catalog, temp DB, temp uploads.
"""
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
tmp = Path(tempfile.mkdtemp(prefix="aud-isolation-"))

os.environ["SUPABASE_URL"] = ""
os.environ["SUPABASE_KEY"] = ""
os.environ["STORAGE_BACKEND"] = "local"
os.environ["DB_PATH"] = str(tmp / "app.db")
os.environ["UPLOAD_DIR"] = str(tmp / "uploads")
os.environ["AUTH_SECRET"] = "test-secret"
os.environ["GROQ_API_KEY"] = ""

sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402
from backend.app.main import app  # noqa: E402

client = TestClient(app, raise_server_exceptions=False)

failures = []


def check(name, cond, extra=""):
    status = "PASS" if cond else "FAIL"
    print(f"[{status}] {name} {extra}")
    if not cond:
        failures.append(name)


wav = ROOT / "backend" / "test_half.wav"

# ── register two accounts ────────────────────────────────────────────────────
ra = client.post("/api/auth/register", json={
    "username": "owner_acct", "email": "owner@test.io", "password": "secret123"})
rb = client.post("/api/auth/register", json={
    "username": "other_acct", "email": "other@test.io", "password": "secret123"})
check("register A", ra.status_code == 200, ra.text[:120])
check("register B", rb.status_code == 200, rb.text[:120])
check("register duplicate username rejected",
      client.post("/api/auth/register", json={
          "username": "owner_acct", "email": "x@test.io", "password": "secret123"}).status_code == 400)

ta, tb = ra.json()["token"], rb.json()["token"]
ha = {"Authorization": f"Bearer {ta}"}
hb = {"Authorization": f"Bearer {tb}"}

# ── login works and returns a token ─────────────────────────────────────────
rl = client.post("/api/auth/login", json={"identifier": "owner_acct", "password": "secret123"})
check("login A", rl.status_code == 200 and rl.json().get("token"), rl.text[:120])

# ── upload as A (classic + chunked paths) ────────────────────────────────────
ru = client.post("/api/upload", files={"file": ("meeting.wav", wav.read_bytes(), "audio/wav")}, headers=ha)
check("upload as A", ru.status_code == 200, ru.text[:200])
sid = ru.json()["id"]

ru_anon = client.post("/api/upload", files={"file": ("x.wav", wav.read_bytes(), "audio/wav")})
check("upload anonymous rejected", ru_anon.status_code == 401, str(ru_anon.status_code))

# chunked path
ri = client.post("/api/upload/init", headers=hb)
rid = ri.json()["upload_id"]
rc = client.post("/api/upload/chunk", data={"upload_id": rid, "chunk_index": "0"},
                 files={"file": ("b.wav", wav.read_bytes(), "audio/wav")}, headers=hb)
rcomp = client.post("/api/upload/complete", json={"upload_id": rid, "filename": "b.wav", "total_chunks": 1}, headers=hb)
check("chunked upload as B", rcomp.status_code == 200, rcomp.text[:200])
sid_b = rcomp.json()["id"]

# ── listing isolation ────────────────────────────────────────────────────────
la = client.get("/api/sessions", headers=ha).json()
lb = client.get("/api/sessions", headers=hb).json()
check("A sees only his session", [s["id"] for s in la] == [sid], str([s["id"] for s in la]))
check("B sees only his session", [s["id"] for s in lb] == [sid_b], str([s["id"] for s in lb]))
check("anonymous list empty", client.get("/api/sessions").json() == [])

# ── cross-account access denied ──────────────────────────────────────────────
check("B GET A session -> 403", client.get(f"/api/sessions/{sid}", headers=hb).status_code == 403)
check("anon GET A session -> 401", client.get(f"/api/sessions/{sid}").status_code == 401)
check("B PUT A session -> 403", client.put(f"/api/sessions/{sid}", json={
    "segments": [], "speakers": [], "settings": {}}, headers=hb).status_code == 403)
check("anon PUT A session -> 401", client.put(f"/api/sessions/{sid}", json={
    "segments": [], "speakers": [], "settings": {}}).status_code == 401)
check("B DELETE A session -> 403", client.delete(f"/api/sessions/{sid}", headers=hb).status_code == 403)
check("B audio A session -> 403", client.get(f"/api/sessions/{sid}/audio", headers=hb).status_code == 403)
check("anon audio A session -> 401", client.get(f"/api/sessions/{sid}/audio").status_code == 401)
check("B export A session -> 403",
      client.get(f"/api/sessions/{sid}/export?format=txt", headers=hb).status_code == 403)
check("B transcribe A session -> 403",
      client.post(f"/api/sessions/{sid}/transcribe", json={}, headers=hb).status_code == 403)
check("B diarize A session -> 403",
      client.post(f"/api/sessions/{sid}/diarize", json={"num_speakers": 2}, headers=hb).status_code == 403)
check("B stats A session -> 403", client.get(f"/api/sessions/{sid}/stats", headers=hb).status_code == 403)
check("B summary A session -> 403", client.post(f"/api/sessions/{sid}/summary", headers=hb).status_code == 403)
check("B translate A session -> 403",
      client.post(f"/api/sessions/{sid}/translate", json={"language": "en"}, headers=hb).status_code == 403)

# ── owner access works, including query-token for audio/export ──────────────
check("A GET own session", client.get(f"/api/sessions/{sid}", headers=ha).status_code == 200)
ra_tok = client.get(f"/api/sessions/{sid}/audio?token={ta}")
check("A audio via query token", ra_tok.status_code in (200, 302), str(ra_tok.status_code))
re_txt = client.get(f"/api/sessions/{sid}/export?format=txt&token={ta}")
check("A export via query token", re_txt.status_code == 200, str(re_txt.status_code))
re_hdr = client.get(f"/api/sessions/{sid}/export?format=txt", headers=ha)
check("A export via header", re_hdr.status_code == 200, str(re_hdr.status_code))

# tampered token rejected
check("tampered query token rejected",
      client.get(f"/api/sessions/{sid}/audio?token={ta[:-4]}dead").status_code == 401)

# ── owner can delete his own ─────────────────────────────────────────────────
check("B DELETE own session", client.delete(f"/api/sessions/{sid_b}", headers=hb).status_code == 200)
check("A DELETE own session", client.delete(f"/api/sessions/{sid}", headers=ha).status_code == 200)

print()
if failures:
    print(f"{len(failures)} FAILURES: {failures}")
    sys.exit(1)
print("ALL ISOLATION TESTS PASSED")
