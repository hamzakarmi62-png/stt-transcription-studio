import { useState } from "react";
import audLogo from "../assets/aud-logo.png";
import { Lock, EyeOff, Star, Users, Languages, Sparkles, Chart } from "./Icons.jsx";

// Multi-page landing companions (About / Pricing / Contact) — Rev-style
// rich pages that share the landing's header, footer and cream design.

const PURPLE = "#6415f5";
const CONTACT_EMAIL = "hamzakarmi62@gmail.com";

function PageHero({ kicker, title, sub, children }) {
  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-10 lg:pt-16 pb-12">
      <p className="text-[11px] font-black tracking-[0.18em] text-[#6415f5] uppercase">{kicker}</p>
      <h1 className="mt-3 text-[clamp(34px,3.4vw,54px)] leading-[1.15] font-semibold tracking-[-0.015em] text-[#18123b]">
        {title}
      </h1>
      {sub && <p className="mt-5 text-[17px] leading-[1.65] text-[#4b4763] max-w-[680px]">{sub}</p>}
      {children}
    </section>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div className={`max-w-[1400px] mx-auto px-5 sm:px-8 pb-16`}>
      <div className={`rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm ${className}`}>{children}</div>
    </div>
  );
}

/* ─────────────────────────── ABOUT PAGE ─────────────────────────── */

const BELIEFS = [
  {
    n: "01",
    title: "Speech Is Everywhere",
    text: "Meetings, lectures, interviews, voice notes, calls — the world speaks for hours every day, and almost none of it is written down. People lose ideas they already had.",
  },
  {
    n: "02",
    title: "AI Can Do The Heavy Lifting",
    text: "Transcribing by hand takes 4–6× the audio length. Modern AI turns an hour of talk into text in minutes — so no one should ever do that work by hand again.",
  },
  {
    n: "03",
    title: "Human Judgment Matters",
    text: "AI drafts, humans decide. Every Aud transcript is built to be reviewed and corrected in place — the tool surfaces the words, you keep the meaning.",
  },
  {
    n: "04",
    title: "Privacy Is Non-Negotiable",
    text: "Your recordings are yours. Encrypted storage, authenticated access, no resale, no training on your data — privacy is a feature, not a footnote.",
  },
];

const TIMELINE = [
  { year: "2026", text: "Aud Studio launches — AI transcription, speaker detection and a real-time editor in one place." },
  { year: "2026", text: "99 languages, AI translation, summaries and speaking statistics arrive." },
  { year: "2026", text: "Link import — paste a YouTube URL and get a transcript, no download needed." },
  { year: "Next", text: "Your voice, everywhere — new tools shaped by the people who use Aud daily." },
];

