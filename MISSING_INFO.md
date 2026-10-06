# MISSING_INFO.md — facts the owner still needs to provide

The public pages hide any element whose value is `null` in
`frontend/src/specContent.js` → `RICH_DATA.missing`. Visitors never see
"TODO". Fill a value there and the element appears automatically.

## Hidden right now (value is null)

| Key | Where it would appear | What to provide |
|---|---|---|
| `supportEmail` | Contact page → "Email" row | The support inbox |
| `supportHours` | Contact page → "Support hours" row | e.g. "Sun–Thu, 9:00–17:00 (UTC+1)" |
| `maxFileSize` | AI Transcription page → formats note | Real per-file size ceiling of the studio |
| `retentionDays` | (reserved) security copy | How long files are kept |
| `storeLinks` | Footer → App Store / Google Play | Real store URLs (buttons hidden until then) |
| `socialLinks` | (reserved) footer social row | Real X / LinkedIn / YouTube profiles |
| `teamMembers` | (reserved) Company page | Real names/roles |
| `customerStories` | (reserved) Use Cases | A real customer story |
| `changelogDates` | Changelog → dates | Real dates per entry (no dates shown until then) |
| `legalText` | Terms page → "Last updated" | Real legal text by a qualified person |
| `menuStatsVerified` | — | Menu stats bar now shows only facts (99 languages, 12 speakers, 6 export formats, $0 free plan) |
| `languageListVerified` | Supported Languages | The 99-language list follows the documented Whisper set — confirm it matches the engine config |

## Removed by the QA pass (provide facts to re-enable)

- **API and Docs** — menu item and page are hidden (`SPEC_DATA.api.enabled = false`)
  because there is no public API. To ship it: build the API, set `enabled: true`,
  re-add the menu item in `siteData.js` → NAV_MENUS → Product → Developers, and
  fill `SPEC_DATA.api` from the real endpoints.
- **Human-service prices** — the invented per-minute prices were removed from
  `HUMAN_SERVICES` (siteData.js) and the services page. Add real prices only when
  the reviewer program is live (also update the Pricing page's own list yourself —
  the Pricing page is out of bounds for this tooling).
- **Careers roles** — the fake role rows were deleted; add real openings in
  `SPEC_DATA.careers.roles` (empty list shows an honest empty state).

## Optional configuration (README §env)

- SMTP notifications: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`.
- Guest demo: `GUEST_DEMO_ENABLED=true` (+ `GUEST_DEMO_DAILY_LIMIT`, default 3).
