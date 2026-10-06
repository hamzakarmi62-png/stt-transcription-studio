import { useEffect, useRef, useState } from "react";
import audLogo from "../assets/aud-logo.png";
import { AboutPage, PricingPage, ContactPage, FeaturePage, InfoPage, HumanServicesPage, LanguagesPage, CalculatorPage, ChangelogPage, LegalPage, CareersPage, ServicePage, AudiencePage, ListingPage, TeamPage, PressPage, FreelancersPage, PartnersPage, LocationsPage, UseCasesPage, ReviewersPage } from "./LandingPages.jsx";
import { NAV_MENUS, BRAND, PLANS, USE_CASES } from "../siteData.js";
import { SPEC_DATA } from "../specData.js";
import { RICH_DATA } from "../specContent.js";
import { TFeaturePage, THumanPage, TApi, TContact, TCareers, TCompany, TReviewers, TTerms, TAudiencePage, TSecurity } from "./SpecPages.jsx";
import { TBlog, TTutorials, TUseCases, TLanguages, TChangelog } from "./SpecResources.jsx";
import { FileChecker } from "./tools/Checkers.jsx";
import { MenuIcon, MenuGlyph } from "./MenuIcons.jsx";
import {
  Mic, Users, Languages, Sparkles, Chart, Download,
  Lock, EyeOff,
} from "./Icons.jsx";

// Landing rebuilt after rev.com: warm cream background, slim nav with two
// CTAs, oversized two-line headline on the left with trust badges, and a
// dark product-demo card on the right cycling through animated scenes.
const PURPLE = "#6415f5";

const CONTACT_EMAIL = "hamzakarmi62@gmail.com";

const NAV = NAV_MENUS;

// Flatten every routable item of a dropdown (for the mobile accordion).
function collectItems(item) {
  const out = [];
  for (const col of item.columns || []) {
    if (col.items) out.push(...col.items);
    if (col.grid2x2) for (const g of col.grid2x2) out.push(...g.items);
  }
  return out;
}

