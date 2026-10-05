import { useEffect, useRef, useState } from "react";
import audLogo from "../assets/aud-logo.png";
import { AboutPage, PricingPage, ContactPage, FeaturePage, InfoPage, HumanServicesPage, LanguagesPage, CalculatorPage, ChangelogPage, LegalPage, CareersPage, ServicePage, AudiencePage, ListingPage, TeamPage, PressPage, FreelancersPage, PartnersPage, LocationsPage } from "./LandingPages.jsx";
import { NAV_MENUS, BRAND } from "../siteData.js";
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
  const [activeNav, setActiveNav] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [page, setPage] = useState("home"); // home | about | pricing | contact
  const closeTimer = useRef(null);

  const goToSection = (id) => {
    setOpenMenu(null);
    if (page !== "home") {
      setPage("home");
      setTimeout(() => {
        setActiveNav(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToPage = (pg) => {
    setOpenMenu(null);
    setPage(pg);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const menuData = (item) => item.menu || (item.groups ? { groups: item.groups, promo: item.promo, stats: item.stats } : null);

  const goFeature = (slug) => {
    setOpenMenu(null);
    setPage("feat:" + slug);
    window.scrollTo({ top: 0, behavior: "instant" });
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

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#f6f3ed]/95 backdrop-blur border-b border-[#18123b]/[0.06]">
        <div className="max-w-[1400px] mx-auto flex items-center gap-8 px-5 sm:px-8 h-[76px]">
          <button onClick={onStart} className="shrink-0" aria-label="Aud — home">
            <img src={audLogo} alt="Aud" className="h-10 w-auto" draggable={false} />
          </button>

          <nav className="hidden lg:flex items-center gap-7" onMouseLeave={scheduleClose}>
            {NAV.map((item) => (
              <div key={item.label} className="relative" onMouseEnter={() => menuData(item) && openWith(item.label)}>
                <button
                  aria-haspopup={item.menu ? "true" : undefined}
                  aria-expanded={item.menu ? openMenu === item.label : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setOpenMenu(null); }
                    if (e.key === "ArrowDown" && item.menu) { e.preventDefault(); openWith(item.label); }
                  }}
                  onClick={() => (item.label === "About" ? goToPage("about") : item.label === "Pricing" ? goToPage("pricing") : item.menu ? openWith(item.label) : goToSection(item.id))}
                  className={`text-[15px] font-medium transition-colors flex items-center gap-1 ${
                    ((page === 'about' || page === 'team' || page === 'press' || page === 'freelancers' || page === 'partners' || page === 'security') && item.label === 'About') || (page === 'pricing' && item.label === 'Pricing') || (page.startsWith('feat:') && item.label === 'Product') || (page.startsWith('svc:') && item.label === 'Product') || (page.startsWith('info:accuracy') && item.label === 'Features') || (page.startsWith('info:') && !page.startsWith('info:accuracy') && item.label === 'Resources') || ((page === 'human' || page === 'languages' || page === 'calculator' || page === 'changelog' || page === 'legal' || page === 'careers' || page.startsWith('res:')) && item.label === 'Resources') || activeNav === item.id || openMenu === item.label
                      ? "text-[#6415f5]"
                      : "text-[#18123b]/75 hover:text-[#18123b]"
                  }`}
                >
                  {item.label}
                  {menuData(item) && (
                    <svg viewBox="0 0 24 24" className={`w-3 h-3 transition-transform ${openMenu === item.label ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
            <button onClick={onStart} className="hidden sm:block text-[15px] font-medium text-[#18123b]/85 hover:text-[#18123b] transition-colors px-2">
              Log in
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

          {/* ── Mega-menu panel ── */}
          {openMenu && (
            <div
              className="absolute left-0 right-0 top-full z-30 hidden lg:block"
              onMouseEnter={() => openWith(openMenu)}
              onMouseLeave={scheduleClose}
            >
              <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
                <div className="mt-2 rounded-3xl bg-white border border-[#18123b]/10 shadow-2xl shadow-[#18123b]/15 overflow-hidden">
                  {(() => {
                    const item = NAV.find((n) => n.label === openMenu);
                    if (!item || !menuData(item)) return null;
                    return (
                      <div>
                        <div className="grid grid-cols-[1.25fr_340px]">
                          <div className="p-6 border-r border-[#18123b]/[0.07]">
                            <div className={"grid gap-6 " + (menuData(item).groups.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                              {menuData(item).groups.map((group) => (
                                <div key={group.title}>
                                  <p className="text-[10px] font-black tracking-[0.14em] text-[#4b4763]/80 uppercase mb-3">{group.title}</p>
                                  <div className="space-y-1">
                                    {group.items.map((it) => (
                                      <button
                                        key={it.label}
                                        onClick={() => (it.page ? (setOpenMenu(null), setPage(it.page), window.scrollTo({ top: 0, behavior: "instant" })) : it.slug ? goFeature(it.slug) : goToSection(it.target))}
                                        className="w-full flex items-start gap-2.5 text-start rounded-xl p-2 hover:bg-[#6415f5]/[0.06] transition group/link"
                                      >
                                        <span className="min-w-0">
                                          <span className="block text-[13px] font-semibold text-[#18123b] group-hover/link:text-[#6415f5] transition-colors">
                                            {it.label}
                                          </span>
                                          <span className="block text-[11px] text-[#4b4763] leading-snug">{it.desc}</span>
                                        </span>
                                        <span className="ms-auto mt-1 text-[#18123b]/25 group-hover/link:text-[#6415f5] transition-colors">→</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div><div className="relative p-0 min-h-[300px]">
                            {menuData(item).promo.video ? (
                              <video
                                src={menuData(item).promo.video}
                                poster={menuData(item).promo.poster}
                                autoPlay muted loop playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <img src="/videos/hero-woman.jpg" alt="Aud Studio" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#12101f]/95 via-[#12101f]/55 to-transparent" />
                            <div className="relative h-full flex flex-col justify-end p-6 text-white">
                              {menuData(item).promo.kicker && (
                                <p className="text-[9px] font-black tracking-[0.16em] text-[#c4b5fd] uppercase">{menuData(item).promo.kicker}</p>
                              )}
                              <p className="text-[15px] font-bold leading-snug mt-1">{menuData(item).promo.title}</p>
                              <p className="text-[11.5px] text-white/80 mt-1.5 leading-relaxed">{menuData(item).promo.text}</p>
                              <button
                                onClick={onStart}
                                className="mt-4 self-start px-4 py-2 rounded-lg bg-[#6415f5] text-white text-[12px] font-semibold hover:bg-[#5311cf] transition"
                              >
                                {menuData(item).promo.cta}
                              </button>
                            </div>
                          </div>
                        </div>
                        {menuData(item).stats && (
                          <div className="grid grid-cols-4 border-t border-[#18123b]/[0.07] bg-[#f6f3ed]">
                            {menuData(item).stats.map(([n, label]) => (
                              <div key={label} className="py-3.5 text-center border-r border-[#18123b]/[0.05] last:border-r-0">
                                <span className="text-lg font-extrabold text-[#18123b]">{n}</span>
                                <span className="ms-1.5 text-[11px] font-semibold text-[#4b4763]">{label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {page === "about" && <AboutPage onStart={onStart} goTeam={() => goToPage("team")} goSecurity={() => goToPage("security")} />}
      {page === "pricing" && <PricingPage onStart={onStart} />}
      {page === "contact" && <ContactPage />}
      {page.startsWith("feat:") && <FeaturePage slug={page.slice(5)} onStart={onStart} goFeature={goFeature} />}
      {page.startsWith("info:") && <InfoPage slug={page.slice(5)} onStart={onStart} />}
      {page.startsWith("svc:") && <ServicePage slug={page.slice(4)} onStart={onStart} />}
      {page.startsWith("aud:") && <AudiencePage slug={page.slice(4)} />}
      {page.startsWith("res:") && <ListingPage slug={page.slice(4)} onStart={onStart} />}
      {page === "team" && <TeamPage onStart={onStart} />}
      {page === "press" && <PressPage />}
      {page === "freelancers" && <FreelancersPage />}
      {page === "partners" && <PartnersPage />}
      {page === "locations" && <LocationsPage />}
      {page === "human" && <HumanServicesPage onStart={onStart} />}
      {page === "languages" && <LanguagesPage />}
      {page === "calculator" && <CalculatorPage onStart={onStart} />}
      {page === "changelog" && <ChangelogPage />}
      {page === "legal" && <LegalPage />}
      {page === "careers" && <CareersPage />}
      {page === "home" && (
      <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="produit" className="relative scroll-mt-4">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-8 lg:pt-14 pb-14 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div>
            <TypedHeadline />

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

          {/* Right — dark demo card: real footage + a live product walkthrough */}
          <HeroDemo />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="scroll-mt-4 border-t border-[#18123b]/[0.07] bg-white/60">
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

      </>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[#18123b]/10 bg-white/60">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <img src={audLogo} alt="Aud" className="h-9 w-auto mb-4" draggable={false} />
            <p className="text-xs text-[#4b4763] leading-relaxed max-w-[220px]">{BRAND.tagline}</p>
          </div>
          {[
            { title: "Product", links: [
              ["AI Transcription", () => goFeature("ai-transcription")],
              ["Speaker Detection", () => goFeature("speaker-detection")],
              ["AI Translation", () => goFeature("translation")],
              ["Export Center", () => goFeature("share")],
              ["Pricing", () => goToPage("pricing")],
            ]},
            { title: "Features", links: [
              ["Multi-language", () => goFeature("multi-language")],
              ["Smart Editor", () => goFeature("editor")],
              ["Smart Summary", () => goFeature("summary")],
              ["Speaking Statistics", () => goFeature("statistics")],
              ["Link Import", () => goFeature("link-import")],
            ]},
            { title: "Resources", links: [
              ["Help Center", () => goToPage("info:help")],
              ["Blog", () => goToPage("info:blog")],
              ["Tutorials", () => goToPage("info:tutorials")],
              ["Use Cases", () => goToPage("info:cases")],
              ["Pricing Calculator", () => goToPage("calculator")],
            ]},
            { title: "About & Legal", links: [
              ["Company", () => goToPage("about")],
              ["Security & Privacy", () => goToPage("security")],
              ["Human-Verified Services", () => goToPage("human")],
              ["Terms & Privacy", () => goToPage("legal")],
              ["Careers", () => goToPage("careers")],
            ]},
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[10px] font-black tracking-[0.14em] text-[#18123b] uppercase mb-3">{col.title}</p>
              <div className="space-y-2">
                {col.links.map(([label, fn]) => (
                  <button key={label} onClick={fn} className="block text-xs text-[#4b4763] hover:text-[#6415f5] transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#18123b]/10 pt-6">
          <p className="text-xs text-[#4b4763]/70">
            © {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}
          </p>
          <p className="text-xs text-[#4b4763]/70">
            Contact: <a className="font-semibold text-[#6415f5]" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}