// ═══════════════════════════════════════════════════════════════════════
//  RICH CONTENT — long-form copy for the public pages (enrichment pass).
//  Facts allowed: upload MP3/WAV/M4A/OGG/MP4/MKV (large files), transcription
//  from a link (YouTube, MP4, MP3), language auto-detect, expected speakers,
//  speaker detection, editor (back 15s / forward 30s / speed, labels with
//  timestamps, word editing, undo/redo, auto-save, search), Key Moments,
//  Aud AI Chat (clickable timestamps), AI Translation (original kept,
//  switch back), Share, Export TXT/SRT/DOCX/PDF, archive, files & folders,
//  interface language selector, dark mode, Whisper + Groq, AES-256,
//  no data sold, private encrypted processing, GDPR/RGPD.
//  Human review = PLANNED.  Unknown values = null → elements auto-hide.
// ═══════════════════════════════════════════════════════════════════════

export const RICH_DATA = {
  // Values the owner must supply. When null, the UI element that needs the
  // value is hidden and the item is listed in MISSING_INFO.md.
  missing: {
    supportEmail: null,
    supportHours: null,
    maxFileSize: null,       // e.g. "2 GB" — shown on AI Transcription page
    retentionDays: null,     // how long files are kept
    storeLinks: null,        // App Store / Google Play URLs
    socialLinks: null,       // X / LinkedIn / YouTube profiles
    teamMembers: null,       // real team list
    customerStories: null,   // real customer stories
    changelogDates: null,    // real dates for changelog entries
    legalText: null,         // real Terms / Privacy text
    menuStatsVerified: null, // stats bar numbers (98%+, <3 min) — verify or remove
    languageListVerified: null, // confirm the Whisper language set matches the engine config
  },

  // ── Audio-quality guide (generic, accurate — not an Aud measurement) ──
  quality: {
    intro: "Transcription quality starts at the recording, long before any AI runs. None of these tips are guarantees — they are the factors that reliably move results in one direction or the other, for any speech-recognition engine.",
    factors: [
      { h: "Microphone distance and clipping", p: "A consistent hand-width or two from the mouth gives the engine a clean signal. Too far and the voice drowns in room echo; too close and loud syllables clip into distortion that no model can read back into words." },
      { h: "Background noise", p: "Fans, traffic, music and open-plan chatter compete with speech for the same frequencies. Modern engines filter steady hum well, but irregular noise (coughs, clattering dishes, overlapping laughter) still costs accuracy. A quiet room, or even soft furnishings, helps more than any setting." },
      { h: "One speaker at a time", p: "Speaker detection separates voices by how they sound, but heavy crosstalk — people talking over each other — makes both the separation and the words themselves harder. Letting speakers finish, or briefly repeating an overlapping answer, pays off in the transcript." },
      { h: "File format and sample rate", p: "Lossless sources (WAV) preserve the full signal; compressed formats (MP3, M4A, OGG) trade a little fidelity for size — usually acceptable at normal bitrates. Re-recording a compressed file into WAV adds nothing. The original file is always the best source." },
      { h: "Accents and mixed languages", p: "Every engine has stronger and weaker language coverage. Mixed recordings — speakers switching between languages mid-sentence — are the hardest case everywhere; Aud lets you pick several languages in one pass for exactly this reason, and results still vary by recording." },
      { h: "Music and sound effects", p: "Intros, jingles and transitions are not speech, and engines either skip them or produce garbage lines you will delete anyway. If you control the edit, keeping music segments short makes the transcript cleaner." },
      { h: "Expected speakers", p: "Telling the engine how many people to expect (when you know) gives speaker detection a strong hint — a three-person panel is easier to separate when the engine is not guessing whether it is hearing two people or five." },
    ],
  },

  // ── Formats table (AI Transcription page) ─────────────────────────────
  formats: {
    rows: [
      ["MP3", "Compressed audio, plays everywhere", "Voice recorders, downloads, podcasts — small files, wide support"],
      ["WAV", "Uncompressed audio", "The best-quality source when size does not matter (studio, field recorders)"],
      ["M4A", "Compressed audio (AAC)", "Phone voice memos and many recorder apps"],
      ["OGG", "Open compressed audio", "Common with open-source recorders and game/voip captures"],
      ["MP4", "Video container", "Interview and lecture videos — the audio track is used"],
      ["MKV", "Video container", "Screen recordings and captures in other tools"],
    ],
    tip: "Aud extracts the audio from video containers automatically, and large files are supported. The exact size ceiling of your plan is not published here — see the studio's upload screen for the current limit.",
  },

  // ── Export Center guide ────────────────────────────────────────────────
  exportGuide: {
    items: [
      { h: "TXT — plain text", p: "Just the words (with or without speaker labels and timestamps, depending on the export). It opens anywhere, pastes into any tool, and is the right choice for notes, articles and feeding other software." },
      { h: "SRT — subtitles", p: "A numbered list of cues, each with a start → end timecode and its text. Video players, YouTube, Vimeo and editors read it directly. If your goal is captions on a video, SRT is the format." },
      { h: "DOCX — Word document", p: "A formatted document that keeps speaker labels and structure, ready for review rounds, comments and tracked changes — the format of choice for teams, legal files and theses." },
      { h: "PDF — fixed layout", p: "Renders identically everywhere. Use it for archives, records and anything you need to print or hand over without edits." },
    ],
    table: {
      head: ["", "TXT", "SRT", "DOCX", "PDF"],
      rows: [
        ["Timestamps", "Optional", "Yes (required)", "Optional", "Optional"],
        ["Speaker labels", "Optional", "Rarely", "Yes", "Yes"],
        ["Opens with", "Anything", "Players & editors", "Word processors", "Any reader"],
        ["Best for", "Notes, reuse", "Video captions", "Review & editing", "Archive & print"],
        ["Editable after", "Yes", "With subtitle tools", "Yes", "No (by design)"],
      ],
    },
  },

  // ── Translation (AI Translation page) ──────────────────────────────────
  translation: {
    how: [
      { h: "Two texts, one transcript", p: "When you translate a transcript in Aud, the translation is added alongside the original — the original text is kept intact. You switch between the original and the translated version at any time without losing either." },
      { h: "Nothing is overwritten", p: "Because the original never changes, you can always check a translated sentence against what was actually said — click back, compare, click forward again. This also means a correction to the original can be re-translated without starting over." },
      { h: "Where it helps", p: "Sharing a multilingual meeting with colleagues, preparing a publication in another language, or checking what an interviewee said in a language you do not speak — while keeping the source of truth available." },
    ],
    tips: [
      { h: "Fix the transcript first", p: "Translation quality follows source quality. A garbled sentence rarely translates into a clean one — correct the original before translating." },
      { h: "Watch names and technical terms", p: "Proper nouns, product names and domain jargon are where machine translation most often drifts. Scan the translation for them first." },
      { h: "Idioms rarely map one-to-one", p: "A literal translation of an idiom is usually wrong in the target language. Expect to smooth those sentences by hand if the text will be published." },
      { h: "Review segment by segment", p: "Short segments are easier to compare against the original than a wall of text. Read the translation next to the source, paragraph by paragraph." },
      { h: "Keep the original next to you", p: "Since Aud keeps the original intact, use it — the fastest check for any doubtful sentence is to switch back and listen to that moment." },
    ],
    sample: {
      note: "Sample — prepared example lines, not the live engine.",
      langs: [["en", "English"], ["fr", "Français"], ["es", "Español"], ["ar", "العربية"]],
      lines: [
        { en: "We record the interview on Thursday.", fr: "Nous enregistrons l'entretien jeudi.", es: "Grabamos la entrevista el jueves.", ar: "نسجّل المقابلة يوم الخميس." },
        { en: "Can you send the notes by Friday?", fr: "Peux-tu envoyer les notes d'ici vendredi ?", es: "¿Puedes enviar las notas el viernes?", ar: "هل يمكنك إرسال الملاحظات قبل الجمعة؟" },
        { en: "The second speaker joined late.", fr: "Le deuxième intervenant est arrivé en retard.", es: "El segundo orador llegó tarde.", ar: "انضم المتحدث الثاني متأخرًا." },
        { en: "Let's review the transcript together.", fr: "Relisons la transcription ensemble.", es: "Revisemos la transcripción juntos.", ar: "لنراجع التفريغ معًا." },
      ],
    },
  },

  // Export Center: the read-only share link, kept distinct from exports
  shareLinks: {
    h: "Sharing, not exporting",
    p1: "Exporting produces a file you send around yourself — TXT, SRT, DOCX or PDF. Sharing is the lighter path: Aud gives a transcript a read-only link, and whoever opens it reads the text, sees the speakers and can play the audio.",
    p2: "The link never grants access to your account, and nothing becomes public unless you create it. Use exports when the destination needs a file; use a share link when the destination is a person.",
  },

  // ── Sample Q&A (Aud AI Chat + Key Moments) ────────────────────────────
  chatExamples: [
    { q: "What did Speaker 2 say about the deadline?", a: "Speaker 2 moved the deadline to Friday and asked everyone to have their parts ready the day before.", t: "01:12.4", line: 4 },
    { q: "Who proposed recording on Thursday?", a: "Speaker 1 proposed recording the interview on Thursday and Speaker 3 agreed.", t: "00:18.0", line: 1 },
    { q: "What is still missing before we publish?", a: "Speaker 3 said the show notes and the SRT subtitles are still missing before the episode can be published.", t: "01:44.9", line: 6 },
    { q: "Did anyone mention the microphone?", a: "Yes — Speaker 2 suggested re-recording the intro because the microphone was clipping.", t: "00:52.3", line: 3 },
  ],
  momentsExamples: [
    { q: "Where does the deadline change?", t: "01:12.4", line: 4, note: "Speaker 2 moves the deadline to Friday — a decision the whole team acts on." },
    { q: "Which moment names the blockers?", t: "01:44.9", line: 6, note: "Speaker 3 lists what is still missing: show notes and subtitles." },
    { q: "Where is the recording planned?", t: "00:18.0", line: 1, note: "Speaker 1 proposes Thursday — the moment the schedule is set." },
  ],

  // ── Sample transcript shared by tools ──────────────────────────────────
  demoTranscript: {
    speakers: [
      { name: "Speaker 1", color: "#10b981" },
      { name: "Speaker 2", color: "#f59e0b" },
      { name: "Speaker 3", color: "#ef4444" },
    ],
    lines: [
      { s: 0, t: "00:04.2", text: "Welcome everyone — this is our planning session for episode twelve." },
      { s: 0, t: "00:18.0", text: "I propose we record the interview on Thursday afternoon." },
      { s: 1, t: "00:33.5", text: "Thursday works for me, as long as we keep it under an hour." },
      { s: 1, t: "00:52.3", text: "And we should re-record the intro — the microphone was clipping last time." },
      { s: 0, t: "01:12.4", text: "Good point. So the deadline for the raw cut moves to Friday." },
      { s: 2, t: "01:30.1", text: "I can prepare the question list by Wednesday night." },
      { s: 2, t: "01:44.9", text: "What is still missing are the show notes and the SRT subtitles." },
      { s: 0, t: "01:58.7", text: "Then let's split it: I take the notes, Speaker 2 takes the subtitles." },
    ],
  },

  speakerTips: [
    { h: "Set the expected count when you know it", p: "If you know two people are talking, say so. The engine then separates voices into exactly that many tracks instead of guessing — the single biggest help you can give it." },
    { h: "Let people finish", p: "Voice separation clusters short utterances less reliably than full sentences. A meeting where people complete their thoughts separates cleanly; constant interruption makes every speaker sound alike." },
    { h: "Distinct voices help, but are not required", p: "The algorithm works on voice characteristics — pitch, timbre, cadence. Very similar voices with the same microphone still separate, just with more room for review." },
    { h: "Rename speakers once", p: "After transcription, rename \"Speaker 2\" to a real name and every line, export and share page follows. Reviewing \"Sarah asked…\" is far faster than matching colors." },
  ],

  editorTips: [
    { h: "Click a word to hear that moment", p: "The editor is synced to the audio: click any word and playback jumps there. Verification becomes a two-second job instead of scrubbing a timeline." },
    { h: "Short jumps, often", p: "Back 15 seconds and forward 30 seconds are mapped for review rhythm — rewind just enough to re-hear a phrase, skip whole passages you have already checked." },
    { h: "Change the speed, not the words", p: "Playback speed is there for you, not the transcript: slow down for dense speech, speed up through silences. The text does not change — only how fast you hear it." },
    { h: "Trust auto-save, use undo anyway", p: "Every edit saves as you type. Undo and redo are for structure: if splitting a paragraph went wrong, one step back restores it." },
    { h: "Search before you scroll", p: "For long recordings, search jumps straight to the line — names, terms and repeated phrases are found instantly instead of skim-reading an hour of text." },
  ],

  // ── The 4 Features group pages ─────────────────────────────────────────
  groupPages: {
    transcribe: {
      crumb: "Transcribe",
      headline: "From sound to text",
      desc: "Everything Aud does to turn a recording into a transcript you can work with.",
      items: [
        ["Timestamped text", "ai-transcription", "Every word carries its own timestamp, so text and audio stay locked together — click a word, hear that moment."],
        ["Speaker detection", "speaker-detection", "Voices are separated and labeled automatically, with the option to set how many speakers to expect."],
        ["Language auto-detect", "multi-language", "The recording's language is detected on its own — and you can pick several languages for mixed recordings."],
        ["Large files", "ai-transcription", "Long recordings are the normal case: upload the full session, not a chopped-up copy."],
      ],
    },
    translate: {
      crumb: "Translate",
      headline: "One transcript, many languages",
      desc: "Translation that lives next to the original instead of replacing it.",
      items: [
        ["AI translation", "translation", "Translate the full transcript in one step — every segment rewritten in the chosen language."],
        ["Original kept intact", "translation", "The original text never changes. Switch between original and translation whenever you need to check a phrase."],
        ["Multiple languages", "multi-language", "Mixed recordings — speakers switching languages mid-sentence — are transcribed with multi-language passes."],
        ["Human translation", "svc:global-subtitles", "Planned: a professional translator reviewing the text, for the work that cannot afford doubt."],
      ],
    },
    "edit-export": {
      crumb: "Edit and export",
      headline: "Correct it, shape it, ship it",
      desc: "The tools that take a raw transcript to a finished document.",
      items: [
        ["Word-level editor", "editor", "Click between words and type; playback follows the text, so every fix is verified against the audio."],
        ["Auto-save", "editor", "Edits save as you type — close the tab, come back tomorrow, the transcript is where you left it."],
        ["Share transcript", "share", "A read-only share link with playback: your audience reads and listens without touching your account."],
        ["TXT, SRT, DOCX, PDF", "share", "Four export families cover notes, captions, review documents and archives."],
      ],
    },
    organize: {
      crumb: "Organize",
      headline: "An archive, not a pile",
      desc: "How Aud keeps a growing library of transcripts usable.",
      items: [
        ["Files, archive & search", "files-folders", "Folders, the sessions archive and full-text search — one page covers how your whole library stays findable."],
        ["Bulk actions", "files-folders", "Move and clean up in batches. Files saved in My Files are protected from bulk deletion."],
      ],
    },
  },

  // ── Audience pages ×7 ──────────────────────────────────────────────────
  audiences: {
    businesses: {
      pains: ["Decisions made in meetings are re-litigated a week later because nobody can find the exact wording.", "Minutes take longer to write than the meeting lasted — and still miss nuance.", "Global teams need the same meeting in more than one language."],
      workflow: ["Upload the meeting recording (or paste the call's video link) — MP4, MKV or an audio file.", "Set the expected number of participants so speaker detection has a head start.", "Transcribe — language is detected automatically.", "Rename speakers to real names; skim Key Moments for the decisions.", "Translate the minutes for the offices that need another language.", "Share the read-only link in the follow-up email, or export to DOCX for the archive."],
      recommended: [["Speaker detection", "speaker-detection", "Label every participant automatically."], ["Key Moments", "key-moments", "Jump to the decisions without re-watching."], ["AI Translation", "translation", "One meeting, every office language."]],
      tips: ["Ask people to say their name once at the start — renaming speakers afterwards becomes trivial.", "Keep one folder per recurring meeting; the archive search finds any decision across them.", "Share links are read-only — safe to paste into chat tools."],
      faq: [["Can it handle a room of many people?", "Aud separates up to a dozen speakers per recording. For big rooms, a table microphone and one-speaker-at-a-time discipline matter more than any setting."], ["How do colleagues without an account see a transcript?", "Through the read-only share link — they read the text, see the speakers and can play the audio, all without an account."]],
    },
    creators: {
      pains: ["Show notes, subtitles and articles all come from the same episode — and all get re-typed by hand.", "Quotes for social clips are re-found by scrubbing the timeline.", "Guests speak a different language than the audience."],
      workflow: ["Record the episode as you already do — or paste the published video link.", "Transcribe with speakers detected automatically (host vs guest).", "Mark the strong moments with Key Moments while reviewing.", "Export SRT for the video platform and TXT for show notes.", "Translate the transcript for the international cut.", "Share the transcript with the editor as a link instead of a file."],
      recommended: [["Export Center", "share", "SRT for the platform, TXT for notes — one transcript."], ["Key Moments", "key-moments", "The quotable lines surface on their own."], ["AI Translation", "translation", "Subtitles for a second audience."]],
      tips: ["Record 5 seconds of room tone — edits around breaths sound cleaner and transcribe cleaner.", "Name episodes consistently in one folder; archive search becomes your content database.", "Check the SRT in a player before uploading — timecodes transfer exactly."],
      faq: [["Do the subtitles drop into YouTube directly?", "The SRT export follows the standard cue format players and platforms expect — upload it as the caption file, no conversion needed."], ["Can I keep a transcript private?", "Yes — nothing is public unless you create a share link, and share links are read-only."]],
    },
    researchers: {
      pains: ["Fieldwork interviews pile up faster than they can be transcribed by hand.", "Analysis needs precise quotes with timestamps, not paraphrase.", "Participants switch between languages and dialects mid-sentence."],
      workflow: ["Upload each session's recording as you collect it — WAV from the recorder, or the phone's M4A.", "Set expected speakers (interviewer + participant) per session.", "Transcribe; correct names and technical terms in the editor.", "Use search to pull every mention of a theme across all sessions.", "Translate the passages you need for publication, keeping the original.", "Export DOCX with speaker labels for the methods appendix."],
      recommended: [["Multi-language", "multi-language", "Dialects and code-switching in one pass."], ["Search", "share", "Every mention of a theme, across every interview."], ["Export Center", "share", "DOCX with labels for the appendix."]],
      tips: ["Keep a consistent file naming scheme (date_participant) — your archive will thank you at writing-up time.", "Correct a participant's recurring misheard terms once; search becomes reliable.", "The original is always kept next to the translation — cite from the original, publish from the translation."],
      faq: [["Does the transcript keep timestamps for quoting?", "Yes — every line and word is timestamped, so a quote in your write-up can point back to the exact second."], ["Can I work across many interviews at once?", "Yes — the archive and full-text search cover all your sessions; folders keep projects separated."]],
    },
    newsrooms: {
      pains: ["Press conferences and broadcast files pile up on deadline.", "Every published quote must be verified against the recording.", "International desks need the same material in several languages."],
      workflow: ["Paste the press-conference link or upload the broadcast file.", "Transcribe — speakers are detected and timestamped automatically.", "Verify quotes by clicking the words: playback jumps to that second.", "Clip the moments that matter with Key Moments.", "Translate the piece for the international desk, original intact.", "Share the transcript to the desk as a read-only link."],
      recommended: [["Link Transcription", "link-import", "Paste a URL, get a transcript."], ["Aud AI Chat", "ask", "\"What did X say about Y\" — answered with a timestamp."], ["Key Moments", "key-moments", "The soundbites surface on their own."]],
      tips: ["Verify at the word level — the timestamp under a quote is the fact-check.", "Keep raw transcripts untouched in one folder and work in a copy.", "Translate only after the source transcript is verified."],
      faq: [["Can I import from a URL?", "Yes — YouTube links and direct MP4/MP3 links are fetched into your account and enter the normal pipeline."], ["How do I prove a quote is accurate?", "Every word is timestamped to the audio; clicking it plays that exact moment — the recording is the proof."]],
    },
    education: {
      pains: ["Lectures need written records for accessibility and revision.", "Student interviews and seminars accumulate across a term.", "Material must be shareable with classmates and supervisors without account juggling."],
      workflow: ["Record the lecture (phone M4A is fine) or upload the seminar video.", "Transcribe — one file per lecture, one folder per course.", "Correct names and technical terms in the editor.", "Export TXT for revision sheets, DOCX for shared notes.", "Translate lectures for exchange students, original intact.", "Share the read-only link with the study group."],
      recommended: [["Files and Folders", "files-folders", "One folder per course, all term long."], ["Share", "share", "Read-only links for classmates."], ["AI Translation", "translation", "Study material in every student's language."]],
      tips: ["Sit the recorder near the speaker, not near the door — distance is the enemy.", "Correct recurring course terms once, then search finds every occurrence.", "Share links beat attachments: no version confusion."],
      faq: [["Can students share with each other?", "Yes — a read-only share link lets classmates read and listen without accounts."], ["Does it work on a phone recording?", "Yes — M4A voice memos are a standard input; quality depends mostly on distance to the speaker."]],
    },
    video: {
      pains: ["Subtitle backlog grows with every upload.", "Accessibility requirements demand accurate captions, not machine sloppiness.", "Libraries need subtitles in several languages from the same source."],
      workflow: ["Upload the video (MP4, MKV) or paste its published link.", "Transcribe — timecodes come word-accurate.", "Correct the transcript; the SRT inherits the corrections.", "Export SRT with precise timecodes.", "Translate for additional language tracks, original kept.", "Archive the transcript next to the project folder."],
      recommended: [["Export Center", "share", "SRT with precise timecodes, plus TXT/DOCX/PDF."], ["AI Translation", "translation", "One source, many subtitle tracks."], ["Files and Folders", "files-folders", "Keep every video's text with its project."]],
      tips: ["Correct the transcript before exporting — the SRT is generated from it, so fixes flow through.", "Check reading speed: short cues read better than long ones.", "Keep the transcript as the master; regenerate formats rather than editing files separately."],
      faq: [["Do you offer human-reviewed captions?", "Human review is planned — see the human-verified services page for how it will work."], ["Which subtitle format is exported?", "SRT, the format players, YouTube, Vimeo and editors accept directly."]],
    },
    consulting: {
      pains: ["Discovery interviews multiply across engagements.", "Findings must cite what was actually said, to whom, when.", "Client work demands confidentiality by default."],
      workflow: ["Upload each stakeholder call into the engagement's folder.", "Set expected speakers per call.", "Transcribe and correct names and internal terms.", "Use Key Moments to flag commitments and risks.", "Draft deliverables from the transcript, exporting DOCX.", "Share findings internally with read-only links."],
      recommended: [["Files and Folders", "files-folders", "Each engagement isolated in its own folder."], ["Key Moments", "key-moments", "Commitments flagged as they happen."], ["Export Center", "share", "DOCX deliverables with speaker labels."]],
      tips: ["One folder per engagement from day one — cross-project searches stay clean.", "Flag sensitive moments during review, not after export.", "Record consent at the start of the call — it lands in the transcript."],
      faq: [["Is client material kept private?", "Files are encrypted in transit and at rest, are never sold, and are only shared through links you create."], ["Can engagements be kept separate?", "Yes — folders isolate projects, and archive search can be pointed at one folder's material."]],
    },
  },

  // ── Blog (8 educational posts) ─────────────────────────────────────────
  blog: {
    cats: ["Transcription", "Subtitles", "Translation", "Workflows"],
    posts: [
      {
        id: "audio-quality", cat: "Transcription", minutes: 5,
        title: "Audio quality: the cheapest way to a better transcript",
        paras: [
          "Every speech-recognition engine — however good — starts from the same input: your audio. Improving that input costs nothing and usually moves the result more than any setting.",
          "Distance first. A microphone a hand-width from the speaker's mouth captures a clean, stable voice. The same microphone across the table captures voice plus room echo plus everything else in the building. Engines are trained to ignore some of that, but every layer of noise competes with the words.",
          "Watch the level. Recordings that peak into the red are clipped — the tops of loud syllables are literally cut off. No model can recognize a sound that was never captured. If your recorder has a level meter, aim for healthy but not maxed.",
          "Keep the original file. Converting a compressed file to WAV, or re-recording audio out of the speakers, adds nothing — the damage (if any) is already in the signal. Upload the original, whatever format it is.",
          "Finally: quiet beats processing. Closing a window, moving off the street, or recording in a furnished room is the one intervention that reliably improves every downstream tool — transcription, speaker separation, and your own ears during review.",
        ],
        related: ["srt-vtt-txt", "multi-speaker"],
      },
      {
        id: "srt-vtt-txt", cat: "Subtitles", minutes: 4,
        title: "SRT vs VTT vs plain text: which format for what",
        paras: [
          "Transcripts travel in different containers, and picking the right one saves an hour of fiddling later.",
          "TXT is just text. No timing, no structure — the words, optionally with speaker labels. It opens everywhere and pastes into anything: notes, articles, other software. If your next step is a human reading it, TXT is usually right.",
          "SRT (SubRip) is the veteran subtitle format: a number, a start --> end timecode, the cue text, blank line, repeat. Players, YouTube, Vimeo and every editor read it. If the text must appear on a video at the right moment, SRT is the answer.",
          "VTT (WebVTT) is SRT's younger sibling for the web: similar cues, a WEBVTT header, and extra styling options browsers understand. HTML5 video uses it natively. The two convert back and forth almost mechanically — which is why a small converter tool covers most needs.",
          "DOCX and PDF live at the other end of the spectrum: formatted documents for review, archives and print. Word processors keep the conversation going on a transcript; PDF freezes it.",
          "Rule of thumb: humans read TXT or DOCX, videos wear SRT or VTT, archives keep PDF. A good transcript is the master — the formats are just exports.",
        ],
        related: ["audio-quality", "subtitles-that-read"],
      },
      {
        id: "multi-speaker", cat: "Transcription", minutes: 5,
        title: "How speaker detection works, in plain language",
        paras: [
          "Speaker detection — diarization, in the literature — answers a question that sounds trivial and is not: given an hour of audio, which stretches of sound belong to the same person?",
          "The engine does not recognize who you are; it clusters how you sound. Voice characteristics — pitch, timbre, speaking rhythm — are summarized into a fingerprint over short windows. Windows with similar fingerprints are grouped, and each group becomes a speaker.",
          "That is why you never need to train it on recordings of the participants: the grouping happens within your one file. It is also why telling the engine the expected number of speakers helps so much — clustering with a known count is a much easier problem than discovering the count.",
          "Crosstalk is the hard case. When two people speak over each other, the audio genuinely contains both voices at once; any separation is an approximation. Meetings where people finish their sentences diarize dramatically better than parliamentary shouting matches.",
          "Practical checklist: set the expected speaker count when you know it, keep the recorder close, let people finish — and rename \"Speaker 2\" to a real name right after transcribing, so the rest of the review reads like a document instead of a puzzle.",
        ],
        related: ["audio-quality", "interview-workflow"],
      },
      {
        id: "interview-workflow", cat: "Workflows", minutes: 6,
        title: "Interview workflow: from recording to quotable text",
        paras: [
          "A repeatable pipeline turns interview marathons into a calm afternoon. The steps below assume nothing about your subject matter — only that you recorded one or more conversations and need accurate, citable text.",
          "1. Capture well at the source. Recorder close to the participant, phone on airplane mode, one file per session, named with the date. Ten seconds of discipline here saves an hour later.",
          "2. Transcribe the raw session. Upload the file as-is — with speaker detection on and the expected count set if you know it. The goal of this pass is completeness, not polish.",
          "3. Correct in one focused pass. Play at higher speed, fix names, technical terms and any garbled line, splitting paragraphs where topics change. The editor's search makes recurring terms a one-click fix.",
          "4. Verify the quotes you plan to use. Click the words — playback jumps to that second. A quote with a timestamp you have personally checked is a quote you can defend.",
          "5. Only now translate, if needed. Translation quality follows source quality, and keeping the original beside the translation lets a reviewer check any sentence.",
          "6. Export for the destination: DOCX for the report, TXT for the database, and the share link for anyone who needs to listen.",
        ],
        related: ["research-coding", "audio-quality"],
      },
      {
        id: "subtitles-that-read", cat: "Subtitles", minutes: 4,
        title: "Subtitles people can actually read",
        paras: [
          "A technically correct subtitle can still be an awful viewing experience. Reading while watching is a skill your audience did not ask to learn — the fewer demands the captions make, the better the video feels.",
          "Keep cues short. Two lines of reasonable length beat one enormous line, and one idea per cue beats two. When a sentence spans cues, break it at the natural spoken pause, not mid-phrase.",
          "Respect the timing. The cue should appear when the words start and leave when they end. Viewers habitually read to the end of a cue — a caption that lingers over the next speaker's line misattributes it.",
          "Numbers, names and terms deserve a second look. These are both the hardest things for any engine and the most jarring to get wrong on screen — the viewer cannot tell a wrong name from a surprising one.",
          "And always proof the SRT in a real player before publishing: what looks fine in a text file can expose overlap or timing drift the moment it meets the video.",
        ],
        related: ["srt-vtt-txt", "translate-keep-original"],
      },
      {
        id: "research-coding", cat: "Workflows", minutes: 6,
        title: "Qualitative research interviews: coding without the copy-paste marathon",
        paras: [
          "In qualitative research, the transcription used to be the tax you paid before analysis could start — weeks of hand-typing for a single study. The analysis method has not changed; the tedium can.",
          "The core discipline is the same as it ever was: verbatim text, identified speakers, exact timestamps. Machine transcription now supplies that base in minutes, and the researcher's job shifts to correction and coding.",
          "Correct strategically. You do not need a perfect transcript — you need a faithful one. Names, technical terms and any passage you expect to quote deserve the attention; filler and small stumbles can stay as heard, since verbatim data is data.",
          "Use search as your first coding pass. Themes usually announce themselves as recurring words — search the whole archive of sessions at once, and every candidate passage arrives with its timestamp attached.",
          "Keep the original language. If publication happens in another language, translate the passages you need while the original stays attached — reviewers can compare, and your quotes remain defensible against the recording.",
          "Export with structure: DOCX with speaker labels for the methods appendix, TXT for the analysis tool of your choice, and the recordings stay in the archive as the ground truth.",
        ],
        related: ["interview-workflow", "translate-keep-original"],
      },
      {
        id: "translate-keep-original", cat: "Translation", minutes: 4,
        title: "Why a translated transcript should keep the original",
        paras: [
          "The obvious way to translate a transcript — overwrite it — destroys the most valuable thing the document had: the record of what was actually said.",
          "Keeping the original next to the translation turns a black box into a checkable document. Any sentence that reads oddly can be compared against the source instantly; any disagreement about meaning is settled by switching back and listening to that moment.",
          "It also changes the correction loop. If the source transcript is fixed later — a name, a misheard word — the translation can be revisited against the corrected original, instead of silently propagating an error into another language.",
          "For teams, the pair of texts is a workflow: the original is the ground truth for people who spoke the language; the translation is the working copy for everyone else. Neither replaces the other.",
          "This is why Aud's translation is additive by design — the original is kept intact, and switching between the two is a click, not a project.",
        ],
        related: ["subtitles-that-read", "research-coding"],
      },
      {
        id: "multi-speaker-prep", cat: "Workflows", minutes: 4,
        title: "Preparing a multi-speaker recording (panel, meeting, focus group)",
        paras: [
          "More speakers does not have to mean more chaos — most multi-voice problems are decided before anyone presses record.",
          "Give every voice its own chance. One shared microphone in the middle of a table captures everyone at the same distance and the same room noise; individual microphones (or at least one per two people) are better still. The engine separates voices; it cannot separate a voice from the room it drowned in.",
          "Set the count. If three people will speak, say three. Speaker detection with a known target stops exploring the space between \"two colleagues\" and \"a crowd\".",
          "Control the overlap. Ask for a beat between speakers — panels that finish sentences diarize cleanly; free-for-alls produce hybrid lines no tool can attribute.",
          "Log the seating. A thirty-second note of who sat where (and who joined late) makes renaming speakers a formality instead of detective work.",
          "Then run the normal pipeline: transcribe, rename once, and review with Key Moments pointing you to the passages where decisions actually happened.",
        ],
        related: ["multi-speaker", "audio-quality"],
      },
    ],
  },

  // ── Help Center articles (14+, from the Aud facts list) ────────────────
  help: {
    articles: [
      { id: "h-formats", topic: "Uploading files", title: "Which file formats does Aud support?", body: [
        "Aud accepts the common audio formats — MP3, WAV, M4A and OGG — and the common video containers MP4 and MKV. Audio is extracted from video automatically; you never need to convert anything first.",
        "Large files are supported: upload the whole session rather than splitting it. If a file refuses to start, check that it plays locally — a truncated download is the usual culprit.",
      ]},
      { id: "h-first-transcription", topic: "Uploading files", title: "How do I transcribe my first file?", body: [
        "Open New Transcription, then either drag your file in, browse for it, or paste a link. Choose the language (or leave auto-detect on) and — if you know it — how many speakers to expect.",
        "Start the transcription. You can leave the page; the session appears in your archive when it is ready, and the transcript opens with every word timestamped.",
      ]},
      { id: "h-link", topic: "Uploading files", title: "How do I transcribe from a link?", body: [
        "Paste a YouTube link or a direct media URL (MP4 or MP3) into the link field instead of uploading a file. Aud fetches the media into your account and runs the normal pipeline.",
        "The link must be publicly reachable — private or unlisted videos need the file uploaded instead. If fetching fails, open the link in an incognito window to check it is truly public.",
      ]},
      { id: "h-language-speakers", topic: "Uploading files", title: "How do language and speaker options work?", body: [
        "Language: leave auto-detect on and Aud identifies the language itself, or pick one language when you know it for maximum focus. For recordings that switch languages, pick several — each gets its own pass and the most confident result wins.",
        "Speakers: if you know how many people talk, set the expected number. Speaker detection then separates voices into exactly that many tracks instead of guessing.",
      ]},
      { id: "h-editor", topic: "Editing", title: "How does the editor work?", body: [
        "The editor behaves like a word processor synced to the audio. Click any word and playback jumps to that moment — verification is immediate.",
        "Playback controls include back 15 seconds, forward 30 seconds and adjustable speed, so you can move through the recording at review pace rather than listening speed.",
      ]},
      { id: "h-autosave", topic: "Editing", title: "Is my editing saved?", body: [
        "Yes — every change saves automatically as you type. Close the tab, come back later: the transcript is exactly where you left it.",
        "Undo and redo are there for structural mistakes — if splitting a paragraph went wrong, one step restores it.",
      ]},
      { id: "h-word-edit", topic: "Editing", title: "How do I fix a word?", body: [
        "Click into the text like in any document and type the correction — the edit attaches to the same timestamp, so text and audio never drift apart.",
        "Enter splits a paragraph at the cursor, which is how you break a monologue into readable turns.",
      ]},
      { id: "h-rename-speakers", topic: "Speakers", title: "How do I rename speakers?", body: [
        "Click a speaker label (for example \"Speaker 2\") and type the real name. The change applies everywhere at once — every line in the transcript, every export and any share page.",
        "Do this right after transcribing: reviewing \"Sarah asked…\" is far faster than matching colored labels.",
      ]},
      { id: "h-key-moments", topic: "Editing", title: "What are Key Moments?", body: [
        "While Aud reads your recording, it flags the passages that carry the weight — decisions, commitments, turning points — as Key Moments.",
        "Click a moment to play the audio from exactly there. You can also mark your own moments in the editor; both kinds live side by side.",
      ]},
      { id: "h-chat", topic: "Editing", title: "How does Aud AI Chat work?", body: [
        "Ask a question about the transcript in your own words — no keywords or syntax. The AI answers from your transcript and cites the exact moment every claim came from.",
        "Click a cited timestamp to jump the audio there and verify the answer yourself. The AI answers only from your transcript.",
      ]},
      { id: "h-translate", topic: "Translation", title: "How do I translate a transcript — and switch back?", body: [
        "Open a finished transcript and choose Translate. Aud adds the translation alongside your text — the original is kept intact.",
        "Switch between original and translation at any time. Nothing is overwritten, so you can always check a sentence against what was actually said.",
      ]},
      { id: "h-export", topic: "Exporting", title: "How do I export — and which format?", body: [
        "From any transcript, open the export menu and choose the format: TXT for plain text and reuse, SRT for subtitles with precise timecodes, DOCX for formatted review documents, PDF for archives.",
        "Exports carry your speaker labels and (where the format allows) timestamps — corrections made in the editor flow into the file.",
      ]},
      { id: "h-share", topic: "Sharing", title: "How do I share a transcript?", body: [
        "Every transcript has a read-only share link. Whoever opens it sees the text, the speakers and the audio player — without an account and without touching your files.",
        "Nothing is public unless you create a link, and you control when you share it.",
      ]},
      { id: "h-folders", topic: "Organizing", title: "How do files and folders work?", body: [
        "Create folders in your studio (for example one per project, course or client), rename sessions, and move them between folders. Color tags make the archive readable at a glance.",
        "Files saved in My Files are protected: the archive's bulk delete skips them, so an accidental sweep cannot wipe your curated library.",
      ]},
      { id: "h-archive", topic: "Organizing", title: "Where do past sessions go?", body: [
        "Every transcription session is kept in your sessions archive — newest first, searchable across all of them.",
        "Search finds any word in any transcript and jumps straight into the session at that line, which is how past material stays useful instead of buried.",
      ]},
      { id: "h-privacy", topic: "Account & privacy", title: "How is my data protected?", body: [
        "Files are encrypted in transit and at rest (AES-256), and access is authenticated per account — one account cannot read another's transcripts.",
        "Your recordings are processed for your transcription purpose only. Data is not sold to third parties, files are not public or searchable, and sharing happens only through links you create. Aud follows GDPR (RGPD).",
      ]},
    ],
  },

  // ── Tutorials (6, real app flow) ───────────────────────────────────────
  tutorials: {
    items: [
      { id: "t-first", cat: "Getting started", title: "Your first transcription", steps: [
        ["Open the studio", "Log in and click New Transcription."],
        ["Add your recording", "Drag in an MP3, WAV, M4A, OGG, MP4 or MKV — or paste a YouTube / media link."],
        ["Check the options", "Leave language on auto-detect, and set the expected number of speakers if you know it."],
        ["Start", "Launch the transcription — you can close the tab; the session lands in your archive."],
        ["Open and skim", "When it finishes, open the transcript and scroll to feel the structure: speakers, timestamps, turns."],
      ]},
      { id: "t-speakers", cat: "Getting started", title: "Set up speakers correctly", steps: [
        ["Count the voices", "Before starting, note how many people speak in the recording."],
        ["Set the expected number", "Enter it in the speakers option — detection separates exactly that many voices."],
        ["Transcribe", "Run the transcription as usual."],
        ["Rename the labels", "Click each \"Speaker N\" label and type the real name — it updates everywhere."],
        ["Spot-check a turn", "Click a line from each speaker to confirm the voices were separated the way you expect."],
      ]},
      { id: "t-edit", cat: "Editing", title: "Correct a transcript efficiently", steps: [
        ["Open the editor", "Open the finished session from your archive."],
        ["Do a speed pass", "Raise playback speed and fix names and technical terms as you hear them — click a word to jump the audio there."],
        ["Split long paragraphs", "Press Enter at topic changes so each turn is readable."],
        ["Use search for repeats", "Search a recurring misheard term and fix every occurrence."],
        ["Rely on auto-save", "Edits save as you type; undo is there for structural mistakes."],
      ]},
      { id: "t-translate", cat: "Translation", title: "Translate and keep the original", steps: [
        ["Finish the original first", "Correct the transcript — translation quality follows source quality."],
        ["Choose Translate", "Pick the target language and run the translation."],
        ["Compare side by side", "Read the translation against the original; switch between them any time."],
        ["Check names and terms", "Scan for proper nouns and jargon — the usual drift points."],
        ["Keep both", "The original stays intact — export either version, or both."],
      ]},
      { id: "t-srt", cat: "Subtitles", title: "Create SRT subtitles for a video", steps: [
        ["Transcribe the video", "Upload the MP4/MKV or paste the link — audio is extracted automatically."],
        ["Correct the transcript", "Every fix flows into the subtitles, so correct before exporting."],
        ["Export as SRT", "Open the export menu and choose SRT — timecodes come word-accurate."],
        ["Proof in a player", "Load the SRT into a video player to check timing and reading comfort."],
        ["Upload to the platform", "The file drops into YouTube, Vimeo or your editor as-is."],
      ]},
      { id: "t-folders", cat: "Organizing", title: "Organize your archive", steps: [
        ["Plan your structure", "One folder per project, course or client — simple beats clever."],
        ["Create folders", "In the studio, create the folders you need."],
        ["Move sessions", "Move existing sessions into place; rename anything with unclear names."],
        ["Save key files to My Files", "Files in My Files are skipped by bulk delete — your curated shelf."],
        ["Search across everything", "Try the archive search on a recurring term — every hit jumps to its line."],
      ]},
    ],
  },

  // ── Use cases detail ───────────────────────────────────────────────────
  usecases: {
    items: [
      { id: "u-journalists", icon: "newsroom", title: "Journalists", aud: "newsrooms", scenario: "A press conference ends at noon; the piece is due at five. The recording is long, the quotes must be exact, and three desks need the material.", outcome: "A link-to-transcript pass puts the full text on every desk within minutes of the feed ending; each desk verifies its own quotes by clicking the words, and the international desk works from the translation with the original intact." },
      { id: "u-researchers", icon: "flask", title: "Researchers", aud: "researchers", scenario: "A study plans thirty semi-structured interviews across two regions, with participants switching languages mid-sentence.", outcome: "Each session is transcribed the day it is collected, with timestamps attached to every quote; search across the archive surfaces every mention of a theme without re-reading hours of audio." },
      { id: "u-students", icon: "cap", title: "Students", aud: "education", scenario: "A semester of lectures, plus ten interviews for a thesis, recorded on a phone in a language the professor does not teach in.", outcome: "Lectures become searchable revision material in course folders; the thesis interviews are quoted with timestamps and translated for the committee, originals intact." },
      { id: "u-podcasters", icon: "podcast", title: "Podcasters", aud: "creators", scenario: "One episode must become show notes, three social clips and platform subtitles — every week.", outcome: "The transcript is the single source: TXT feeds the notes, Key Moments mark the clip boundaries, and the SRT export drops straight into the video platform." },
      { id: "u-video", icon: "captions", title: "Video creators", aud: "video", scenario: "A back catalogue of videos needs captions in two languages, and every new upload adds to the pile.", outcome: "Each video's transcript is corrected once, then generates an SRT in the original language and translated tracks — the backlog shrinks instead of growing." },
      { id: "u-businesses", icon: "briefcase", title: "Businesses", aud: "businesses", scenario: "A weekly leadership call across three offices, in two languages, where decisions are re-litigated because nobody can find the wording.", outcome: "Every call lands in one folder, speaker-labeled and searchable; the minutes travel as a read-only link, and the translated version reaches the office that needs it." },
    ],
  },

  // ── Security page ──────────────────────────────────────────────────────
  security: {
    does: [
      "Encrypt files in transit and at rest (AES-256).",
      "Authenticate access per account — one account cannot read another's transcripts.",
      "Keep files private: nothing is public or searchable unless you create a share link.",
      "Process recordings for your transcription purpose.",
      "Follow GDPR (RGPD).",
    ],
    doesNot: [
      "Sell your data to third parties.",
      "Make your files public or searchable by others.",
      "Share anything except through the read-only links you create.",
    ],
    faq: [
      ["Who can see my files?", "Only your authenticated account — and, for the pieces you choose, whoever opens a read-only share link you created."],
      ["How are files protected?", "Encryption in transit on every request and AES-256 encryption at rest, with access authenticated per account."],
      ["Do you sell data?", "No. Data is not sold to third parties, and recordings are processed for your transcription purpose."],
      ["What about GDPR?", "Aud follows GDPR (RGPD): your files are yours, private by default, and deletions you perform in the studio remove the material."],
      ["Can I delete a recording?", "Yes — deleting a session removes its audio, transcript and metadata from your archive; bulk deletion works the same way, with files saved in My Files protected from accidental sweeps."],
    ],
  },

  careers: { emptyNote: "There are no open roles right now. We still read every CV." },

  // 8+ full FAQ answers for the AI Transcription page (from the facts list)
  aiFaq: [
    ["Which file formats does Aud support?", "Aud accepts MP3, WAV, M4A and OGG audio files, plus MP4 and MKV video containers — audio is extracted from video automatically. You never need to convert a file before uploading."],
    ["How large can my files be?", "Large files are supported — upload the whole session instead of splitting it into pieces. The current size ceiling of your plan is shown on the studio's upload screen."],
    ["Which languages can it transcribe?", "Aud transcribes in dozens of languages with automatic language detection. For recordings that switch between languages, you can select several languages in one pass and the most confident result wins."],
    ["Do I have to tell it how many speakers there are?", "No — speaker detection runs automatically. If you do know the number, setting the expected count gives the separation a strong hint and usually produces cleaner speaker labels."],
    ["Are the timestamps accurate?", "Every word carries its own timestamp, and the editor is synced to the audio: click any word and playback jumps to that exact moment, so you can verify any line against the recording."],
    ["What happens to my files after transcription?", "Your session is kept in your archive where you can edit, translate, share and export it. Files are encrypted in transit and at rest, are never sold, and are only visible to your account unless you create a share link."],
    ["Can I correct mistakes?", "Yes — the editor works like a word processor synced to the audio. Type a correction and it attaches to the same timestamp; undo, redo and auto-save are all built in."],
    ["Does it work on phone recordings?", "Yes — phone voice memos (M4A) are a standard input. Quality depends mostly on the recording: distance to the speaker and background noise matter more than the device."],
  ],

  // Link Transcription page: supported types & common problems
  linkGuide: {
    items: [
      ["YouTube links", "Standard youtube.com/watch, youtu.be and Shorts links work. The video must be publicly reachable — private or unlisted videos cannot be fetched, so upload the file instead. Members-only or age-restricted videos can fail for the same reason."],
      ["Direct MP4 / MP3 links", "A URL that ends in .mp4 or .mp3 (optionally with query parameters) is fetched as-is. The server hosting the file must allow direct access — if the link asks for a login or expires quickly, download the file and upload it."],
      ["Other formats by upload", "Link fetching covers YouTube plus MP4/MP3 addresses. Everything else — WAV, M4A, OGG, MKV and the rest — goes through the normal upload path instead."],
      ["\"It says the link is not supported\"", "Usually one of three things: the URL points to a web page rather than the media file itself (copy the direct file address instead), the media is private, or the host blocks automated access. The checker above tells you which case looks likely."],
      ["\"The video was removed / unavailable\"", "The source disappeared between pasting and fetching — the link checker validates the shape of the URL, but only the moment of transcription proves the media is still there."],
      ["Long videos", "A link avoids the upload step entirely, which is convenient for long recordings. The normal pipeline — language detection, speakers, timestamps — runs exactly as with an uploaded file."],
    ],
  },

  // Human-verified pages: detailed explanation (planned — no invented facts)
  humanDetail: [
    ["The draft comes first", "The process would start exactly where Aud always starts: the AI transcribes your recording with timestamps and speaker labels. Nothing changes about speed or cost of that first draft."],
    ["A reviewer checks the text", "A human reviewer would then go through the transcript against the audio — correcting misheard words, fixing names and terms, and marking anything uncertain rather than guessing."],
    ["Verified delivery", "The corrected transcript would return to your studio marked as reviewed, ready for the usual editing, translation, sharing and exports."],
    ["What it is for", "The service is aimed at the work where a word can matter: legal and editorial quotations, publications, compliance captions — anywhere \"probably right\" is not good enough."],
    ["What is not decided yet", "Pricing beyond the per-minute structure, exact delivery times, and the language coverage at launch are all still to be confirmed — the placeholder boxes on this page stay empty until they are real."],
  ],
};
