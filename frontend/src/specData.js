// ═══════════════════════════════════════════════════════════════════════
//  SPEC PAGE TEMPLATES — mockup-exact content (image spec, 2026-10)
//  Template: feature page · human-verified · help · tutorials · use cases
//  · languages · changelog · api · contact · careers · company ·
//  reviewers · terms · footer.  Placeholders keep TODO: owner to verify.
// ═══════════════════════════════════════════════════════════════════════

export const SPEC_DATA = {
  // Template: feature page — Speaker Detection, Transcript Editor, Key Moments, and others
  features: {
    "ai-transcription": {
      crumb: "AI Transcription",
      headline: "Turn audio and video into text, in minutes",
      desc: "Upload any audio or video and get a precise, timestamped transcript, ready to edit and keep.",
      card: [
        { s: "Speaker 1", t: "00:12.0", c: "#10b981", l: "Sample line from the first speaker." },
        { s: "Speaker 2", t: "00:31.4", c: "#f59e0b", l: "Sample line from the second speaker." },
      ],
      steps: [["Upload", "MP3, WAV, M4A, OGG, MP4, MKV — or paste a link"], ["Transcribe", "Language and speakers detected automatically"], ["Edit", "Fix anything in the editor — every correction stays synced to the audio"]],
      related: [["Speaker Detection", "speaker-detection"], ["Transcript Editor", "editor"], ["Key Moments", "key-moments"]],
      faq: [["Which file formats does Aud support?", "All common formats: MP3, WAV, M4A, OGG for audio, and MP4, MKV for video. Audio is extracted from videos automatically."]],
      cta: "Start transcribing for free",
    },
    "speaker-detection": {
      crumb: "Speaker Detection",
      headline: "Know who said what, and when",
      desc: "Aud labels every speaker automatically, so you can read, search, and quote with confidence.",
      card: [
        { s: "Speaker 1", t: "00:12.0", c: "#10b981", l: "Sample line from the first speaker." },
        { s: "Speaker 2", t: "00:31.4", c: "#f59e0b", l: "Sample line from the second speaker." },
        { s: "Speaker 3", t: "00:58.9", c: "#ef4444", l: "Sample line from the third speaker." },
      ],
      steps: [["Choose speakers", "Set the expected number, or let Aud decide"], ["Detect", "Each segment is labeled and timestamped"], ["Rename", "Replace \"Speaker 2\" with a real name"]],
      related: [["Transcript Editor", "editor"], ["AI Transcription", "ai-transcription"], ["Key Moments", "key-moments"]],
      faq: [["How many speakers can Aud detect?", "Up to 12 speakers in one recording."], ["Can I rename speakers after transcribing?", "Yes — rename once and every line updates instantly."]],
      cta: "Start transcribing with speaker labels",
    },
    "editor": {
      crumb: "Transcript Editor",
      headline: "Fix text word by word",
      desc: "The editor works like a word processor: click between words, type, and the audio follows you.",
      card: [{ s: "Speaker 1", t: "00:41.5", c: "#10b981", l: "Edit any word while listening." }],
      steps: [["Click to play", "Click any word to jump the audio there"], ["Type to fix", "Corrections sync to the timestamp"], ["Search instantly", "Find any word across the transcript"]],
      related: [["Speaker Detection", "speaker-detection"], ["AI Transcription", "ai-transcription"], ["Export Center", "share"]],
      faq: [["Is my editing saved?", "Yes — every change autosaves as you type."]],
      cta: "Open the editor",
    },
    "ask": {
      crumb: "Aud AI Chat",
      headline: "Ask your transcript anything",
      desc: "Aud AI Chat answers questions about your recording and cites the exact moment every claim came from.",
      card: [
        { s: "You", t: "00:00.0", c: "#6415f5", l: "What did Speaker 2 say about the deadline?" },
        { s: "Aud", t: "cited", c: "#10b981", l: "Speaker 2 moved the deadline to Friday — 00:12:48." },
      ],
      steps: [["Ask in your own words", "No keywords or syntax needed"], ["Get a cited answer", "Every claim carries a clickable timestamp"], ["Verify in one click", "Play the cited moment and confirm"]],
      related: [["AI Transcription", "ai-transcription"], ["Smart Summary", "summary"], ["Transcript Editor", "editor"]],
      faq: [["Can it invent answers?", "No — the AI answers only from your transcript and cites its sources."]],
      cta: "Try Aud AI Chat",
    },
    "key-moments": {
      crumb: "Key Moments",
      headline: "The moments that matter, found",
      desc: "Aud flags the key moments in your recording so you can review hours of audio in minutes.",
      card: [{ s: "Key moment", t: "00:37.3", c: "#6415f5", l: "AI finds what matters in your recording." }],
      steps: [["Transcribe", "The AI reads the whole recording"], ["Moments surface", "Important passages are flagged"], ["Jump and clip", "Play or clip each moment to the second"]],
      related: [["AI Transcription", "ai-transcription"], ["Transcript Editor", "editor"], ["Aud AI Chat", "ask"]],
      faq: [["Can I add my own moments?", "Yes — mark any line as a key moment in the editor."]],
      cta: "Find your key moments",
    },
    "translation": {
      crumb: "AI Translation",
      headline: "Translate, keep the original",
      desc: "Instant AI translation of the full transcript — the original stays intact and you can switch between versions at any time.",
      card: [
        { s: "Original", t: "00:00.0", c: "#10b981", l: "The transcript in its original language." },
        { s: "Translated", t: "00:00.0", c: "#f59e0b", l: "The same transcript, translated." },
      ],
      steps: [["Finish the transcript", "Correct it until it is exactly right"], ["Translate", "The AI rewrites every segment in the chosen language"], ["Switch freely", "Original and translation stay side by side"]],
      related: [["AI Transcription", "ai-transcription"], ["Export Center", "share"], ["Language auto-detect", "multi-language"]],
      faq: [["Does translation change my original?", "No — the original transcript stays intact."]],
      cta: "Translate your first transcript",
    },
    "share": {
      crumb: "Export Center",
      headline: "Your transcript, in six formats",
      desc: "Export to TXT, SRT, DOCX, PDF, JSON and XML — with full timestamps and speaker labels.",
      card: [
        { s: "TXT", t: "notes", c: "#10b981", l: "Plain text for any workflow." },
        { s: "SRT", t: "subtitles", c: "#f59e0b", l: "Subtitles with precise timecodes." },
        { s: "DOCX · PDF", t: "documents", c: "#6415f5", l: "Formatted documents with speakers." },
      ],
      steps: [["Finish the transcript", "Edit until it is exactly right"], ["Pick the format", "Six formats for every workflow"], ["Download", "The file is ready immediately"]],
      related: [["AI Transcription", "ai-transcription"], ["Transcript Editor", "editor"], ["Language auto-detect", "multi-language"]],
      faq: [["Do exports keep speaker labels?", "Yes — DOCX and PDF include speaker labels and timestamps."]],
      cta: "Export your transcript",
    },
    "link-import": {
      crumb: "Link Transcription",
      headline: "From a link to a transcript",
      desc: "Paste a YouTube or media link — Aud fetches the media into your account and runs the full transcription pipeline.",
      card: [{ s: "YouTube link", t: "00:00.0", c: "#ef4444", l: "Paste a link — Aud fetches the media." }],
      steps: [["Paste the link", "YouTube or a direct MP4/MP3 URL"], ["Aud fetches it", "The media is stored in your account"], ["Transcription runs", "The normal pipeline — speakers and all"]],
      related: [["AI Transcription", "ai-transcription"], ["Files and Folders", "files-folders"], ["Speaker Detection", "speaker-detection"]],
      faq: [["Which links work?", "YouTube videos and direct media URLs."]],
      cta: "Paste your first link",
    },
    "files-folders": {
      crumb: "Files and Folders",
      headline: "Everything in one place",
      desc: "Folders, custom names, color tags and full-archive search — keep dozens of transcripts organized like a library.",
      card: [{ s: "Archive", t: "—", c: "#6415f5", l: "Every transcript organized and searchable." }],
      steps: [["Create folders", "Organize per project, course or client"], ["Name and tag", "Custom names and color tags per file"], ["Search everything", "Find any word across the whole archive"]],
      related: [["Share transcript", "share"], ["Aud AI Chat", "ask"]],
      faq: [["Are files in folders protected from bulk delete?", "Yes — the archive bulk delete skips everything saved in My Files."]],
      cta: "Organize your archive",
    },
    "multi-language": {
      crumb: "Language auto-detect",
      headline: "99 languages. One studio.",
      desc: "Transcribe in up to 99 languages — mixed recordings handled, auto-detect included.",
      card: [
        { s: "العربية", t: "auto", c: "#10b981", l: "كل لغة تُكتب بنصها الأصلي." },
        { s: "English", t: "auto", c: "#f59e0b", l: "Each language in its native script." },
      ],
      steps: [["Pick your languages", "One for precision — or several for mixed recordings"], ["Every pass is transcribed", "Each language gets its own pass"], ["The best parts win", "The most confident segment of every passage"]],
      related: [["AI Transcription", "ai-transcription"], ["AI Translation", "translation"], ["Speaker Detection", "speaker-detection"]],
      faq: [["Does it understand dialects?", "The models are tuned on Maghrebi and Levantine speech alongside Modern Standard Arabic."]],
      cta: "Transcribe in your language",
    },
    "summary": {
      crumb: "Smart Summary",
      headline: "A summary that knows the whole story",
      desc: "A clear summary of your meetings and interviews, generated automatically from the transcript.",
      card: [{ s: "Summary", t: "auto", c: "#6415f5", l: "Key points, decisions, and actions — drafted." }],
      steps: [["Transcribe", "The AI reads the whole recording"], ["Summarize", "Key points drafted automatically"], ["Refine", "Edit the summary like any text"]],
      related: [["Key Moments", "key-moments"], ["Aud AI Chat", "ask"], ["Export Center", "share"]],
      faq: [["Which language is the summary in?", "The transcript's language — or translate it after."]],
      cta: "Summarize a recording",
    },
    "statistics": {
      crumb: "Speaking Statistics",
      headline: "Speaking stats at a glance",
      desc: "Talking time, pace and participation for every speaker in the recording.",
      card: [{ s: "Speaker 1", t: "talk share", c: "#10b981", l: "Sample talking-time share — the room's balance at a glance." }],
      steps: [["Transcribe", "Speakers detected automatically"], ["Measure", "Talking time and pace per speaker"], ["Balance", "See who dominated the room"]],
      related: [["Speaker Detection", "speaker-detection"], ["AI Transcription", "ai-transcription"], ["Export Center", "share"]],
      faq: [["Does it work on any recording?", "Any transcript with speaker labels."]],
      cta: "See your speaking stats",
    },
  },

  // Template: human-verified service pages — PLANNED, one topic each,
  // no shared paragraphs between the three, no accuracy/speed/availability
  // claims, waitlist form with the service preselected.
  human: {
    badge: "Planned",
    cta: "Join the waitlist",
    pages: {
      "human-transcription": {
        crumb: "Human Transcription",
        service: "Human Transcription",
        headline: "A person checks the transcript",
        desc: "A planned service: after the AI transcript is ready, a human reviewer would check it against the audio and correct every mistake.",
        stepsTitle: "How it would work",
        steps: [["AI draft", "Aud transcribes your file first — timestamps and speaker labels included."], ["Human review", "A reviewer would listen and correct the text word by word."], ["Verified delivery", "The corrected transcript would return to your studio, marked as reviewed."]],
        detail: "This page describes a planned service. Nothing can be ordered yet — the waitlist below is the only live part.",
      },
      "global-subtitles": {
        crumb: "Human Translation",
        service: "Human Translation",
        headline: "A translator reviews the translation",
        desc: "A planned service: a professional translator would check or produce the translation of your transcript, with the original text kept intact.",
        stepsTitle: "How it would work",
        steps: [["AI translation", "The transcript is translated by the AI first — the original is never replaced."], ["Human review", "A professional translator would correct the translation against the original."], ["Verified delivery", "The reviewed translation would sit next to your original, ready to export."]],
        detail: "This page describes a planned service. Nothing can be ordered yet — the waitlist below is the only live part.",
      },
      "human-captions": {
        crumb: "Verified Subtitles",
        service: "Verified Subtitles",
        headline: "Subtitles checked by a person",
        desc: "A planned service: your SRT subtitles would be reviewed by a human for timing and wording before you publish them.",
        stepsTitle: "How it would work",
        steps: [["AI subtitles", "Export word-accurate SRT from your transcript first."], ["Human review", "A reviewer would check timing, spelling and reading comfort."], ["Verified delivery", "The reviewed SRT would be returned, ready for your platform."]],
        detail: "This page describes a planned service. Nothing can be ordered yet — the waitlist below is the only live part.",
      },
    },
  },

  // Template: help center
  help: {
    crumb: "Help Center",
    headline: "How can we help?",
    sub: "Search answers about uploading, editing, translating, and exporting.",
    searchPh: "Search the Help Center",
    topicsTitle: "Browse by topic",
    topics: [
      ["upload", "Uploading files", "Formats, size limits, links"],
      ["users", "Speakers", "Detection and renaming"],
      ["pencil", "Editing", "Editor, undo, auto-save"],
      ["globe", "Translation", "Languages and original text"],
      ["export", "Exporting", "TXT, SRT, DOCX, PDF"],
      ["userCheck", "Account", "Sign in, settings, folders"],
    ],
    popularTitle: "Popular articles",
    popular: ["Which file formats does Aud support?", "How do I translate a transcript?", "How do I export subtitles as SRT?"],
    stuckTitle: "Still stuck?",
    stuckSub: "Our team can help.",
    stuckCta: "Contact Support",
  },

  // Template: tutorials
  tutorials: {
    crumb: "Tutorials",
    headline: "Tutorials",
    sub: "Short step-by-step guides to get more from Aud.",
    chips: ["All", "Getting started", "Editing", "Translation", "Subtitles"],
    rows: [
      ["play", "Transcribe your first file", "Getting started", 3],
      ["pencil", "Fix mistakes in the editor", "Editing", 4],
      ["globe", "Translate and keep the original", "Translation", 3],
      ["captions", "Create SRT subtitles for a video", "Subtitles", 4],
    ],
  },

  // Template: use cases
  usecases: {
    crumb: "Use Cases",
    headline: "See how people use Aud",
    sub: "Pick your situation to see the workflow that fits.",
    cards: [
      ["newsroom", "Journalists", "Verify quotes from interviews", "newsrooms"],
      ["flask", "Researchers", "Analyze long recordings", "researchers"],
      ["cap", "Students", "Turn lectures into notes", "education"],
      ["podcast", "Podcasters", "Show notes and subtitles", "creators"],
      ["captions", "Video creators", "Subtitles in many languages", "video"],
      ["briefcase", "Businesses", "Meetings you can search", "businesses"],
    ],
    featuredLabel: "Featured story",
    featured: "TODO: owner to add a real customer story",
  },

  // Template: supported languages
  languages: {
    crumb: "Supported Languages",
    headline: "Languages Aud supports",
    sub: "Transcribe and translate across the world's languages. Search to check yours.",
    searchPh: "Search a language",
    chips: ["All", "Transcription", "Translation"],
    note: "A = AI. The full engine list — search to check yours.",
    noticeTitle: "Add a human-review badge only for languages you can actually review",
    notice: "The A badge means AI transcription. Mark reviewed languages only once a real reviewer covers them.",
  },

  // Template: changelog
  changelog: {
    crumb: "Changelog",
    headline: "What's new in Aud",
    sub: "Every improvement, in order.",
    dateLabel: null, // owner: set real dates per entry; null hides dates
    entries: [ // TODO: owner to verify — replace with real dated entries
      { tag: "New", title: "Aud AI Chat", text: "Ask questions about a transcript and jump to the exact moment." },
      { tag: "New", title: "AI translation panel", text: "Translate a full transcript. The original stays intact." },
      { tag: "Improved", title: "Editor auto-save", text: "Changes save as you type." },
      { tag: "Fixed", title: "Long files in translation", text: "Large transcripts translate in parts." },
    ],
  },

  // Template: API and docs — hidden (no public API). Set enabled:true and
  // re-add the menu item when a real API exists.
  api: {
    enabled: false,
    crumb: "API and Docs",
    badge: "Proposed: only if you offer an API",
    title: "Aud API",
    desc: "Send audio or video, get a transcript with timestamps and speakers.",
    sidebar: ["Introduction", "Authentication", "Transcribe a file", "Speakers", "Translation", "Errors and limits", "API status"],
    code: "POST /v1/transcriptions\nfile: meeting.mp3\nlanguage: auto\nspeakers: auto",
    todoTitle: "Endpoints, parameters, and examples",
    todo: "Endpoints, parameters, and examples will be documented from the real API.",
  },

  // Template: contact (About / Contact — also reached from Resources / Contact Support)
  contact: {
    crumb: "Contact",
    headline: "Talk to us",
    desc: "Questions, feedback, or a custom need? We reply by email.",
    rows: [
      ["help", "Quick answers", "Visit the Help Center"],
    ],
    form: { name: "Name", namePh: "Your name", email: "Email", emailPh: "name@company.com", topic: "Topic", topics: ["Support", "Sales", "Feedback"], message: "Message", messagePh: "How can we help?", submit: "Send message" },
  },

  // Template: careers
  careers: {
    crumb: "Careers",
    headline: "Help us make speech searchable",
    sub: "Join a small team building transcription and translation tools.",
    roles: [], // owner: add real openings here; empty list shows the honest empty state
    emptyTitle: "No open roles?",
    emptyCta: "Send us your CV",
  },

  // Template: company
  company: {
    crumb: "Company",
    headline: "Make spoken words searchable, readable, and understood",
    desc: "Aud turns audio and video into text you can edit, translate, and trust.",
    cards: [
      ["star", "Our mission", "Turn the world's spoken words into text anyone can read, search and keep."],
      ["pencil", "Our approach", "AI first, human review when it matters"],
      ["shield", "Our promise", "Your files stay private"],
    ],
  },

  // Template: human reviewers [planned]
  reviewers: {
    crumb: "Our Human Reviewers",
    badge: "Planned",
    headline: "People behind the review",
    desc: "How reviewers and translators are selected and how they protect your files.",
    steps: [
      ["Selection", "Reviewers would be selected and their language skills tested before they see any file."],
      ["Confidentiality", "Reviewers would work under confidentiality agreements, inside the same encrypted pipeline as the studio."],
      ["Quality checks", "A sample of each reviewer's finished work would be re-checked before delivery."],
    ],
    plannedNotice: "This program is not live yet — this page describes how it would work. The interest form below is the only live part.",
    cta: "Register interest",
  },

  // Template: terms and privacy
  terms: {
    crumb: "Terms and Privacy",
    tabs: ["Terms of Service", "Privacy Policy", "Cookies"],
    toc: ["1. Using Aud", "2. Your content", "3. Privacy", "4. Data retention", "5. Contact"],
    updated: "Last updated: TODO date",
    note: "TODO: have a qualified person write the real legal text. This mockup shows layout only.",
  },

  // Template: contact support (Resources menu — topic fixed to Support)
  support: {
    crumb: "Contact Support",
    headline: "Get support",
    desc: "A question about using Aud? Send the support team a message — the topic is set to Support. For how-to answers, the Help Center is faster.",
  },

  // Footer (appears at the bottom of every page)
  footer: {
    tagline: "Audio and video into text, in minutes.",
    columns: [
      ["Product", [["AI Transcription", "feat:ai-transcription"], ["Speaker Detection", "feat:speaker-detection"], ["AI Translation", "feat:translation"], ["Export Center", "feat:share"]]],
      ["Features", [["Transcribe", "feat:ai-transcription"], ["Translate", "feat:translation"], ["Edit and export", "feat:editor"], ["Organize", "feat:files-folders"]]],
      ["Resources", [["Blog", "res:blog"], ["Help Center", "info:help"], ["Tutorials", "res:tutorials"], ["Changelog", "changelog"]]],
      ["About", [["Company", "about"], ["Security", "info:security"], ["Contact", "contact"], ["Careers", "careers"]]],
    ],
  },
};
