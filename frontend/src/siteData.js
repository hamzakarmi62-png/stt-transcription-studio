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

// ── Use cases for the home page ──────────────────────────────────────────
export const USE_CASES = [
  { title: "Journalists", text: "Turn interviews into searchable, quotable text with exact timestamps — every quote verifiable." },
  { title: "Students & researchers", text: "Transcribe field interviews and lectures, then code and translate them for your thesis." },
  { title: "Podcasters", text: "Episodes become show notes, articles and subtitles from one transcript." },
  { title: "Video creators", text: "Generate SRT subtitles in the original or translated language, ready for publishing." },
  { title: "Businesses", text: "Keep meeting minutes and multilingual calls organized, searchable and shared." },
  { title: "Translators", text: "Start from a precise AI draft and deliver professional translations faster." },
];

// ── Navigation [labels CONFIRMED; sub-item grouping per blueprint;
//    some descriptions PROPOSED — TODO: owner to verify] ──────────────────
export const NAV_MENUS = [
  {
    label: "Product",
    groups: [
      {
        title: "AI Services",
        items: [
          { label: "AI Transcription", desc: "Upload audio or video and get a clean, timestamped transcript.", slug: "ai-transcription" },
          { label: "Speaker Detection", desc: "Automatically labels who is speaking.", slug: "speaker-detection" },
          { label: "AI Translation", desc: "Instantly translate transcripts into any world language.", slug: "translation" },
          { label: "Subtitles (SRT)", desc: "Create subtitle files for video, original or translated language.", slug: "share" },
          { label: "Transcript Editor", desc: "Fix text, rename speakers, adjust timestamps.", slug: "editor" }, // [PROPOSED]
          { label: "Export Center", desc: "Download as TXT, SRT, DOCX, or PDF.", slug: "share" },
        ],
      },
      {
        title: "Human-Verified Services",
        items: [
          { label: "Human Transcription Review", desc: "A human proofreader checks and corrects the AI transcript.", page: "human" },
          { label: "Human Translation", desc: "A professional translator reviews or produces the translation.", page: "human" },
          { label: "Human-Verified Subtitles", desc: "Reviewed subtitles ready for publishing.", page: "human" },
        ],
      },
      {
        title: "For Developers",
        items: [
          { label: "API & Documentation", desc: "Bring transcription into your own apps.", page: "info:apps" }, // [PROPOSED — remove if no API]
        ],
      },
    ],
    promo: {
      video: "/videos/feat-multilang.mp4", poster: "/videos/feat-multilang.jpg",
      kicker: "TRANSLATE", title: "Translate into 99 languages",
      text: "One click turns your finished transcript into another language — speakers and timestamps stay intact.",
      cta: "Try translation free",
    },
    stats: [["99", "languages"], ["10", "formats"], ["12", "speakers"], ["$0", "free plan"]],
  },
  {
    label: "Features",
    groups: [
      {
        title: "Transcribe",
        items: [
          { label: "Audio & video upload", desc: "MP3, WAV, M4A, MP4 and more.", target: "produit" }, // [PROPOSED formats]
          { label: "Timestamped text", desc: "Every word locked to the audio.", slug: "ai-transcription" },
          { label: "Speaker detection", desc: "Automatically labeled turns.", slug: "speaker-detection" },
          { label: "All world languages", desc: "Recognition in 99 languages.", slug: "multi-language" },
          { label: "Accents & mixed audio", desc: "Handles accents and code-switching.", page: "info:dialects" }, // [PROPOSED]
        ],
      },
      {
        title: "Translate",
        items: [
          { label: "Instant AI translation", desc: "Full transcripts and subtitles.", slug: "translation" },
          { label: "Human review on request", desc: "Professional translator sign-off.", page: "human" },
          { label: "Side-by-side view", desc: "Original and translated together.", slug: "translation" }, // [PROPOSED]
          { label: "Multi-language output", desc: "One transcript, many languages.", slug: "multi-language" }, // [PROPOSED]
        ],
      },
      {
        title: "Edit & Export",
        items: [
          { label: "In-browser editor", desc: "Fix text while you listen.", slug: "editor" }, // [PROPOSED]
          { label: "Export suite", desc: "TXT, SRT, DOCX, PDF.", slug: "share" },
          { label: "Copy & share", desc: "Read-only links with playback.", slug: "share" }, // [PROPOSED]
        ],
      },
      {
        title: "Organize",
        items: [
          { label: "Project library", desc: "Folders, custom names, search.", slug: "share" }, // [PROPOSED]
          { label: "Bulk upload", desc: "Many files, one queue.", target: "produit" }, // [PROPOSED]
        ],
      },
    ],
    promo: {
      video: "/videos/feat-stats.mp4", poster: "/videos/feat-stats.jpg",
      kicker: "FEATURES", title: "Every tool, one studio",
      text: "From the first word to the final export — all inside Aud.",
      cta: "Explore features",
    },
    stats: [["99", "languages"], ["12", "speakers"], ["6", "formats"], ["$0", "free plan"]],
  },
  {
    label: "Resources",
    groups: [
      {
        title: "Resources",
        items: [
          { label: "Blog", desc: "Tips on transcription, subtitles, translation and accessibility.", page: "info:blog" },
          { label: "Help Center / FAQ", desc: "How to upload, edit, translate and export.", page: "info:help" },
          { label: "Tutorials", desc: "Short guides — e.g. how to create translated subtitles.", page: "info:tutorials" },
          { label: "Use Cases", desc: "Journalists, students, podcasters, researchers, creators, businesses.", page: "info:cases" },
          { label: "Supported Languages", desc: "The full list of 99 languages.", page: "languages" },
          { label: "Pricing Calculator", desc: "Estimate cost from minutes, languages and human review.", page: "calculator" },
          { label: "Changelog", desc: "Product updates.", page: "changelog" }, // [PROPOSED]
          { label: "Contact Support", desc: "Email or form.", page: "contact" },
        ],
      },
    ],
    promo: {
      video: "/videos/feat-ask.mp4", poster: "/videos/feat-ask.jpg",
      kicker: "RESOURCES", title: "Master every feature",
      text: "Guides, articles and videos that turn first-time users into power users.",
      cta: "Explore resources",
    },
    stats: [["8", "resources"], ["24/7", "available"], ["EN/FR/AR", "guides"], ["Free", "always"]],
  },
  {
    label: "About",
    groups: [
      {
        title: "About Aud",
        items: [
          { label: "Company", desc: "Mission and story: make spoken content searchable, readable and understandable in every language.", target: "apropos" },
          { label: "Security and Privacy", desc: "How files are stored, encrypted and deleted — and what is never done with them.", page: "info:security" },
          { label: "Our Human Reviewers", desc: "How reviewers are selected and how confidentiality is protected.", page: "human" }, // [PROPOSED — only if true]
          { label: "Contact", desc: "Email and form.", page: "contact" },
          { label: "Careers", desc: "Join the team behind the studio.", page: "careers" }, // [PROPOSED]
          { label: "Terms and Privacy Policy", desc: "The legal pages.", page: "legal" },
        ],
      },
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
    // Pricing — direct nav item (the pricing PAGE holds the plans, comparison
    // table, human-verified price list and FAQ per the blueprint).
    label: "Pricing", id: "tarifs", page: "pricing",
  },
];

// Pricing has no dropdown — direct link (per blueprint rule 1).
