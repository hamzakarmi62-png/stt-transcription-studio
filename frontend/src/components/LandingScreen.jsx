import { useState } from "react";
import audLogo from "../assets/aud-logo.png";
import {
  Mic, Users, Languages, Sparkles, Chart, Download,
  Lock, EyeOff,
} from "./Icons.jsx";

// Landing rebuilt after rev.com: warm cream background, slim nav with two
// CTAs, oversized two-line headline on the left with trust badges, and a
// dark product-demo card on the right cycling through animated scenes.
const PURPLE = "#6415f5";

const CONTACT_EMAIL = "hamzakarmi62@gmail.com";

const NAV = [
  { label: "Product", id: "produit" },
  { label: "Features", id: "fonctionnalites" },
  { label: "Resources", id: "ressources" },
  { label: "About", id: "apropos" },
  { label: "Pricing", id: "tarifs" },
];

const FAQ = [
  {
    q: "Which file formats are supported?",
    a: "All common formats: MP3, WAV, M4A, FLAC, OGG for audio, and MP4, WEBM, MOV, MKV for video. Audio is extracted from videos automatically.",
  },
  {
    q: "Which languages does Aud transcribe?",
    a: "Arabic, French, English and dozens of other languages, detected automatically. You can then translate the transcript in one click.",
  },
  {
    q: "How do I share a transcript?",
    a: "Every transcript has a read-only share link: whoever opens it sees the text and speakers and can listen — without ever accessing your account.",
  },
  {
    q: "Can I correct the text after transcription?",
    a: "Yes. The editor works like a word processor: click between words to type, Enter splits paragraphs with their own timestamp, and everything is saved automatically.",
  },
];

const PLAN_FEATURES = [
  "Unlimited AI transcription (audio & video)",
  "Automatic speaker detection",
  "Smart translation and summaries",
  "Export to TXT, SRT, Word, PDF, JSON, XML",
  "Read-only share links",
  "Full editor with version history",
];

const FEATURES = [
  { icon: Mic, title: "AI transcription", text: "Audio and video converted to text with remarkable accuracy, in many languages." },
  { icon: Users, title: "Speaker detection", text: "The AI automatically tells speakers apart and labels every line." },
  { icon: Languages, title: "Built-in translation", text: "Translate your transcript to Arabic, French, English and more." },
  { icon: Sparkles, title: "Smart summary", text: "A clear summary of your meetings and interviews, generated automatically." },
  { icon: Chart, title: "Speaking statistics", text: "Talking time, pace and participation for every speaker at a glance." },
  { icon: Download, title: "Multi-format export", text: "TXT, SRT subtitles, Word and PDF — ready to share with your team." },
];

const STEPS = [
  { n: "1", title: "Import your file", text: "MP3, WAV, M4A, MP4… drag and drop, or record straight from your microphone." },
  { n: "2", title: "The AI works", text: "Transcription, speakers and language detected automatically in minutes." },
  { n: "3", title: "Edit and export", text: "Fix the text, name the speakers, then export in your favorite format." },
];

function CursorIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="white" stroke="#18123b" strokeWidth="1.4">
      <path d="M5.5 3.2 19 11.4l-6.2 1.2-2.6 5.9z" />
    </svg>
  );
}

