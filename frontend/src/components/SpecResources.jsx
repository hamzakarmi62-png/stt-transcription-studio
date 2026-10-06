import { useEffect, useMemo, useState } from "react";
import { SPEC_DATA } from "../specData.js";
import { RICH_DATA } from "../specContent.js";
import { ALL_LANGUAGES, BRAND } from "../siteData.js";
import { MenuIcon } from "./MenuIcons.jsx";
import { usePost, FormNote, CopyBtn, useAnnounce, Live, copyText } from "./tools/ui.jsx";
import { PageToc, SectionH, FaqBlock, Highlight } from "./Toc.jsx";

// Enriched Resources pages: blog, help center, tutorials, use cases,
// supported languages, changelog — all controls do real work on the page.

const CONTACT_EMAIL = BRAND.email;

function Page({ section, crumb, badge, children }) {
  useEffect(() => { document.title = `${crumb} — Aud`; }, [crumb]);
  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-7 pb-20">
      <p className="text-[13px] text-[#4b4763]/80 mb-5 flex items-center gap-2.5 flex-wrap">
        <span>{section} / {crumb}</span>
        {badge && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">{badge}</span>}
      </p>
      {children}
    </div>
  );
}

/* ── Blog: search + category chips + article view + related + copy link ── */
export function TBlog() {
  const b = RICH_DATA.blog;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [openId, setOpenId] = useState(null);
  const [msg, say] = useAnnounce();
  const open = openId ? b.posts.find((p) => p.id === openId) : null;

  const shown = b.posts.filter((p) =>
    (cat === "All" || p.cat === cat) &&
    (p.title + " " + p.paras.join(" ")).toLowerCase().includes(q.toLowerCase())
  );

  if (open) {
    const related = open.related.map((id) => b.posts.find((p) => p.id === id)).filter(Boolean);
    return (
      <Page section="Resources" crumb="Blog">
        <button onClick={() => { setOpenId(null); say("Back to the article list"); }}
          className="mb-5 px-3.5 py-2 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12.5px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">← All articles</button>
        <p className="text-[11px] font-black tracking-[0.14em] text-[#6415f5] uppercase">{open.cat} · {open.minutes} min read</p>
        <h1 className="mt-2 text-[clamp(26px,2.6vw,38px)] leading-[1.2] font-semibold tracking-[-0.015em] text-[#18123b] max-w-[820px]">{open.title}</h1>
        <div className="mt-4"><CopyBtn text={`${window.location.origin}${window.location.pathname}#blog-${open.id}`} label="Copy link" /></div>
        <div className="mt-7 max-w-[760px] space-y-4">
          {open.paras.map((p, i) => <p key={i} className="text-[15px] text-[#18123b]/85 leading-[1.8]">{p}</p>)}
        </div>
        {related.length > 0 && (
          <div className="mt-10">
            <p className="text-[15px] font-medium text-[#18123b]/75 mb-3">Related articles</p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-[760px]">
              {related.map((r) => (
                <button key={r.id} onClick={() => { setOpenId(r.id); window.scrollTo({ top: 0, behavior: "instant" }); }}
                  className="text-start rounded-xl bg-white border border-[#18123b]/10 p-5 hover:border-[#6415f5]/40 transition">
                  <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{r.cat} · {r.minutes} min</p>
                  <p className="mt-1.5 font-bold text-[#18123b]">{r.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        <Live message={msg} />
      </Page>
    );
  }

  return (
    <Page section="Resources" crumb="Blog">
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">The Aud blog</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">Practical writing about transcription, subtitles, translation and the workflows around them.</p>

      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the articles…" aria-label="Search articles"
          className="flex-1 min-w-[220px] rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        {["All", ...b.cats].map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition ${cat === c ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {c}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-[#4b4763]/80" aria-live="polite">{shown.length} article{shown.length !== 1 ? "s" : ""}{cat !== "All" ? ` in ${cat}` : ""}{q ? ` matching "${q}"` : ""}</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((p) => (
          <button key={p.id} onClick={() => { setOpenId(p.id); window.scrollTo({ top: 0, behavior: "instant" }); }}
            className="text-start rounded-2xl bg-white border border-[#18123b]/10 p-6 hover:border-[#6415f5]/40 hover:shadow-sm transition">
            <p className="text-[10px] font-black tracking-[0.12em] text-[#6415f5] uppercase">{p.cat} · {p.minutes} min read</p>
            <p className="mt-2 text-[16px] font-bold text-[#18123b] leading-snug">{p.title}</p>
            <p className="mt-2 text-[13px] text-[#4b4763] leading-relaxed line-clamp-3">{p.paras[0]}</p>
            <span className="mt-3 inline-block text-[12.5px] font-semibold text-[#6415f5]">Read the article →</span>
          </button>
        ))}
        {shown.length === 0 && <p className="col-span-full text-sm text-[#4b4763] py-10 text-center">Nothing matches this search.</p>}
      </div>
      <Live message={msg} />
    </Page>
  );
}

/* ── Help Center: live search with highlights + topic filter + article view
   + "Was this helpful?" (posts to the backend) + copy link ─────────────── */
export function THelpCenter({ goPage }) {
  const h = RICH_DATA.help;
  const topics = [...new Set(h.articles.map((a) => a.topic))];
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("All");
  const [openId, setOpenId] = useState(null);
  const [msg, say] = useAnnounce();
  const open = openId ? h.articles.find((a) => a.id === openId) : null;

  const matches = (a) => (a.title + " " + a.body.join(" ")).toLowerCase().includes(q.toLowerCase());
  const shown = h.articles.filter((a) => (topic === "All" || a.topic === topic) && matches(a));

  if (open) {
    return (
      <Page section="Resources" crumb="Help Center">
        <button onClick={() => { setOpenId(null); say("Back to all articles"); }}
          className="mb-5 px-3.5 py-2 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12.5px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">← All articles</button>
        <p className="text-[11px] font-black tracking-[0.14em] text-[#6415f5] uppercase">{open.topic}</p>
        <h1 className="mt-2 text-[clamp(24px,2.4vw,34px)] font-semibold tracking-[-0.015em] text-[#18123b]">{open.title}</h1>
        <div className="mt-4 flex items-center gap-3">
          <CopyBtn text={`${window.location.origin}${window.location.pathname}#${open.id}`} label="Copy link" />
        </div>
        <div className="mt-6 max-w-[720px] space-y-4">
          {open.body.map((p, i) => <p key={i} className="text-[15px] text-[#18123b]/85 leading-[1.8]">{p}</p>)}
        </div>
        <HelpfulFeedback articleId={open.id} />
        <div className="mt-8 max-w-[720px] rounded-xl bg-[#f6f3ed] border border-[#18123b]/10 p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13.5px] text-[#4b4763]">Didn't find your answer?</p>
          <button onClick={() => goPage("support")} className="px-4 py-2 rounded-lg border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white text-[13px] font-semibold hover:bg-[#6415f5]/[0.06] transition">Contact Support</button>
        </div>
        <Live message={msg} />
      </Page>
    );
  }

  return (
    <Page section="Resources" crumb="Help Center">
      <div className="text-center pt-2">
        <h1 className="text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.015em] text-[#18123b]">How can we help?</h1>
        <p className="mt-3 text-[15.5px] text-[#4b4763]">Search answers about uploading, editing, translating, exporting and privacy.</p>
        <div className="relative max-w-[560px] mx-auto mt-7">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b4763]/60"><MenuIcon name="search" className="w-[18px] h-[18px]" /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the Help Center" aria-label="Search the Help Center"
            className="w-full rounded-xl border border-[#18123b]/15 bg-white pl-11 pr-4 py-3.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2.5">
        {["All", ...topics].map((t) => (
          <button key={t} onClick={() => setTopic(t)} aria-pressed={topic === t}
            className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition ${topic === t ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {t}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-[#4b4763]/80" aria-live="polite">{shown.length} article{shown.length !== 1 ? "s" : ""}{q ? ` matching "${q}"` : ""}</p>

      <div className="mt-5 rounded-xl bg-white border border-[#18123b]/10 divide-y divide-[#18123b]/[0.07]">
        {shown.map((a) => (
          <button key={a.id} onClick={() => { setOpenId(a.id); window.scrollTo({ top: 0, behavior: "instant" }); }}
            className="w-full text-start px-5 py-4 hover:bg-[#6415f5]/[0.04] transition">
            <p className="text-[14.5px] font-bold text-[#18123b]"><Highlight text={a.title} q={q} /></p>
            <p className="text-[12.5px] text-[#4b4763] mt-0.5 line-clamp-1"><Highlight text={a.body[0]} q={q} /></p>
          </button>
        ))}
        {shown.length === 0 && <p className="px-5 py-8 text-sm text-[#4b4763] text-center">No article matches — try another word, or contact support below.</p>}
      </div>
      <Live message={msg} />
    </Page>
  );
}

function HelpfulFeedback({ articleId }) {
  const post = usePost("/api/public/feedback");
  const vote = (helpful) => post.post({ article_id: articleId, helpful }, "Thanks — your feedback was recorded.");
  if (post.state === "success") {
    return <p role="status" aria-live="polite" className="mt-6 text-[13.5px] font-semibold text-emerald-600">{post.done}</p>;
  }
  return (
    <div className="mt-6 flex items-center gap-3">
      <p className="text-[13.5px] text-[#4b4763]">Was this helpful?</p>
      <button onClick={() => vote(true)} disabled={post.state === "loading"}
        className="px-3.5 py-1.5 rounded-lg border-[1.5px] border-emerald-500/60 text-emerald-700 text-[12.5px] font-semibold bg-white hover:bg-emerald-50 transition">Yes</button>
      <button onClick={() => vote(false)} disabled={post.state === "loading"}
        className="px-3.5 py-1.5 rounded-lg border-[1.5px] border-[#18123b]/20 text-[#4b4763] text-[12.5px] font-semibold bg-white hover:bg-[#18123b]/[0.04] transition">No</button>
      <FormNote {...post} state={post.state === "success" ? "idle" : post.state} done="" />
    </div>
  );
}

/* ── Tutorials: tick-off steps (localStorage), progress, filter, search ── */
export function TTutorials() {
  const t = RICH_DATA.tutorials;
  const cats = [...new Set(t.items.map((x) => x.cat))];
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const [doneMap, setDoneMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aud-tutorials") || "{}"); } catch { return {}; }
  });

  const shown = t.items.filter((x) =>
    (cat === "All" || x.cat === cat) &&
    (x.title + " " + x.steps.map((s) => s[0]).join(" ")).toLowerCase().includes(q.toLowerCase())
  );
  const open = openId ? t.items.find((x) => x.id === openId) : null;

  const toggleStep = (id, i, total) => {
    const cur = doneMap[id] || [];
    const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
    const map = { ...doneMap, [id]: next };
    if (next.length >= total) delete map[id]; // completed → reset for reuse
    setDoneMap(map);
    try { localStorage.setItem("aud-tutorials", JSON.stringify(map)); } catch { /* private mode */ }
  };

  if (open) {
    const done = doneMap[open.id] || [];
    const pct = Math.round((done.length / open.steps.length) * 100);
    return (
      <Page section="Resources" crumb="Tutorials">
        <button onClick={() => setOpenId(null)} className="mb-5 px-3.5 py-2 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12.5px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">← All tutorials</button>
        <p className="text-[11px] font-black tracking-[0.14em] text-[#6415f5] uppercase">{open.cat} · {open.steps.length} steps</p>
        <h1 className="mt-2 text-[clamp(24px,2.4vw,34px)] font-semibold tracking-[-0.015em] text-[#18123b]">{open.title}</h1>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 rounded-full bg-[#18123b]/[0.08] overflow-hidden w-40" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[#6415f5] transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <span aria-live="polite" className="text-[12.5px] font-semibold text-[#4b4763]">{done.length}/{open.steps.length} done</span>
        </div>
        <div className="mt-7 max-w-[760px] space-y-3">
          {open.steps.map(([st, sd], i) => {
            const checked = done.includes(i);
            return (
              <button key={i} onClick={() => toggleStep(open.id, i, open.steps.length)} aria-pressed={checked}
                className={`w-full text-start flex gap-4 rounded-xl border p-5 transition ${checked ? "bg-[#6415f5]/[0.05] border-[#6415f5]/30" : "bg-white border-[#18123b]/10 hover:border-[#6415f5]/40"}`}>
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition ${checked ? "bg-[#6415f5] border-[#6415f5] text-white" : "border-[#18123b]/20 text-[#4b4763]"}`}>
                  {checked ? "✓" : i + 1}
                </span>
                <span>
                  <span className={`block text-[14.5px] font-bold ${checked ? "text-[#18123b]/60 line-through" : "text-[#18123b]"}`}>{st}</span>
                  <span className="block mt-0.5 text-[13px] text-[#4b4763] leading-relaxed">{sd}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[11.5px] text-[#4b4763]/80">Your tick-offs are saved in this browser only.</p>
      </Page>
    );
  }

  return (
    <Page section="Resources" crumb="Tutorials">
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">Tutorials</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">Short step-by-step guides to get more from Aud — tick the steps off as you follow along.</p>

      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tutorials…" aria-label="Search tutorials"
          className="flex-1 min-w-[200px] rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        {["All", ...cats].map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition ${cat === c ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white border border-[#18123b]/10 divide-y divide-[#18123b]/[0.07]">
        {shown.map((x) => {
          const dn = (doneMap[x.id] || []).length;
          return (
            <button key={x.id} onClick={() => { setOpenId(x.id); window.scrollTo({ top: 0, behavior: "instant" }); }}
              className="w-full text-start flex items-center gap-4 px-5 py-4 hover:bg-[#6415f5]/[0.04] transition">
              <span className="shrink-0 w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
                <MenuIcon name={x.cat === "Editing" ? "pencil" : x.cat === "Translation" ? "globe" : x.cat === "Subtitles" ? "captions" : x.cat === "Organizing" ? "folder" : "play"} className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-bold text-[#18123b]">{x.title}</span>
                <span className="block text-[12.5px] text-[#4b4763] mt-0.5">{x.cat} · {x.steps.length} steps{dn > 0 ? ` · ${dn} done` : ""}</span>
              </span>
              <span className="ms-auto text-[#4b4763]/50"><MenuIcon name="chevron" className="w-4 h-4" /></span>
            </button>
          );
        })}
        {shown.length === 0 && <p className="px-5 py-8 text-sm text-[#4b4763] text-center">No tutorial matches this search.</p>}
      </div>
    </Page>
  );
}

/* ── Use cases: filter + detail view ────────────────────────────────────── */
export function TUseCases({ goAudience }) {
  const u = RICH_DATA.usecases;
  const auds = [...new Set(u.items.map((x) => x.aud))];
  const [f, setF] = useState("All");
  const [openId, setOpenId] = useState(null);
  const shown = u.items.filter((x) => f === "All" || x.aud === f);
  const open = openId ? u.items.find((x) => x.id === openId) : null;
  return (
    <Page section="Resources" crumb="Use Cases">
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">See how people use Aud</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">Generic, realistic situations — pick one to see the scenario and the outcome.</p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        {["All", ...auds].map((a) => (
          <button key={a} onClick={() => { setF(a); setOpenId(null); }} aria-pressed={f === a}
            className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold capitalize transition ${f === a ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {a}
          </button>
        ))}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((x) => (
          <button key={x.id} onClick={() => setOpenId(x.id)} aria-expanded={openId === x.id}
            className="text-start rounded-xl bg-white border border-[#18123b]/10 p-5 hover:border-[#6415f5]/40 transition">
            <span className="w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
              <MenuIcon name={x.icon} className="w-5 h-5" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#18123b]">{x.title}</p>
            <p className="mt-1 text-[13px] text-[#4b4763] leading-relaxed">{x.scenario}</p>
          </button>
        ))}
      </div>

      {open && (
        <div className="mt-8 rounded-2xl bg-[#f6f3ed] border border-[#18123b]/10 p-6 sm:p-8" aria-live="polite">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[0.14em] text-[#6415f5] uppercase">{open.title}</p>
              <h2 className="mt-1.5 text-xl font-semibold text-[#18123b]">{open.scenario}</h2>
            </div>
            <button onClick={() => setOpenId(null)} aria-label="Close detail" className="text-[#4b4763]/60 hover:text-[#18123b] text-[18px] px-2">✕</button>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-[#18123b]/10 p-5">
              <p className="text-[12px] font-black tracking-[0.12em] text-[#4b4763]/70 uppercase">The situation</p>
              <p className="mt-2 text-[14px] text-[#4b4763] leading-relaxed">{open.scenario}</p>
            </div>
            <div className="rounded-xl bg-white border border-[#18123b]/10 p-5">
              <p className="text-[12px] font-black tracking-[0.12em] text-[#6415f5] uppercase">The outcome</p>
              <p className="mt-2 text-[14px] text-[#18123b]/85 leading-relaxed">{open.outcome}</p>
            </div>
          </div>
          <button onClick={() => goAudience(open.aud)} className="mt-5 px-5 py-2.5 rounded-[10px] bg-[#6415f5] text-white text-[13.5px] font-semibold hover:bg-[#5311cf] transition">
            See the full workflow for this audience →
          </button>
        </div>
      )}
    </Page>
  );
}

/* ── Supported Languages: search, script filter, alphabet bar, ISO, copy ── */
export function TLanguages() {
  const l = SPEC_DATA ? null : null; // placeholder (kept for readability)
  const [q, setQ] = useState("");
  const [script, setScript] = useState("All");
  const [msg, say] = useAnnounce();
  const isLatin = (label) => /^[\x00-\x24\x26-\x7E (]*$/.test(label.replace(/\s|\(|\)/g, ""));
  const filtered = useMemo(() => ALL_LANGUAGES.filter((x) => {
    const mQ = x.label.toLowerCase().includes(q.toLowerCase());
    const mS = script === "All" || (script === "Latin" ? isLatin(x.label) : !isLatin(x.label));
    return mQ && mS;
  }), [q, script]);
  const letters = [...new Set(filtered.map((x) => x.label[0].toUpperCase()))].sort();
  const jump = (L) => {
    const el = document.getElementById("lang-" + L);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <Page section="Resources" crumb="Supported Languages">
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">Languages Aud supports</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">Transcribe and translate across {ALL_LANGUAGES.length} languages. Search to check yours.</p>

      <div className="relative mt-7">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b4763]/60"><MenuIcon name="search" className="w-[18px] h-[18px]" /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a language" aria-label="Search a language"
          className="w-full rounded-xl border border-[#18123b]/15 bg-white pl-11 pr-4 py-3.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {["All", "Latin", "Non-Latin"].map((s) => (
          <button key={s} onClick={() => setScript(s)} aria-pressed={script === s}
            className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition ${script === s ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {s === "All" ? "All" : s + " script"}
          </button>
        ))}
        <span className="ms-auto text-[12.5px] font-semibold text-[#4b4763]" aria-live="polite">Showing {filtered.length} of {ALL_LANGUAGES.length}</span>
      </div>

      {q === "" && script === "All" && (
        <div className="mt-4 flex flex-wrap gap-1.5" role="navigation" aria-label="Alphabet jump">
          {letters.map((L) => (
            <button key={L} onClick={() => jump(L)} className="w-7 h-7 rounded-md text-[11.5px] font-bold text-[#6415f5] bg-[#6415f5]/[0.06] hover:bg-[#6415f5]/[0.14] transition">{L}</button>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map((x) => (
          <div key={x.value} id={"lang-" + x.label[0].toUpperCase()} className="rounded-lg bg-white border border-[#18123b]/10 px-4 py-3 flex items-center justify-between gap-2 scroll-mt-28">
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-[#18123b] truncate">{x.label}</span>
              <span className="block text-[11px] font-mono text-[#4b4763]/70">ISO: {x.value}</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-[#4b4763]/70" title="AI transcription">A</span>
              <button onClick={() => copyText(x.value, say)} aria-label={`Copy language code ${x.value}`}
                className="px-2 py-1 rounded-md text-[10.5px] font-bold text-[#6415f5] bg-[#6415f5]/[0.08] hover:bg-[#6415f5]/[0.16] transition">Copy code</button>
            </span>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-sm text-[#4b4763] py-8 text-center">No language matches "{q}".</p>}
      </div>
      <p className="mt-4 text-[12px] text-[#4b4763]/80">A = AI transcription. This list follows the documented Whisper language set — the engine behind Aud.</p>
      <Live message={msg} />
    </Page>
  );
}

/* ── Changelog: tag filter + search ─────────────────────────────────────── */
export function TChangelog() {
  const c = SPEC_DATA.changelog;
  const [tag, setTag] = useState("All");
  const [q, setQ] = useState("");
  const tags = [...new Set(c.entries.map((e) => e.tag))];
  const shown = c.entries.filter((e) =>
    (tag === "All" || e.tag === tag) &&
    (e.title + " " + e.text).toLowerCase().includes(q.toLowerCase())
  );
  const tagCls = { New: "bg-[#6415f5]/[0.08] text-[#6415f5]", Improved: "bg-emerald-50 text-emerald-700", Fixed: "bg-emerald-50 text-emerald-700" };
  return (
    <Page section="Resources" crumb="Changelog">
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">What's new in Aud</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">Every improvement, in order.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the changelog…" aria-label="Search the changelog"
          className="flex-1 min-w-[200px] rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        {["All", ...tags].map((x) => (
          <button key={x} onClick={() => setTag(x)} aria-pressed={tag === x}
            className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition ${tag === x ? "bg-[#6415f5] text-white" : "bg-white border border-[#18123b]/15 text-[#4b4763] hover:border-[#6415f5]/40"}`}>
            {x}
          </button>
        ))}
      </div>

      <div className="mt-8 border-l-2 border-[#18123b]/10 pl-7 space-y-9">
        {shown.map((e) => (
          <div key={e.title} className="relative">
            <span className="absolute -left-[35px] top-1 w-3.5 h-3.5 rounded-full bg-[#6415f5]" />
            <p className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${tagCls[e.tag] || "bg-[#18123b]/[0.06] text-[#4b4763]"}`}>{e.tag}</span>
              <span className="text-[15.5px] font-bold text-[#18123b]">{e.title}</span>
            </p>
            <p className="mt-1 text-[13.5px] text-[#4b4763] leading-relaxed">{e.text}</p>
          </div>
        ))}
        {shown.length === 0 && <p className="text-sm text-[#4b4763] py-6">No entry matches this filter.</p>}
      </div>
    </Page>
  );
}
