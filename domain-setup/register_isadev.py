"""Open the is-a.dev registration PRs (root + nested subdomain).

The previous PR (#52874) was denied: "Cannot have a login page in order to
view contents. Place this site on a nested subdomain instead."

Fix shipped since: the root now serves a public marketing landing page
(no login needed to view contents), and the login-walled app itself is
additionally registered on the nested subdomain app.audstudio.is-a.dev.

The token is read from the git remote URL and kept in memory only —
never printed, logged, or written to disk.
"""
import base64
import json
import re
import subprocess
import time

import requests

REPO = "is-a-dev/register"
OWNER = {
    "username": "hamzakarmi62-png",
    "email": "hamzakarmi62@gmail.com",
}
CNAME = "stt-transcription-studio.onrender.com"

# (json filename, subdomain, purpose text)
DOMAINS = [
    (
        "audstudio.json",
        "audstudio",
        "Aud is a free audio/video transcription studio (speech-to-text with "
        "speaker diarization, translation, summaries and TXT/SRT/DOCX/PDF "
        "export). The root serves a public landing page describing the tool.",
    ),
    (
        "app.audstudio.json",
        "app.audstudio",
        "The application part of Aud (audstudio.is-a.dev): the signed-in "
        "transcription workspace — upload, transcript editor, export.",
    ),
]

PR_BODY_TMPL = """<!--
YOU MUST FILL OUT THIS ENTIRE TEMPLATE FOR YOUR PR TO BE APPROVED!

DO NOT MODIFY OR REMOVE THIS TEMPLATE (INCLUDING REMOVING COMMENTS) OR YOUR PR WILL FAIL VALIDATION!
-->

# Requirements
<!-- Your domain MUST pass ALL the requirements below, otherwise it WILL BE DENIED. -->
<!-- Change each checkbox to [x] (all lowercase, with no spaces between the brackets) to mark it as completed. -->
<!-- Do not modify anything in this section other than the checkboxes, or your PR will fail validation. -->

- [x] <!-- TOS --> I **agree** to the [Terms of Service](https://is-a.dev/terms). <!-- Your request MUST follow the TOS to be approved. -->
- [x] <!-- DOMAIN_STRUCTURE --> My file is following the [domain structure](https://docs.is-a.dev/domain-structure/). <!-- Your file is in the domains directory, the name is valid, it is JSON format, etc. -->
- [x] <!-- WEBSITE_REACHABLE --> My website is **reachable** and **completed**. <!-- We do not permit simple "Hello, world!" or simply copied template websites with minimal changes. -->
- [x] <!-- SOFTWARE_RELATED --> My website is **software development** related. <!-- We do not accept websites such as gaming, courses, AI agents/chatbots, etc. NOTE: Only your root subdomain needs to meet this requirement. -->
- [x] <!-- NON_COMMERCIAL --> My website is **not for commercial use**. <!-- Your website's purpose should not be to generate any form of revenue or profit. (e.g. a business) -->
- [x] <!-- CONTACT_INFO --> I have provided sufficient contact information in the `owner` key. <!-- Provide your email in the `email` field or another platform (e.g. Twitter or Discord) for contact. -->
- [x] <!-- WEBSITE_LINK --> I have provided a link to my website below. <!-- This step is required for your PR to be approved. -->

# Website Preview
<!-- Provide a LINK (not a screenshot) to your website below between the start/end markers. -->
<!-- This should be a LINK to the existing domain your website is on, NOT the is-a.dev domain you're applying for. (e.g. https://abc.vercel.app, https://abc.github.io) -->

<!-- WEBSITE_PREVIEW_START -->
https://stt-transcription-studio.onrender.com
<!-- WEBSITE_PREVIEW_END -->

# Website Purpose
<!-- Please tell us the purpose or motive behind your website in between the start/end markers. For example, it is a portfolio website, etc. -->

<!-- WEBSITE_PURPOSE_START -->
{purpose}
<!-- WEBSITE_PURPOSE_END -->
"""


def main():
    url = subprocess.run(
        ["git", "remote", "get-url", "origin"], capture_output=True, text=True
    ).stdout.strip()
    m = re.match(r"https://([^:]+):([^@]+)@github\.com/", url)
    if not m:
        print("NO_EMBEDDED_CRED")
        return 2
    user, token = m.group(1), m.group(2)

    s = requests.Session()
    s.headers.update(
        {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "aud-domain-setup",
        }
    )

    me = s.get("https://api.github.com/user", timeout=30)
    me.raise_for_status()
    print("GitHub account:", me.json()["login"])

    # fork exists (created for the previous PR); keep its main up to date
    fork_full = f"{user}/register"
    fork = s.get(f"https://api.github.com/repos/{fork_full}", timeout=30)
    if fork.status_code != 200:
        fr = s.post(f"https://api.github.com/repos/{REPO}/forks", timeout=60)
        if fr.status_code not in (200, 202):
            print("fork failed:", fr.status_code, fr.text[:200])
            return 1
        for _ in range(12):
            if s.get(f"https://api.github.com/repos/{fork_full}", timeout=30).status_code == 200:
                break
            time.sleep(5)
    sync = s.post(f"https://api.github.com/repos/{fork_full}/merge-upstream",
                  json={"branch": "main"}, timeout=30)
    print("fork sync:", sync.status_code, sync.json().get("message", "")[:80])

    results = []
    for fname, sub, purpose in DOMAINS:
        # a domain may already be on main (merged) or in an open PR
        live = s.get(
            f"https://raw.githubusercontent.com/{REPO}/main/domains/{fname}", timeout=30
        )
        if live.status_code == 200:
            print(f"{sub}.is-a.dev already registered on main — skipping")
            continue

        br = s.get(f"https://api.github.com/repos/{fork_full}/git/ref/heads/main", timeout=30)
        br.raise_for_status()
        sha = br.json()["object"]["sha"]
        branch = f"add-{sub.replace('.', '-')}"
        nb = s.post(
            f"https://api.github.com/repos/{fork_full}/git/refs",
            json={"ref": f"refs/heads/{branch}", "sha": sha},
            timeout=30,
        )
        if nb.status_code not in (201, 422):
            print(f"{sub}: branch failed:", nb.status_code, nb.text[:200])
            continue

        record = {
            "owner": dict(OWNER),
            "records": {"CNAME": CNAME},
            "proxied": False,
        }
        content = base64.b64encode(
            json.dumps(record, indent=2, ensure_ascii=False).encode("utf-8")
        ).decode()
        cf = s.put(
            f"https://api.github.com/repos/{fork_full}/contents/domains/{fname}",
            json={
                "message": f"Register {sub}.is-a.dev",
                "content": content,
                "branch": branch,
            },
            timeout=30,
        )
        if cf.status_code not in (201, 200):
            print(f"{sub}: file failed:", cf.status_code, cf.text[:200])
            continue
        print(f"{sub}.is-a.dev: committed in fork")

        pr = s.post(
            f"https://api.github.com/repos/{REPO}/pulls",
            json={
                "title": f"Register {sub}.is-a.dev",
                "head": f"{user}:{branch}",
                "base": "main",
                "body": PR_BODY_TMPL.format(purpose=purpose),
            },
            timeout=30,
        )
        if pr.status_code == 201:
            print(f"{sub}.is-a.dev PR:", pr.json().get("html_url"))
            results.append(pr.json().get("html_url"))
        else:
            print(f"{sub}: PR failed:", pr.status_code, pr.text[:300])

    print("DONE", json.dumps(results))
    return 0 if results else 1


if __name__ == "__main__":
    raise SystemExit(main())
