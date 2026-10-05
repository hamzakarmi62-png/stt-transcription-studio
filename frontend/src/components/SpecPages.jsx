import { useState } from "react";
import { SPEC_DATA } from "../specData.js";
import { ALL_LANGUAGES, BRAND } from "../siteData.js";
import { MenuIcon } from "./MenuIcons.jsx";

// Spec page templates — mockup-exact (image spec, 2026-10).
// Every template: breadcrumb → headline → one-liner → ONE purple button,
// then the section blocks exactly as drawn in the mockups.

const CONTACT_EMAIL = BRAND.email;

function Crumb({ section, text, badge }) {
  return (
    <p className="text-[13px] text-[#4b4763]/80 mb-5 flex items-center gap-2.5 flex-wrap">
      <span>{section} / {text}</span>
      {badge && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">{badge}</span>}
    </p>
  );
}

function Page({ section, crumb, badge, children }) {
  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-7 pb-20">
      <Crumb section={section} text={crumb} badge={badge} />
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p className="text-[15px] font-medium text-[#18123b]/75 mb-4">{children}</p>;
}

function PurpleBtn({ children, onClick, outline }) {
  return outline ? (
    <button onClick={onClick} className="px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white text-[14px] font-semibold hover:bg-[#6415f5]/[0.06] transition">{children}</button>
  ) : (
    <button onClick={onClick} className="px-6 py-3 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition shadow-sm">{children}</button>
  );
}

function Dashed({ title, children }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#18123b]/20 bg-white/40 p-5">
      {title && <p className="text-[14px] font-bold text-[#18123b]">{title}</p>}
      <p className={`text-[13px] text-[#4b4763] leading-relaxed ${title ? "mt-1" : ""}`}>{children}</p>
    </div>
  );
}

function SpeakerCard({ rows }) {
  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-6 space-y-4">
      {rows.map((r, i) => (
        <div key={i}>
          <p className="text-[14px] font-bold" style={{ color: r.c }}>
            {r.s} <span className="font-semibold">· {r.t}</span>
          </p>
          <p className="text-[14px] text-[#4b4763] mt-0.5">{r.l}</p>
        </div>
      ))}
    </div>
  );
}

function StepsRow({ steps }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {steps.map(([t, d], i) => (
        <div key={t} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
          <p className="text-[15px] font-bold text-[#18123b]">{i + 1}. {t}</p>
          <p className="mt-1.5 text-[13px] text-[#4b4763] leading-relaxed">{d}</p>
        </div>
      ))}
    </div>
  );
}

function Chips({ items, goFeature }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map(([label, slug]) => (
        <button key={slug + label} onClick={() => goFeature(slug)} className="px-3.5 py-2 rounded-lg bg-[#6415f5]/[0.08] text-[#6415f5] text-[13px] font-semibold hover:bg-[#6415f5]/[0.14] transition">
          {label}
        </button>
      ))}
    </div>
  );
}

