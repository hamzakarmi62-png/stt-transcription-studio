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
