# Public Site — Enrichment Pass (README)

## What was added

- **Working in-page tools** (all client-side, nothing uploaded):
  File Readiness Checker (home + AI Transcription), Link Checker
  (Link Transcription), SRT/VTT Converter with strip & timecode shift
  (Export Center), Sample Transcript with inline speaker renaming /
  timestamps toggle / copy / TXT download, Sample Q&A with timestamp chips
  (AI Chat + Key Moments), Translation side-by-side sample, Sample folders
  demo, Sample editor (undo/redo/autosave/speed), Manual-time estimator +
  "Copy this workflow" (audience pages).
- **Rich honest content** from one data file (`frontend/src/specContent.js`
  → `RICH_DATA`): quality guide, formats table, export comparison, blog
  (8 articles), Help Center (15 articles with live search + highlights +
  feedback), 6 tick-off tutorials (localStorage), use cases with detail
  views, 99-language searchable list (alphabet jump + ISO + copy code),
  changelog with tag filter, security do/do-not lists.
- **Shared page chrome**: in-page TOC with scroll-spy, Expand/Collapse all
  for FAQs, "Copy link" on section headings.
- **Backend** (`backend/app/routers/public_forms.py`, registered in
  `main.py`): `POST /api/public/contact`, `/waitlist`, `/careers`,
  `/feedback` — server-side validation, honeypot field, per-IP in-memory
  rate limiting, size limits, JSON errors, submissions stored in the
  existing SQLite DB (`public_submissions` table), optional email mirror.
- **Guest demo (OFF by default)**: `GET /api/public/config` tells the
  front-end whether to render the "Try it now" box on the AI Transcription
  page. When enabled the endpoint reuses the app's Groq/Whisper engine with
  60 s / 25 MB caps and a per-IP daily limit; the clip is processed in a
  temp dir and never persisted.

## Environment variables (backend .env / Render dashboard)

| Variable | Default | Purpose |
|---|---|---|
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `NOTIFY_EMAIL` | empty | When all set, every public submission also emails `NOTIFY_EMAIL`. Otherwise store-only (the UI confirmation stays truthful). |
| `GUEST_DEMO_ENABLED` | `false` | `true` turns on the guest demo endpoint and the front-end box. |
| `GUEST_DEMO_DAILY_LIMIT` | `3` | Per-IP transcriptions per day while the demo is on. |

**Guest-demo cost note:** each demo run bills like any other transcription
of a ≤60 s clip through your Groq/Whisper path (a few seconds of engine
time). With the free Groq tier this is effectively free at the default
3/day/IP limit; enable only if you accept that usage.

## Where to edit content

- `frontend/src/specContent.js` — `RICH_DATA`: articles, guides, tips,
  FAQs, audience workflows, sample transcripts, and `missing` (null → the
  UI hides the element; see `MISSING_INFO.md`).
- `frontend/src/specData.js` — `SPEC_DATA`: template config (crumbs,
  headlines, CTAs, careers roles, footer columns).
- No page text is hard-coded in components.

## Tests

- Automated (pure functions): `node frontend/scripts/tools.test.mjs`
  — SRT/VTT parsing & conversion round-trips, strip, shift (incl. clamping
  at 0), malformed input errors, and all link-checker cases.
- Manual checklist: see `TESTS.md`.