function FaqList({ faq }) {
  return (
    <div className="space-y-3">
      {faq.map(([q, a]) => (
        <details key={q} className="group rounded-xl bg-white border border-[#18123b]/10">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-[15px] font-semibold text-[#18123b]">
            {q}
            <span className="shrink-0 text-[18px] text-[#4b4763] group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="px-5 pb-4 text-[14px] text-[#4b4763] leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  );
}

/* ── Template: feature page ─────────────────────────────────────────────── */
export function TFeaturePage({ slug, onStart, goFeature }) {
  const f = SPEC_DATA.features[slug];
  if (!f) return null;
  return (
    <Page section="Product" crumb={f.crumb}>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
        <div>
          <h1 className="text-[clamp(28px,2.8vw,42px)] leading-[1.18] font-semibold tracking-[-0.015em] text-[#18123b]">{f.headline}</h1>
          <p className="mt-3.5 text-[16px] leading-[1.65] text-[#4b4763] max-w-[540px]">{f.desc}</p>
          <div className="mt-6"><PurpleBtn onClick={onStart}>{f.cta || "Try Aud for free"}</PurpleBtn></div>
        </div>
        <SpeakerCard rows={f.card} />
      </div>

      <div className="mt-14">
        <Label>How it works</Label>
        <StepsRow steps={f.steps} />
      </div>

      <div className="mt-12">
        <Label>Related features</Label>
        <Chips items={f.related} goFeature={goFeature} />
      </div>

      <div className="mt-12">
        <Label>Questions</Label>
        <FaqList faq={f.faq} />
      </div>

      <button onClick={onStart} className="mt-14 w-full py-4 rounded-xl bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition shadow-sm">
        {f.cta}
      </button>
    </Page>
  );
}

/* ── Template: human-verified service page ──────────────────────────────── */
export function THumanPage({ slug }) {
  const h = SPEC_DATA.human;
  const crumb = h.crumbs[slug];
  if (!crumb) return null;
  return (
    <Page section="Product" crumb={crumb} badge={h.badge}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] leading-[1.18] font-semibold tracking-[-0.015em] text-[#18123b]">{h.headline}</h1>
      <p className="mt-3.5 text-[16px] leading-[1.65] text-[#4b4763] max-w-[540px]">{h.desc}</p>
      <div className="mt-6">
        <PurpleBtn onClick={() => { window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — " + crumb)}`; }}>{h.cta}</PurpleBtn>
      </div>

      <div className="mt-14">
        <Label>{h.stepsTitle}</Label>
        <StepsRow steps={h.steps} />
      </div>

      <div className="mt-12">
        <Label>{h.detailsTitle}</Label>
        <div className="grid sm:grid-cols-3 gap-4">
          {h.details.map(([t, d]) => (
            <div key={t} className="rounded-xl border-2 border-dashed border-[#18123b]/20 bg-white/40 p-5">
              <p className="text-[13.5px] font-semibold text-[#18123b]/80">{t}</p>
              <p className="mt-1 text-[13px] text-[#4b4763]">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Dashed title={h.noticeTitle}>{h.notice}</Dashed>
      </div>
    </Page>
  );
}

/* ── Template: help center ──────────────────────────────────────────────── */
export function THelpCenter({ goPage }) {
  const h = SPEC_DATA.help;
  const [q, setQ] = useState("");
  const topics = h.topics.filter(([, t]) => t.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page section="Resources" crumb={h.crumb}>
      <div className="text-center pt-4">
        <h1 className="text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.015em] text-[#18123b]">{h.headline}</h1>
        <p className="mt-3 text-[15.5px] text-[#4b4763]">{h.sub}</p>
        <div className="relative max-w-[560px] mx-auto mt-7">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b4763]/60"><MenuIcon name="search" className="w-4.5 h-4.5 w-[18px] h-[18px]" /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={h.searchPh}
            className="w-full rounded-xl border border-[#18123b]/15 bg-white pl-11 pr-4 py-3.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
      </div>

      <div className="mt-12">
        <Label>{h.topicsTitle}</Label>
        <div className="grid sm:grid-cols-3 gap-4">
          {topics.map(([icon, t, d]) => (
            <div key={t} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
              <span className="w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
                <MenuIcon name={icon} className="w-5 h-5" />
              </span>
              <p className="mt-3 text-[15px] font-bold text-[#18123b]">{t}</p>
              <p className="mt-1 text-[13px] text-[#4b4763]">{d}</p>
            </div>
          ))}
          {topics.length === 0 && <p className="text-sm text-[#4b4763] col-span-full py-6 text-center">No topic matches "{q}".</p>}
        </div>
      </div>

      <div className="mt-12">
        <Label>{h.popularTitle}</Label>
        <div className="rounded-xl bg-white border border-[#18123b]/10 divide-y divide-[#18123b]/[0.07]">
          {h.popular.map((q2) => (
            <p key={q2} className="px-5 py-4 text-[14.5px] font-semibold text-[#18123b]">{q2}</p>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-xl bg-white border border-[#18123b]/10 p-7 text-center">
        <p className="text-[15.5px] font-bold text-[#18123b]">{h.stuckTitle}</p>
        <p className="mt-1 text-[13.5px] text-[#4b4763]">{h.stuckSub}</p>
        <div className="mt-4"><PurpleBtn outline onClick={() => goPage("contact")}>{h.stuckCta}</PurpleBtn></div>
      </div>
    </Page>
  );
}

/* ── Template: tutorials ────────────────────────────────────────────────── */
export function TTutorials() {
  const t = SPEC_DATA.tutorials;
  const [cat, setCat] = useState("All");
  const rows = t.rows.filter(([, , c]) => cat === "All" || c === cat);
  return (
    <Page section="Resources" crumb={t.crumb}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{t.headline}</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">{t.sub}</p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        {t.chips.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition ${cat === c ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-7 rounded-xl bg-white border border-[#18123b]/10 divide-y divide-[#18123b]/[0.07]">
        {rows.map(([icon, title, c, n]) => (
          <div key={title} className="flex items-center gap-4 px-5 py-4">
            <span className="shrink-0 w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
              <MenuIcon name={icon} className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold text-[#18123b]">{title}</p>
              <p className="text-[12.5px] text-[#4b4763] mt-0.5">{c} · {n} steps</p>
            </div>
            <span className="ms-auto text-[#4b4763]/50"><MenuIcon name="chevron" className="w-4 h-4" /></span>
          </div>
        ))}
        {rows.length === 0 && <p className="px-5 py-6 text-sm text-[#4b4763] text-center">Nothing in this category yet.</p>}
      </div>
    </Page>
  );
}

/* ── Template: use cases ────────────────────────────────────────────────── */
export function TUseCases({ goAudience }) {
  const u = SPEC_DATA.usecases;
  return (
    <Page section="Resources" crumb={u.crumb}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{u.headline}</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">{u.sub}</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {u.cards.map(([icon, title, d, aud]) => (
          <button key={title} onClick={() => goAudience(aud)} className="rounded-xl bg-white border border-[#18123b]/10 p-5 text-start hover:border-[#6415f5]/40 hover:shadow-sm transition">
            <span className="w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
              <MenuIcon name={icon} className="w-5 h-5" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#18123b]">{title}</p>
            <p className="mt-1 text-[13px] text-[#4b4763]">{d}</p>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Dashed>
          <span className="block text-[12.5px] text-[#4b4763]">{u.featuredLabel}</span>
          <span className="block mt-1 text-[15px] font-bold text-[#18123b]/50">{u.featured}</span>
        </Dashed>
      </div>
    </Page>
  );
}

/* ── Template: supported languages ──────────────────────────────────────── */
export function TLanguages() {
  const l = SPEC_DATA.languages;
  const [q, setQ] = useState("");
  const shown = ALL_LANGUAGES.filter((x) => x.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page section="Resources" crumb={l.crumb}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{l.headline}</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">{l.sub}</p>

      <div className="relative mt-7">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b4763]/60"><MenuIcon name="search" className="w-[18px] h-[18px]" /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={l.searchPh}
          className="w-full rounded-xl border border-[#18123b]/15 bg-white pl-11 pr-4 py-3.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {l.chips.map((c, i) => (
          <button key={c} className={`px-4 py-2 rounded-full text-[13px] font-semibold transition ${i === 0 ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {shown.map((x) => (
          <div key={x.value} className="rounded-lg bg-white border border-[#18123b]/10 px-4 py-3 flex items-center justify-between gap-2">
            <span className="text-[13.5px] font-semibold text-[#18123b] truncate">{x.label}</span>
            <span className="shrink-0 text-[11px] font-bold text-[#4b4763]/70">A</span>
          </div>
        ))}
        {shown.length === 0 && <p className="col-span-full text-sm text-[#4b4763] py-6 text-center">No language matches "{q}".</p>}
      </div>

      <p className="mt-4 text-[12px] text-[#4b4763]/80">{l.note}</p>

      <div className="mt-8">
        <Dashed title={l.noticeTitle}>{l.notice}</Dashed>
      </div>
    </Page>
  );
}

/* ── Template: changelog ────────────────────────────────────────────────── */
export function TChangelog() {
  const c = SPEC_DATA.changelog;
  const tagCls = { New: "bg-[#6415f5]/[0.08] text-[#6415f5]", Improved: "bg-emerald-50 text-emerald-700", Fixed: "bg-emerald-50 text-emerald-700" };
  return (
    <Page section="Resources" crumb={c.crumb}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{c.headline}</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">{c.sub}</p>

      <div className="mt-9 border-l-2 border-[#18123b]/10 pl-7 space-y-9">
        {c.entries.map((e) => (
          <div key={e.title} className="relative">
            <span className="absolute -left-[35px] top-1 w-3.5 h-3.5 rounded-full bg-[#6415f5]" />
            <p className="text-[12.5px] text-[#4b4763]/80">{c.dateLabel}</p>
            <p className="mt-1.5 flex items-center gap-2.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${tagCls[e.tag] || "bg-[#18123b]/[0.06] text-[#4b4763]"}`}>{e.tag}</span>
              <span className="text-[15.5px] font-bold text-[#18123b]">{e.title}</span>
            </p>
            <p className="mt-1 text-[13.5px] text-[#4b4763] leading-relaxed">{e.text}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* ── Template: API and docs [proposed] ──────────────────────────────────── */
export function TApi() {
  const a = SPEC_DATA.api;
  const [active, setActive] = useState(a.sidebar[0]);
  return (
    <Page section="Product" crumb={a.crumb} badge={a.badge}>
      <div className="grid lg:grid-cols-[220px_1fr] gap-10 items-start">
        <div className="space-y-1">
          {a.sidebar.map((s) => (
            <button key={s} onClick={() => setActive(s)}
              className={`block w-full text-start px-3 py-2 rounded-lg text-[14px] font-medium transition ${active === s ? "text-[#6415f5] bg-[#6415f5]/[0.06]" : "text-[#4b4763] hover:text-[#18123b]"}`}>
              {s}
            </button>
          ))}
        </div>
        <div>
          <h1 className="text-[clamp(28px,2.8vw,40px)] font-semibold tracking-[-0.015em] text-[#18123b]">{a.title}</h1>
          <p className="mt-3 text-[15.5px] text-[#4b4763]">{a.desc}</p>
          <pre className="mt-7 rounded-xl bg-[#18123b] p-6 text-[13.5px] leading-[1.8] text-white font-mono whitespace-pre-wrap overflow-x-auto">{a.code}</pre>
          <div className="mt-7">
            <Dashed title={a.todoTitle}>{a.todo}</Dashed>
          </div>
        </div>
      </div>
    </Page>
  );
}

/* ── Template: contact ──────────────────────────────────────────────────── */
export function TContact({ goPage }) {
  const c = SPEC_DATA.contact;
  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = encodeURIComponent(`Name: ${fd.get("name")}\nEmail: ${fd.get("email")}\nTopic: ${fd.get("topic")}\n\n${fd.get("message")}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — " + fd.get("topic"))}&body=${body}`;
  };
  return (
    <Page section="About" crumb={c.crumb}>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{c.headline}</h1>
          <p className="mt-3.5 text-[15.5px] text-[#4b4763] max-w-[420px]">{c.desc}</p>
          <div className="mt-8 space-y-5">
            {c.rows.map(([icon, t, d]) => (
              <button key={t} onClick={() => icon === "help" && goPage("info:help")} className="flex items-center gap-4 text-start w-full group">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
                  <MenuIcon name={icon} className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold text-[#18123b] group-hover:text-[#6415f5] transition-colors">{t}</span>
                  <span className="block text-[13px] text-[#4b4763]">{d}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white border border-[#18123b]/10 p-6 sm:p-7 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5">{c.form.name}</label>
            <input name="name" required placeholder={c.form.namePh} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5">{c.form.email}</label>
            <input name="email" type="email" required placeholder={c.form.emailPh} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5">{c.form.topic}</label>
            <select name="topic" className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30">
              {c.form.topics.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5">{c.form.message}</label>
            <textarea name="message" rows={4} required placeholder={c.form.messagePh} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <PurpleBtn>{c.form.submit}</PurpleBtn>
        </form>
      </div>
    </Page>
  );
}

/* ── Template: careers ──────────────────────────────────────────────────── */
export function TCareers() {
  const c = SPEC_DATA.careers;
  return (
    <Page section="About" crumb={c.crumb}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{c.headline}</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">{c.sub}</p>

      <div className="mt-8 rounded-xl bg-white border border-[#18123b]/10 divide-y divide-[#18123b]/[0.07]">
        {c.roles.map(([title, meta, dept], i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold text-[#18123b]">{title}</p>
              <p className="text-[12.5px] text-[#4b4763] mt-0.5">{meta}</p>
            </div>
            <span className="ms-auto shrink-0 px-2.5 py-1 rounded-md bg-[#6415f5]/[0.08] text-[#6415f5] text-[11px] font-bold">{dept}</span>
            <span className="text-[#4b4763]/50"><MenuIcon name="chevron" className="w-4 h-4" /></span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Dashed>
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-[14px] font-bold text-[#18123b]">{c.emptyTitle}</span>
            <PurpleBtn outline onClick={() => { window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Aud — CV")}`; }}>{c.emptyCta}</PurpleBtn>
          </span>
        </Dashed>
      </div>
    </Page>
  );
}

/* ── Template: company ──────────────────────────────────────────────────── */
export function TCompany() {
  const c = SPEC_DATA.company;
  return (
    <Page section="About" crumb={c.crumb}>
      <h1 className="text-[clamp(28px,3vw,44px)] leading-[1.2] font-semibold tracking-[-0.015em] text-[#18123b] max-w-[820px]">{c.headline}</h1>
      <p className="mt-4 text-[16px] text-[#4b4763]">{c.desc}</p>

      <div className="mt-9 grid sm:grid-cols-3 gap-4">
        {c.cards.map(([icon, t, d]) => (
          <div key={t} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
            <span className="w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
              <MenuIcon name={icon} className="w-5 h-5" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#18123b]">{t}</p>
            <p className="mt-1 text-[13px] text-[#4b4763]">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Label>{c.storyLabel}</Label>
        <Dashed>{c.story}</Dashed>
      </div>

      <div className="mt-12">
        <Label>{c.teamLabel}</Label>
        <div className="grid sm:grid-cols-3 gap-4">
          {c.team.map((m, i) => (
            <div key={i} className={`rounded-xl p-6 text-center ${m.solid ? "bg-white border border-[#18123b]/10" : "border-2 border-dashed border-[#18123b]/20 bg-white/40"}`}>
              <span className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-[18px] font-black ${m.solid ? "bg-[#6415f5]/[0.08] border border-[#6415f5]/20 text-[#6415f5]" : "bg-[#6415f5]/[0.05] border border-[#6415f5]/10 text-[#6415f5]/50"}`}>■</span>
              <p className={`mt-3 text-[14.5px] font-bold ${m.solid ? "text-[#18123b]" : "text-[#18123b]/50"}`}>{m.name}</p>
              <p className="text-[12.5px] text-[#4b4763]">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ── Template: human reviewers [planned] ────────────────────────────────── */
export function TReviewers({ goFreelancers }) {
  const r = SPEC_DATA.reviewers;
  return (
    <Page section="About" crumb={r.crumb} badge={r.badge}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{r.headline}</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763] max-w-[560px]">{r.desc}</p>

      <div className="mt-9 space-y-6">
        {r.steps.map(([t, d], i) => (
          <div key={t} className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#6415f5] text-white text-[12px] font-bold flex items-center justify-center">{i + 1}</span>
            <div>
              <p className="text-[15px] font-bold text-[#18123b]">{t}</p>
              <p className="mt-0.5 text-[13.5px] text-[#4b4763]">{d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Dashed title={r.noticeTitle}>{r.notice}</Dashed>
      </div>

      <div className="mt-8"><PurpleBtn onClick={goFreelancers}>{r.cta}</PurpleBtn></div>
    </Page>
  );
}

/* ── Template: terms and privacy ────────────────────────────────────────── */
export function TTerms() {
  const t = SPEC_DATA.terms;
  const [tab, setTab] = useState(t.tabs[0]);
  const [toc, setToc] = useState(t.toc[0]);
  return (
    <Page section="About" crumb={t.crumb}>
      <div className="flex gap-8 border-b border-[#18123b]/10">
        {t.tabs.map((x) => (
          <button key={x} onClick={() => setTab(x)}
            className={`pb-3 text-[14.5px] font-semibold -mb-px border-b-2 transition ${tab === x ? "text-[#6415f5] border-[#6415f5]" : "text-[#4b4763] border-transparent hover:text-[#18123b]"}`}>
            {x}
          </button>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[240px_1fr] gap-10 items-start">
        <div className="space-y-1">
          {t.toc.map((x) => (
            <button key={x} onClick={() => setToc(x)}
              className={`block w-full text-start px-3 py-2 rounded-lg text-[14px] font-medium transition ${toc === x ? "text-[#6415f5] bg-[#6415f5]/[0.06]" : "text-[#4b4763] hover:text-[#18123b]"}`}>
              {x}
            </button>
          ))}
        </div>
        <div>
          <h1 className="text-[clamp(26px,2.6vw,36px)] font-semibold tracking-[-0.015em] text-[#18123b]">{tab}</h1>
          <p className="mt-2 text-[13px] text-[#4b4763]/80">{t.updated}</p>
          <div className="mt-7 space-y-8">
            {t.toc.map((x) => (
              <div key={x}>
                <p className="text-[16px] font-bold text-[#18123b]">{x}</p>
                <div className="mt-3 space-y-2">
                  <span className="block h-3 rounded bg-[#18123b]/[0.07] w-full" />
                  <span className="block h-3 rounded bg-[#18123b]/[0.07] w-5/6" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Dashed>{t.note}</Dashed>
          </div>
        </div>
      </div>
    </Page>
  );
}
