import { useState } from "react";
import audLogo from "../assets/aud-logo.png";
import { PLANS, HUMAN_SERVICES, PRICING_FAQ, SUBSCRIPTION_RULES, ALL_LANGUAGES, USE_CASES, BRAND } from "../siteData.js";
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

export function AboutPage({ goHome, onStart, goTeam, goSecurity }) {
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
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <a href="#" onClick={(e) => { e.preventDefault(); window.__goTeam && window.__goTeam(); }} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-6 shadow-sm hover:border-[#6415f5]/40 transition block">
              <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">Meet the team</p>
              <p className="mt-1 font-semibold text-[#18123b]">AI engineering, applied linguistics, architecture & UX</p>
              <p className="mt-1.5 text-sm text-[#4b4763]">The four disciplines behind every transcription.</p>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.__goSecurity && window.__goSecurity(); }} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-6 shadow-sm hover:border-[#6415f5]/40 transition block">
              <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">Security & privacy</p>
              <p className="mt-1 font-semibold text-[#18123b]">SSL/TLS in transit · AES-256 at rest</p>
              <p className="mt-1.5 text-sm text-[#4b4763]">Your files are never used beyond your transcription purpose.</p>
            </a>
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

const PLATFORM_FEATURES = [
  "AI Transcription (audio & video)", "Speaker Detection", "Multi-language (99 languages)",
  "AI Translation", "Smart Summaries", "Speaking Statistics", "Real-time Editor",
  "Export TXT · SRT · DOCX · PDF · JSON · XML", "Read-only Share Links", "Folders & Organization",
  "Link Import (YouTube & more)", "Privacy-first storage",
];

export function PricingPage({ goHome, onStart, goPage }) {
  const [cycle, setCycle] = useState("monthly"); // monthly | annual (annual = 2 months free)
  const [openFaq, setOpenFaq] = useState(null);

  const price = (p) => {
    if (p.monthly === null) return "Custom";
    return "$" + (cycle === "annual" ? p.annual : p.monthly);
  };

  return (
    <div>
      <PageHero
        kicker="Pricing"
        title={<>Pricing Plans For <span style={{ color: PURPLE }}>Every Voice</span></>}
        sub="Subscribe to Aud's AI studio — or order human-verified services per minute. All numbers below are placeholders the owner will finalize."
      />

      {/* rating-style header strip */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 -mt-6 pb-2">
        <p className="text-center text-[13px] font-semibold text-[#4b4763]">
          “The fastest way to turn speech into text — in any language.”
        </p>
      </div>

      {/* cycle toggle */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-8 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-[#18123b]/15 bg-white p-1">
          <button
            onClick={() => setCycle("monthly")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition ${cycle === "monthly" ? "bg-[#6415f5] text-white" : "text-[#4b4763] hover:text-[#18123b]"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("annual")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${cycle === "annual" ? "bg-[#6415f5] text-white" : "text-[#4b4763] hover:text-[#18123b]"}`}
          >
            Annual
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${cycle === "annual" ? "bg-white text-[#6415f5]" : "bg-[#6415f5] text-white"}`}>
              2 months free
            </span>
          </button>
        </div>
      </div>

      {/* plan cards */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-14 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-[26px] p-7 flex flex-col ${
              p.popular
                ? "bg-[#18123b] text-white shadow-2xl shadow-[#6415f5]/30 xl:-my-4 xl:py-11"
                : "bg-white border-[1.5px] border-[#18123b]/10 shadow-sm"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#6415f5] text-white text-[10px] font-black tracking-wide uppercase whitespace-nowrap">
                Most Popular
              </span>
            )}
            <h3 className={`font-semibold text-lg ${p.popular ? "text-white" : "text-[#18123b]"}`}>{p.name}</h3>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className={`text-4xl font-extrabold tracking-tight ${p.popular ? "text-white" : "text-[#18123b]"}`}>
                {price(p)}
              </span>
              {p.monthly !== null && (
                <span className={`text-xs font-semibold ${p.popular ? "text-white/60" : "text-[#4b4763]"}`}>per seat/month</span>
              )}
            </div>
            {cycle === "annual" && p.monthly !== null && p.monthly > 0 && (
              <p className={`mt-1 text-[11px] font-semibold ${p.popular ? "text-emerald-300" : "text-emerald-500"}`}>
                2 months free · ${(p.annual * 12).toFixed(2)} billed annually
              </p>
            )}
            <ul className="mt-6 space-y-2.5 flex-1">
              {[
                [`${p.minutes} AI transcription minutes / month`],
                [`Max file length: ${p.maxLen}`],
                [`Languages: ${p.langs}`],
                [`Speaker detection: ${p.speakers}`],
                [`AI translation: ${p.translation}`],
                [`Exports: ${p.exports.join(", ")}`],
                [`Transcript editor: ${p.editor}`],
                [`Human-verified discount: ${p.humanDiscount}`],
                [`Team seats: ${p.seats}`],
                [`Support: ${p.support}`],
                [`API access: ${p.api ? "Yes" : "No"}`],
              ].map(([row]) => (
                <li key={row} className={`flex items-start gap-2 text-[13px] ${p.popular ? "text-white/90" : "text-[#4b4763]"}`}>
                  <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${p.popular ? "bg-white/20 text-white" : "bg-[#6415f5]/[0.08] text-[#6415f5]"}`}>✓</span>
                  {row}
                </li>
              ))}
            </ul>
            <button
              onClick={p.id === "free" ? onStart : undefined}
              className={`mt-7 w-full py-3 rounded-xl font-bold transition ${
                p.popular
                  ? "bg-[#6415f5] text-white hover:bg-[#5311cf] shadow-lg shadow-[#6415f5]/30"
                  : "bg-[#6415f5]/[0.08] text-[#6415f5] border border-[#6415f5]/30 hover:bg-[#6415f5] hover:text-white"
              }`}
            >
              {p.id === "business" ? "Talk To A Specialist" : p.id === "free" ? "Get Started" : "Get Started"}
            </button>
            {p.id === "business" && (
              <p className="mt-2 text-center text-[11px] text-[#4b4763]">
                Write to <a className="font-bold text-[#6415f5]" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* subscription rules */}
      <p className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10 text-center text-[11px] text-[#4b4763]">
        {SUBSCRIPTION_RULES}
      </p>

      {/* comparison table */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-14">
        <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-[#18123b] mb-6">Compare Our Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr>
                  <th className="text-start py-3 px-4 font-black text-[#18123b]">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className={`py-3 px-4 font-black ${p.popular ? "text-[#6415f5]" : "text-[#18123b]"}`}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI transcription minutes / month", "minutes"],
                  ["Max file length", "maxLen"],
                  ["Languages", "langs"],
                  ["Speaker detection", "speakers"],
                  ["AI translation", "translation"],
                  ["Transcript editor", "editor"],
                  ["Human-verified discount", "humanDiscount"],
                  ["Team seats", "seats"],
                  ["Support", "support"],
                  ["API access", "apiText"],
                ].map(([label, key]) => (
                  <tr key={key} className="border-t border-[#18123b]/[0.07]">
                    <td className="py-3 px-4 text-[#4b4763]">{label}</td>
                    {PLANS.map((p) => {
                      const val = key === "apiText" ? (p.api ? "Yes" : "No") : p[key];
                      return <td key={p.id} className="py-3 px-4 text-center text-[#18123b] font-medium">{val}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* human-verified services price list */}
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-14">
        <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-[#18123b]">Human-Verified Services</h2>
          <p className="text-sm text-[#4b4763] mt-2 mb-6">
            Per-minute add-on available with any plan — a professional reviews the AI output.
          </p>
          <div className="divide-y divide-[#18123b]/[0.07]">
            {HUMAN_SERVICES.map((svc) => (
              <div key={svc.name} className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#18123b] text-sm">{svc.name}</p>
                  <p className="text-xs text-[#4b4763] mt-0.5">{svc.desc}</p>
                </div>
                <div className="text-end">
                  <span className="text-lg font-extrabold text-[#6415f5]">{svc.price}</span>
                  <span className="block text-[10px] text-[#4b4763]">{svc.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-[#4b4763]">
            Prices are placeholders — the owner finalizes them based on real reviewer and API costs.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-3xl font-semibold text-[#18123b] text-center">Subscription FAQ</h2>
        <div className="mt-8 space-y-3">
          {PRICING_FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 font-semibold text-[#18123b] text-start"
              >
                {item.q}
                <span className={`shrink-0 w-7 h-7 rounded-full border border-[#18123b]/15 flex items-center justify-center text-[#18123b]/60 ${openFaq === i ? "rotate-45 border-[#6415f5] text-[#6415f5]" : ""} transition-transform`}>+</span>
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
    lead: "Acoustic models optimized for Modern Standard Arabic, Maghrebi dialects and Algerian local phrasing — with smooth code-switching between Arabic, French and English, even in noisy field recordings.",
    sections: [
      { h: "Dialect-aware acoustic models", p: "The engine was tuned on Maghrebi and Levantine speech patterns alongside Modern Standard Arabic — Algerian local phrasing is understood as speech, not mangled into textbook Arabic." },
      { h: "Code-switching, handled", p: "Real conversations flip between Arabic and French or English mid-sentence. The models track the switches and write each language in its native script." },
      { h: "Deep-learning noise filters", p: "Low-quality recordings pass through learned filtering layers before recognition — background hum, distant chatter and phone-line artifacts are reduced, not transcribed." },
      { h: "Word-level verification", p: "Every word carries its own timestamp and confidence, so you can verify any claim against the audio in one click." },
    ],
    steps: [
      ["Upload or paste a link", "Drop a file, record your microphone, or paste a YouTube URL — Aud handles the rest."],
      ["AI listens and writes", "Whisper-grade speech recognition writes every word with word-level timestamps."],
      ["Review and keep", "Fix anything in the editor, then export or share your transcript forever."],
    ],
    whyTitle: "What makes it different",
    why: [["Whisper-grade accuracy", "Built on speech-recognition models trained on millions of hours — Arabic, French, English and 96 more languages."], ["Word-level timestamps", "Every word knows exactly when it was spoken, so the text and the playback stay locked together."], ["Built for real-world audio", "Accents, crosstalk and background hum are its daily bread — imperfect recordings are the norm, not the exception."], ["AI drafts, you decide", "The transcript is a first draft, not a verdict — correct any word in place and the correction saves itself."]],
    facts: [["99", "languages"], ["10+", "export formats"], ["±0.2s", "word sync"], ["$0", "forever"]],
  },
  "speaker-detection": {
    kicker: "Speaker Detection",
    title: "Know Who Said What, When",
    video: "/videos/feat-speakers.mp4",
    poster: "/videos/feat-speakers.jpg",
    lead: "An automated voice-separation algorithm built for multi-speaker interviews and focus groups — custom labeling, color coding and timeline distribution for every speaker.",
    sections: [
      { h: "Voice-separation algorithm", p: "Voice-print clustering isolates each speaker from the raw waveform — interviews, focus groups and panel discussions become clean, labeled turns without manual work." },
      { h: "Custom labels & colors", p: "Rename speakers to real names, assign any color, and the entire transcript, exports and share pages adopt your choices instantly." },
      { h: "Timeline distribution", p: "See the speaking timeline distributed across the conversation — who opened, who answered, who dominated the room." },
    ],
    steps: [
      ["Voices are separated", "Voice-print clustering tells the speakers apart — no training needed."],
      ["Every line is labeled", "Each paragraph carries the name of the person speaking it."],
      ["You stay in control", "Rename speakers, merge turns, pick any color — the whole transcript follows."],
    ],
    whyTitle: "Voices, untangled",
    why: [["Voice-print clustering", "Speakers are separated by how they actually sound — no training recordings, no setup, no guesswork."], ["Rename once, apply everywhere", "Turn “Speaker 2” into “Sarah” and every line, export and share page updates instantly."], ["Turns, not walls of text", "The transcript reads like a script — one turn per speaker, automatically merged when they continue."], ["Colors as identity", "Pick any color per speaker and the whole document color-codes itself around your choice."]],
    facts: [["12", "max speakers"], ["0.5s", "turn sensitivity"], ["∞", "color choice"], ["1", "click rename"]],
  },
  "multi-language": {
    kicker: "Multi-language",
    title: "99 Languages. One Studio.",
    video: "/videos/feat-multilang.mp4",
    poster: "/videos/feat-multilang.jpg",
    lead: "99 languages in one studio — pick several at once for mixed recordings, translate the result in one click, and let auto-detect do the guessing for you.",
    steps: [
      ["Pick your languages", "One language for precision — or up to as many as you like for mixed recordings."],
      ["Every pass is transcribed", "Each chosen language gets its own full pass through the AI."],
      ["The best parts win", "Aud keeps the most confident segment of every passage — bilingual recordings finally work."],
    ],
    whyTitle: "One studio, every language",
    why: [["99 languages, native scripts", "From Arabic to Zulu — each language is transcribed in its own script, not transliterated."], ["Mix languages in one recording", "French-Arabic conversations, English-Spanish meetings: multiple passes plus a confidence merge keep the best of each."], ["Code-switching friendly", "Speakers who flip languages mid-sentence finally get a transcript that follows them."], ["Translate after transcribing", "Turn the finished transcript into another language in one click — speakers and timestamps survive."]],
    facts: [["99", "languages"], ["3+", "at once"], ["Auto", "detection"], ["1-click", "translation"]],
  },
  "editor": {
    kicker: "Real-time Editor",
    title: "Fix While You Listen",
    video: "/videos/feat-editor.mp4",
    poster: "/videos/feat-editor.jpg",
    lead: "A synchronized audio-text playback player with click-to-play timeline adjustment, inline text correction and instant search — edit any word and the change syncs to the exact timestamp.",
    sections: [
      { h: "Synchronized playback player", p: "The audio player and the transcript are one surface: the highlight follows the voice, and clicking any word repositions the audio to that exact moment." },
      { h: "Click-to-play timeline", p: "Adjust the playhead by clicking the text or scrubbing the player — the mapping between text and audio is word-accurate." },
      { h: "Inline correction & instant search", p: "Correct any word inline while listening, then search the whole transcript instantly — results jump straight into context." },
    ],
    steps: [
      ["Click anywhere to type", "The caret lands exactly where you clicked — even mid-word."],
      ["Enter splits with its own time", "Everything after the caret becomes a new paragraph with its own timestamp."],
      ["Everything saves itself", "No save button — your corrections are stored as you type."],
    ],
    whyTitle: "An editor that listens with you",
    why: [["Click becomes caret", "Place the caret anywhere — even mid-word — and the playhead jumps to that exact moment."], ["Enter splits intelligently", "Everything after the caret becomes a new paragraph with its own timestamp. Nothing is lost."], ["Merge without mess", "Pull paragraphs back together and the timeline stitches itself behind the scenes."], ["Autosave always", "Every keystroke is stored as it happens — refresh, close the tab, come back tomorrow."]],
    facts: [["Word", "caret precision"], ["Auto", "save"], ["∞", "undo history"], ["RTL", "native"]],
  },
  "translation": {
    kicker: "AI Translation",
    title: "Your Transcript, Any Language",
    video: "/videos/hero-man.mp4",
    poster: "/videos/hero-man.jpg",
    lead: "A multilingual neural cross-translation engine: Arabic ↔ French ↔ English with context-aware vocabulary that adapts to academic, legal and media terminology.",
    sections: [
      { h: "Neural cross-translation", p: "The engine translates between Arabic, French and English with full awareness of direction and register — the output reads like it was written in the target language, not machine-mapped." },
      { h: "Context-aware vocabulary", p: "Academic, legal and media terminology is preserved: technical terms keep their established translations instead of being paraphrased away." },
      { h: "Nothing is lost in the switch", p: "Speaker labels, paragraph order and timestamps survive the translation. The original stays intact — flip between versions at any moment." },
    ],
    steps: [
      ["Finish your transcript", "Correct it until it is exactly right."],
      ["Choose a language", "The AI translation panel rewrites every segment."],
      ["Compare side by side", "The original stays intact — switch back at any moment."],
    ],
    whyTitle: "Translate without losing anything",
    why: [["Line-by-line fidelity", "Speakers, paragraph order and timestamps survive the translation — it stays a transcript."], ["The original is sacred", "Nothing is overwritten — flip between original and translation in one click, any time."], ["99 directions", "Translate into any language the studio understands, in both directions."], ["Translations are shareable", "Export or share-link a translated version exactly like the original."]],
    facts: [["99", "directions"], ["1", "click"], ["100%", "labels kept"], ["Instant", "switching"]],
  },
  "summary": {
    kicker: "Smart Summary",
    title: "Key Points, Auto-Generated",
    video: "/videos/feat-summary.mp4",
    poster: "/videos/feat-summary.jpg",
    lead: "The AI reads your whole transcript and writes a clean, structured summary: the key points first, then the decisions and actions that follow.",
    steps: [
      ["One click", "No prompts to write — Aud reads the transcript and summarizes it."],
      ["Structured output", "Key points, then decisions and actions — ready to share."],
      ["Download it", "Take the summary with you as a .txt file."],
    ],
    whyTitle: "The gist, written for you",
    why: [["No prompts to write", "The summary builds itself from the transcript — there is nothing to configure."], ["Structured output", "Key points first, then the decisions and actions that follow from them."], ["Regenerate any time", "Not the angle you wanted? One click rewrites it from the same transcript."], ["Take it with you", "Download the summary as a .txt file and paste it anywhere."]],
    facts: [["1", "click"], ["Whole", "transcript"], ["∞", "regenerations"], [".txt", "export"]],
  },
  "ask": {
    kicker: "Ask Your Transcript",
    title: "Ask. Get Answers With Timestamps.",
    video: "/videos/feat-ask.mp4",
    poster: "/videos/feat-ask.jpg",
    lead: "Type a natural-language question about your recording — Aud answers from its content alone, citing the exact moments every claim came from.",
    steps: [
      ["Ask in your own words", "No special syntax — the AI understands natural questions."],
      ["Answers with citations", "Every answer carries clickable timestamps into the audio."],
      ["Verify in one click", "Play the cited moment and confirm with your own ears."],
    ],
    whyTitle: "Ask your recording anything",
    why: [["Natural questions", "No keywords or special syntax — ask exactly like you would ask a person."], ["Answers with citations", "Every answer carries clickable timestamps that play the exact moment."], ["Grounded, never creative", "The AI answers only from your transcript — it cannot invent what was never said."], ["Unlimited questions", "Ask ten questions or a hundred — the feature is free like everything else."]],
    facts: [["1-click", "citations"], ["Grounded", "answers"], ["∞", "questions"], ["Any", "language"]],
  },
  "statistics": {
    kicker: "Speaking Statistics",
    title: "Time, Pace, Participation",
    video: "/videos/feat-stats.mp4",
    poster: "/videos/feat-stats.mp4.jpg".replace(".mp4.jpg", ".mp4"),
    lead: "Talking time, pace and participation per speaker — the anatomy of any meeting or interview, generated automatically after every transcription.",
    steps: [
      ["Transcribe as usual", "The statistics build themselves from the words and speakers."],
      ["See the balance", "Talking time per speaker, pace and participation at a glance."],
      ["Spot what matters", "Who is missing from the conversation — and who never stops."],
    ],
    whyTitle: "The anatomy of your conversation",
    why: [["Talking time per speaker", "Who dominated the room, measured in seconds — not impressions."], ["Pace and volume of words", "How fast each person speaks and how much they actually said."], ["Participation balance", "See who is missing from the conversation before the meeting ends."], ["Built automatically", "Zero configuration — the statistics appear after every transcription."]],
    facts: [["Per", "speaker"], ["Auto", "built"], ["1", "glance"], ["Diarized", "files"]],
  },
  "link-import": {
    kicker: "Link Import",
    title: "Paste A Link. Get A Transcript.",
    video: "/videos/feat-linkimport.mp4",
    poster: "/videos/feat-linkimport.jpg",
    lead: "YouTube videos and direct MP4 or MP3 links — paste the URL and Aud fetches the media into your own account, then runs the full transcription pipeline.",
    steps: [
      ["Paste the link", "A YouTube video or a direct media URL — nothing to download on your side."],
      ["Aud fetches the media", "The studio downloads it to your account, even from the cloud."],
      ["The normal pipeline runs", "Transcription, speakers and export — exactly like an uploaded file."],
    ],
    whyTitle: "Your link is the upload",
    why: [["YouTube supported", "Paste a video URL and the studio fetches the media itself — no downloader on your side."], ["Direct media links too", "Any MP4 or MP3 URL on the web works as an upload."], ["It lands in YOUR account", "The file is stored in your own archive — never on a third-party site."], ["Then everything follows", "Transcription, speakers, summary and export — exactly like a normal upload."]],
    facts: [["YouTube", "supported"], ["MP4+MP3", "links"], ["Background", "fetch"], ["Per", "account"]],
  },
  "share": {
    kicker: "Share & Export",
    title: "Share Links. Export Everything.",
    video: "/videos/feat-share.mp4",
    poster: "/videos/feat-share.jpg",
    lead: "A complete export suite: Microsoft Word (.docx) documents, PDF reports, plain text (.txt) and SubRip subtitle files (.srt) with precise timecodes — plus read-only share links with built-in playback.",
    sections: [
      { h: "Document exports", p: "Word (.docx) and PDF reports carry speaker labels and formatting — ready for archives, theses and legal files." },
      { h: "Text & subtitle exports", p: "Plain .txt for any workflow, and .srt subtitle files with precise timecodes that drop straight into your video editor." },
      { h: "Developer exports", p: "JSON and XML structures with full word-level timing for pipelines, search indexes and integrations." },
    ],
    steps: [
      ["Create a share link", "Read-only, with playback — your audience never touches your account."],
      ["Export in your format", "Six formats for every workflow, with full timestamps."],
      ["Keep it organized", "Folders, custom names and a searchable archive."],
    ],
    whyTitle: "Your transcript, ready for the world",
    why: [["Read-only share pages", "A link with built-in playback — your audience reads and listens without touching your account."], ["Six export formats", "TXT for notes, SRT for subtitles, DOCX for documents, PDF for records, JSON and XML for developers."], ["Folders and custom names", "Keep dozens of transcripts organized like real files in real folders."], ["Everything searchable", "Find any word across your entire archive in one search."]],
    facts: [["6", "formats"], ["Read", "only"], ["Folders", "+ names"], ["Full", "search"]],
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

      {f.sections && (
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10 space-y-5">
          {f.sections.map((sec) => (
            <div key={sec.h} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8">
              <h2 className="text-xl font-semibold text-[#18123b]">{sec.h}</h2>
              <p className="mt-3 text-[15px] text-[#4b4763] leading-[1.75]">{sec.p}</p>
            </div>
          ))}
        </div>
      )}

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
          <h2 className="text-2xl font-semibold text-white">{f.whyTitle}</h2>
          <div className="mt-7 grid sm:grid-cols-2 gap-4">
            {f.why.map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/[0.06] border border-white/10 p-5">
                <p className="font-semibold text-white text-[15px]">{t}</p>
                <p className="mt-1.5 text-[13px] text-white/70 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {f.facts.map(([n, label]) => (
              <div key={label} className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-center">
                <p className="text-lg font-extrabold text-white leading-tight">{n}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{label}</p>
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


/* ─────────────────── INFO PAGES (Resources & Features deep-dives) ─────────────────── */

export const INFO_PAGES = {
  "apps": {
    kicker: "Supported Applications",
    title: "One Platform, Every Screen",
    lead: "Aud meets you wherever you work: a full web application, mobile recording on the go, and an API that brings transcription into your own products.",
    video: "/videos/feat-linkimport.mp4",
    poster: "/videos/feat-linkimport.jpg",
    sections: [
      { h: "The web application", p: "The complete studio in your browser — upload, transcribe, edit with word-level precision, organize into folders, translate, summarize and export. Nothing to install; it runs on any modern browser on Windows, macOS, Linux, Android and iOS." },
      { h: "Mobile recording", p: "Record lectures, interviews and meetings directly from your phone. The recording uploads to your account the moment you stop, and the transcription pipeline starts by itself — your phone never needs the heavy tools." },
      { h: "API for developers & companies", p: "An Application Programming Interface lets developers and organizations plug Aud's transcription engine into their own products: send audio, receive structured, timestamped, speaker-labeled text. Ideal for newsrooms, research platforms and legal software." },
    ],
    steps: [
      ["Open the web app", "Everything runs in the browser — the full studio, no installation."],
      ["Record from mobile", "Your phone becomes a professional recorder wired to your account."],
      ["Integrate via API", "Developers connect their own apps to the same engine."],
    ],
    facts: [["Web", "app"], ["Mobile", "recording"], ["API", "access"], ["5", "platforms"]],
  },
  "accuracy": {
    kicker: "High Accuracy & Speed",
    title: "An Hour Of Audio, Under Three Minutes",
    lead: "Numbers first: Aud processes a full one-hour recording in under 3 minutes at over 98% accuracy — powered by state-of-the-art deep-learning speech models.",
    video: "/videos/hero-woman.mp4",
    poster: "/videos/hero-woman.jpg",
    sections: [
      { h: "98%+ accuracy", p: "The underlying models are trained on millions of hours of real speech — including noisy, overlapping and accented audio. Word-level confidence scores let you see exactly which words the AI is sure about." },
      { h: "40× real-time speed", p: "The GPU-backed engine processes an hour-long file in under three minutes. Chunked processing means the first text appears while the rest is still being transcribed." },
      { h: "Speed without shortcuts", p: "Chunking preserves timestamps across the whole file, so fast output never breaks the word-to-audio alignment you rely on when editing." },
    ],
    steps: [
      ["Upload", "Any size, any length — up to 2 GB per file."],
      ["Process", "40× faster than real time on GPU infrastructure."],
      ["Verify", "Word-level confidence and instant playback checking."],
    ],
    facts: [["<3 min", "per hour"], ["98%+", "accuracy"], ["40×", "real-time"], ["2 GB", "max file"]],
  },
  "dialects": {
    kicker: "Difficult Dialects & Noise",
    title: "Built For Imperfect Audio",
    lead: "Real recordings are messy: street noise, echoey rooms, people talking over each other. Aud's audio-enhancement technologies are designed for exactly that.",
    video: "/videos/feat-multilang.mp4",
    poster: "/videos/feat-multilang.jpg",
    sections: [
      { h: "Dialects & regional speech", p: "The models were exposed to Maghrebi and Levantine dialects alongside Modern Standard Arabic — Algerian, Tunisian, Moroccan, Syrian and Levantine speech patterns are understood, not mangled into textbook Arabic." },
      { h: "Noise, echo & overlap", p: "Audio-enhancement preprocessing reduces background hum, room echo and steady noise before recognition. Overlapping speakers are handled by the diarization layer, which splits simultaneous voices into separate labeled tracks." },
      { h: "Imperfect is the default", p: "Field recordings, phone calls, lecture halls with reverb — these are the recordings researchers and journalists actually have. Aud treats them as the normal case, not the exception." },
    ],
    steps: [
      ["Enhance", "Noise and echo reduction run before recognition."],
      ["Separate", "Overlapping speakers are split into labeled tracks."],
      ["Recognize", "Dialect-aware models write what was actually said."],
    ],
    facts: [["MSA+3", "dialect families"], ["Noise", "reduction"], ["Overlap", "separation"], ["Field", "ready"]],
  },
  "help": {
    kicker: "Help Center & User Guide",
    title: "Every Step, Illustrated",
    lead: "Step-by-step guides covering the whole journey: creating your account, uploading files of any size, transcribing, correcting, translating, exporting and sharing.",
    video: "/videos/feat-ask.mp4",
    poster: "/videos/feat-ask.jpg",
    sections: [
      { h: "Getting started", p: "Create your account with just a name, email and password. The first transcription takes under a minute: pick a file, choose a language or leave auto-detect, and press start." },
      { h: "Uploading files of any size", p: "Drag and drop or browse — files up to 2 GB. Large files upload in 5 MB chunks with automatic resume, and the archive keeps every version organized in folders you name." },
      { h: "Exporting and sharing", p: "When the transcript is ready: export to Word, PDF, TXT or SRT subtitles — or create a read-only share link with built-in playback for your audience." },
    ],
    steps: [
      ["Create", "Name, email, password — done in 30 seconds."],
      ["Upload & transcribe", "Files, links or live recording."],
      ["Export & share", "Six formats and read-only links."],
    ],
    facts: [["3", "quick steps"], ["2 GB", "per file"], ["6", "formats"], ["24/7", "guides"]],
  },
  "blog": {
    kicker: "Platform Blog",
    title: "Words About Words",
    lead: "Periodic articles and specialized topics covering linguistics, artificial intelligence, speech-recognition technology and the latest developments in Natural Language Processing.",
    video: "/videos/feat-summary.mp4",
    poster: "/videos/feat-summary.jpg",
    sections: [
      { h: "Linguistics & dialects", p: "Why Maghrebi Arabic breaks standard models, how code-switching actually works in the brain, and what that means for speech technology in North Africa." },
      { h: "AI & speech recognition", p: "How Whisper-class models are trained, what word-level timestamps really measure, and where the next accuracy jump will come from." },
      { h: "NLP developments", p: "From summarization to translation quality — what large language models can and cannot do for the written word, explained without hype." },
    ],
    steps: [
      ["Read", "Deep dives written in plain language."],
      ["Learn", "The technology behind every feature."],
      ["Stay current", "New articles as the field moves."],
    ],
    facts: [["3", "topic pillars"], ["Plain", "language"], ["No", "hype"], ["Free", "reading"]],
  },
  "tutorials": {
    kicker: "Tutorial Video Lessons",
    title: "Watch. Learn. Master.",
    lead: "A visual library of short, focused videos explaining the advanced platform features and how to leverage every control-panel tool efficiently.",
    video: "/videos/feat-stats.mp4",
    poster: "/videos/feat-stats.mp4.jpg".replace(".mp4.jpg", ".mp4"),
    sections: [
      { h: "Feature walkthroughs", p: "Two-minute videos on single features: speaker renaming, paragraph splitting, folder organization, share links — each one focused and complete." },
      { h: "Advanced workflows", p: "Combining tools: multi-language passes for mixed interviews, translation for bilingual publishing, statistics for meeting facilitation." },
      { h: "Control panel mastery", p: "The archive, folders, custom names and the sync nudge — the small tools that turn a good transcript into a perfect one." },
    ],
    steps: [
      ["Watch", "Short, focused, no filler."],
      ["Practice", "Follow along in your own studio."],
      ["Master", "Every tool, explained."],
    ],
    facts: [["2 min", "per lesson"], ["Every", "feature"], ["Free", "access"], ["More", "coming"]],
  },
  "cases": {
    kicker: "Case Studies & Examples",
    title: "How People Use Aud",
    lead: "Practical examples and success stories showing the platform at work in scientific research, journalism and content creation.",
    video: "/videos/feat-speakers.mp4",
    poster: "/videos/feat-speakers.jpg",
    sections: [
      { h: "Scientific research", p: "Field interviews transcribed and speaker-labeled in minutes — qualitative researchers code their data directly in the editor instead of paying for manual transcription or losing weeks to it." },
      { h: "Journalism", p: "Broadcast and TV interviews become searchable text with exact timestamps — every quote verifiable by playing the cited second, every deadline met." },
      { h: "Content creation", p: "Podcasters and YouTubers turn episodes into articles, subtitles and social snippets from one transcript — one recording, five outputs." },
    ],
    steps: [
      ["Researchers", "Interviews coded in the editor, not on paper."],
      ["Journalists", "Quotes verified to the second."],
      ["Creators", "One episode, many formats."],
    ],
    facts: [["Research", "coded faster"], ["Press", "on deadline"], ["Creators", "5 outputs"], ["All", "free"]],
  },
  "security": {
    kicker: "Security & Privacy",
    title: "Your Words, Locked Down",
    lead: "Clear legal and technical commitments about your data: confidentiality, encryption in transit and at rest, and strict non-usage of files outside your transcription purpose.",
    video: "/videos/hero-man.mp4",
    poster: "/videos/hero-man.jpg",
    sections: [
      { h: "Encrypted everywhere", p: "Audio files and transcripts are encrypted in transit (HTTPS/TLS) and at rest in storage. Access requires authenticated tokens — nothing is public unless you create a share link." },
      { h: "Never used against you", p: "Your recordings and transcripts are processed solely for your transcription purpose. They are never sold, never shared, and never used to train third-party models." },
      { h: "You control deletion", p: "Delete a session and its audio, transcript and metadata are removed from the active storage. Bulk deletion works the same way — your archive is yours to erase." },
    ],
    steps: [
      ["Encrypted transit", "HTTPS/TLS on every request."],
      ["Encrypted storage", "Authenticated access only."],
      ["Your deletion rules", "Single or bulk — honored completely."],
    ],
    facts: [["TLS", "in transit"], ["Encrypted", "at rest"], ["0", "third-party use"], ["You", "control deletion"]],
  },
  "team": {
    kicker: "Meet the Team",
    title: "The People Behind Aud",
    lead: "Experts in artificial intelligence engineering, applied linguistics, software architecture and user experience — building the studio they use themselves.",
    video: "/videos/feat-team.mp4",
    poster: "/videos/feat-team.jpg",
    sections: [
      { h: "AI engineering", p: "Speech-recognition pipelines, model selection and the word-timing engine — engineered for North-African dialects first, then the world." },
      { h: "Applied linguistics", p: "How people actually speak — code-switching, dialect mixing and regional phrasing — informs every correction and model choice." },
      { h: "Software architecture & UX", p: "A free-tier cloud service that survives restarts, scales to hour-long files and still feels like a word processor." },
    ],
    steps: [
      ["Founder-led", "Hamza Karmi — founder, engineer and the studio's first user."],
      ["Four disciplines", "AI, linguistics, architecture and UX in one loop."],
      ["User-shaped", "Every feature starts from a real transcription need."],
    ],
    facts: [["4", "disciplines"], ["1", "mission"], ["99", "languages"], ["Free", "for all"]],
  },
  "security": {
    kicker: "Security, Compliance & Privacy",
    title: "End-To-End, Locked Down",
    lead: "SSL/TLS encryption in transit, AES-256 at rest, and strict data-governance policies: your audio files are never used for third-party model training without consent.",
    video: "/videos/hero-man.mp4",
    poster: "/videos/hero-man.jpg",
    sections: [
      { h: "Encryption protocols", p: "Every request travels over SSL/TLS, and stored audio plus transcripts are protected by AES-256 encryption at rest — the same standard used by financial institutions." },
      { h: "Strict data governance", p: "User audio files are processed solely for the transcription you requested. No resale, no advertising use, and no third-party model training without explicit consent." },
      { h: "Authenticated access only", p: "Accounts are token-protected and isolated per user — one account can never read another's transcripts, and share links are read-only by design." },
    ],
    steps: [
      ["In transit", "SSL/TLS on every request, no exceptions."],
      ["At rest", "AES-256 encrypted storage."],
      ["Governed", "Your data, your deletion, your control."],
    ],
    facts: [["SSL/TLS", "in transit"], ["AES-256", "at rest"], ["0", "third-party training"], ["Isolated", "per account"]],
  },
};

export function InfoPage({ slug, onStart }) {
  const f = INFO_PAGES[slug];
  if (!f) return null;
  const keys = Object.keys(INFO_PAGES).filter((k) => k !== slug).slice(0, 4);
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

      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-10 space-y-5">
        {f.sections.map((sec) => (
          <div key={sec.h} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8">
            <h2 className="text-xl font-semibold text-[#18123b]">{sec.h}</h2>
            <p className="mt-3 text-[15px] text-[#4b4763] leading-[1.75]">{sec.p}</p>
          </div>
        ))}
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <div className="rounded-[26px] bg-[#18123b] p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-white">The essentials</h2>
          <div className="mt-7 grid sm:grid-cols-3 gap-5">
            {f.steps.map(([t, d], i) => (
              <div key={t} className="relative rounded-2xl bg-white/[0.06] border border-white/10 p-6">
                <span className="absolute -top-4 left-5 w-9 h-9 rounded-xl bg-[#6415f5] text-white font-extrabold flex items-center justify-center shadow-md">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-white">{t}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {f.facts.map(([n, label]) => (
              <div key={label} className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-center">
                <p className="text-lg font-extrabold text-white leading-tight">{n}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{label}</p>
              </div>
            ))}
          </div>
          <button onClick={onStart} className="mt-8 px-6 py-3 rounded-xl bg-white text-[#18123b] font-semibold hover:bg-slate-100 transition shadow-xl">
            Start transcribing free
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-xl font-semibold text-[#18123b] mb-5">Keep exploring</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {keys.map((k) => (
            <div key={k} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-5 shadow-sm">
              <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{INFO_PAGES[k].kicker}</p>
              <p className="mt-1 font-semibold text-[#18123b]">{INFO_PAGES[k].title}</p>
              <img src={INFO_PAGES[k].poster} alt="" className="mt-3 w-full h-24 object-cover rounded-xl" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ─────── DATA-DRIVEN PAGES (human / languages / calculator / changelog / legal / careers) ─────── */

export function HumanServicesPage({ onStart }) {
  return (
    <div>
      <PageHero
        kicker="Human-Verified Services"
        title={<>When It Matters, <span style={{ color: PURPLE }}>A Human Checks It.</span></>}
        sub="Add professional human review to any plan — per minute, on demand. A specialist corrects, verifies and signs off the AI output."
      />
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10 grid md:grid-cols-2 gap-5">
        {HUMAN_SERVICES.map((svc) => (
          <div key={svc.name} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-[#18123b] text-lg pr-4">{svc.name}</h3>
              <div className="text-end shrink-0">
                <span className="text-2xl font-extrabold text-[#6415f5]">{svc.price}</span>
                <span className="block text-[10px] text-[#4b4763]">{svc.unit}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-[#4b4763] leading-relaxed">{svc.desc}</p>
          </div>
        ))}
      </div>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-[26px] bg-[#18123b] p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-white">How it works</h2>
          <div className="mt-7 grid sm:grid-cols-3 gap-5">
            {[
              ["Order", "Pick the service and send your transcript or recording from the studio."],
              ["A specialist works", "A professional reviewer or translator checks the output against the audio."],
              ["Verified delivery", "You receive the human-signed version — ready for courts, publishers and archives."],
            ].map(([t, d], i) => (
              <div key={t} className="relative rounded-2xl bg-white/[0.06] border border-white/10 p-6">
                <span className="absolute -top-4 left-5 w-9 h-9 rounded-xl bg-[#6415f5] text-white font-extrabold flex items-center justify-center shadow-md">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-white">{t}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[12px] text-white/60">
            Order by email: <a className="font-bold text-white underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function LanguagesPage() {
  return (
    <div>
      <PageHero
        kicker="Supported Languages"
        title={<><span style={{ color: PURPLE }}>99 Languages</span>, One Studio</>}
        sub="Every language below is supported for transcription. Translation follows the same list — and auto-detect picks the language for you."
      />
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          {ALL_LANGUAGES.map((l) => (
            <div key={l.value} className="flex items-center gap-2.5 py-1.5 border-b border-[#18123b]/[0.05]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6415f5]" />
              <span className="text-sm text-[#18123b]">{l.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-[#4b4763]">
          Mixed recordings? Select several languages in the studio — every language gets its own pass.
        </p>
      </div>
    </div>
  );
}

export function CalculatorPage({ onStart }) {
  const [minutes, setMinutes] = useState(120);
  const [planId, setPlan] = useState("starter");
  const [humanMinutes, setHumanMinutes] = useState(0);
  const plan = PLANS.find((p) => p.id === planId);
  const monthly = plan.monthly === null ? null : plan.monthly;
  const humanCost = humanMinutes * 1.0;
  const quota = parseInt(String(plan.minutes).replace(/[^0-9]/g, "") || "0", 10);
  const over = Math.max(0, minutes - quota);
  return (
    <div>
      <PageHero
        kicker="Pricing Calculator"
        title={<>See Exactly What You'd <span style={{ color: PURPLE }}>Pay</span></>}
        sub="Move the sliders — the estimate updates live. All plan prices are placeholders the owner will finalize."
      />
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-[26px] bg-white border-[1.5px] border-[#6415f5]/30 shadow-xl shadow-[#6415f5]/10 p-8">
          <label className="block text-xs font-bold text-slate-700 mb-2">Minutes you transcribe per month: <span className="text-[#6415f5]">{minutes}</span></label>
          <input type="range" min={10} max={2400} step={10} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-full accent-[#6415f5]" />
          <label className="block text-xs font-bold text-slate-700 mt-6 mb-2">Plan</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition ${plan === p.id ? "bg-[#6415f5] text-white border-[#6415f5]" : "border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <label className="block text-xs font-bold text-slate-700 mt-6 mb-2">Human-verified review minutes: <span className="text-[#6415f5]">{humanMinutes}</span></label>
          <input type="range" min={0} max={600} step={10} value={humanMinutes} onChange={(e) => setHumanMinutes(Number(e.target.value))} className="w-full accent-[#6415f5]" />

          <div className="mt-8 rounded-2xl bg-[#f6f3ed] border border-[#18123b]/10 p-6">
            <div className="flex flex-wrap justify-between gap-3 text-sm">
              <span className="text-[#4b4763]">{plan.name} plan (monthly)</span>
              <span className="font-bold text-[#18123b]">{monthly === null ? "Custom" : "$" + monthly.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-3 text-sm mt-2">
              <span className="text-[#4b4763]">Human review ({humanMinutes} min × $1.00)</span>
              <span className="font-bold text-[#18123b]">${humanCost.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-3 text-sm mt-2">
              <span className="text-[#4b4763]">Extra minutes beyond the plan</span>
              <span className="font-bold text-[#18123b]">{over > 0 ? over + " min" : "none"}</span>
            </div>
            <div className="border-t border-[#18123b]/10 mt-4 pt-4 flex flex-wrap justify-between gap-3">
              <span className="font-black text-[#18123b]">Estimated monthly total</span>
              <span className="font-black text-2xl text-[#6415f5]">{monthly === null ? "Custom" : "$" + (monthly + humanCost).toFixed(2)}</span>
            </div>
            <p className="mt-3 text-[10px] text-[#4b4763]">Estimate only — final prices are set by the owner.</p>
          </div>
          <button onClick={onStart} className="mt-6 w-full py-3.5 rounded-xl bg-[#6415f5] text-white font-bold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
            Try Aud for free
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChangelogPage() {
  const entries = [
    { date: "October 2026", title: "Multi-language transcription", text: "Choose several languages at once — each gets its own transcription pass and the best part of every passage is kept." },
    { date: "October 2026", title: "Human-verified services", text: "Add professional human review to transcription, translation and subtitles — per minute, on demand." },
    { date: "October 2026", title: "New pricing plans", text: "Free, Starter, Pro and Business tiers with a monthly/annual toggle and a full comparison table." },
    { date: "October 2026", title: "99 languages", text: "The language picker now covers every language the engine supports — with auto-detect." },
    { date: "October 2026", title: "A bigger website", text: "Feature pages, About, Pricing, Contact and a rich multi-page navigation." },
  ];
  return (
    <div>
      <PageHero kicker="Changelog" title={<>Product <span style={{ color: PURPLE }}>Updates</span></>} sub="Every improvement to the studio, newest first." />
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16 space-y-4">
        {entries.map((e, i) => (
          <div key={i} className="rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm p-6 flex gap-5">
            <span className="shrink-0 text-[11px] font-black text-[#6415f5] uppercase w-28 pt-1">{e.date}</span>
            <div>
              <p className="font-semibold text-[#18123b]">{e.title}</p>
              <p className="text-sm text-[#4b4763] mt-1 leading-relaxed">{e.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LegalPage() {
  return (
    <div>
      <PageHero
        kicker="Terms & Privacy Policy"
        title={<>Legal, In <span style={{ color: PURPLE }}>Plain Language</span></>}
        sub="The short version of how Aud handles your data and your rights."
      />
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16 space-y-5">
        {[
          ["Your recordings are yours", "Audio and transcripts are stored encrypted, accessible only to your account, and never sold or shared. They are never used to train third-party models without your explicit consent."],
          ["Deletion is real", "Deleting a session removes its audio, transcript and metadata from active storage. Bulk deletion is honored completely."],
          ["Share links are read-only", "A share link exposes only that transcript and its playback — never your account, other files or personal data."],
          ["Human review confidentiality", "Human-verified services are performed under confidentiality: reviewers see only the file being reviewed and cannot keep or share it."],
          ["Subscriptions", "Plans can be canceled at any time. Monthly allowances reset each cycle. Prices shown on the pricing page are finalized by the owner."],
          ["Contact", "For any legal or privacy question: " + BRAND.email],
        ].map(([h, p]) => (
          <div key={h} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-7">
            <h3 className="font-semibold text-[#18123b]">{h}</h3>
            <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CareersPage() {
  return (
    <div>
      <PageHero
        kicker="Careers"
        title={<>Build The Studio <span style={{ color: PURPLE }}>With Us</span></>}
        sub="Aud is a small, focused team building speech tools for languages the industry forgot. We hire people who use what they build."
      />
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16 space-y-4">
        {[
          ["Speech AI Engineer", "Fine-tune recognition models for dialects and noisy field audio."],
          ["Applied Linguist (Arabic dialects)", "Review, annotate and shape how the models hear Maghrebi and Levantine speech."],
          ["Full-stack Developer (React/FastAPI)", "Build the studio: editor, pipelines, sharing."],
          ["UX Designer", "Make hour-long editing feel effortless."],
        ].map(([role, desc]) => (
          <div key={role} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[#18123b]">{role}</h3>
              <p className="text-sm text-[#4b4763] mt-1">{desc}</p>
            </div>
            <a href={"mailto:" + BRAND.email + "?subject=" + encodeURIComponent("Aud — " + role)} className="px-5 py-2.5 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white font-semibold text-sm hover:bg-[#6415f5]/[0.06] transition">
              Apply
            </a>
          </div>
        ))}
        <p className="text-center text-sm text-[#4b4763] pt-4">
          No open role fits? Write to <a className="font-bold text-[#6415f5]" href={"mailto:" + BRAND.email}>{BRAND.email}</a> anyway — the best hires rarely check a box.
        </p>
      </div>
    </div>
  );
}


/* ─────────────────── GENERIC TEMPLATE PAGES (driven by siteData) ─────────────────── */

export function ServicePage({ slug, onStart }) {
  const f = SERVICE_PAGES[slug];
  if (!f) return null;
  const others = Object.keys(SERVICE_PAGES).filter((k) => k !== slug).slice(0, 3);
  return (
    <div>
      {/* Hero */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-10 lg:pt-14 pb-12 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
        <div>
          {f.badge && (
            <span className="inline-block px-2.5 py-1 rounded-md bg-[#6415f5] text-white text-[10px] font-black tracking-wide uppercase mb-3">
              {f.badge}
            </span>
          )}
          <p className="text-[11px] font-black tracking-[0.18em] text-[#6415f5] uppercase">{f.kicker}</p>
          <h1 className="mt-3 text-[clamp(32px,3.2vw,52px)] leading-[1.15] font-semibold tracking-[-0.015em] text-[#18123b]">{f.title}</h1>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#4b4763] max-w-[580px]">{f.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onStart} className="px-6 py-3 rounded-xl bg-[#6415f5] text-white font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
              Try Aud Free
            </button>
            <a href={"mailto:" + BRAND.email + "?subject=" + encodeURIComponent("Aud — " + f.title)} className="px-6 py-3 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white font-semibold hover:bg-[#6415f5]/[0.06] transition">
              Talk to a Specialist
            </a>
          </div>
        </div>
        {/* Demo/screenshot placeholder — TODO: owner to add real screenshots */}
        <div className="relative rounded-[26px] bg-[#18123b] h-[320px] sm:h-[420px] overflow-hidden shadow-2xl shadow-[#18123b]/25 flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)" }} />
          <div className="relative text-center text-white/70 px-8">
            <p className="text-[11px] font-black tracking-[0.16em] uppercase mb-2">Demo placeholder</p>
            <p className="text-sm">{f.kicker} — screenshot / interactive demo coming here.</p>
          </div>
        </div>
      </div>

      {/* How it works */}
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

      {/* Key features grid */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <div className="rounded-[26px] bg-[#18123b] p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Key features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {f.keyFeatures.map((k) => (
              <div key={k} className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 text-white/90 text-sm font-medium">
                {k}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details block */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8 grid sm:grid-cols-3 gap-x-6 gap-y-4">
          {Object.entries(f.details).map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] font-black tracking-[0.14em] text-[#4b4763]/70 uppercase">{k}</p>
              <p className="mt-1 text-sm font-semibold text-[#18123b]">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* See pricing + FAQ */}
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-10 space-y-4">
        {f.faq.map((item) => (
          <div key={item.q} className="rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm p-6">
            <p className="font-semibold text-[#18123b] text-sm">{item.q}</p>
            <p className="text-sm text-[#4b4763] mt-2 leading-relaxed">{item.a}</p>
          </div>
        ))}
        <button
          onClick={() => window.__goPricing && window.__goPricing()}
          className="w-full py-4 rounded-2xl bg-[#6415f5] text-white font-bold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25"
        >
          See pricing
        </button>
      </div>

      {/* Related products */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-xl font-semibold text-[#18123b] mb-5">Related products</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {others.map((k) => (
            <div key={k} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-5 shadow-sm">
              <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{SERVICE_PAGES[k].kicker}</p>
              <p className="mt-1 font-semibold text-[#18123b]">{SERVICE_PAGES[k].title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AudiencePage({ slug }) {
  const f = AUDIENCE_PAGES[slug];
  if (!f) return null;
  return (
    <div>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-10 lg:pt-14 pb-12 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
        <div>
          <p className="text-[11px] font-black tracking-[0.18em] text-[#6415f5] uppercase">{f.kicker}</p>
          <h1 className="mt-3 text-[clamp(32px,3.2vw,52px)] leading-[1.15] font-semibold tracking-[-0.015em] text-[#18123b]">{f.title}</h1>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#4b4763] max-w-[580px]">{f.problem}</p>
        </div>
        <div className="relative rounded-[26px] overflow-hidden shadow-2xl shadow-[#18123b]/25 h-[320px] sm:h-[420px]">
          <video src={f.video} poster={f.poster} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12101f]/40 to-transparent" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <h2 className="text-2xl font-semibold text-[#18123b] mb-6">How Aud helps</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {f.help.map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm p-6">
              <h3 className="font-semibold text-[#18123b]">{t}</h3>
              <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8">
          <h2 className="text-xl font-semibold text-[#18123b] mb-1">Recommended products</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-5">
            {f.recommended.map((k) => (
              <div key={k} className="rounded-2xl border border-[#18123b]/[0.08] p-5">
                <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{SERVICE_PAGES[k] ? SERVICE_PAGES[k].kicker : k}</p>
                <p className="mt-1 font-semibold text-[#18123b] text-sm">{SERVICE_PAGES[k] ? SERVICE_PAGES[k].title : k}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-[#f6f3ed] border border-[#18123b]/[0.08] p-6">
            <p className="text-sm italic text-[#4b4763]">“{f.story.quote}”</p>
            <p className="mt-2 text-[11px] font-bold text-[#18123b]/60">{f.story.source}</p>
          </div>
          <p className="mt-4 text-xs text-[#4b4763]">
            Your data stays protected — see <button className="font-bold text-[#6415f5]" onClick={() => window.__goSecurity && window.__goSecurity()}>Security & Privacy</button>.
          </p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16 space-y-3">
        {f.faq.map((item) => (
          <div key={item.q} className="rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm p-6">
            <p className="font-semibold text-[#18123b] text-sm">{item.q}</p>
            <p className="text-sm text-[#4b4763] mt-2 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingPage({ slug, onStart }) {
  const f = RESOURCE_LISTINGS[slug];
  if (!f) return null;
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...f.categories];
  const shown = f.cards.filter(
    (c) => (cat === "All" || c.cat === cat) && c.title.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div>
      <PageHero kicker={f.kicker} title={f.title} sub={f.lead} />
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-2xl border px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6415f5]/40 border-[#18123b]/15 bg-white text-[#18123b]"
          />
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold border transition ${
                cat === c ? "bg-[#6415f5] text-white border-[#6415f5]" : "border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((c, i) => (
            <div key={i} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-6 hover:shadow-md transition">
              <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{c.cat}</p>
              <h3 className="mt-2 font-semibold text-[#18123b]">{c.title}</h3>
              <p className="mt-1 text-[11px] text-[#4b4763]">{c.date}</p>
            </div>
          ))}
          {shown.length === 0 && <p className="text-sm text-[#4b4763] col-span-full py-10 text-center">Nothing matches this filter yet.</p>}
        </div>
        <p className="mt-8 text-[10px] text-[#4b4763] text-center">TODO: owner to verify — card contents are placeholders.</p>
      </div>
    </div>
  );
}


/* ─────────────────── SIMPLE PAGES (team / press / freelancers / partners / locations) ─────────────────── */

export function TeamPage({ onStart }) {
  return (
    <div>
      <PageHero
        kicker="Leadership"
        title={<>The People Behind <span style={{ color: PURPLE }}>Aud</span></>}
        sub="A small team across AI engineering, applied linguistics, software architecture and user experience. TODO: owner to verify names and roles."
      />
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {LEADERSHIP.map((m) => (
            <div key={m.name} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-8 text-center">
              <span className="w-20 h-20 mx-auto rounded-full border-[1.5px] border-[#18123b]/30 bg-white flex items-center justify-center text-[#18123b] text-xl font-black">{m.initials}</span>
              <h3 className="mt-4 font-semibold text-[#18123b]">{m.name}</h3>
              <p className="text-sm text-[#4b4763] mt-1">{m.role}</p>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold text-[#18123b] mt-12 mb-5 text-center">Our Board</h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-[700px] mx-auto">
          {BOARD.map((m, i) => (
            <div key={i} className="rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm p-5 text-center">
              <p className="font-semibold text-[#18123b] text-sm">{m.name}</p>
              <p className="text-xs text-[#4b4763] mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button onClick={onStart} className="px-6 py-3 rounded-xl bg-[#6415f5] text-white font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
            Try Aud for free
          </button>
        </div>
      </div>
    </div>
  );
}

export function PressPage() {
  return (
    <div>
      <PageHero
        kicker="Press"
        title={<>Aud In The <span style={{ color: PURPLE }}>News</span></>}
        sub="Media mentions and press resources. TODO: owner to verify — placeholders below."
      />
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRESS.map((n, i) => (
          <div key={i} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-7">
            <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{n.outlet}</p>
            <h3 className="mt-2 font-semibold text-[#18123b]">{n.title}</h3>
            <p className="text-xs text-[#4b4763] mt-1">{n.date}</p>
          </div>
        ))}
        <div className="rounded-[26px] bg-[#18123b] p-7 text-white">
          <p className="text-[10px] font-black tracking-[0.12em] uppercase text-white/70">Press kit</p>
          <p className="mt-2 text-sm text-white/90">For interviews and press inquiries, write to <a className="font-bold underline" href={"mailto:" + BRAND.email}>{BRAND.email}</a></p>
        </div>
      </div>
    </div>
  );
}

export function FreelancersPage() {
  const [sent, setSent] = useState(false);
  const field = "w-full px-4 py-3 rounded-xl border-[1.5px] border-[#18123b]/15 bg-white text-sm text-[#18123b] focus:outline-none focus:border-[#6415f5]";
  return (
    <div>
      <PageHero
        kicker="Freelancers"
        title={<>Join The <span style={{ color: PURPLE }}>Reviewers Network</span></>}
        sub="Aud's human-verified services run on a network of freelance transcriptionists, translators and subtitle professionals. Apply to join."
      />
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
        {sent ? (
          <div className="rounded-[26px] bg-white border border-[#18123b]/[0.08] p-10 text-center shadow-sm">
            <span className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 flex items-center justify-center text-2xl">✓</span>
            <h3 className="mt-4 text-xl font-bold text-[#18123b]">Your application is ready to send</h3>
            <p className="text-sm text-[#4b4763] mt-2">Your email app opened with the application prefilled — press send and we will reply with the next steps.</p>
          </div>
        ) : (
          <form
            className="rounded-[26px] bg-white border-[1.5px] border-[#6415f5]/30 shadow-xl shadow-[#6415f5]/10 p-8 grid sm:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.target);
              const body = encodeURIComponent(
                "Name: " + f.get("name") + "\nEmail: " + f.get("email") + "\nLanguages: " + f.get("langs") + "\nExperience: " + f.get("exp")
              );
              window.location.href = "mailto:" + BRAND.email + "?subject=" + encodeURIComponent("Aud — Freelancer application") + "&body=" + body;
              setSent(true);
            }}
          >
            <input name="name" required placeholder="Full name" className={field} />
            <input name="email" type="email" required placeholder="Email" className={field} />
            <input name="langs" required placeholder="Languages (e.g. Arabic, French)" className={"sm:col-span-2 " + field} />
            <textarea name="exp" rows={4} placeholder="Your transcription / translation experience…" className={"sm:col-span-2 " + field} />
            <button type="submit" className="sm:col-span-2 w-full py-3.5 rounded-xl bg-[#6415f5] text-white font-bold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
              Apply to join
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function PartnersPage() {
  return (
    <div>
      <PageHero
        kicker="Partners"
        title={<>Build With <span style={{ color: PURPLE }}>Aud</span></>}
        sub="Universities, media organizations and platforms partner with Aud to bring transcription and translation to their audiences."
      />
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-[26px] bg-white border-[1.5px] border-[#6415f5]/30 shadow-xl shadow-[#6415f5]/10 p-8">
          <h2 className="text-xl font-semibold text-[#18123b]">Partnership inquiry</h2>
          <form
            className="mt-6 grid sm:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.target);
              const body = encodeURIComponent("Organization: " + f.get("org") + "\nEmail: " + f.get("email") + "\n\n" + f.get("msg"));
              window.location.href = "mailto:" + BRAND.email + "?subject=" + encodeURIComponent("Aud — Partnership inquiry") + "&body=" + body;
            }}
          >
            <input name="org" required placeholder="Organization" className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#18123b]/15 bg-white text-sm focus:outline-none focus:border-[#6415f5]" />
            <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#18123b]/15 bg-white text-sm focus:outline-none focus:border-[#6415f5]" />
            <textarea name="msg" rows={4} required placeholder="Tell us about your partnership idea…" className="sm:col-span-2 w-full px-4 py-3 rounded-xl border-[1.5px] border-[#18123b]/15 bg-white text-sm focus:outline-none focus:border-[#6415f5]" />
            <button type="submit" className="sm:col-span-2 w-full py-3.5 rounded-xl bg-[#6415f5] text-white font-bold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25">
              Send inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function LocationsPage() {
  return (
    <div>
      <PageHero
        kicker="Services By Location"
        title={<>Aud <span style={{ color: PURPLE }}>Around The World</span></>}
        sub="The same studio, tuned for the languages and dialects of every region we serve."
      />
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16 space-y-4">
        {LOCATIONS.map((l) => (
          <div key={l.region} className="rounded-[26px] bg-white border border-[#18123b]/[0.08] shadow-sm p-7 flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-semibold text-[#18123b]">{l.region}</h3>
            <p className="text-sm text-[#4b4763]">{l.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
