# MISSING_INFO.md — values the site is waiting for

The public pages hide any element whose value is `null` in
`frontend/src/specContent.js` → `RICH_DATA.missing` (visitors never see
"TODO"). Fill a value there and the element appears. This file lists
everything currently hidden or unverified.

## Hidden right now (value is null)

| Key | Where it would appear | What to provide |
|---|---|---|
| `supportEmail` | Contact page → "Email" row | The support inbox (e.g. `support@…`) |
| `supportHours` | Contact page → "Support hours" row | e.g. "Sun–Thu, 9:00–17:00 (UTC+1)" |
| `maxFileSize` | AI Transcription page → formats tip | The real per-file size ceiling shown in the studio |
| `retentionDays` | (reserved) Security/FAQ copy | How long files are kept before deletion |
| `storeLinks` | Footer → App Store / Google Play buttons | The real store URLs (buttons are hidden until then) |
| `socialLinks` | (reserved) footer social row | Real X / LinkedIn / YouTube profile URLs |
| `teamMembers` | Company page → Team section | Real names/roles (section is hidden until provided) |
| `customerStories` | Use Cases → Featured story | A real customer story (placeholder is hidden) |
| `changelogDates` | Changelog → dates | Real dates per entry (entries show no dates until then) |
| `legalText` | Terms page → "Last updated" | Real legal text by a qualified person (skeleton shown) |
| `menuStatsVerified` | Dropdown menus → stats bar | The menu stats bar shows "98%+ accuracy", "<3 min per hour" from a previous pass — verify these numbers or ask to have them removed |
| `languageListVerified` | Supported Languages page | The list follows the documented Whisper language set (99 entries) — verify it matches your engine configuration |

## Also awaiting the owner (visible but clearly planned/empty)

- Careers roles list is intentionally empty — add real openings in
  `frontend/src/specData.js` → `SPEC_DATA.careers.roles`.
- Human-verified pages show `Planned` and dashed Details boxes
  (accuracy / turnaround / options) until the reviewer program is real.
- API and Docs page is marked `Proposed: only if you offer an API`.

## Optional configuration (README §env)

- SMTP notification for form submissions: `SMTP_HOST`, `SMTP_PORT`,
  `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL` — without them, submissions are
  only stored in SQLite (`public_submissions` table).
- Guest demo: `GUEST_DEMO_ENABLED=true` enables the "Try it now" box
  (60 s / 25 MB / per-IP daily limit — see README).