// Status badge: New/Beta = purple pill · Planned = amber pill.
function StatusBadge({ kind }) {
  if (!kind) return null;
  const planned = kind === "Planned";
  return (
    <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide uppercase ${planned ? "bg-amber-100 text-amber-800" : "bg-[#6415f5] text-white"}`}>
      {kind}
    </span>
  );
}

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

const HOME_FEATURES = [
  { icon: Mic, title: "AI transcription", slug: "ai-transcription", text: "Audio and video converted to text with remarkable accuracy, in many languages." },
  { icon: Users, title: "Speaker detection", slug: "speaker-detection", text: "The AI automatically tells speakers apart and labels every line." },
  { icon: Languages, title: "Built-in translation", slug: "translation", text: "Translate your transcript to Arabic, French, English and more." },
  { icon: Sparkles, title: "Smart summary", slug: "summary", text: "A clear summary of your meetings and interviews, generated automatically." },
  { icon: Chart, title: "Speaking statistics", slug: "statistics", text: "Talking time, pace and participation for every speaker at a glance." },
  { icon: Download, title: "Multi-format export", slug: "share", text: "TXT, SRT subtitles, Word and PDF — ready to share with your team." },
];

const STEPS = [
  { n: "1", title: "Import your file", text: "MP3, WAV, M4A, MP4… drag and drop, or record straight from your microphone." },
  { n: "2", title: "The AI works", text: "Transcription, speakers and language detected automatically in minutes." },
  { n: "3", title: "Edit and export", text: "Fix the text, name the speakers, then export in your favorite format." },
];

// Trust bar stats — [CONFIRMED product facts]
const TRUST_STATS = [["99", "languages"], ["12", "speakers"], ["6", "export formats"], ["$0", "free plan"]];
// TODO: owner to verify — replace with real customer logos when available.
const PLACEHOLDER_LOGOS = ["UNIVERSITY", "NEWSROOM", "LAW FIRM", "PODCAST STUDIO", "RESEARCH LAB"];

function CursorIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="white" stroke="#18123b" strokeWidth="1.4">
      <path d="M5.5 3.2 19 11.4l-6.2 1.2-2.6 5.9z" />
    </svg>
  );
}

const H_LINE1 = "Transcribe everything";
const H_LINE2 = "in minutes, not hours";

// The hero headline types itself out on arrival — a live-writing feel with a
// blinking caret. min-height reserves the final two-line box so the page
// below never jumps while the text grows.
function TypedHeadline() {
  const total = H_LINE1.length + H_LINE2.length;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n < total) {
      // type on with a human-ish, slightly uneven cadence
      const t = setTimeout(() => setN((v) => v + 1), 42 + Math.random() * 46);
      return () => clearTimeout(t);
    }
    // full headline shown — hold it a moment, then write it again
    const t = setTimeout(() => setN(0), 2600);
    return () => clearTimeout(t);
  }, [n, total]);
  const n1 = Math.min(n, H_LINE1.length);
  const n2 = Math.max(0, Math.min(n - H_LINE1.length, H_LINE2.length));
  return (
    <h1
      className="text-[clamp(40px,4.4vw,68px)] leading-[1.18] font-normal tracking-[-0.012em] text-[#18123b]"
      style={{ minHeight: "2.4em" }}
      aria-label={`${H_LINE1} ${H_LINE2}`}
    >
      {H_LINE1.slice(0, n1)}
      <br />
      {H_LINE2.slice(0, n2)}
    </h1>
  );
}

const DEMO_Q = "What did Speaker 2 say about the deadline?";
const DEMO_FILES = ["interview_client.wav", "meeting_notes.m4a", "focus_group.mp3", "call_2231.mp3", "lecture_hall.wav"];
const DEMO_A1 = "Speaker 2 moved the deadline to Friday \u2014 the full exchange runs 00:12:48 \u2013 00:14:02 in the transcript. [1][2]";
const DEMO_CHAT2 = "Update the information in the document's table.";
const DEMO_MEMO = [
  ["TO:", "Assigned Counsel", "Jacobs & Ybarra"],
  ["FROM:", "Legal Research & Investigations Unit", "Legal R&I Team"],
  ["DATE:", "[Date of Preparation]", "July 09, 2026"],
  ["RE:", "[Investigative Summary \u2013 People v. Daniel Mares]", "Investigative Summary \u2013 People v. Daniel Mares"],
  ["RD #:", "JD275402", "JD275402"],
  ["EVENT #:", "2017616455", "2017616455"],
];
const DEMO_LOOP = 270; // 100ms ticks — the walkthrough replays forever

// The hero demo: real footage under a timed product walkthrough — question
// typed, files analyzed, AI answer with timestamps, source card, then the
// memo draft that fills itself. Everything loops like a product film.
function HeroDemo() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setT((v) => (v + 1) % DEMO_LOOP), 100);
    return () => clearInterval(iv);
  }, []);

  const qn = Math.max(0, Math.min(t - 4, DEMO_Q.length));
  const an = Math.max(0, Math.min((t - 92) * 2, DEMO_A1.length));
  const c2n = Math.max(0, Math.min(((t - 180) * 1.5) | 0, DEMO_CHAT2.length));
  const showingWoman = t < 150;
  const fadeOut = t >= 262;

  return (
    <div className="relative w-full h-[440px] sm:h-[520px] lg:h-[560px] rounded-[26px] overflow-hidden shadow-2xl shadow-[#18123b]/30 bg-[#12101f]">
      {/* footage */}
      <video
        src="/videos/hero-woman.mp4"
        poster="/videos/hero-woman.jpg"
        preload="auto"
        autoPlay muted loop playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${showingWoman ? "opacity-100" : "opacity-0"}`}
      />
      <video
        src="/videos/hero-man.mp4"
        poster="/videos/hero-man.jpg"
        preload="auto"
        autoPlay muted loop playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${showingWoman ? "opacity-0" : "opacity-100"}`}
      />
      {/* ambient gradient + dim so the UI cards read on any frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#262247]/60 via-[#151226]/55 to-[#0b0a16]/80" />
      <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-[#6415f5]/20 blur-[100px]" />

      <div className={`absolute inset-0 transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
        {/* chat bar — question types itself */}
        <div className="absolute top-6 left-6 right-6 sm:top-9 sm:left-9 sm:right-9">
          <div className="max-w-[430px] rounded-2xl bg-white/12 backdrop-blur-xl border border-white/20 shadow-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-[12.5px] text-white/95 truncate">
              {qn > 0 ? DEMO_Q.slice(0, qn) : <span className="text-white/45">Ask your transcript…</span>}
            </span>
            <span
              className={`ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] shadow-lg shrink-0 transition-colors ${t >= 50 && t < 62 ? "hero-ring" : ""} ${qn >= DEMO_Q.length ? "bg-[#6415f5]" : "bg-white/15"}`}
            >
              ↑
            </span>
          </div>
          {qn >= DEMO_Q.length && t < 66 && (
            <div className="relative mt-2 inline-flex items-center gap-2.5">
              <span className="rounded-xl bg-white/10 backdrop-blur border border-white/15 px-3.5 py-2 text-[10.5px] text-white/85">
                Ask in your own words — answers cite timestamps.
              </span>
              <CursorIcon className="demo-cursor w-5 h-5 drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* analyzing files */}
        {t >= 58 && t < 150 && (
          <div className="hero-in absolute top-[104px] left-6 right-6 sm:top-[128px] sm:left-9 sm:right-auto w-full max-w-[360px]">
            <div className="rounded-2xl bg-[#181430]/85 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <span className="text-[9px] font-bold tracking-[0.14em] text-white/85">ANALYZING…</span>
                <span className="text-[8px] font-semibold text-white/45">5 SOURCE FILES</span>
              </div>
              <div className="p-3 space-y-2">
                {DEMO_FILES.map((f, i) =>
                  t >= 62 + i * 4 ? (
                    <div key={f} className="hero-in flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "demo-pulse bg-emerald-400" : "bg-white/35"}`} />
                      <span className="text-[10px] text-white/80 font-medium">{f}</span>
                      {i === 0 && <span className="ml-auto text-[8px] font-bold text-emerald-300">RUNNING</span>}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI answer — types out with timestamps */}
        {t >= 92 && t < 170 && (
          <div className="hero-in absolute bottom-[96px] left-6 right-6 sm:left-9 sm:right-auto w-full max-w-[400px]">
            <div className="rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl px-4 py-3.5">
              <p className="text-[11.5px] leading-[1.6] text-slate-700">
                {DEMO_A1.slice(0, an)}
                {an < DEMO_A1.length && <span className="inline-block w-[1.5px] h-[12px] bg-[#6415f5] align-middle ml-[1px]" />}
              </p>
              {an >= DEMO_A1.length && (
                <p className="text-[11.5px] leading-[1.6] text-slate-700 mt-2">Specifically, it suggests the following:</p>
              )}
            </div>
          </div>
        )}

        {/* source material — transcript excerpt pops over the answer */}
        {t >= 138 && t < 158 && (
          <div className="hero-in absolute top-[92px] right-6 sm:right-9 w-[240px] rounded-xl bg-white/95 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90">
              <span className="text-[7.5px] font-bold tracking-[0.14em] text-white/85">SOURCE MATERIAL</span>
              <span className="text-[7.5px] font-semibold text-white/50">meeting_notes.m4a</span>
            </div>
            <div className="px-3 py-2.5 space-y-1">
              <p className="text-[9px] text-slate-600"><b>00:12:48</b> — Speaker 2: The deadline moved to Friday, not Monday. Everything ships then.</p>
            </div>
          </div>
        )}

        {/* draft document button (man scene) */}
        {t >= 158 && t < 172 && (
          <div className="hero-in absolute bottom-[54px] left-6 sm:left-9">
            <div className={`inline-flex items-center gap-2 rounded-xl bg-white/12 backdrop-blur border border-white/20 px-4 py-2.5 text-[11.5px] text-white/90 shadow-xl ${t >= 166 ? "hero-ring" : ""}`}>
              ✎ Draft document
            </div>
            {t >= 166 && <CursorIcon className="demo-cursor w-5 h-5 drop-shadow-lg -ml-8 mt-1 inline-block" />}
          </div>
        )}

        {/* memo card slides up, then fills itself */}
        {t >= 172 && (
          <div className="hero-in absolute inset-0 flex items-center justify-center px-6 pt-10">
            <div className="w-full max-w-[400px] rounded-2xl bg-white/75 backdrop-blur-xl border border-white/40 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80">
                <span className="text-[10.5px] font-bold text-slate-800">Transcript Memorandum</span>
                <span className="flex items-center gap-2 text-[8.5px] font-semibold text-slate-400">
                  <span>Citations</span>
                  <span className="w-6 h-3 rounded-full bg-[#6415f5]/80 relative"><span className="absolute right-0.5 top-0.5 w-2 h-2 rounded-full bg-white" /></span>
                  <span>Export ▾</span><span className="text-slate-600">Share</span>
                </span>
              </div>
              <div className="px-5 py-4">
                <p className="text-center text-[11px] font-extrabold tracking-[0.08em] text-slate-800">INVESTIGATIVE MEMORANDUM</p>
                <p className="text-center text-[7px] font-semibold tracking-[0.14em] text-slate-400 mt-1">CONFIDENTIAL — ATTORNEY WORK PRODUCT / PRIVILEGED</p>
                <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden text-[8.5px]">
                  {DEMO_MEMO.map(([k, before, after], i) => {
                    const filled = t >= 218 + i * 4;
                    return (
                      <div key={k} className="grid grid-cols-[64px_1fr] border-b border-slate-100 last:border-b-0">
                        <span className="px-2.5 py-1.5 font-bold text-slate-500 border-r border-slate-100">{k}</span>
                        <span className={`px-2.5 py-1.5 ${filled ? "text-slate-800 font-semibold hero-in" : "text-slate-400"}`}>
                          {filled ? after : before}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* second chat — the update command */}
        {t >= 176 && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-9 sm:right-auto w-full max-w-[430px]">
            <div className="rounded-2xl bg-white/12 backdrop-blur-xl border border-white/20 shadow-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-[12.5px] text-white/95 truncate">
                {t < 180 ? <span className="text-white/45">Ask your transcript…</span> : DEMO_CHAT2.slice(0, c2n)}
              </span>
              <span
                className={`ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] shadow-lg shrink-0 transition-colors ${t >= 214 && t < 224 ? "hero-ring" : ""} ${c2n >= DEMO_CHAT2.length ? "bg-[#6415f5]" : "bg-white/15"}`}
              >
                ↑
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandingScreen({ onStart }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState("home"); // home | about | pricing | contact | feat:* | svc:* | aud:* | res:* | info:* | ...
  const closeTimer = useRef(null);

  const goToSection = (id) => {
    setOpenMenu(null);
    if (page !== "home") {
      setPage("home");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToPage = (pg) => {
    setOpenMenu(null);
    setMobileOpen(false);
    setPage(pg);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const goFeature = (slug) => {
    setOpenMenu(null);
    setMobileOpen(false);
    setPage("feat:" + slug);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Cross-page links inside page components (About, Audience, Service…)
  useEffect(() => {
    window.__goTeam = () => goToPage("team");
    window.__goSecurity = () => goToPage("info:security");
    window.__goPricing = () => goToPage("pricing");
    window.__goFeature = (k) => goFeature(k);
    window.__goSvc = (k) => goToPage("svc:" + k);
    window.__goPage = (p) => goToPage(p);
  }, []);

  const navFromItem = (it) => {
    if (!it) return;
    if (it.slug) goFeature(it.slug);
    else if (it.svc) goToPage("svc:" + it.svc);
    else if (it.page) goToPage(it.page);
    else if (it.target) goToSection(it.target);
  };

  // Desktop mega-menu: opens on hover, closes on leaving the header area
  const openWith = (label) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpenMenu(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };

  // Which nav item is highlighted for the current page
  const navActive = (label) => {
    if (label === "Product") return page.startsWith("feat:") || page.startsWith("svc:");
    if (label === "Features") return page.startsWith("aud:") || page === "human";
    if (label === "Resources") return page.startsWith("res:") || page.startsWith("info:") || ["languages", "calculator", "changelog"].includes(page);
    if (label === "About") return ["about", "team", "press", "freelancers", "partners", "reviewers", "legal", "careers"].includes(page);
    if (label === "Pricing") return page === "pricing";
    return false;
  };

  // Split a column's items into `n` sub-columns (Product → AI platform, 9 items).
  const subCols = (items, n) => {
    const half = Math.ceil(items.length / n);
    return Array.from({ length: n }, (_, i) => items.slice(i * half, (i + 1) * half)).filter((a) => a.length);
  };

  const openNavItem = NAV.find((n) => n.label === openMenu);

  return (
    <div
      className="min-h-screen bg-[#f6f3ed] text-[#18123b] antialiased"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      dir="ltr"
      lang="en"
    >
      <style>{`
        @keyframes demoFloat {0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .demo-float {animation: demoFloat 5s ease-in-out infinite}
        @keyframes demoCursor {0%,100%{transform:translate(0,0)}50%{transform:translate(10px,-8px)}}
        .demo-cursor {animation: demoCursor 3s ease-in-out infinite}
        @keyframes heroIn {from{opacity:0; transform:translateY(16px) scale(.98)} to{opacity:1; transform:translateY(0) scale(1)}}
        .hero-in {animation: heroIn .5s cubic-bezier(.22,1,.36,1) both}
        @keyframes heroRing {0%{box-shadow:0 0 0 0 rgba(100,21,245,.55)} 100%{box-shadow:0 0 0 14px rgba(100,21,245,0)}}
        .hero-ring {animation: heroRing 1s ease-out infinite}
        @keyframes demoPulse {0%,100%{opacity:.35}50%{opacity:1}}
        .demo-pulse {animation: demoPulse 1.4s ease-in-out infinite}
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#f6f3ed]/95 backdrop-blur border-b border-[#18123b]/[0.06]">
        <div className="max-w-[1400px] mx-auto flex items-center gap-6 px-5 sm:px-8 h-[76px]">
          <button onClick={() => goToPage("home")} className="shrink-0" aria-label="Aud — home">
            <img src={audLogo} alt="Aud" className="h-10 w-auto" draggable={false} />
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" onMouseLeave={scheduleClose} aria-label="Main">
            {NAV.map((item) => (
              <div key={item.label} className="relative" onMouseEnter={() => item.columns && openWith(item.label)}>
                <button
                  aria-haspopup={item.columns ? "true" : undefined}
                  aria-expanded={item.columns ? openMenu === item.label : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOpenMenu(null);
                    if (e.key === "ArrowDown" && item.columns) { e.preventDefault(); openWith(item.label); }
                  }}
                  onClick={() => (item.columns ? openWith(item.label) : goToPage(item.page))}
                  className={`text-[14px] font-medium transition-colors flex items-center gap-1 ${
                    navActive(item.label) || openMenu === item.label
                      ? "text-[#6415f5]"
                      : "text-[#18123b]/75 hover:text-[#18123b]"
                  }`}
                >
                  {item.label}
                  {item.columns && (
                    <svg viewBox="0 0 24 24" className={`w-3 h-3 transition-transform ${openMenu === item.label ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
            <button onClick={onStart} className="hidden sm:block text-[14px] font-medium text-[#18123b]/85 hover:text-[#18123b] transition-colors px-2">
              Log in
            </button>
            <button
              onClick={onStart}
              className="inline-flex items-center px-5 py-2.5 rounded-[10px] bg-[#6415f5] text-white text-[14px] font-semibold hover:bg-[#5311cf] transition shadow-sm"
            >
              Try Aud for free
            </button>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden w-10 h-10 rounded-xl border border-[#18123b]/15 bg-white/60 flex items-center justify-center"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label="Menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* ── Mega-menu panel (desktop) ── */}
          {openNavItem && openNavItem.columns && (
            <div
              className="absolute left-0 right-0 top-full z-30 hidden lg:block"
              onMouseEnter={() => openWith(openMenu)}
              onMouseLeave={scheduleClose}
              onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu(null); }}
            >
              <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
                <div className="mt-2 rounded-3xl bg-white border border-[#18123b]/10 shadow-2xl shadow-[#18123b]/15 overflow-hidden">
                  <div className="grid grid-cols-[1fr_320px]">
                    <div className="p-6 border-r border-[#18123b]/[0.07]">
                      <div
                        className="grid gap-6"
                        style={{ gridTemplateColumns: openNavItem.columns.length > 1 ? openNavItem.widths || "1fr" : "1fr" }}
                      >
                        {openNavItem.columns.map((col) => (
                          <div key={col.title} className="min-w-0">
                            <p className="text-[10px] font-black tracking-[0.14em] text-[#4b4763]/80 uppercase mb-3">{col.title}</p>

                            {/* Core features → 2×2 grid of groups */}
                            {col.grid2x2 && (
                              <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                                {col.grid2x2.map((g) => (
                                  <div key={g.title}>
                                    <p className="text-[11px] font-bold text-[#18123b]/70 mb-1.5">{g.title}</p>
                                    <div className="space-y-0.5">
                                      {g.items.map((it) => (
                                        <button
                                          key={it.label}
                                          onClick={() => navFromItem(it)}
                                          className="w-full flex items-center gap-2 text-start rounded-lg px-2 py-1.5 hover:bg-[#6415f5]/[0.06] transition group/link"
                                        >
                                          <span className="text-[12.5px] font-medium text-[#18123b] group-hover/link:text-[#6415f5] transition-colors">{it.label}</span>
                                          <StatusBadge kind={it.badge} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* AI platform → items split into 2 sub-columns */}
                            {col.subCols && (
                              <div className="grid grid-cols-2 gap-x-5">
                                {subCols(col.items, col.subCols).map((chunk, ci) => (
                                  <div key={ci} className="space-y-1">
                                    {chunk.map((it) => (
                                      <button
                                        key={it.label}
                                        onClick={() => navFromItem(it)}
                                        className="w-full flex items-start gap-2.5 text-start rounded-xl p-2 hover:bg-[#6415f5]/[0.06] transition group/link"
                                      >
                                        <MenuGlyph icon={it.icon} />
                                        <span className="min-w-0">
                                          <span className="flex items-center gap-1.5">
                                            <span className="text-[12.5px] font-semibold text-[#18123b] group-hover/link:text-[#6415f5] transition-colors">{it.label}</span>
                                            <StatusBadge kind={it.badge} />
                                          </span>
                                          <span className="block text-[10.5px] text-[#4b4763] leading-snug">{it.desc}</span>
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Simple list columns (Human-verified / Developers / Who it's for) */}
                            {col.items && !col.cols3 && !col.subCols && (
                              <div className="space-y-1">
                                {col.items.map((it) => (
                                  <button
                                    key={it.label}
                                    onClick={() => navFromItem(it)}
                                    className="w-full flex items-start gap-2.5 text-start rounded-xl p-2 hover:bg-[#6415f5]/[0.06] transition group/link"
                                  >
                                    {it.icon && <MenuGlyph icon={it.icon} />}
                                    <span className="min-w-0">
                                      <span className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[12.5px] font-semibold text-[#18123b] group-hover/link:text-[#6415f5] transition-colors">{it.label}</span>
                                        <StatusBadge kind={it.badge} />
                                      </span>
                                      {it.desc && <span className="block text-[10.5px] text-[#4b4763] leading-snug">{it.desc}</span>}
                                    </span>
                                  </button>
                                ))}
                                {/* Also serving (Features col 2) */}
                                {col.also && (
                                  <div className="pt-3 mt-2 border-t border-[#18123b]/[0.07]">
                                    <p className="text-[10px] font-black tracking-[0.14em] text-[#4b4763]/80 uppercase mb-2">{col.also.title}</p>
                                    <div className="space-y-0.5">
                                      {col.also.items.map((it) => (
                                        <button
                                          key={it.label}
                                          onClick={() => navFromItem(it)}
                                          className="w-full flex items-center gap-2 text-start rounded-lg px-2 py-1.5 hover:bg-[#6415f5]/[0.06] transition group/link"
                                        >
                                          <span className="text-[12px] font-medium text-[#18123b] group-hover/link:text-[#6415f5] transition-colors">{it.label}</span>
                                          <StatusBadge kind={it.badge} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Resources / About → 3-column grid of icon cards */}
                            {col.cols3 && (
                              <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                                {col.items.map((it) => (
                                  <button
                                    key={it.label}
                                    onClick={() => navFromItem(it)}
                                    className="flex items-start gap-2.5 text-start rounded-xl p-2 hover:bg-[#6415f5]/[0.06] transition group/link"
                                  >
                                    <MenuGlyph icon={it.icon} />
                                    <span className="min-w-0">
                                      <span className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[12.5px] font-semibold text-[#18123b] group-hover/link:text-[#6415f5] transition-colors">{it.label}</span>
                                        <StatusBadge kind={it.badge} />
                                      </span>
                                      <span className="block text-[10.5px] text-[#4b4763] leading-snug">{it.desc}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Promo rail */}
                    <div className="relative p-0 min-h-[320px]">
                      {openNavItem.promo.video ? (
                        <video
                          src={openNavItem.promo.video}
                          poster={openNavItem.promo.poster}
                          autoPlay muted loop playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <img src="/videos/hero-woman.jpg" alt="Aud Studio" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12101f]/95 via-[#12101f]/55 to-transparent" />
                      <div className="relative h-full flex flex-col justify-end p-6 text-white">
                        {openNavItem.promo.kicker && (
                          <p className="text-[9px] font-black tracking-[0.16em] text-[#c4b5fd] uppercase">{openNavItem.promo.kicker}</p>
                        )}
                        <p className="text-[15px] font-bold leading-snug mt-1">{openNavItem.promo.title}</p>
                        <p className="text-[11.5px] text-white/80 mt-1.5 leading-relaxed">{openNavItem.promo.text}</p>
                        <button
                          onClick={onStart}
                          className="mt-4 self-start px-4 py-2 rounded-lg bg-[#6415f5] text-white text-[12px] font-semibold hover:bg-[#5311cf] transition"
                        >
                          {openNavItem.promo.cta}
                        </button>
                      </div>
                    </div>
                  </div>

                  {openNavItem.stats && (
                    <div className="grid grid-cols-4 border-t border-[#18123b]/[0.07] bg-[#f6f3ed]">
                      {openNavItem.stats.map(([n, label]) => (
                        <div key={label} className="py-3.5 text-center border-r border-[#18123b]/[0.05] last:border-r-0">
                          <span className="text-lg font-extrabold text-[#18123b]">{n}</span>
                          <span className="ms-1.5 text-[11px] font-semibold text-[#4b4763]">{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile menu (accordion) ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#18123b]/[0.06] bg-[#f6f3ed] max-h-[calc(100vh-76px)] overflow-y-auto">
            <div className="px-5 py-4 space-y-2 pb-8">
              {NAV.filter((n) => n.columns).map((item) => (
                <details key={item.label} className="rounded-xl bg-white border border-[#18123b]/[0.08]">
                  <summary className="px-4 py-3 font-semibold text-[#18123b] cursor-pointer list-none flex items-center justify-between">
                    {item.label}
                    <span className="text-[#4b4763]">▾</span>
                  </summary>
                  <div className="px-2 pb-2 space-y-0.5">
                    {collectItems(item).map((it) => (
                      <button
                        key={it.label + (it.slug || it.svc || it.page || "")}
                        onClick={() => navFromItem(it)}
                        className="w-full flex items-center gap-2 text-start rounded-lg px-3 py-2 hover:bg-[#6415f5]/[0.06] transition"
                      >
                        {it.icon && <MenuIcon name={it.icon} className="w-4 h-4 text-[#6415f5]" />}
                        <span className="text-[13px] font-medium text-[#18123b]">{it.label}</span>
                        <StatusBadge kind={it.badge} />
                      </button>
                    ))}
                  </div>
                </details>
              ))}
              <button
                onClick={() => goToPage("pricing")}
                className="w-full rounded-xl bg-white border border-[#18123b]/[0.08] px-4 py-3 font-semibold text-[#18123b] text-start"
              >
                Pricing
              </button>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button onClick={onStart} className="w-full py-3 rounded-xl bg-[#6415f5] text-white font-semibold hover:bg-[#5311cf] transition">
                  Try Aud for free
                </button>
                <button onClick={onStart} className="w-full py-3 rounded-xl text-[#18123b]/85 font-medium">
                  Log in
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {page === "about" && <TCompany />}
      {page === "pricing" && <PricingPage onStart={onStart} />}
      {page === "contact" && <TContact goPage={goToPage} />}
      {page.startsWith("feat:") && ((SPEC_DATA.features[page.slice(5)] || RICH_DATA.groupPages[page.slice(5)])
        ? <TFeaturePage slug={page.slice(5)} goFeature={goFeature} goPage={goToPage} />
        : <FeaturePage slug={page.slice(5)} onStart={onStart} goFeature={goFeature} />)}
      {page.startsWith("info:") && (page === "info:help"
        ? <THelpCenter goPage={goToPage} />
        : page === "info:api" ? <TApi />
        : page === "info:security" ? <TSecurity />
        : <InfoPage slug={page.slice(5)} onStart={onStart} />)}
      {page.startsWith("svc:") && (SPEC_DATA.human.crumbs[page.slice(4)]
        ? <THumanPage slug={page.slice(4)} />
        : <ServicePage slug={page.slice(4)} onStart={onStart} />)}
      {page.startsWith("aud:") && <TAudiencePage slug={page.slice(4)} goFeature={goFeature} />}
      {page.startsWith("res:") && (page === "res:usecases"
        ? <TUseCases goAudience={(a) => goToPage("aud:" + a)} />
        : page === "res:tutorials" ? <TTutorials />
        : page === "res:blog" ? <TBlog />
        : <ListingPage slug={page.slice(4)} onStart={onStart} />)}
      {page === "reviewers" && <TReviewers goFreelancers={() => goToPage("freelancers")} />}
      {page === "team" && <TeamPage onStart={onStart} />}
      {page === "press" && <PressPage />}
      {page === "freelancers" && <FreelancersPage />}
      {page === "partners" && <PartnersPage />}
      {page === "locations" && <LocationsPage />}
      {page === "human" && <HumanServicesPage onStart={onStart} />}
      {page === "languages" && <TLanguages />}
      {page === "calculator" && <CalculatorPage onStart={onStart} />}
      {page === "changelog" && <TChangelog />}
      {page === "legal" && <TTerms />}
      {page === "careers" && <TCareers />}
      {page === "home" && (
      <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section id="produit" className="relative scroll-mt-4">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-8 lg:pt-14 pb-14 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div>
            <TypedHeadline />

            <p className="mt-7 text-[17px] leading-[1.6] text-[#4b4763] max-w-[580px]">
              The transcription platform built for teams that don't have
              time to re-listen to everything. Transcription, speaker detection,
              translation and summaries for all your recordings. Every word
              verified, so the decision stays yours.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => document.getElementById("home-upload")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="inline-flex items-center px-8 py-3.5 rounded-xl bg-[#6415f5] text-white text-[16px] font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25"
              >
                Check your file
              </button>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — Contact request")}`}
                className="inline-flex items-center px-7 py-3.5 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white font-semibold hover:bg-[#6415f5]/[0.06] transition"
              >
                Talk to a specialist
              </a>
            </div>

            {/* Upload box — runs the local file check; nothing is uploaded */}
            <div className="mt-5 max-w-[580px]" id="home-upload">
              <FileChecker compact />
            </div>

            {/* Trust badges */}
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
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

          {/* Right — dark demo card: real footage + a live product walkthrough */}
          <HeroDemo />
        </div>
      </section>

      {/* ── 2. Trust bar ────────────────────────────────────────────────── */}
      <section className="border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TRUST_STATS.map(([n, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold tracking-tight text-[#18123b]">{n}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4b4763] mt-1">{label}</p>
              </div>
            ))}
          </div>
          {/* TODO: owner to verify — replace these placeholder wordmarks with real customer logos */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-45">
            {PLACEHOLDER_LOGOS.map((logo) => (
              <span key={logo} className="text-[13px] font-black tracking-[0.22em] text-[#18123b]">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. How it works ─────────────────────────────────────────────── */}
      <section id="fonctionnalites-steps" className="border-t border-[#18123b]/[0.07]">
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

      {/* ── 4. AI vs Human-verified ─────────────────────────────────────── */}
      <section className="border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Two ways to a finished transcript
          </h2>
          <p className="mt-3 text-center text-[#4b4763] max-w-xl mx-auto">
            AI speed when you need it now — human verification when the words must be certain.
          </p>
          <div className="mt-11 grid lg:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* AI card */}
            <div className="rounded-[26px] bg-white border-[1.5px] border-[#6415f5]/40 shadow-xl shadow-[#6415f5]/10 p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#18123b]">AI transcription</h3>
                <span className="px-2.5 py-1 rounded-md bg-[#6415f5] text-white text-[9px] font-black tracking-wide uppercase">Ready now</span>
              </div>
              <ul className="mt-5 space-y-3">
                {["Timestamped text in minutes", "Speakers detected automatically", "99 languages, one-click translation", "Word-level editor included", "Free to start"].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-[#18123b]/85">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#6415f5]/[0.08] border border-[#6415f5]/25 text-[#6415f5] flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="mt-7 w-full py-3.5 rounded-xl bg-[#6415f5] text-white font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
                Try Aud for free
              </button>
            </div>

            {/* Human-verified card */}
            <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#18123b]">Human-verified</h3>
                <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black tracking-wide uppercase">Planned</span>
              </div>
              <ul className="mt-5 space-y-3">
                {["A person checks every word", "For legal, media and research work", "Per-minute pricing on top of any plan", "Verbatim, timestamps and rush options", "Ordered from the studio"].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-[#18123b]/85">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#6415f5]/[0.08] border border-[#6415f5]/25 text-[#6415f5] flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              {/* TODO: owner to verify — service goes live with the reviewer program */}
              <button onClick={() => goToPage("human")} className="mt-7 w-full py-3.5 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white font-semibold hover:bg-[#6415f5]/[0.06] transition">
                See the services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Feature cards ────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="scroll-mt-4 border-t border-[#18123b]/[0.07]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Everything you need for your <span className="text-[#6415f5]">meeting minutes</span>
          </h2>
          <div className="mt-11 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HOME_FEATURES.map((f) => (
              <button
                key={f.title}
                onClick={() => goFeature(f.slug)}
                className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-6 shadow-sm hover:shadow-md hover:border-[#6415f5]/30 transition text-start group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#6415f5]/[0.08] border border-[#6415f5]/20 flex items-center justify-center text-[#6415f5]">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-semibold text-[#18123b] group-hover:text-[#6415f5] transition-colors">{f.title}</h3>
                <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{f.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Industries / use cases ───────────────────────────────────── */}
      <section className="border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Built for the way you work
          </h2>
          <div className="mt-11 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((u) => (
              <button
                key={u.title}
                onClick={() => u.aud && goToPage("aud:" + u.aud)}
                className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-7 text-start hover:shadow-md hover:border-[#6415f5]/30 transition group"
              >
                <h3 className="text-lg font-semibold text-[#18123b] group-hover:text-[#6415f5] transition-colors">{u.title}</h3>
                <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{u.text}</p>
                <span className="mt-4 inline-block text-[13px] font-semibold text-[#6415f5]">See how it works →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Stories (placeholders) ───────────────────────────────────── */}
      <section className="border-t border-[#18123b]/[0.07]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Teams that trust Aud
          </h2>
          {/* TODO: owner to verify — replace with real customer stories */}
          <div className="mt-11 grid sm:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-[26px] border-2 border-dashed border-[#18123b]/20 bg-white/50 p-8 text-center">
                <p className="text-4xl leading-none text-[#6415f5]/40 font-black">"</p>
                <p className="mt-2 text-sm font-medium text-[#18123b]/55 leading-relaxed">TODO: owner to add a real customer story.</p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4b4763]/70">Name · Role</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Pricing preview ──────────────────────────────────────────── */}
      <section id="tarifs-preview" className="border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Start free, scale when you need to
          </h2>
          <p className="mt-3 text-center text-[#4b4763] max-w-xl mx-auto">
            Every plan includes the full studio. Human-verified services are priced per minute on top.
          </p>
          <div className="mt-11 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => goToPage("pricing")}
                className={`rounded-[26px] p-7 text-start transition shadow-sm hover:shadow-md ${
                  p.popular ? "bg-white border-[1.5px] border-[#6415f5]/50 shadow-lg shadow-[#6415f5]/10" : "bg-white border border-[#18123b]/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#18123b]">{p.name}</h3>
                  {p.popular && <span className="px-2 py-0.5 rounded-md bg-[#6415f5] text-white text-[9px] font-black tracking-wide uppercase">Popular</span>}
                </div>
                <p className="mt-3">
                  <span className="text-3xl font-extrabold tracking-tight text-[#18123b]">{p.monthly === null ? "Custom" : `$${p.monthly}`}</span>
                  {p.monthly !== null && p.monthly > 0 && <span className="text-[11px] font-semibold text-[#4b4763]"> /month</span>}
                </p>
                <p className="mt-2 text-[12.5px] text-[#4b4763] leading-relaxed">{p.minutes} min · {p.maxLen} max file</p>
                <span className="mt-4 inline-block text-[13px] font-semibold text-[#6415f5]">See the plan →</span>
              </button>
            ))}
          </div>
          <div className="mt-9 text-center">
            <button onClick={() => goToPage("pricing")} className="px-8 py-3.5 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white font-semibold hover:bg-[#6415f5]/[0.06] transition">
              Compare all plans
            </button>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ──────────────────────────────────────────────────────── */}
      <section id="ressources" className="scroll-mt-4 border-t border-[#18123b]/[0.07]">
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

      {/* ── 10. Final CTA ───────────────────────────────────────────────── */}
      <section id="apropos" className="scroll-mt-4 max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
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

      </>
      )}

      {/* ── Footer (appears at the bottom of every page) ── */}
      <footer className="bg-[#18123b] text-white">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-14 pb-10 grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10">
          <div>
            <p className="text-[22px] font-extrabold tracking-tight text-[#a78bfa]">{BRAND.name.toUpperCase()}</p>
            <p className="mt-3 text-[13px] text-white/60 leading-relaxed max-w-[240px]">{SPEC_DATA.footer.tagline}</p>
            {/* TODO: owner to verify — add the real store links when the apps ship */}
            <div className="mt-5 flex flex-col items-start gap-2.5">
              {["App Store", "Google Play"].map((store) => (
                <button key={store} title={`TODO: owner to add the real ${store} link`} className="px-4 py-2 rounded-lg border border-white/25 text-[13px] font-semibold text-white/80 hover:text-white hover:border-white/50 transition">
                  {store}
                </button>
              ))}
            </div>
          </div>
          {SPEC_DATA.footer.columns.map(([title, links]) => (
            <div key={title}>
              <p className="text-[15px] font-bold text-white mb-4">{title}</p>
              <div className="space-y-2.5">
                {links.map(([label, route]) => (
                  <button key={label} onClick={() => (route.startsWith("feat:") ? goFeature(route.slice(5)) : goToPage(route))} className="block text-[13.5px] text-white/60 hover:text-white transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-[13px] text-white/50">
            © {new Date().getFullYear()} {BRAND.name}.{" "}
            <button onClick={() => goToPage("legal")} className="hover:text-white transition">Terms</button>
            {" · "}
            <button onClick={() => goToPage("legal")} className="hover:text-white transition">Privacy</button>
          </p>
          <div className="flex items-center gap-2 text-white/70">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z" /></svg>
            {/* TODO: owner to verify — language selector is a placeholder until translations ship */}
            <select aria-label="Language" defaultValue="en" title="TODO: owner to verify — translations coming" onChange={() => {}}
              className="bg-transparent text-[13px] text-white/80 focus:outline-none [&>option]:text-[#18123b]">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </footer>
    </div>
  );
}