export default function LandingScreen({ onStart }) {
  const [activeNav, setActiveNav] = useState(null);

  const goToSection = (id) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="min-h-screen bg-[#f6f3ed] text-[#18123b] antialiased"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      dir="ltr"
      lang="en"
    >
      <style>{`
        @keyframes demoScene {
          0% {opacity:0; transform:translateY(18px) scale(.985)}
          2.5% {opacity:1; transform:translateY(0) scale(1)}
          22% {opacity:1; transform:translateY(0) scale(1)}
          25% {opacity:0; transform:translateY(-14px) scale(.99)}
          100% {opacity:0}
        }
        .demo-scene {animation: demoScene 16s ease-in-out infinite; opacity:0}
        @keyframes demoFloat {0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .demo-float {animation: demoFloat 5s ease-in-out infinite}
        @keyframes demoType {0%{max-width:0}9%{max-width:0}19%{max-width:100%}23.5%{max-width:100%}25%{max-width:0}100%{max-width:0}}
        .demo-type {display:inline-block; overflow:hidden; white-space:nowrap; vertical-align:bottom; max-width:0; animation: demoType 16s linear infinite; animation-delay:8s}
        @keyframes demoBlink {0%,55%{opacity:1}60%,100%{opacity:0}}
        .demo-caret {animation: demoBlink 1.1s steps(1) infinite}
        @keyframes demoCursor {0%,100%{transform:translate(0,0)}50%{transform:translate(12px,-9px)}}
        .demo-cursor {animation: demoCursor 4s ease-in-out infinite}
        @keyframes demoPulse {0%,100%{opacity:.35}50%{opacity:1}}
        .demo-pulse {animation: demoPulse 1.4s ease-in-out infinite}
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="relative z-20">
        <div className="max-w-[1400px] mx-auto flex items-center gap-8 px-5 sm:px-8 h-[76px]">
          <button onClick={onStart} className="shrink-0" aria-label="Aud — home">
            <img src={audLogo} alt="Aud" className="h-10 w-auto" draggable={false} />
          </button>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => goToSection(item.id)}
                className={`text-[15px] font-medium transition-colors ${
                  activeNav === item.id ? "text-[#6415f5]" : "text-[#18123b]/75 hover:text-[#18123b]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
            <button onClick={onStart} className="hidden sm:block text-[15px] font-medium text-[#18123b]/85 hover:text-[#18123b] transition-colors px-2">
              Sign in
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — Contact request")}`}
              className="hidden md:inline-flex items-center px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white/50 text-[15px] font-semibold hover:bg-white transition"
            >
              Talk to a specialist
            </a>
            <button
              onClick={onStart}
              className="inline-flex items-center px-5 py-2.5 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition shadow-sm"
            >
              Try Aud for free
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="produit" className="relative scroll-mt-4">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-8 lg:pt-14 pb-14 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div>
            <h1 className="text-[clamp(40px,4.4vw,68px)] leading-[1.18] font-medium tracking-[-0.012em] text-[#18123b]">
              Transcribe everything
              <br /> in minutes, not hours
            </h1>

            <p className="mt-9 text-[17px] leading-[1.6] text-[#4b4763] max-w-[580px]">
              The transcription platform built for teams that don't have
              time to re-listen to everything. Transcription, speaker detection,
              translation and summaries for all your recordings. Every word
              verified, so the decision stays yours.
            </p>

            <button
              onClick={onStart}
              className="mt-9 inline-flex items-center px-9 py-4 rounded-xl bg-[#6415f5] text-white text-[17px] font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25"
            >
              Try Aud for free
            </button>

            {/* Trust badges */}
            <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-5">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b]">
                  <Lock className="w-5 h-5" />
                </span>
                <span className="text-[12px] font-semibold leading-[1.35] text-[#18123b]/85">
                  No data sold<br />to third parties
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b]">
                  <EyeOff className="w-5 h-5" />
                </span>
                <span className="text-[12px] font-semibold leading-[1.35] text-[#18123b]/85">
                  Private &amp; encrypted<br />processing
                </span>
              </div>

              <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-[#18123b]/30 flex flex-col items-center justify-center text-center leading-[1.15]">
                <span className="text-[9px] font-bold tracking-wide text-[#18123b]/80">ENCRYPTION</span>
                <span className="text-[11px] font-extrabold tracking-wide text-[#18123b]">AES-256</span>
              </div>

              <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-[#18123b]/30 flex flex-col items-center justify-center text-center leading-[1.15]">
                <span className="text-[9px] font-bold tracking-wide text-[#18123b]/80">PRIVATE AI</span>
                <span className="text-[11px] font-extrabold tracking-wide text-[#18123b]">RGPD</span>
              </div>
            </div>
          </div>

          {/* Right — dark demo card playing the real product walkthrough */}
          <div className="relative w-full h-[440px] sm:h-[520px] lg:h-[560px] rounded-[26px] overflow-hidden shadow-2xl shadow-[#18123b]/30 bg-[#12101f]">
            {/* ambient backdrop (visible while the video buffers) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#262247] via-[#151226] to-[#0b0a16]" />
            <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-[#6415f5]/25 blur-[100px]" />
            <div className="absolute bottom-[-60px] -left-16 w-[340px] h-[340px] rounded-full bg-teal-300/10 blur-[90px]" />

            {/* Scene 1 — transcript editor */}
            <div className="demo-scene absolute inset-0 p-6 sm:p-9 flex items-center justify-center" style={{ animationDelay: "0s" }}>
              <div className="demo-float w-full max-w-[430px]">
                <div className="rounded-2xl bg-white/95 backdrop-blur shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80">
                    <span className="text-[10.5px] font-semibold text-slate-700">Minutes — Strategy meeting</span>
                    <span className="flex items-center gap-2 text-[8.5px] font-semibold text-slate-400">
                      <span>Quotes</span>
                      <span className="w-6 h-3 rounded-full bg-[#6415f5]/80 relative"><span className="absolute right-0.5 top-0.5 w-2 h-2 rounded-full bg-white" /></span>
                      <span>Export ▾</span>
                      <span className="text-slate-600">Share</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-1.5 border-b border-slate-100 text-[9px] text-slate-400">
                    <span>↩</span><span>↷</span><span>Paragraphe ▾</span><span className="font-bold">B</span><span className="italic">I</span><span className="underline">U</span><span>S</span><span>≡</span><span>≡☰</span><span>‹›</span><span>❞</span>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-center text-[11px] font-extrabold tracking-[0.08em] text-slate-800">MEETING MINUTES</p>
                    <p className="text-center text-[7px] font-semibold tracking-[0.14em] text-slate-400 mt-1">CONFIDENTIAL — INTERNAL USE</p>
                    <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden text-[8.5px]">
                      {[
                        ["SPEAKERS", "3 speakers detected"],
                        ["DURATION", "45:12"],
                        ["LANGUAGE", "French — auto-detected"],
                        ["EXPORT", "PDF · DOCX · SRT · TXT"],
                      ].map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[92px_1fr] border-b border-slate-100 last:border-b-0">
                          <span className="px-2.5 py-1.5 font-bold text-slate-500 border-r border-slate-100">{k}:</span>
                          <span className="px-2.5 py-1.5 text-slate-600">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[8.5px] text-slate-500"><span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 align-middle" /><b>Speaker 1 · 00:12</b> — Welcome everyone, let's begin.</p>
                      <p className="text-[8.5px] text-slate-500"><span className="inline-block w-1.5 h-1.5 rounded-full bg-fuchsia-500 mr-1.5 align-middle" /><b>Speaker 2 · 00:18</b> — I prepared the quarterly minutes.</p>
                    </div>
                  </div>
                </div>
                <div className="relative mt-4 ml-1 inline-flex items-center gap-2.5">
                  <span className="rounded-xl bg-white/10 backdrop-blur border border-white/15 px-3.5 py-2 text-[10.5px] text-white/85">
                    Edit the minutes live, word by word.
                  </span>
                  <CursorIcon className="demo-cursor w-5 h-5 drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Scene 2 — share dialog */}
            <div className="demo-scene absolute inset-0 p-6 sm:p-9 flex items-center justify-center" style={{ animationDelay: "4s" }}>
              <div className="demo-float w-full max-w-[380px] rounded-2xl bg-white/95 backdrop-blur shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-800">Share 'Meeting minutes'</span>
                  <span className="text-slate-400 text-[12px]">✕</span>
                </div>
                <div className="px-4 py-3.5">
                  <div className="rounded-lg border border-slate-200 px-3 py-2 text-[10.5px] text-slate-500">jacques@entreprise.com</div>
                  <p className="mt-3 text-[7.5px] font-bold tracking-[0.14em] text-slate-400">GENERAL ACCESS</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-medium text-slate-600">
                      <span className="w-[18px] h-[18px] rounded-full bg-slate-200 inline-flex items-center justify-center text-[7px] font-bold text-slate-500">ORG</span>
                      The whole organization <span className="text-slate-400">▾</span>
                    </span>
                    <span className="text-[9.5px] font-medium text-slate-600">Viewer ▾</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9.5px] font-semibold text-slate-600">🔗 Copy link</span>
                  <span className="rounded-lg bg-slate-800 text-white px-3 py-1.5 text-[9.5px] font-semibold">Done</span>
                </div>
              </div>
            </div>

            {/* Scene 3 — ask the AI */}
            <div className="demo-scene absolute inset-0 p-6 sm:p-9 flex items-center justify-center" style={{ animationDelay: "8s" }}>
              <div className="w-full max-w-[440px]">
                <div className="rounded-2xl bg-white/12 backdrop-blur-xl border border-white/20 shadow-2xl px-4 py-3.5 flex items-center gap-3">
                  <span className="text-[12.5px] text-white/95 whitespace-nowrap">
                    <span className="demo-type">Summarize the key decisions of the meeting</span>
                    <span className="demo-caret inline-block w-[1.5px] h-[14px] bg-white/90 align-middle ml-[1px]" />
                  </span>
                  <span className="ml-auto w-8 h-8 rounded-full bg-[#6415f5] flex items-center justify-center text-white text-[13px] shadow-lg shrink-0">↑</span>
                </div>
                <div className="relative mt-5 inline-flex items-center gap-2.5">
                  <span className="rounded-xl bg-white/10 backdrop-blur border border-white/15 px-3.5 py-2 text-[10.5px] text-white/85">
                    Ask a question about the meeting — the AI answers with quotes.
                  </span>
                  <CursorIcon className="demo-cursor w-5 h-5 drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Scene 4 — analyzing files */}
            <div className="demo-scene absolute inset-0 p-6 sm:p-9 flex items-center justify-center" style={{ animationDelay: "12s" }}>
              <div className="demo-float w-full max-w-[420px] rounded-2xl bg-[#181430]/85 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <span className="text-[9px] font-bold tracking-[0.14em] text-white/85">TRANSCRIPTION IN PROGRESS…</span>
                  <span className="text-[8px] font-semibold text-white/45">5 AUDIO FILES</span>
                </div>
                <div className="p-3 space-y-2">
                  {["interview_client.wav", "reunion_conseil.mp3", "memo_vocal.webm", "rdv_terrain.mp4", "notes_reunion.m4a"].map((f, i) => (
                    <div key={f} className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "demo-pulse bg-emerald-400" : "bg-white/35"}`} />
                      <span className="text-[10px] text-white/80 font-medium">{f}</span>
                      {i === 0 && <span className="ml-auto text-[8px] font-bold text-emerald-300">RUNNING</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="scroll-mt-4 border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Everything you need for your <span className="text-[#6415f5]">meeting minutes</span>
          </h2>
          <div className="mt-11 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-6 shadow-sm hover:shadow-md hover:border-[#6415f5]/30 transition">
                <div className="w-11 h-11 rounded-xl bg-[#6415f5]/[0.08] border border-[#6415f5]/20 flex items-center justify-center text-[#6415f5]">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-semibold text-[#18123b]">{f.title}</h3>
                <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ───────────────────────────────────────────────────────── */}
      <section className="border-t border-[#18123b]/[0.07]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">How it works</h2>
          <div className="mt-11 grid sm:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-white border border-[#18123b]/[0.08] p-6 shadow-sm">
                <span className="absolute -top-4 left-6 w-9 h-9 rounded-xl bg-[#6415f5] text-white font-extrabold flex items-center justify-center shadow-md">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-[#18123b]">{s.title}</h3>
                <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ressources (FAQ) ────────────────────────────────────────────── */}
      <section id="ressources" className="scroll-mt-4 border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-center text-[#4b4763]">
            Everything you need to know before starting.
          </p>
          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm open:shadow-md open:border-[#6415f5]/30 transition"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-4.5 py-4 font-semibold text-[#18123b]">
                  {item.q}
                  <span className="shrink-0 w-7 h-7 rounded-full border border-[#18123b]/15 flex items-center justify-center text-[#18123b]/60 group-open:rotate-45 group-open:border-[#6415f5] group-open:text-[#6415f5] transition-transform">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm text-[#4b4763] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tarifs ──────────────────────────────────────────────────────── */}
      <section id="tarifs" className="scroll-mt-4 border-t border-[#18123b]/[0.07]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            One simple price: <span className="text-[#6415f5]">free</span>
          </h2>
          <p className="mt-3 text-center text-[#4b4763] max-w-xl mx-auto">
            All features, no credit card. Transcribe from your very first try.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-md rounded-[26px] bg-white border-[1.5px] border-[#6415f5]/40 shadow-xl shadow-[#6415f5]/10 p-8">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-[#18123b]">Free account</h3>
                <div className="text-right">
                  <span className="text-4xl font-extrabold tracking-tight text-[#18123b]">$0</span>
                  <span className="block text-[11px] font-semibold text-[#4b4763]">forever</span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#18123b]/85">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#6415f5]/[0.08] border border-[#6415f5]/25 text-[#6415f5] flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onStart}
                className="mt-8 w-full py-3.5 rounded-xl bg-[#6415f5] text-white font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25"
              >
                Try Aud for free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── À propos ────────────────────────────────────────────────────── */}
      <section id="apropos" className="scroll-mt-4 border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-16 lg:py-20 text-center">
          <img src={audLogo} alt="Aud" className="h-14 w-auto mx-auto" draggable={false} />
          <h2 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b]">About Aud</h2>
          <p className="mt-5 text-[16px] leading-[1.75] text-[#4b4763] max-w-2xl mx-auto">
            Aud is a transcription studio powered by artificial intelligence.
            It turns your meetings, interviews and recordings into verifiable text:
            every word timestamped, every speaker identified, every export ready to share.
            Your files stay private — never resold, never used to train models.
          </p>
          <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — Contact request")}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white font-semibold hover:bg-[#6415f5]/[0.06] transition"
            >
              ✉ {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-[26px] bg-[#6415f5] relative overflow-hidden px-8 py-14 sm:py-16 text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-black/10 blur-3xl" />
          <h2 className="relative text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            Ready to save hours of work?
          </h2>
          <p className="relative mt-4 text-white/80 max-w-xl mx-auto">
            Create your free account and transcribe your first file today.
          </p>
          <button
            onClick={onStart}
            className="relative mt-8 inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-white text-[#18123b] font-semibold hover:bg-slate-100 transition shadow-xl"
          >
            Create my free account
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#18123b]/10">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={audLogo} alt="Aud" className="h-8 w-auto" draggable={false} />
          <p className="text-xs text-[#4b4763]/70">
            © {new Date().getFullYear()} Aud — Transcription Services · Artificial Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}
