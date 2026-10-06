# TESTS.md — manual test checklist (public-site enrichment)

## 1. SRT/VTT converter (Export Center → "Try it on this page")
- [ ] Sample prefills; **SRT → VTT** shows `WEBVTT` header + dot milliseconds.
- [ ] **VTT → SRT** produces numbered blocks with comma milliseconds.
- [ ] Paste VTT then press **SRT → VTT** — still works (parser accepts both).
- [ ] **Strip timestamps** removes all `-->` lines, keeps both text lines.
- [ ] **Shift ±s** with `1.5` adds 1.5 s to every cue; `-5` clamps at 00:00:00,000 (no negative).
- [ ] Shift with non-numeric input shows the validation error, result area unchanged.
- [ ] Clear the text and press any conversion → red error "No subtitle cues found…", no crash.
- [ ] Copy button shows "Copied ✓"; Download saves a `.txt` containing the result.

## 2. File Readiness Checker (home hero box + AI Transcription)
- [ ] Choose an MP3 → name, size, duration (from metadata), "✓ supported", advice line.
- [ ] Choose an MP4 → duration reads from the video metadata; format ✓.
- [ ] Choose a `.txt` file → "doesn't look like audio or video" advice, no duration.
- [ ] Choose a `.wav` → ✓; choose a `.mov` → "not in the confirmed list" advice.
- [ ] Nothing uploads: works with the network tab open showing no requests after file pick.

## 3. Link Checker (Link Transcription)
- [ ] `https://www.youtube.com/watch?v=…` → ✓ YouTube link + privacy tip.
- [ ] `https://youtu.be/abc` → ✓. Direct `…/file.mp3` and `…/file.mp4?x=1` → ✓ direct.
- [ ] `youtube.com/watch?v=x` (no scheme) → "Not a web link" tip.
- [ ] `https://example.com/page` → "web page, not a media file" tip.
- [ ] `https://example.com/a.wav` → "other formats by upload" tip.
- [ ] Copy copies the exact URL; Clear empties input and result.

## 4. Sample transcript / editor / Q&A / folders / translation
- [ ] Click a line → highlights; click another → moves.
- [ ] Click "Speaker 1" → inline input; type "Sarah" + Enter → every line of that speaker renames; Copy text uses the new name.
- [ ] Timestamps toggle hides/shows `[mm:ss.s]` in UI **and** in copied/downloaded text.
- [ ] Download TXT downloads the visible representation.
- [ ] Editor demo: edit a line → "✓ Saved" appears; Undo/Redo restore; disabled state respected.
- [ ] Speed buttons visibly change the progress-bar pace; active state styled.
- [ ] AI Chat page: each suggested question swaps the answer; timestamp chip highlights the matching transcript line.
- [ ] Key Moments page: same behavior with moment notes.
- [ ] Folders demo: create (empty name ignored; duplicate rejected), rename inline, move a file via the select, delete empty folder OK, deleting a folder with files → "Empty the folder first".
- [ ] Translation sample: Original/Translated toggle switches the highlighted column; language select changes the right column; "Sample — not the live engine" visible.

## 5. Audience pages (7)
- [ ] Each shows pains, numbered workflow, recommended features (links work), tips, FAQ, estimator.
- [ ] Estimator: hours=3, ratio=4 → "≈ 12 hours"; invalid input shows the red validation; ratio edit changes result; the "adjustable assumption" note is visible.
- [ ] "Copy this workflow" copies the numbered steps.

## 6. Blog / Help / Tutorials / Use cases / Languages / Changelog
- [ ] Blog: search filters by title+body; category chips filter; counter updates; article view opens; related articles navigate; Copy link copies URL#blog-<id>; back returns to the same list state.
- [ ] Help: search highlights matches in title and excerpt; topic chips filter; 15 articles present; article view shows full body; "Was this helpful? Yes/No" → backend POST → success message (server stores row); Copy link works; "Contact Support" navigates.
- [ ] Tutorials: tick steps → progress % updates and persists after reload (localStorage); completing all resets on next visit; search + category filter work.
- [ ] Use cases: audience filter chips; card click opens scenario/outcome detail; "See the full workflow" navigates to the audience page; close (✕) returns.
- [ ] Languages: counter "Showing N of 99"; search filters; Latin/Non-Latin chips filter; alphabet jump scrolls; Copy code copies the ISO code; each card shows its ISO.
- [ ] Changelog: tag chips filter (New/Improved/Fixed); search filters; no dates shown (dates are null).

## 7. Forms against the backend (contact, waitlist ×2, careers)
- [ ] Valid submit → button "Sending…", then green confirmation; row appears in SQLite `public_submissions`.
- [ ] Invalid email (client) → browser validation blocks.
- [ ] Honeypot filled (devtools) → HTTP 200 but nothing stored.
- [ ] Spam 6× quickly → 429 "Too many messages…" shown in red, inputs kept.
- [ ] Backend stopped → red "service could not be reached", inputs kept.
- [ ] Careers with no roles → empty-state note + application form with "General application".

## 8. Guest demo (only when GUEST_DEMO_ENABLED=true)
- [ ] Flag off → box absent, `/api/public/config` returns `{"guest_demo": false}`.
- [ ] Flag on → box shows; >25 MB file rejected client-side; >60 s clip rejected server-side; 4th call in a day → 429; transcript renders; no session row created.

## 9. Regression / design
- [ ] Header unchanged: menus open on hover/click/keyboard; Log in + Try Aud for free still navigate to the app.
- [ ] Hero primary button now scrolls to the upload checker (no login redirect); header buttons untouched.
- [ ] Pricing page and logged-in app untouched.
- [ ] Dark-mode toggle of the app unaffected (public pages stay cream/light as before).
- [ ] No console errors on: home, all Product pages, all audience pages, blog, help, tutorials, use cases, languages, changelog, contact, careers, company, security, reviewers, terms, API docs.
