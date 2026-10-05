// ═══════════════════════════════════════════════════════════════════════
//  AUD — WEBSITE DATA (single source of truth)
//  Edit THIS file to change prices, plans, menus and copy.
//  The layout components read everything from here.
//
//  [CONFIRMED] = fact from the live product or the owner.
//  [PROPOSED]  = suggestion — TODO: owner to verify before treating it
//                as a real fact. Marked with TODO comments below.
// ═══════════════════════════════════════════════════════════════════════

export const BRAND = {
  name: "Aud",
  // Tagline [CONFIRMED by owner] — editable
  tagline: "Turn audio and video into accurate, timestamped text, in any language.",
  email: "hamzakarmi62@gmail.com",
};

// ── All world languages supported by the engine [CONFIRMED] ──────────────
export const ALL_LANGUAGES = [
  { value: "ar", label: "Arabic (العربية)" },
  { value: "en", label: "English" },
  { value: "fr", label: "French (Français)" },
  { value: "es", label: "Spanish (Español)" },
  { value: "de", label: "German (Deutsch)" },
  { value: "tr", label: "Turkish (Türkçe)" },
  { value: "zh", label: "Chinese (中文)" },
  { value: "hi", label: "Hindi (हिन्दी)" },
  { value: "ur", label: "Urdu (اردو)" },
  { value: "pt", label: "Portuguese (Português)" },
  { value: "ru", label: "Russian (Русский)" },
  { value: "it", label: "Italian (Italiano)" },
  { value: "nl", label: "Dutch (Nederlands)" },
  { value: "ja", label: "Japanese (日本語)" },
  { value: "ko", label: "Korean (한국어)" },
  { value: "fa", label: "Persian (فارسی)" },
  { value: "am", label: "Amharic (አማርኛ)" },
  { value: "as", label: "Assamese" },
  { value: "az", label: "Azerbaijani (Azərbaycan)" },
  { value: "ba", label: "Bashkir (Башҡортса)" },
  { value: "be", label: "Belarusian (Беларуская)" },
  { value: "bg", label: "Bulgarian (Български)" },
  { value: "bn", label: "Bengali (বাংলা)" },
  { value: "bo", label: "Tibetan (བོད་སྐད)" },
  { value: "br", label: "Breton (Brezhoneg)" },
  { value: "bs", label: "Bosnian (Bosanski)" },
  { value: "ca", label: "Catalan (Català)" },
  { value: "cs", label: "Czech (Čeština)" },
  { value: "cy", label: "Welsh (Cymraeg)" },
  { value: "da", label: "Danish (Dansk)" },
  { value: "el", label: "Greek (Ελληνικά)" },
  { value: "et", label: "Estonian (Eesti)" },
  { value: "eu", label: "Basque (Euskara)" },
  { value: "fi", label: "Finnish (Suomi)" },
  { value: "fo", label: "Faroese (Føroyskt)" },
  { value: "gl", label: "Galician (Galego)" },
  { value: "gu", label: "Gujarati (ગુજરાતી)" },
  { value: "ha", label: "Hausa" },
  { value: "haw", label: "Hawaiian (ʻŌlelo Hawaiʻi)" },
  { value: "he", label: "Hebrew (עברית)" },
  { value: "hr", label: "Croatian (Hrvatski)" },
  { value: "ht", label: "Haitian Creole (Kreyòl)" },
  { value: "hu", label: "Hungarian (Magyar)" },
  { value: "hy", label: "Armenian (Հայերեն)" },
  { value: "id", label: "Indonesian (Bahasa Indonesia)" },
  { value: "is", label: "Icelandic (Íslenska)" },
  { value: "ka", label: "Georgian (ქართული)" },
  { value: "kk", label: "Kazakh (Қазақша)" },
  { value: "km", label: "Khmer (ខ្មែរ)" },
  { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { value: "la", label: "Latin (Latina)" },
  { value: "lb", label: "Luxembourgish (Lëtzebuergesch)" },
  { value: "ln", label: "Lingala (Lingála)" },
  { value: "lo", label: "Lao (ລາວ)" },
  { value: "lt", label: "Lithuanian (Lietuvių)" },
  { value: "lv", label: "Latvian (Latviešu)" },
  { value: "mg", label: "Malagasy" },
  { value: "mi", label: "Māori" },
  { value: "mk", label: "Macedonian (Македонски)" },
  { value: "ml", label: "Malayalam (മലയാളം)" },
  { value: "mn", label: "Mongolian (Монгол)" },
  { value: "mr", label: "Marathi (मराठी)" },
  { value: "ms", label: "Malay (Bahasa Melayu)" },
  { value: "mt", label: "Maltese (Malti)" },
  { value: "my", label: "Burmese (မြန်မာ)" },
  { value: "ne", label: "Nepali (नेपाली)" },
  { value: "nn", label: "Nynorsk" },
  { value: "no", label: "Norwegian (Norsk)" },
  { value: "oc", label: "Occitan" },
  { value: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "pl", label: "Polish (Polski)" },
  { value: "ps", label: "Pashto (پښتو)" },
  { value: "ro", label: "Romanian (Română)" },
  { value: "sa", label: "Sanskrit (संस्कृति)" },
  { value: "sd", label: "Sindhi (سنڌي)" },
  { value: "si", label: "Sinhala (සිංහල)" },
  { value: "sk", label: "Slovak (Slovenčina)" },
  { value: "sl", label: "Slovenian (Slovenščina)" },
  { value: "sn", label: "Shona" },
  { value: "so", label: "Somali (Soomaali)" },
  { value: "sq", label: "Albanian (Shqip)" },
  { value: "sr", label: "Serbian (Српски)" },
  { value: "su", label: "Sundanese (Basa Sunda)" },
  { value: "sv", label: "Swedish (Svenska)" },
  { value: "sw", label: "Swahili (Kiswahili)" },
  { value: "ta", label: "Tamil (தமிழ்)" },
  { value: "te", label: "Telugu (తెలుగు)" },
  { value: "tg", label: "Tajik (Тоҷикӣ)" },
  { value: "th", label: "Thai (ไทย)" },
  { value: "tk", label: "Turkmen (Türkmençe)" },
  { value: "tl", label: "Tagalog (Filipino)" },
  { value: "tt", label: "Tatar (Татарча)" },
  { value: "uk", label: "Ukrainian (Українська)" },
  { value: "uz", label: "Uzbek (Oʻzbek)" },
  { value: "vi", label: "Vietnamese (Tiếng Việt)" },
  { value: "yi", label: "Yiddish (ייִדיש)" },
  { value: "yo", label: "Yoruba (Yorùbá)" },
  { value: "yue", label: "Cantonese (廣東話)" },
  { value: "af", label: "Afrikaans" },
];

// ── Subscription plans [PRICES ARE PROPOSED PLACEHOLDERS — TODO: owner to
//    verify against real speech-recognition + translation API costs] ─────
export const PLANS = [
  {
    id: "free", name: "Free",
    monthly: 0, annual: 0,
    minutes: "30", maxLen: "30 min", langs: "All",
    speakers: "Basic", translation: "Limited (1 target language)",
    exports: ["TXT"], editor: "Basic", humanDiscount: "None",
    seats: 1, support: "Community", api: false,
    popular: false,
  },
  {
    id: "starter", name: "Starter",
    monthly: 9, annual: 7.5,
    minutes: "600", maxLen: "2 hours", langs: "All",
    speakers: "Yes", translation: "10 target languages",
    exports: ["TXT", "SRT"], editor: "Full", humanDiscount: "5%",
    seats: 1, support: "Email", api: false,
    popular: false,
  },
  {
    id: "pro", name: "Pro",
    monthly: 24, annual: 20,
    minutes: "2,400", maxLen: "4 hours", langs: "All",
    speakers: "Yes", translation: "All languages",
    exports: ["TXT", "SRT", "DOCX", "PDF"], editor: "Full", humanDiscount: "15%",
    seats: 3, support: "Priority email", api: true,
    popular: true, // "Most Popular"
  },
  {
    id: "business", name: "Business",
    monthly: null, annual: null, // Custom
    minutes: "Custom / high volume", maxLen: "Custom", langs: "All",
    speakers: "Yes", translation: "All languages",
    exports: ["All"], editor: "Full", humanDiscount: "Custom",
    seats: "Unlimited", support: "Dedicated", api: true,
    popular: false,
  },
];

// Subscription rules [PROPOSED — TODO: owner to verify]
export const SUBSCRIPTION_RULES = "Cancel anytime · minutes pooled across seats · monthly minutes reset each cycle.";

// ── Human-verified services [CONFIRMED: human review exists] —
//    [PRICES PROPOSED — TODO: owner to verify per-minute costs] ───────────
export const HUMAN_SERVICES = [
  { name: "Human Transcription Review", price: "$1.00", unit: "per minute", desc: "A human proofreader checks and corrects the AI transcript for higher accuracy." },
  { name: "Human Translation (standard languages)", price: "$4.00", unit: "per minute", desc: "A professional translator reviews or produces the translation." },
  { name: "Human Translation (rare languages)", price: "$8.00", unit: "per minute", desc: "Rare-language translation by a specialized professional translator." },
  { name: "Human-Verified Subtitles", price: "$1.50", unit: "per minute", desc: "Reviewed subtitles ready for publishing." },
];

// Delivery times / accuracy guarantees: fill in ONLY if you can honor them.
// TODO: owner to verify (e.g. "99%+ accuracy, 48 hours or less").
export const DELIVERY_NOTE = null; // e.g. "99%+ accuracy, 48 hours or less"

// ── Pricing FAQ [PROPOSED — TODO: owner to verify answers] ───────────────
export const PRICING_FAQ = [
  { q: "Can I cancel anytime?", a: "Yes — subscriptions can be canceled at any time from your account settings." },
  { q: "Do unused minutes roll over?", a: "Unused minutes do not roll over; your monthly allowance resets at the start of each cycle." },
  { q: "Which languages are supported?", a: "All world languages for transcription. Translation supports all languages, with the exact range depending on your plan." },
  { q: "How does human review work?", a: "Order human-verified transcription, translation or subtitles per minute as an add-on to any plan. A professional reviewer checks the output and returns the verified version." },
  { q: "How is my data protected?", a: "Files are encrypted in transit and at rest, access is authenticated per account, and your recordings are never used beyond your transcription purpose." },
  { q: "Is there a student discount?", a: "Students and universities can contact us for tailored academic conditions." },
];

// ── Use cases for the home page (each links to its audience page) ────────
export const USE_CASES = [
  { title: "Journalists", aud: "newsrooms", text: "Turn interviews into searchable, quotable text with exact timestamps — every quote verifiable." },
  { title: "Students & researchers", aud: "researchers", text: "Transcribe field interviews and lectures, then code and translate them for your thesis." },
  { title: "Podcasters", aud: "creators", text: "Episodes become show notes, articles and subtitles from one transcript." },
  { title: "Video creators", aud: "video", text: "Generate SRT subtitles in the original or translated language, ready for publishing." },
  { title: "Businesses", aud: "businesses", text: "Keep meeting minutes and multilingual calls organized, searchable and shared." },
  { title: "Translators", aud: "consulting", text: "Start from a precise AI draft and deliver professional translations faster." },
];

// ── Human Reviewers page [PLANNED — TODO: owner to verify everything] ────
export const REVIEWERS = {
  steps: [
    ["Selection", "TODO: how you choose reviewers and test their language skills — publish only what is true."],
    ["Confidentiality", "TODO: agreements and access limits for every reviewer in the network."],
    ["Quality checks", "TODO: how verified work is sampled and checked before delivery."],
  ],
  notice: "This page goes live only when the reviewer program is real — keep the TODO comments until then.",
};

export const CONTACT_INFO = {
  email: BRAND.email,
  hours: null, // TODO: owner to verify — support hours
};

// ── Navigation — REFINED BLUEPRINT ────────────────────────────────────────
// Every item carries status: "exists" (real, live feature) | "planned"
// (Planned badge) | "proposed" (idea — TODO: owner to verify).
// Item routing: slug → feature page (feat:) · svc → service page (svc:)
//              · page → direct page string.
export const NAV_MENUS = [
  {
    label: "Product",
    widths: "2fr 1fr 0.9fr",
    columns: [
      {
        title: "AI platform", subCols: 2,
        items: [
          { icon: "🎙️", label: "AI Transcription", desc: "Timestamped text from audio and video", status: "exists", slug: "ai-transcription" },
          { icon: "🧑‍🤝‍🧑", label: "Speaker Detection", desc: "Who said what, and when", status: "exists", slug: "speaker-detection" },
          { icon: "✏️", label: "Transcript Editor", desc: "Fix text word by word", status: "exists", slug: "editor" },
          { icon: "💬", label: "Aud AI Chat", desc: "Ask questions, get cited answers", status: "exists", badge: "New", slug: "ask" },
          { icon: "⭐", label: "Key Moments", desc: "AI finds what matters", status: "exists", slug: "key-moments" },
          { icon: "🌍", label: "AI Translation", desc: "Translate, keep the original", status: "exists", slug: "translation" },
          { icon: "📤", label: "Export Center", desc: "TXT, SRT, DOCX, PDF", status: "exists", slug: "share" },
          { icon: "🔗", label: "Link Transcription", desc: "From a YouTube or media link", status: "exists", slug: "link-import" },
          { icon: "🗂️", label: "Files and Folders", desc: "Everything in one place", status: "exists", slug: "files-folders" },
        ],
      },
      {
        title: "Human-verified",
        items: [
          { icon: "🧑‍💼", label: "Human Transcription", desc: "A person verifies the text", status: "planned", badge: "Planned", svc: "human-transcription" },
          { icon: "🌐", label: "Human Translation", desc: "Reviewed by a translator", status: "planned", badge: "Planned", svc: "global-subtitles" },
          { icon: "🎬", label: "Verified Subtitles", desc: "Ready to publish", status: "planned", badge: "Planned", svc: "human-captions" },
        ],
      },
      {
        title: "Developers",
        items: [
          { icon: "⚙️", label: "API and Docs", desc: "Developer site and documentation", status: "proposed", page: "info:api" }, // TODO: owner to verify — remove if no API
          { icon: "📜", label: "Changelog", desc: "Product updates", status: "exists", page: "changelog" },
        ],
      },
    ],
    promo: {
      video: "/videos/feat-multilang.mp4", poster: "/videos/feat-multilang.jpg",
      kicker: "TRANSLATE", title: "Translate into 99 languages",
      text: "One click turns your finished transcript into another language — speakers and timestamps stay intact.",
      cta: "Try translation free",
    },
    stats: [["98%+", "accuracy"], ["<3 min", "per hour"], ["99", "languages"], ["$0", "free plan"]],
  },
  {
    label: "Features",
    widths: "1.3fr 1fr",
    columns: [
      {
        title: "Core features",
        grid2x2: [
          { title: "Transcribe", items: [
            { label: "Timestamped text", status: "exists", slug: "ai-transcription" },
            { label: "Speaker detection", status: "exists", slug: "speaker-detection" },
            { label: "Language auto-detect", status: "exists", slug: "multi-language" },
            { label: "Large files", status: "exists", slug: "ai-transcription" },
          ]},
          { title: "Translate", items: [
            { label: "AI translation", status: "exists", slug: "translation" },
            { label: "Original kept intact", status: "exists", slug: "translation" },
            { label: "Multiple languages", status: "exists", slug: "multi-language" },
            { label: "Human translation", status: "planned", badge: "Planned", page: "human" },
          ]},
          { title: "Edit and export", items: [
            { label: "Word-level editor", status: "exists", slug: "editor" },
            { label: "Auto-save", status: "exists", slug: "editor" },
            { label: "Share transcript", status: "exists", slug: "share" },
            { label: "TXT, SRT, DOCX, PDF", status: "exists", slug: "share" },
          ]},
          { title: "Organize", items: [
            { label: "Folders", status: "exists", slug: "files-folders" },
            { label: "Sessions archive", status: "exists", slug: "share" },
            { label: "Search", status: "exists", slug: "share" },
            { label: "Bulk upload", status: "proposed", slug: "share" }, // TODO: owner to verify
          ]},
        ],
      },
      {
        title: "Who it's for",
        items: [
          { icon: "💼", label: "Businesses", desc: "Meetings you can search", status: "exists", page: "aud:businesses" },
          { icon: "🎙️", label: "Creators & podcasters", desc: "Show notes and subtitles", status: "exists", page: "aud:creators" },
          { icon: "🔬", label: "Researchers", desc: "Analyze long recordings", status: "exists", page: "aud:researchers" },
        ],
        also: { title: "Also serving", items: [
          { label: "Journalists & newsrooms", desc: "Verify quotes fast", status: "exists", page: "aud:newsrooms" },
          { label: "Education", desc: "Lectures as study material", status: "exists", page: "aud:education" },
          { label: "Video accessibility", desc: "Subtitles for libraries", status: "exists", page: "aud:video" },
          { label: "Research & consulting", desc: "Discovery interviews, structured", status: "exists", page: "aud:consulting" },
        ]},
      },
    ],
    promo: {
      video: "/videos/feat-team.mp4", poster: "/videos/feat-team.jpg",
      kicker: "WHO IT'S FOR", title: "Built for people who talk for a living",
      text: "Journalists, researchers, teams and creators — Aud speaks your language.",
      cta: "Find your workflow",
    },
    stats: [["99", "languages"], ["12", "speakers"], ["7", "audiences"], ["$0", "free plan"]],
  },
  {
    label: "Resources",
    widths: "1fr",
    columns: [
      { title: "Resources", cols3: true, items: [
        { icon: "📝", label: "Blog", desc: "Insights on transcription, translation and AI workflows.", status: "exists", page: "res:blog" },
        { icon: "🆘", label: "Help Center", desc: "Answers and how-tos.", status: "exists", page: "info:help" },
        { icon: "🎓", label: "Tutorials", desc: "Step-by-step guides.", status: "exists", page: "res:tutorials" },
        { icon: "🧩", label: "Use Cases", desc: "How teams use Aud.", status: "exists", page: "res:usecases" },
        { icon: "🌍", label: "Supported Languages", desc: "Searchable full list.", status: "exists", page: "languages" },
        { icon: "📜", label: "Changelog", desc: "What we shipped.", status: "exists", badge: "New", page: "changelog" },
        { icon: "✉️", label: "Contact Support", desc: "Email or form.", status: "exists", page: "contact" },
      ]},
    ],
    promo: {
      video: "/videos/feat-ask.mp4", poster: "/videos/feat-ask.jpg",
      kicker: "RESOURCES", title: "Master every feature",
      text: "Guides, articles and videos that turn first-time users into power users.",
      cta: "Explore resources",
    },
    stats: [["7", "hubs"], ["24/7", "available"], ["EN/FR/AR", "guides"], ["Free", "always"]],
  },
  {
    label: "About",
    widths: "1fr",
    columns: [
      { title: "About Aud", cols3: true, items: [
        { icon: "🏛️", label: "Company", desc: "Our mission and approach.", status: "exists", page: "about" },
        { icon: "🛡️", label: "Security and Privacy", desc: "How we protect your files.", status: "exists", page: "info:security" },
        { icon: "🧑‍💼", label: "Our Human Reviewers", desc: "How reviewers are vetted.", status: "planned", badge: "Planned", page: "reviewers" },
        { icon: "✉️", label: "Contact", desc: "Email and form.", status: "exists", page: "contact" },
        { icon: "🚀", label: "Careers", desc: "Join the team.", status: "exists", page: "careers" },
        { icon: "⚖️", label: "Terms and Privacy", desc: "The legal pages.", status: "exists", page: "legal" },
      ]},
    ],
    promo: {
      video: "/videos/hero-woman.mp4", poster: "/videos/hero-woman.jpg",
      kicker: "OUR MISSION", title: "Every voice deserves to be heard",
      text: "North-African roots, world-class speech AI.",
      cta: "Read our story",
    },
    stats: [["4", "disciplines"], ["24/7", "support"], ["100%", "private"], ["$0", "free plan"]],
  },
  {
    // Pricing — direct nav item, no dropdown (per blueprint).
    label: "Pricing", id: "tarifs", page: "pricing",
  },
];

// Pricing has no dropdown — direct link (per blueprint rule 1).


// ═══════════════════════════════════════════════════════════════════════
//  SERVICE PAGES — every Product mega-menu item gets one of these.
//  Placeholders marked TODO: owner to verify (screenshots, numbers).
// ═══════════════════════════════════════════════════════════════════════
export const SERVICE_PAGES = {
  "multi-file": {
    kicker: "Multi-File Analysis", title: "Analyze Every File Together",
    badge: null,
    lead: "Upload several audio, video and document files into one workspace — every answer, summary and citation tells you the exact source file it came from.",
    video: "/videos/feat-editor.mp4", poster: "/videos/feat-editor.jpg",
    steps: [
      ["Add your files", "Drag in multiple recordings and documents — they join one shared workspace."],
      ["Ask across all of them", "Questions, summaries and searches run over every file at once."],
      ["Citations included", "Each finding points to the exact file and timestamp it came from."],
    ],
    keyFeatures: ["Cross-file search", "Combined summaries", "Per-file citations", "Shared speaker labels", "Bulk export", "Workspace folders"],
    details: { accuracy: "Word-level timestamps", turnaround: "Minutes per file", languages: "99 languages", formats: "MP3, WAV, M4A, MP4, PDF, DOCX", integrations: "Google Drive, ZIP upload", options: "Verbatim · timestamps · speaker labels" },
    faq: [
      { q: "How many files can I analyze together?", a: "Several files share one workspace — add as many as your plan allows and query them together." },
      { q: "Do citations show the source file?", a: "Yes — every answer and summary line cites the exact file and timestamp." },
    ],
  },
  "document-editor": {
    kicker: "Document Editor", title: "Draft Documents With Citations Kept",
    badge: "Beta",
    lead: "Draft and edit case documents inside the studio — every citation stays linked to its source, and the finished document exports to Word or PDF.",
    video: "/videos/feat-editor.mp4", poster: "/videos/feat-editor.jpg",
    steps: [
      ["Start from a transcript", "Pull verified text straight from your transcriptions."],
      ["Draft and cite", "Write with citations kept — every quote knows its source."],
      ["Export", "Word (.docx) or PDF, formatting preserved."],
    ],
    keyFeatures: ["Citation-aware drafting", "Word & PDF export", "Inline editing", "Speaker labels kept", "Version history", "Templates"],
    details: { accuracy: "Citations verified against audio", turnaround: "Instant", languages: "99 languages", formats: "DOCX, PDF", integrations: "Transcript library", options: "Templates · verbatim · timestamps" },
    faq: [
      { q: "Do citations survive the export?", a: "Yes — exported Word and PDF documents keep the citation references." },
    ],
  },
  "image-analysis": {
    kicker: "Image Analysis", title: "Ask Questions About Your Images",
    badge: "New",
    lead: "Upload an image, ask questions about it, and get answers linked to the source file — photos, scans and screenshots join your text workflow.",
    video: "/videos/feat-linkimport.mp4", poster: "/videos/feat-linkimport.jpg",
    steps: [
      ["Upload the image", "Photos, scans and screenshots join the same workspace as your transcripts."],
      ["Ask questions", "The AI describes, reads and explains what is in the image."],
      ["Answers cite the source", "Every answer links back to the image file it came from."],
    ],
    keyFeatures: ["Visual question answering", "Text extraction from images", "Source-linked answers", "Same workspace as transcripts", "Export with citations", "Multi-image projects"],
    details: { accuracy: "Answers cite the source image", turnaround: "Instant", languages: "99 languages", formats: "JPG, PNG", integrations: "Shared workspace", options: "Multi-image projects" },
    faq: [
      { q: "What image formats work?", a: "JPG and PNG — upload them alongside your audio and video files." },
    ],
  },
  "clipping": {
    kicker: "Transcript Editor & Clipping", title: "Edit Text, Mark Moments, Clip",
    badge: null,
    lead: "Edit transcripts word by word, mark the key moments, and clip the recording to the second — the edit and the audio never drift apart.",
    video: "/videos/hero-woman.mp4", poster: "/videos/hero-woman.jpg",
    steps: [
      ["Edit inline", "Click between words and type — corrections sync to the timestamp."],
      ["Mark key moments", "Flag the lines that matter for fast review later."],
      ["Clip to the second", "Cut the exact span you need, guided by the transcript."],
    ],
    keyFeatures: ["Word-accurate playback", "Moment marking", "Second-precision clipping", "Split and merge paragraphs", "Instant search", "Autosave"],
    details: { accuracy: "Word-level sync", turnaround: "Instant", languages: "99 languages", formats: "Clip export with the transcript", integrations: "Share links", options: "Moment flags · timestamps" },
    faq: [
      { q: "Can I clip without editing first?", a: "Yes — mark moments directly on the raw transcript and clip from there." },
    ],
  },
  "ai-templates": {
    kicker: "AI Templates", title: "Prebuilt Workflows, One Click",
    badge: null,
    lead: "Prebuilt AI workflows for the documents you write most: chronologies, summaries, key-file overviews and more — applied to your transcripts in one click.",
    video: "/videos/feat-summary.mp4", poster: "/videos/feat-summary.jpg",
    steps: [
      ["Pick a template", "Chronology, summary, key-file overview — built by the workflow, not improvised."],
      ["Apply to your files", "The template runs across one transcript or a whole workspace."],
      ["Edit the output", "The result lands in the editor — refine and export."],
    ],
    keyFeatures: ["Chronology template", "Summary template", "Key-file overview", "Reusable across projects", "Editable output", "More templates coming"],
    details: { accuracy: "Grounded in your transcripts", turnaround: "Instant", languages: "99 languages", formats: "Editor output · export", integrations: "Transcript library", options: "Custom prompts coming" },
    faq: [
      { q: "Can I make my own template?", a: "Custom templates are on the roadmap — today the prebuilt set covers the most common documents." },
    ],
  },
  "mobile-app": {
    kicker: "Mobile App", title: "The Studio, In Your Pocket",
    badge: null,
    lead: "Record, review and analyze on iOS and Android — recordings sync to your account the moment you stop talking.",
    video: "/videos/feat-linkimport.mp4", poster: "/videos/feat-linkimport.jpg",
    steps: [
      ["Record on the go", "Lectures, interviews and meetings — captured in the app."],
      ["Instant sync", "The recording reaches your account the moment you stop."],
      ["Review anywhere", "Read and correct the transcript from your phone."],
    ],
    keyFeatures: ["One-tap recording", "Instant account sync", "Mobile transcript review", "Share from the phone", "Background uploading", "iOS & Android"],
    details: { accuracy: "Same engine as the web app", turnaround: "Minutes", languages: "99 languages", formats: "In-app playback", integrations: "Your Aud account", options: "Auto-upload on Wi-Fi" },
    faq: [
      { q: "Do recordings upload on mobile data?", a: "You choose — auto-upload on Wi-Fi only, or upload immediately on any connection." },
    ],
  },
  "notetaker": {
    kicker: "AI Notetaker", title: "It Joins The Meeting For You",
    badge: "New",
    lead: "The AI Notetaker joins your Google Meet, Zoom, Teams and WebEx meetings and produces a searchable, speaker-labeled transcript.",
    video: "/videos/feat-summary.mp4", poster: "/videos/feat-summary.jpg",
    steps: [
      ["Invite the notetaker", "Add it to your meeting like a participant."],
      ["Meet as usual", "Talk — the notetaker listens and transcribes."],
      ["Search the meeting", "A speaker-labeled transcript lands in your account."],
    ],
    keyFeatures: ["Google Meet", "Zoom", "Microsoft Teams", "WebEx", "Speaker-labeled output", "Searchable archive"],
    details: { accuracy: "Same transcription engine", turnaround: "Minutes after the call", languages: "99 languages", formats: "Transcript + export", integrations: "Meet · Zoom · Teams · WebEx", options: "Calendar sync coming" },
    faq: [
      { q: "Which meeting apps work?", a: "Google Meet, Zoom, Microsoft Teams and WebEx today." },
    ],
  },
  "file-organization": {
    kicker: "File Organization", title: "Everything In Its Place",
    badge: null,
    lead: "Google Drive sync, ZIP upload, bulk download and color tags — keep a growing archive organized like a professional library.",
    video: "/videos/hero-woman.jpg", poster: "/videos/hero-woman.jpg",
    steps: [
      ["Organize", "Folders, custom names and color tags per project."],
      ["Sync and bulk", "Google Drive sync, ZIP upload and bulk download."],
      ["Find anything", "Search inside every transcript in the archive."],
    ],
    keyFeatures: ["Google Drive sync", "ZIP upload", "Bulk download", "Color tags", "Folders & custom names", "Full-archive search"],
    details: { accuracy: "—", turnaround: "Instant", languages: "—", formats: "ZIP, Drive", integrations: "Google Drive", options: "Color tags · bulk actions" },
    faq: [
      { q: "Does Drive sync work both ways?", a: "Files you place in the synced folder appear in your studio archive." },
    ],
  },
  "human-transcription": {
    kicker: "Human Transcription", title: "A Human Verifies Every Word",
    badge: null,
    lead: "A professional transcriptionist reviews and corrects the AI transcript — higher accuracy for the work that cannot afford doubt.",
    video: "/videos/hero-woman.mp4", poster: "/videos/hero-woman.jpg",
    steps: [
      ["Order from the studio", "Pick the file and the options — verbatim, timestamps, rush."],
      ["A specialist verifies", "A human transcriptionist checks every word against the audio."],
      ["Verified delivery", "The corrected transcript returns to your account, marked verified."],
    ],
    keyFeatures: ["Human-verified accuracy", "Verbatim option", "Timestamp option", "Rush delivery", "Interactive editor after delivery", "Confidential by agreement"],
    details: { accuracy: "PLACEHOLDER — owner to verify", turnaround: "PLACEHOLDER — owner to verify", languages: "PLACEHOLDER", formats: "DOCX, PDF, TXT, SRT", integrations: "Studio account", options: "Verbatim · timestamps · rush" },
    faq: [
      { q: "How is the price calculated?", a: "Per minute of audio — see the human-verified services price list on the pricing page." },
    ],
  },
  "human-captions": {
    kicker: "Human Captions", title: "Captions Reviewed By Professionals",
    badge: null,
    lead: "Human-reviewed captions for your videos — compliant with accessibility rules, ready for YouTube, Vimeo, Dropbox and Google Drive.",
    video: "/videos/feat-share.mp4", poster: "/videos/feat-share.jpg",
    steps: [
      ["Send the video", "Upload or link the video that needs captions."],
      ["Reviewed captions", "A professional writes and checks the caption track."],
      ["Publish anywhere", "SRT files work with YouTube, Vimeo, Dropbox and Drive."],
    ],
    keyFeatures: ["Accessibility compliant", "YouTube integration", "Vimeo integration", "Dropbox & Google Drive", "Precise timecodes", "Original or translated"],
    details: { accuracy: "Human-verified", turnaround: "PLACEHOLDER — owner to verify", languages: "Original or translated", formats: "SRT, VTT", integrations: "YouTube · Vimeo · Dropbox · Drive", options: "Rush available" },
    faq: [
      { q: "Which platforms accept the files?", a: "The SRT/VTT files drop straight into YouTube, Vimeo and any editor." },
    ],
  },
  "global-subtitles": {
    kicker: "Global Subtitles", title: "Subtitles In Every Language",
    badge: null,
    lead: "Human translation of your subtitles into many languages by fluent speakers — the source-language captions are included free.",
    video: "/videos/hero-man.mp4", poster: "/videos/hero-man.jpg",
    steps: [
      ["Start from the captions", "The source-language caption track is included at no cost."],
      ["Pick the languages", "Fluent speakers translate each track."],
      ["Publish globally", "Verified subtitle files for every platform."],
    ],
    keyFeatures: ["Fluent-speaker translation", "99%+ accuracy target", "Source captions included", "Multi-language bundles", "Platform-ready files", "Confidential handling"],
    details: { accuracy: "PLACEHOLDER — owner to verify", turnaround: "PLACEHOLDER — owner to verify", languages: "Many — contact for rare languages", formats: "SRT, VTT", integrations: "YouTube · Vimeo", options: "Bundle discounts" },
    faq: [
      { q: "Is the source-language track really free?", a: "Yes — the original-language captions are included with the translation order." },
    ],
  },
};

// ── AUDIENCE PAGES (Features → Who It's For) ─────────────────────────────
export const AUDIENCE_PAGES = {
  businesses: {
    kicker: "For Businesses", title: "Meetings That Write Their Own Minutes",
    problem: "Your teams spend hours in meetings, then more hours writing down what was decided. The decisions get lost, the actions slip, and nobody can find the moment it was said.",
    video: "/videos/feat-team.mp4", poster: "/videos/feat-team.jpg",
    help: [
      ["Meeting transcriptions", "Every call and meeting becomes searchable, speaker-labeled text."],
      ["AI summaries", "Key points and actions generated automatically after each meeting."],
      ["Translated for global teams", "Share minutes in every language your offices speak."],
      ["Organized archive", "Folders, search and share links for the whole company."],
    ],
    recommended: ["multi-file" , "notetaker", "summary"],
    story: { quote: "PLACEHOLDER — owner to add a real customer story.", source: "Customer story — TODO: owner to verify" },
    faq: [
      { q: "Can it handle multi-speaker meetings?", a: "Yes — up to 12 speakers with automatic turn separation and custom labels." },
      { q: "How do teams share transcripts?", a: "Read-only share links, folders and export to Word or PDF." },
    ],
  },
  creators: {
    kicker: "For Creators & Podcasters", title: "One Recording, Every Format",
    problem: "You record great episodes — then spend a day writing show notes, subtitles and articles from them. The content is already spoken; it should already be written.",
    video: "/videos/hero-woman.mp4", poster: "/videos/hero-woman.jpg",
    help: [
      ["Episode transcripts", "The full episode becomes text in minutes, word-accurate."],
      ["Subtitles ready to publish", "SRT files with precise timecodes for every platform."],
      ["Articles from episodes", "Turn the transcript into written content without retyping."],
      ["Clips with timestamps", "Mark the key moments and clip them to the second."],
    ],
    recommended: ["share", "clipping", "translation"],
    story: { quote: "PLACEHOLDER — owner to add a real customer story.", source: "Customer story — TODO: owner to verify" },
    faq: [
      { q: "Do subtitles work on YouTube?", a: "The SRT files drop straight into YouTube, Vimeo and any editor." },
    ],
  },
  researchers: {
    kicker: "For Researchers", title: "Interviews, Coded In Minutes",
    problem: "Qualitative research lives and dies by interviews — and by the weeks spent transcribing them by hand before the analysis can even start.",
    video: "/videos/feat-multilang.mp4", poster: "/videos/feat-multilang.jpg",
    help: [
      ["Field interviews transcribed", "Hours of recordings become word-accurate text the same day."],
      ["Dialect-aware models", "Local dialects and code-switching understood, not mangled."],
      ["Code in the editor", "Mark, split and label passages while listening."],
      ["Translate for publication", "Turn interviews into the language your paper needs."],
    ],
    recommended: ["multi-file", "editor", "translation"],
    story: { quote: "PLACEHOLDER — owner to add a real customer story.", source: "Customer story — TODO: owner to verify" },
    faq: [
      { q: "Does it understand dialects?", a: "The models are tuned on Maghrebi and Levantine speech alongside Modern Standard Arabic." },
    ],
  },
  consulting: {
    kicker: "Also Serving", title: "Research & Consulting",
    problem: "Consultants run discovery after discovery — and every engagement needs the interviews written down, organized and cited.",
    video: "/videos/feat-team.mp4", poster: "/videos/feat-team.jpg",
    help: [
      ["Discovery interviews transcribed", "Stakeholder calls become structured, searchable text."],
      ["Cross-project workspace", "Every engagement in its own folders, cited and organized."],
      ["Summaries for deliverables", "Findings drafted automatically, refined by you."],
      ["Secure handling", "Encrypted storage and confidential processing."],
    ],
    recommended: ["multi-file", "summary", "share"],
    story: { quote: "PLACEHOLDER — owner to add a real customer story.", source: "Customer story — TODO: owner to verify" },
    faq: [
      { q: "Can I keep engagements separate?", a: "Yes — folders, custom names and color tags keep every project isolated." },
    ],
  },
  newsrooms: {
    kicker: "Also Serving", title: "Newsrooms & Journalists",
    problem: "Broadcast interviews, press conferences and field recordings pile up faster than any desk can transcribe them — and every quote must be verified to the second.",
    video: "/videos/feat-linkimport.mp4", poster: "/videos/feat-linkimport.jpg",
    help: [
      ["Broadcast files transcribed", "Paste the link or upload the file — text in minutes."],
      ["Every quote verified", "Clickable timestamps prove exactly what was said."],
      ["Translate for international desks", "One interview, every language your outlet publishes."],
      ["Clip the soundbite", "Mark the moment and cut it to the second."],
    ],
    recommended: ["link-import", "clipping", "translation"],
    story: { quote: "PLACEHOLDER — owner to add a real customer story.", source: "Customer story — TODO: owner to verify" },
    faq: [
      { q: "Can I import from a URL?", a: "Yes — YouTube and direct media links are fetched into your account automatically." },
    ],
  },
  education: {
    kicker: "Also Serving", title: "Education",
    problem: "Lectures, seminars and student interviews pile up — and accessibility rules keep growing. Every spoken word needs a written record.",
    video: "/videos/feat-team.mp4", poster: "/videos/feat-team.jpg",
    help: [
      ["Lectures transcribed", "Every lecture becomes readable, searchable study material."],
      ["Accessible by default", "Transcripts and captions support accessibility requirements."],
      ["Student research support", "Interview coding and translation for theses and papers."],
      ["Organized per course", "Folders and share links for every class."],
    ],
    recommended: ["multi-language", "share", "translation"],
    story: { quote: "PLACEHOLDER — owner to add a real customer story.", source: "Customer story — TODO: owner to verify" },
    faq: [
      { q: "Can students share transcripts?", a: "Yes — read-only share links work for classmates and supervisors." },
    ],
  },
  video: {
    kicker: "Also Serving", title: "Video Distribution & Accessibility",
    problem: "Your video library needs subtitles in every language and accessibility compliance — and the backlog grows with every upload.",
    video: "/videos/feat-share.mp4", poster: "/videos/feat-share.jpg",
    help: [
      ["Subtitles from audio", "SRT files with precise timecodes, generated in minutes."],
      ["Human-verified options", "Reviewed captions for compliance-critical content."],
      ["Translated tracks", "One video, subtitle files in many languages."],
      ["Bulk pipeline", "ZIP upload and bulk export for whole libraries."],
    ],
    recommended: ["share", "human-captions", "translation"],
    story: { quote: "PLACEHOLDER — owner to add a real customer story.", source: "Customer story — TODO: owner to verify" },
    faq: [
      { q: "Do you offer human-reviewed captions?", a: "Yes — see the human-verified services on the pricing page." },
    ],
  },
};

// ── RESOURCE LISTINGS (Resources menu) ───────────────────────────────────
export const RESOURCE_LISTINGS = {
  blog: {
    kicker: "Blog", title: "The Aud Blog",
    lead: "Insights on transcription, translation, AI workflows and accessibility.",
    categories: ["Transcription", "Translation", "AI workflows", "Accessibility"],
    cards: [ // TODO: owner to replace with real articles
      { title: "Why Maghrebi Arabic breaks standard speech models", cat: "Transcription", date: "October 2026" },
      { title: "Code-switching: how bilingual speakers really talk", cat: "AI workflows", date: "October 2026" },
      { title: "SRT subtitles: the format every platform accepts", cat: "Accessibility", date: "September 2026" },
      { title: "From interview to article in three steps", cat: "Transcription", date: "September 2026" },
      { title: "What word-level timestamps actually measure", cat: "AI workflows", date: "September 2026" },
      { title: "Accessibility rules your videos must meet", cat: "Accessibility", date: "August 2026" },
    ],
  },
  guides: {
    kicker: "Reports & Guides", title: "Reports & Guides",
    lead: "Whitepapers and guides to inform how you work with spoken content.",
    categories: ["Guides", "Reports"],
    cards: [ // TODO: owner to replace with real documents
      { title: "The complete guide to research interviews", cat: "Guides", date: "October 2026" },
      { title: "Choosing between AI and human transcription", cat: "Reports", date: "October 2026" },
      { title: "Subtitle formats explained: SRT vs VTT", cat: "Guides", date: "September 2026" },
      { title: "Data privacy in transcription: what to ask", cat: "Reports", date: "September 2026" },
    ],
  },
  tutorials: {
    kicker: "Learning Center", title: "Tutorials & Learning Center",
    lead: "Tutorials on using the platform, grouped by topic — from first upload to advanced workflows.",
    categories: ["Basics", "Editing", "Translation", "Organization"],
    cards: [ // TODO: owner to replace with real tutorials
      { title: "Your first transcription in 60 seconds", cat: "Basics", date: "October 2026" },
      { title: "Renaming speakers and picking colors", cat: "Editing", date: "October 2026" },
      { title: "Creating translated subtitles", cat: "Translation", date: "October 2026" },
      { title: "Folders, tags and the archive", cat: "Organization", date: "October 2026" },
      { title: "Splitting paragraphs the Rev way", cat: "Editing", date: "October 2026" },
      { title: "Importing from YouTube links", cat: "Basics", date: "October 2026" },
    ],
  },
  library: {
    kicker: "Transcript Library", title: "Free Transcript Library",
    lead: "Free example transcripts — search and preview how different recordings come out.",
    categories: ["Interviews", "Meetings", "Lectures", "Podcasts"],
    cards: [ // TODO: owner to replace with real examples
      { title: "Example: two-speaker interview", cat: "Interviews", date: "October 2026" },
      { title: "Example: team meeting with three speakers", cat: "Meetings", date: "October 2026" },
      { title: "Example: lecture with slide references", cat: "Lectures", date: "October 2026" },
      { title: "Example: podcast with intro music", cat: "Podcasts", date: "October 2026" },
    ],
  },
  stories: {
    kicker: "Success Stories", title: "Success Stories",
    lead: "Customer stories — how teams and professionals put Aud to work.", // TODO: owner to verify
    categories: ["Research", "Media", "Business", "Education"],
    cards: [ // TODO: owner to replace with real stories
      { title: "PLACEHOLDER — customer story", cat: "Research", date: "October 2026" },
      { title: "PLACEHOLDER — customer story", cat: "Media", date: "October 2026" },
      { title: "PLACEHOLDER — customer story", cat: "Business", date: "October 2026" },
      { title: "PLACEHOLDER — customer story", cat: "Education", date: "October 2026" },
    ],
  },
  webinars: {
    kicker: "Webinars", title: "Webinars",
    lead: "Live and on-demand sessions with the Aud team and guests.",
    categories: ["Live", "On-demand"],
    cards: [ // TODO: owner to replace with real webinars
      { title: "PLACEHOLDER — upcoming webinar", cat: "Live", date: "Coming soon" },
      { title: "PLACEHOLDER — recorded session", cat: "On-demand", date: "October 2026" },
    ],
  },
  reviews: {
    kicker: "Reviews", title: "Reviews",
    lead: "Ratings and feedback from review sites and app stores.", // TODO: owner to verify — add real review links
    categories: ["Review sites", "App stores"],
    cards: [ // TODO: owner to replace with real reviews
      { title: "PLACEHOLDER — review site rating", cat: "Review sites", date: "—" },
      { title: "PLACEHOLDER — app store rating", cat: "App stores", date: "—" },
    ],
  },
};

// ── TEAM / LEADERSHIP [PROPOSED — TODO: owner to verify names & roles] ───
export const LEADERSHIP = [
  { name: "Hamza Karmi", role: "Founder & CEO", initials: "HK" },
  // TODO: owner to verify — add real team members
  { name: "PLACEHOLDER — AI Engineering", role: "Speech AI Lead", initials: "AI" },
  { name: "PLACEHOLDER — Applied Linguistics", role: "Dialect & Language Lead", initials: "AL" },
  { name: "PLACEHOLDER — Software Architecture", role: "Platform Lead", initials: "SA" },
  { name: "PLACEHOLDER — UX Design", role: "Design Lead", initials: "UX" },
];

export const BOARD = [ // TODO: owner to verify
  { name: "PLACEHOLDER — Advisor", role: "Advisor" },
  { name: "PLACEHOLDER — Advisor", role: "Advisor" },
];

// ── PRESS [PROPOSED — TODO: owner to verify] ─────────────────────────────
export const PRESS = [
  { title: "PLACEHOLDER — press mention", outlet: "Outlet", date: "—" },
  { title: "PLACEHOLDER — press mention", outlet: "Outlet", date: "—" },
];

// ── SECURITY PAGE SECTIONS [values are PLACEHOLDERS — owner to verify] ───
export const SECURITY_SECTIONS = [
  { icon: "🔐", h: "Account security", p: "SSO support, optional multi-factor authentication and domain claiming for organizations. PLACEHOLDER — owner to verify what is enabled today." },
  { icon: "🔒", h: "Encryption", p: "SSL/TLS encryption in transit and AES-256 at rest, with backups. PLACEHOLDER — owner to verify the exact stack." },
  { icon: "🏅", h: "Compliance badges", p: "List only the certifications you actually hold. TODO: owner to verify — remove this card if none yet." },
  { icon: "🛡️", h: "Privacy", p: "Customer data is not sold. Files are not public or searchable. Files are shared only by link or invitation. Data is not used to train external models. TODO: owner to verify each claim." },
  { icon: "👥", h: "Permissions", p: "File-level and workspace-level access controls. TODO: owner to verify the current permission model." },
  { icon: "🧑‍💼", h: "Human reviewers", p: "Identity verification, confidentiality agreements and monitoring for every reviewer in the network. TODO: owner to verify the process." },
  { icon: "🚨", h: "Incident response", p: "A security team is available for incidents. TODO: owner to verify the response process." },
];

export const TRUST_LINE = "PLACEHOLDER — X users and Y organizations trust Aud. TODO: owner to verify.";

// ── LOCATIONS [PROPOSED] ─────────────────────────────────────────────────
export const LOCATIONS = [
  { region: "Algeria & North Africa", note: "Maghrebi dialect support, Arabic and French." },
  { region: "Middle East", note: "Levantine and Gulf dialects, Arabic." },
  { region: "Europe", note: "French, English, Spanish, German and more." },
  { region: "Global", note: "99 languages, remote everything." },
];