export function AboutPage({ goHome, onStart }) {
  return (
    <div>
      <PageHero
        kicker="About Aud"
        title={<>We Believe Every Voice <span style={{ color: PURPLE }}>Deserves To Be Heard.</span></>}
        sub="Our mission is simple: turn the world's spoken words into text anyone can read, search and keep — so no idea is ever lost to a missing transcript."
      >
        <div className="mt-8 rounded-[26px] overflow-hidden relative h-[300px] sm:h-[380px]">
          <img src="/videos/hero-woman.jpg" alt="Aud Studio" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12101f]/70 via-transparent to-transparent" />
        </div>
      </PageHero>

      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-14 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b]">
          At Aud, We Believe Four Things
        </h2>
        <div className="mt-10 grid sm:grid-cols-2 gap-5 text-start">
          {BELIEFS.map((b) => (
            <div key={b.n} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-7 shadow-sm">
              <p className="text-[13px] font-black text-[#6415f5]">{b.n}.</p>
              <h3 className="mt-2 text-lg font-semibold text-[#18123b]">{b.title}</h3>
              <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
          Aud Was Built To Solve These Problems
        </h2>
        <div className="mt-10 max-w-3xl mx-auto">
          {TIMELINE.map((t, i) => (
            <div key={i} className="flex gap-5 items-start">
              <div className="flex flex-col items-center">
                <span className="w-10 h-10 rounded-full bg-[#6415f5] text-white text-[11px] font-black flex items-center justify-center shrink-0">{t.year}</span>
                {i < TIMELINE.length - 1 && <span className="w-px h-full min-h-[48px] bg-[#18123b]/15 my-1" />}
              </div>
              <p className="pb-8 pt-2 text-sm text-[#4b4763] leading-relaxed">{t.text}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-7 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#18123b]">Built by someone who transcribes too</h3>
              <p className="text-sm text-[#4b4763] mt-1">Aud is built and maintained by Hamza Karmi — founder, engineer and first user.</p>
            </div>
            <span className="w-14 h-14 rounded-2xl border-[1.5px] border-[#18123b]/30 bg-white flex items-center justify-center text-[#18123b] text-sm font-black shrink-0">HK</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button onClick={onStart} className="px-6 py-3 rounded-xl bg-[#6415f5] text-white font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
              Try Aud for free
            </button>
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — About")}`} className="px-6 py-3 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white font-semibold hover:bg-[#6415f5]/[0.06] transition">
              Contact the team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────── PRICING PAGE ─────────────────────────── */

const PLANS = [
  {
    name: "Free", price: "$0", per: "forever",
    tagline: "Everything Aud can do — for everyone.",
    cta: "Try Aud for free",
    features: ["Unlimited AI transcription (audio & video)", "Automatic speaker detection", "99 languages + AI translation", "Smart summaries & speaking statistics", "Real-time editor with version history", "Export TXT · SRT · DOCX · PDF · JSON · XML", "Read-only share links", "Folders & organization"],
  },
  {
    name: "Organizations", price: "Custom", per: "tailored",
    tagline: "For teams, universities and media rooms.",
    cta: "Contact the team",
    features: ["Volume transcription for many seats", "Shared folders & organization at scale", "Priority help getting set up", "Custom guidance from the founder"],
  },
];

const PLATFORM_FEATURES = [
  "AI Transcription (audio & video)", "Speaker Detection", "Multi-language (99 languages)",
  "AI Translation", "Smart Summaries", "Speaking Statistics", "Real-time Editor",
  "Export TXT · SRT · DOCX · PDF · JSON · XML", "Read-only Share Links", "Folders & Organization",
  "Link Import (YouTube & more)", "Privacy-first storage",
];

const PRICING_FAQ = [
  { q: "Is it really free?", a: "Yes — every feature on this page is free, forever. No credit card, no trial timer, no hidden tier." },
  { q: "How does multi-language transcription work?", a: "Pick up to as many languages as you like. Each language gets its own transcription pass, and the best part of every passage is kept — built for recordings that mix languages." },
  { q: "Can I correct the transcript afterwards?", a: "Absolutely — the editor works like a word processor. Click between words to type, split paragraphs, rename speakers, and everything saves automatically." },
  { q: "Who can see my recordings?", a: "Only you. Storage is encrypted, access is authenticated, and share links are read-only until you create them." },
];

export function PricingPage({ goHome, onStart }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div>
      <PageHero
        kicker="Pricing"
        title={<>One Simple Price: <span style={{ color: PURPLE }}>Free</span></>}
        sub="All the features, for everyone, without a credit card. If your organization needs more, we tailor it."
      />

      {/* plans */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-14 grid md:grid-cols-2 gap-5">
        {PLANS.map((plan) => (
          <div key={plan.name} className="rounded-[26px] bg-white border-[1.5px] border-[#6415f5]/40 shadow-xl shadow-[#6415f5]/10 p-8">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-[#18123b]">{plan.name}</h3>
              <div className="text-right">
                <span className="text-4xl font-extrabold tracking-tight text-[#18123b]">{plan.price}</span>
                <span className="block text-[11px] font-semibold text-[#4b4763]">{plan.per}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[#4b4763]">{plan.tagline}</p>
            <ul className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[#18123b]/85">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#6415f5]/[0.08] border border-[#6415f5]/25 text-[#6415f5] flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={plan.name === "Free" ? onStart : undefined}
              className="mt-8 w-full py-3.5 rounded-xl bg-[#6415f5] text-white font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25"
            >
              {plan.cta}
            </button>
            {plan.name !== "Free" && (
              <p className="mt-3 text-center text-[11px] text-[#4b4763]">
                Write to <a className="font-bold text-[#6415f5]" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* comparison table */}
      <SectionCard>
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-[#18123b] mb-6">Compare Our Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start">
                  <th className="text-start py-3 px-4 font-black text-[#18123b]">Platform Features</th>
                  <th className="py-3 px-4 font-black text-[#6415f5]">Free</th>
                  <th className="py-3 px-4 font-black text-[#4b4763]">Organizations</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORM_FEATURES.map((f) => (
                  <tr key={f} className="border-t border-[#18123b]/[0.07]">
                    <td className="py-3 px-4 text-[#4b4763]">{f}</td>
                    <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      {/* subscription FAQ */}
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-3xl font-semibold text-[#18123b] text-center">Subscription FAQ</h2>
        <div className="mt-8 space-y-3">
          {PRICING_FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-4 font-semibold text-[#18123b] text-start"
              >
                {item.q}
                <span className="shrink-0 w-7 h-7 rounded-full border border-[#18123b]/15 flex items-center justify-center text-[#18123b]/60">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <p className="px-6 pb-5 text-sm text-[#4b4763] leading-relaxed">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── CONTACT PAGE ─────────────────────────── */

const COUNTRIES = ["Algeria", "Morocco", "Tunisia", "Mauritania", "France", "Belgium", "Switzerland", "Canada", "United Arab Emirates", "Saudi Arabia", "Other"];

export function ContactPage({ goHome }) {
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", country: "Algeria", employees: "", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${form.first} ${form.last}\nEmail: ${form.email}\nPhone: ${form.phone}\nCountry: ${form.country}\n\n${form.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — Contact request from " + form.first + " " + form.last)}&body=${body}`;
    setSent(true);
  };

  const field = "w-full px-4 py-3 rounded-xl border-[1.5px] border-[#18123b]/15 bg-white text-sm text-[#18123b] focus:outline-none focus:border-[#6415f5] placeholder:text-[#4b4763]/50";
  const label = "block text-xs font-bold text-slate-700 mb-1.5";

  return (
    <div>
      <PageHero
        kicker="Find it. Transcribe it. Keep it."
        title={<>Talk To The <span style={{ color: PURPLE }}>Aud Team</span></>}
        sub="Questions about languages, volumes or your organization? Write to us — the founder reads every message."
      />

      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
        {sent ? (
          <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] p-10 text-center shadow-sm">
            <span className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 flex items-center justify-center text-2xl">✓</span>
            <h3 className="mt-4 text-xl font-bold text-[#18123b]">Your email app just opened</h3>
            <p className="text-sm text-[#4b4763] mt-2">Press send and we will get back to you — usually the same day.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-[26px] bg-white border-[1.5px] border-[#6415f5]/30 shadow-xl shadow-[#6415f5]/10 p-8 grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>First name *</label>
              <input required value={form.first} onChange={set("first")} className={field} placeholder="Hamza" />
            </div>
            <div>
              <label className={label}>Last name *</label>
              <input required value={form.last} onChange={set("last")} className={field} placeholder="Karmi" />
            </div>
            <div>
              <label className={label}>Email *</label>
              <input required type="email" value={form.email} onChange={set("email")} className={field} placeholder="name@example.com" />
            </div>
            <div>
              <label className={label}>Phone</label>
              <input type="tel" value={form.phone} onChange={set("phone")} className={field} placeholder="+213 ..." />
            </div>
            <div>
              <label className={label}>Country</label>
              <select value={form.country} onChange={set("country")} className={`${field} cursor-pointer`}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>I am…</label>
              <select value={form.employees} onChange={set("employees")} className={`${field} cursor-pointer`}>
                <option value="">Choose…</option>
                <option>An individual user</option>
                <option>A small team</option>
                <option>A university / school</option>
                <option>A media organization</option>
                <option>Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Your message *</label>
              <textarea required rows={5} value={form.message} onChange={set("message")} className={field} placeholder="Tell us what you transcribe and what you need…" />
            </div>
            <div className="sm:col-span-2 flex items-start gap-2.5 text-[11px] text-[#4b4763]">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded accent-[#6415f5]" />
              <span>I agree to be contacted about my request. You may unsubscribe at any time.</span>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="w-full py-3.5 rounded-xl bg-[#6415f5] text-white font-bold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
                Talk to the Aud team
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 grid sm:grid-cols-3 gap-4 text-center">
          {[
            [<Lock key="l" className="w-5 h-5" />, "Private by design", "Your words stay yours"],
            [<Sparkles key="s" className="w-5 h-5" />, "AI that cites itself", "Timestamps you can verify"],
            [<Users key="u" className="w-5 h-5" />, "Built for teams", "Universities, media, courts"],
          ].map(([icon, t1, t2], i) => (
            <div key={i} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-5">
              <span className="w-10 h-10 mx-auto rounded-xl bg-[#6415f5]/[0.08] border border-[#6415f5]/20 text-[#6415f5] flex items-center justify-center">{icon}</span>
              <p className="mt-2 font-semibold text-[#18123b] text-sm">{t1}</p>
              <p className="text-xs text-[#4b4763]">{t2}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── FEATURE PAGES (one per feature) ─────────────────── */

export const FEATURES = {
  "ai-transcription": {
    kicker: "AI Transcription",
    title: "From Sound To Text, In Minutes",
    video: "/videos/hero-woman.mp4",
    poster: "/videos/hero-woman.jpg",
    lead: "Upload any audio or video and watch it become a precise, timestamped transcript — Arabic, French, English and 96 more languages.",
    steps: [
      ["Upload or paste a link", "Drop a file, record your microphone, or paste a YouTube URL — Aud handles the rest."],
      ["AI listens and writes", "Whisper-grade speech recognition writes every word with word-level timestamps."],
      ["Review and keep", "Fix anything in the editor, then export or share your transcript forever."],
    ],
    benefits: ["Word-level timestamps you can verify", "Automatic language detection", "Handles hour-long recordings", "Speaker names, colors and turns", "Works on the free plan — forever"],
  },
  "speaker-detection": {
    kicker: "Speaker Detection",
    title: "Know Who Said What, When",
    video: "/videos/feat-speakers.mp4",
    poster: "/videos/feat-speakers.jpg",
    lead: "Aud separates the voices in your recording, labels every line with its speaker, and lets you rename them — even pick their color.",
    steps: [
      ["Voices are separated", "Voice-print clustering tells the speakers apart — no training needed."],
      ["Every line is labeled", "Each paragraph carries the name of the person speaking it."],
      ["You stay in control", "Rename speakers, merge turns, pick any color — the whole transcript follows."],
    ],
    benefits: ["Up to 12 speakers in one file", "Speaker menu with free color choice", "Turn-based paragraphs, Word-style flow", "Diarization tuned for real conversations"],
  },
  "multi-language": {
    kicker: "Multi-language",
    title: "99 Languages. One Studio.",
    video: "/videos/feat-multilang.mp4",
    poster: "/videos/feat-multilang.jpg",
    lead: "From Arabic to Zulu — transcribe in 99 languages, pick several at once for mixed recordings, and translate the result in one click.",
    steps: [
      ["Pick your languages", "One language for precision — or up to as many as you like for mixed recordings."],
      ["Every pass is transcribed", "Each chosen language gets its own full pass through the AI."],
      ["The best parts win", "Aud keeps the most confident segment of every passage — bilingual recordings finally work."],
    ],
    benefits: ["99 supported languages", "Code-switching friendly", "One-click translation afterwards", "Auto-detect when you are unsure"],
  },
  "editor": {
    kicker: "Real-time Editor",
    title: "Fix While You Listen",
    video: "/videos/feat-editor.mp4",
    poster: "/videos/feat-editor.jpg",
    lead: "The editor works like a word processor: click between words, type, split paragraphs — and the audio follows you the whole way.",
    steps: [
      ["Click anywhere to type", "The caret lands exactly where you clicked — even mid-word."],
      ["Enter splits with its own time", "Everything after the caret becomes a new paragraph with its own timestamp."],
      ["Everything saves itself", "No save button — your corrections are stored as you type."],
    ],
    benefits: ["Word-accurate click-to-seek", "Merge, split and reorder paragraphs", "Undo history always available", "Speaker renames apply everywhere"],
  },
  "translation": {
    kicker: "AI Translation",
    title: "Your Transcript, Any Language",
    video: "/videos/hero-man.mp4",
    poster: "/videos/hero-man.jpg",
    lead: "One click turns your transcript into Arabic, English, French and more — line by line, keeping the speaker labels and timestamps.",
    steps: [
      ["Finish your transcript", "Correct it until it is exactly right."],
      ["Choose a language", "The AI translation panel rewrites every segment."],
      ["Compare side by side", "The original stays intact — switch back at any moment."],
    ],
    benefits: ["Speaker labels preserved", "Timestamps kept intact", "Switch between original and translation instantly", "Works after diarization too"],
  },
  "summary": {
    kicker: "Smart Summary",
    title: "Key Points, Auto-Generated",
    video: "/videos/feat-summary.mp4",
    poster: "/videos/feat-summary.jpg",
    lead: "The AI reads your whole transcript and writes a clean summary: the key points first, then the actions that follow.",
    steps: [
      ["One click", "No prompts to write — Aud reads the transcript and summarizes it."],
      ["Structured output", "Key points, then decisions and actions — ready to share."],
      ["Download it", "Take the summary with you as a .txt file."],
    ],
    benefits: ["Grounded in your transcript", "Structured: points, then actions", "Regenerate any time", "Free — like everything in Aud"],
  },
  "ask": {
    kicker: "Ask Your Transcript",
    title: "Ask. Get Answers With Timestamps.",
    video: "/videos/feat-ask.mp4",
    poster: "/videos/feat-ask.jpg",
    lead: "Type a question about your recording — Aud answers from its content and cites the exact moments it drew from.",
    steps: [
      ["Ask in your own words", "No special syntax — the AI understands natural questions."],
      ["Answers with citations", "Every answer carries clickable timestamps into the audio."],
      ["Verify in one click", "Play the cited moment and confirm with your own ears."],
    ],
    benefits: ["Answers grounded in the transcript", "Clickable timestamp citations", "Works in every language", "Unlimited questions"],
  },
  "statistics": {
    kicker: "Speaking Statistics",
    title: "Time, Pace, Participation",
    video: "/videos/feat-stats.mp4",
    poster: "/videos/feat-stats.mp4.jpg".replace(".mp4.jpg", ".mp4"),
    lead: "See how long each speaker talked, how fast, and who dominated the room — one glance after every transcription.",
    steps: [
      ["Transcribe as usual", "The statistics build themselves from the words and speakers."],
      ["See the balance", "Talking time per speaker, pace and participation at a glance."],
      ["Spot what matters", "Who is missing from the conversation — and who never stops."],
    ],
    benefits: ["Per-speaker talking time", "Words and pace per speaker", "Great for meetings and interviews", "Free with every transcript"],
  },
  "link-import": {
    kicker: "Link Import",
    title: "Paste A Link. Get A Transcript.",
    video: "/videos/feat-linkimport.mp4",
    poster: "/videos/feat-linkimport.jpg",
    lead: "YouTube, direct MP4 or MP3 links — paste the URL and Aud fetches the media itself, then transcribes it like any upload.",
    steps: [
      ["Paste the link", "A YouTube video or a direct media URL — nothing to download on your side."],
      ["Aud fetches the media", "The studio downloads it to your account, even from the cloud."],
      ["The normal pipeline runs", "Transcription, speakers and export — exactly like an uploaded file."],
    ],
    benefits: ["YouTube supported", "Direct MP4 / MP3 links", "Runs in your own account", "No extra tools ever"],
  },
  "share": {
    kicker: "Share & Export",
    title: "Share Links. Export Everything.",
    video: "/videos/feat-share.mp4",
    poster: "/videos/feat-share.jpg",
    lead: "Create a read-only share link with built-in playback — or export your transcript to TXT, SRT, DOCX, PDF, JSON and XML.",
    steps: [
      ["Create a share link", "Read-only, with playback — your audience never touches your account."],
      ["Export in your format", "Six formats for every workflow, with full timestamps."],
      ["Keep it organized", "Folders, custom names and a searchable archive."],
    ],
    benefits: ["Read-only share pages", "Six export formats", "Folders and custom names", "Everything searchable"],
  },
};

export function FeaturePage({ slug, onStart, goFeature }) {
  const f = FEATURES[slug];
  if (!f) return null;
  const others = Object.keys(FEATURES).filter((k) => k !== slug).slice(0, 4);
  return (
    <div>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-10 lg:pt-14 pb-12 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
        <div>
          <p className="text-[11px] font-black tracking-[0.18em] text-[#6415f5] uppercase">{f.kicker}</p>
          <h1 className="mt-3 text-[clamp(32px,3.2vw,52px)] leading-[1.15] font-semibold tracking-[-0.015em] text-[#18123b]">{f.title}</h1>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#4b4763] max-w-[580px]">{f.lead}</p>
          <button onClick={onStart} className="mt-8 inline-flex items-center px-7 py-3.5 rounded-xl bg-[#6415f5] text-white text-[16px] font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
            Try it free
          </button>
        </div>
        <div className="relative rounded-[26px] overflow-hidden shadow-2xl shadow-[#18123b]/25 bg-[#12101f] h-[320px] sm:h-[420px]">
          <video src={f.video} poster={f.poster} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12101f]/40 to-transparent" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-[#18123b]">How it works</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-5">
            {f.steps.map(([t, d], i) => (
              <div key={t} className="relative rounded-2xl border border-[#18123b]/[0.08] p-6">
                <span className="absolute -top-4 left-5 w-9 h-9 rounded-xl bg-[#6415f5] text-white font-extrabold flex items-center justify-center shadow-md">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-[#18123b]">{t}</h3>
                <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <div className="rounded-[26px] bg-[#18123b] p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Why people use it</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {f.benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 text-white/90">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 border border-white/30 text-white flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                <span className="text-sm leading-relaxed">{b}</span>
              </div>
            ))}
          </div>
          <button onClick={onStart} className="mt-8 px-6 py-3 rounded-xl bg-white text-[#18123b] font-semibold hover:bg-slate-100 transition shadow-xl">
            Start transcribing free
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-xl font-semibold text-[#18123b] mb-5">Explore more of Aud</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {others.map((k) => (
            <button key={k} onClick={() => goFeature(k)} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-5 text-start hover:border-[#6415f5]/40 transition shadow-sm group">
              <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{FEATURES[k].kicker}</p>
              <p className="mt-1 font-semibold text-[#18123b] group-hover:text-[#6415f5] transition-colors">{FEATURES[k].title}</p>
              <img src={FEATURES[k].poster} alt="" className="mt-3 w-full h-24 object-cover rounded-xl" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
