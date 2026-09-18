"""Add the two is-a.dev domains as Render custom domains — ready to run.

Usage:
    python add_render_domains.py <RENDER_API_KEY>

The key is read from the command line and kept in memory only — never
printed, logged, or written to disk. Get a key from:
    dashboard.render.com > Account Settings > API Keys > Create API key

Domains are added even before the is-a.dev PRs merge: Render keeps them
"pending verification" and they activate automatically once the DNS
records go live.
"""
import sys

import requests

BASE = "https://api.render.com/v1"
DOMAINS = ["audstudio.is-a.dev", "app.audstudio.is-a.dev"]


def main() -> int:
    key = sys.argv[1] if len(sys.argv) > 1 else ""
    if not key:
        print("usage: python add_render_domains.py <render_api_key>")
        return 2

    h = {"Authorization": f"Bearer {key}", "Accept": "application/json"}

    r = requests.get(f"{BASE}/services?limit=50", headers=h, timeout=30)
    r.raise_for_status()
    services = r.json()
    match = next(
        (s["service"] for s in services if "stt-transcription" in (s["service"].get("name") or "")),
        None,
    )
    if not match:
        print("Service 'stt-transcription-studio' not found. Existing services:")
        for s in services:
            print(" -", s["service"].get("name"))
        return 1
    sid = match["id"]
    print("service:", match["name"], f"({sid})")

    for domain in DOMAINS:
        rr = requests.post(
            f"{BASE}/services/{sid}/custom-domains",
            headers={**h, "Content-Type": "application/json"},
            json={"name": domain},
            timeout=30,
        )
        if rr.status_code in (200, 201):
            print(f"added: {domain}")
        elif rr.status_code == 409 or "already" in rr.text.lower():
            print(f"already present: {domain}")
        else:
            print(f"{domain} -> HTTP {rr.status_code}: {rr.text[:200]}")

    rr = requests.get(f"{BASE}/services/{sid}/custom-domains", headers=h, timeout=30)
    print("\ncurrent custom domains:")
    for entry in rr.json():
        cd = entry.get("customDomain", entry)
        print(f" - {cd.get('domain')} | status: {cd.get('status')}")

    print("\nNote: domains stay 'pending verification' until the is-a.dev")
    print("pull requests merge and the DNS records go live.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
