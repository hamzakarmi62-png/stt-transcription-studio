import { useEffect, useRef, useState } from "react";
import { SPEC_DATA } from "../specData.js";
import { RICH_DATA } from "../specContent.js";
import { ALL_LANGUAGES, BRAND } from "../siteData.js";
import { MenuIcon } from "./MenuIcons.jsx";
import { SampleTranscript, SampleQA, TranslationSample, SampleFolders, SampleEditor } from "./tools/Samples.jsx";
import { FileChecker, LinkChecker, SubtitleConverter, TimeEstimator } from "./tools/Checkers.jsx";
import { usePost, FormNote, SampleTag, CopyLinkBtn } from "./tools/ui.jsx";
import { PageToc, SectionH, FaqBlock } from "./Toc.jsx";

// Enriched spec page templates: mockup layout + rich content + working tools.
// Every tool is client-side and labeled "Sample" where it is not the live engine.

const CONTACT_EMAIL = BRAND.email;

function Crumb({ section, text, badge }) {
  return (
    <p className="text-[13px] text-[#4b4763]/80 mb-5 flex items-center gap-2.5 flex-wrap">
      <span>{section} / {text}</span>
      {badge && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">{badge}</span>}
    </p>
  );
}

function Page({ section, crumb, badge, desc, children }) {

  useEffect(() => {
    document.title = `${crumb} — Aud`;
    const m = document.querySelector('meta[name="description"]');
    if (m && desc) m.setAttribute("content", desc);
  }, [crumb, desc]);
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

function scrollToTools() {
  document.getElementById("page-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function PurpleBtn({ children, onClick, outline }) {
  return outline ? (
    <button onClick={onClick} className="px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white text-[14px] font-semibold hover:bg-[#6415f5]/[0.06] transition">{children}</button>
  ) : (
    <button onClick={onClick || scrollToTools} className="px-6 py-3 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition shadow-sm">{children}</button>
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

/* ── Optional guest demo (behind GET /api/public/config → guest_demo) ───── */
function GuestDemo() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState("idle");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [file, setFile] = useState(null);
  useEffect(() => {
    fetch("/api/public/config").then((r) => r.json()).then((d) => setEnabled(!!d.guest_demo)).catch(() => {});
  }, []);
  if (!enabled) return null;

  const submit = async () => {
    if (!file) { setErr("Choose a short audio file first."); return; }
    if (file.size > 25 * 1024 * 1024) { setErr("The demo accepts files up to 25 MB."); return; }
    setState("loading"); setErr(""); setText("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/public/guest-demo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setErr(data.error || `The demo failed (${res.status}).`); setState("error"); return; }
      setText(data.text || "(empty result)"); setState("success");
    } catch {
      setErr("The service could not be reached. Please try again in a moment."); setState("error");
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6" id="guest-demo">
      <div className="flex flex-wrap items-center gap-2.5 mb-3">
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#6415f5] text-white text-[10px] font-black tracking-wide uppercase">Try it now</span>
        <span className="text-[12px] text-[#4b4763]">Short clip, no login — up to 60 seconds and 25 MB. The audio is processed for this one response and not stored.</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files && e.target.files[0])} aria-label="Choose a short audio clip"
          className="text-[13px] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[#6415f5]/[0.08] file:text-[#6415f5] file:font-semibold" />
        <button onClick={submit} disabled={state === "loading"} className="px-4 py-2 rounded-lg bg-[#6415f5] text-white text-[12.5px] font-semibold hover:bg-[#5311cf] transition disabled:opacity-50">
          {state === "loading" ? "Transcribing…" : "Transcribe the clip"}
        </button>
      </div>
      {err && <p role="alert" className="mt-3 text-[13px] font-semibold text-red-600">{err}</p>}
      {text && (
        <div className="mt-4 rounded-xl bg-[#f6f3ed] border border-[#18123b]/10 p-4">
          <p className="text-[14px] text-[#18123b]/90 whitespace-pre-wrap leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}

// Extra facts written in data (not invented): link-type guide, human detail.
function LinkGuide() {
  const g = RICH_DATA.linkGuide;
  return (
    <div className="space-y-4">
      {g.items.map(([h, p]) => (
        <div key={h} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
          <p className="text-[15px] font-bold text-[#18123b]">{h}</p>
          <p className="mt-1.5 text-[13.5px] text-[#4b4763] leading-relaxed">{p}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Template: feature page (enriched) ──────────────────────────────────── */
export function TFeaturePage({ slug, goFeature, goPage }) {
  const [spkCount, setSpkCount] = useState(3);
  const f = SPEC_DATA.features[slug];
  const g = RICH_DATA.groupPages[slug];
  if (!f && !g) return null;
  const tools = (() => {
    switch (slug) {
      case "ai-transcription": return [<FileChecker key="fc" />, <SampleTranscript key="st" />];
      case "link-import": return [<LinkChecker key="lc" />];
      case "share": return [<SubtitleConverter key="sc" />];
      case "translation": return [<TranslationSample key="ts" />];
      case "ask": return [<SampleQA key="qa" kind="chat" />];
      case "key-moments": return [<SampleQA key="km" kind="moments" />];
      case "files-folders": return [<SampleFolders key="sf" />];
      case "editor": return [<SampleEditor key="se" />];
      case "speaker-detection": return [<SampleTranscript key="st2" />];
      default: return null;
    }
  })();

  const toc = [
    { id: "how", label: "How it works" },
    ...(tools ? [{ id: "page-tools", label: "Try it on this page" }] : []),
    ...(slug === "ai-transcription" ? [{ id: "quality", label: "What affects quality" }, { id: "formats", label: "Formats" }] : []),
    ...(slug === "link-import" ? [{ id: "linktypes", label: "Link types & problems" }] : []),
    ...(slug === "share" ? [{ id: "exportguide", label: "Format guide" }, { id: "cmptable", label: "Comparison" }, { id: "sharing", label: "Sharing vs exporting" }] : []),
    ...(slug === "translation" ? [{ id: "trhow", label: "How it works" }, { id: "trtips", label: "Tips" }] : []),
    ...(slug === "speaker-detection" ? [{ id: "spktips", label: "Tips" }] : []),
    ...(slug === "editor" ? [{ id: "edtips", label: "Workflow & tips" }] : []),
    { id: "related", label: "Related features" },
    { id: "faq", label: "Questions" },
  ];

  return (
    <Page section="Product" crumb={(f || g).crumb}>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
        <div>
          <h1 className="text-[clamp(28px,2.8vw,42px)] leading-[1.18] font-semibold tracking-[-0.015em] text-[#18123b]">{(f || g).headline}</h1>
          <p className="mt-3.5 text-[16px] leading-[1.65] text-[#4b4763] max-w-[540px]">{(f || g).desc}</p>
          <div className="mt-6"><PurpleBtn>{f?.cta || "Explore the features"}</PurpleBtn></div>
        </div>
        {f ? <SpeakerCard rows={f.card} /> : (
          <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-6">
            <p className="text-[13px] font-semibold text-[#4b4763] mb-3">What this group covers:</p>
            <ul className="space-y-2">
              {g.items.map(([label, , para]) => (
                <li key={label} className="text-[13.5px] text-[#18123b]/85"><b>{label}</b> — {para.split("—")[0]}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-12 grid lg:grid-cols-[220px_1fr] gap-10 items-start">
        <PageToc items={toc} />
        <div className="min-w-0">
          <SectionH id="how">How it works</SectionH>
          <StepsRow steps={f ? f.steps : g.items.map(([label]) => [label, ""])} />
          {g && (
            <div className="mt-5 space-y-3">
              {g.items.map(([label, target, para]) => (
                <button key={label} onClick={() => (target.includes(":") ? goPage && goPage(target) : goFeature(target))} className="w-full text-start rounded-xl bg-white border border-[#18123b]/10 p-5 hover:border-[#6415f5]/40 transition">
                  <p className="text-[15px] font-bold text-[#18123b] group-hover:text-[#6415f5]">{label} →</p>
                  <p className="mt-1 text-[13.5px] text-[#4b4763] leading-relaxed">{para}</p>
                </button>
              ))}
            </div>
          )}

          {slug === "ai-transcription" && (
            <>
              <div className="mt-12"><SectionH id="quality">What affects quality</SectionH></div>
              <p className="text-[14px] text-[#4b4763] leading-relaxed mb-5">{RICH_DATA.quality.intro}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {RICH_DATA.quality.factors.map((x) => (
                  <div key={x.h} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
                    <p className="text-[14.5px] font-bold text-[#18123b]">{x.h}</p>
                    <p className="mt-1.5 text-[13px] text-[#4b4763] leading-relaxed">{x.p}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12"><SectionH id="formats">Formats Aud accepts</SectionH></div>
              <div className="overflow-x-auto rounded-xl border border-[#18123b]/10">
                <table className="w-full text-[13.5px] bg-white">
                  <thead><tr className="bg-[#f6f3ed] text-start"><th className="px-4 py-3 text-start font-bold">Format</th><th className="px-4 py-3 text-start font-bold">What it is</th><th className="px-4 py-3 text-start font-bold">Typical source</th></tr></thead>
                  <tbody>
                    {RICH_DATA.formats.rows.map((r) => (
                      <tr key={r[0]} className="border-t border-[#18123b]/[0.07]">
                        <td className="px-4 py-3 font-bold text-[#18123b]">{r[0]}</td>
                        <td className="px-4 py-3 text-[#4b4763]">{r[1]}</td>
                        <td className="px-4 py-3 text-[#4b4763]">{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[12px] text-[#4b4763]/80">{RICH_DATA.formats.tip}</p>
            </>
          )}

          {slug === "link-import" && (
            <div className="mt-12"><SectionH id="linktypes">Supported link types &amp; common problems</SectionH><LinkGuide /></div>
          )}

          {slug === "share" && (
            <div className="mt-12"><SectionH id="sharing">{RICH_DATA.shareLinks.h}</SectionH>
              <div className="rounded-xl bg-white border border-[#18123b]/10 p-5">
                <p className="text-[13.5px] text-[#4b4763] leading-relaxed">{RICH_DATA.shareLinks.p1}</p>
                <p className="mt-2 text-[13.5px] text-[#4b4763] leading-relaxed">{RICH_DATA.shareLinks.p2}</p>
              </div>
            </div>
          )}

          {slug === "share" && (
            <>
              <div className="mt-12"><SectionH id="exportguide">When to use each format</SectionH></div>
              <div className="space-y-4">
                {RICH_DATA.exportGuide.items.map((x) => (
                  <div key={x.h} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
                    <p className="text-[15px] font-bold text-[#18123b]">{x.h}</p>
                    <p className="mt-1.5 text-[13.5px] text-[#4b4763] leading-relaxed">{x.p}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12"><SectionH id="cmptable">Comparison at a glance</SectionH></div>
              <div className="overflow-x-auto rounded-xl border border-[#18123b]/10">
                <table className="w-full text-[13.5px] bg-white">
                  <thead><tr className="bg-[#f6f3ed]">{RICH_DATA.exportGuide.table.head.map((h) => <th key={h} className="px-4 py-3 text-start font-bold">{h}</th>)}</tr></thead>
                  <tbody>
                    {RICH_DATA.exportGuide.table.rows.map((r) => (
                      <tr key={r[0]} className="border-t border-[#18123b]/[0.07]">
                        {r.map((c, i) => <td key={i} className={`px-4 py-3 ${i === 0 ? "font-bold text-[#18123b]" : "text-[#4b4763]"}`}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {slug === "translation" && (
            <>
              <div className="mt-12"><SectionH id="trhow">How original and translation coexist</SectionH></div>
              <div className="space-y-4">
                {RICH_DATA.translation.how.map((x) => (
                  <div key={x.h} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
                    <p className="text-[15px] font-bold text-[#18123b]">{x.h}</p>
                    <p className="mt-1.5 text-[13.5px] text-[#4b4763] leading-relaxed">{x.p}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12"><SectionH id="trtips">Tips for better translations</SectionH></div>
              <FaqBlock items={RICH_DATA.translation.tips.map((x) => [x.h, x.p])} idBase="trtips" />
              <div className="mt-8">
                <button onClick={() => goPage && goPage("languages")} className="px-3.5 py-2 rounded-lg bg-[#6415f5]/[0.08] text-[#6415f5] text-[13px] font-semibold hover:bg-[#6415f5]/[0.14] transition">
                  Searchable language list →
                </button>
              </div>
            </>
          )}

          {slug === "speaker-detection" && (
            <div className="mt-12"><SectionH id="spktips">Tips for better speaker separation</SectionH></div>
          )}
          {(slug === "speaker-detection") && (
            <FaqBlock items={RICH_DATA.speakerTips.map((x) => [x.h, x.p])} idBase="spktips" />
          )}

          {slug === "editor" && (
            <div className="mt-12"><SectionH id="edtips">The editing workflow</SectionH></div>
          )}
          {slug === "editor" && <FaqBlock items={RICH_DATA.editorTips.map((x) => [x.h, x.p])} idBase="edtips" />}

          {tools && (
            <div className="mt-12" id="page-tools">
              <SectionH id="tools-title">Try it on this page</SectionH>
              <div className="space-y-6">{tools}</div>
              {slug === "speaker-detection" && (
                <div className="mt-5 rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5">
                  <p className="text-[13px] font-semibold text-[#4b4763] mb-2">How many speakers? The sample regroups as you choose:</p>
                  <div className="flex gap-2" role="group" aria-label="Expected speakers">
                    {[1, 2, 3].map((n) => (
                      <button key={n} onClick={() => setSpkCount(n)} aria-pressed={spkCount === n}
                        className={`px-4 py-2 rounded-lg text-[12.5px] font-bold transition ${spkCount === n ? "bg-[#6415f5] text-white" : "bg-[#f6f3ed] text-[#4b4763] hover:bg-[#18123b]/[0.06]"}`}>
                        {n} speaker{n > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                  <SpeakerRegroup count={spkCount} />
                </div>
              )}
            </div>
          )}

          {f && (
            <>
              <div className="mt-12" id="related"><SectionH id="related-h">Related features</SectionH></div>
              <Chips items={f.related.map(([label, s]) => [label, s])} goFeature={goFeature} />
              <div className="mt-12" id="faq"><SectionH id="faq-h">Questions</SectionH></div>
              <FaqBlock items={f.faq} idBase="faq" />
              {slug === "ai-transcription" && (
                <div className="mt-6"><FaqBlock items={RICH_DATA.aiFaq} idBase="ai-faq" /></div>
              )}
              <button onClick={scrollToTools} className="mt-14 w-full py-4 rounded-xl bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition shadow-sm">
                {f.cta} — the tool is on this page
              </button>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}

// Regroups the demo transcript lines under N speakers (1–3).
function SpeakerRegroup({ count }) {
  const d = RICH_DATA.demoTranscript;
  const groups = Array.from({ length: count }, () => []);
  d.lines.forEach((l) => groups[Math.min(l.s, count - 1)].push(l));
  return (
    <div className="mt-4 space-y-2" aria-live="polite">
      {groups.map((g, gi) => (
        <div key={gi} className="rounded-xl bg-[#f6f3ed] border border-[#18123b]/10 p-3">
          <p className="text-[12.5px] font-bold" style={{ color: d.speakers[Math.min(gi, 2)].color }}>
            {d.speakers[Math.min(gi, 2)].name} · {g.length} line{g.length !== 1 ? "s" : ""}
          </p>
          {g.map((l, i) => <p key={i} className="text-[13px] text-[#18123b]/85 mt-0.5">{l.text}</p>)}
        </div>
      ))}
    </div>
  );
}

/* ── Template: human-verified service page (planned) + waitlist ─────────── */
export function THumanPage({ slug }) {
  const h = SPEC_DATA.human;
  const p = h.pages[slug];
  const w = usePost("/api/public/waitlist");
  const [email, setEmail] = useState("");
  const [langs, setLangs] = useState("");
  const [note, setNote] = useState("");
  if (!p) return null;
  const submit = (e) => {
    e.preventDefault();
    const site = e.target.elements["website"]?.value || "";
    w.post({ kind: "service", service: p.service, email, languages: langs, note, website: site },
      "You're on the list — we'll email you when the service goes live.");
  };
  return (
    <Page section="Product" crumb={p.crumb} badge={h.badge} desc={p.desc}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] leading-[1.18] font-semibold tracking-[-0.015em] text-[#18123b]">{p.headline}</h1>
      <p className="mt-3.5 text-[16px] leading-[1.65] text-[#4b4763] max-w-[540px]">{p.desc}</p>
      <div className="mt-6"><PurpleBtn onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}>{h.cta}</PurpleBtn></div>

      <div className="mt-12 grid lg:grid-cols-[220px_1fr] gap-10 items-start">
        <PageToc items={[{ id: "how", label: "How it would work" }, { id: "status", label: "Status" }, { id: "waitlist", label: "Join the waitlist" }]} />
        <div className="min-w-0">
          <SectionH id="how">{p.stepsTitle}</SectionH>
          <StepsRow steps={p.steps} />

          <div className="mt-10" id="status"><SectionH id="status-h">Status</SectionH></div>
          <div className="rounded-xl bg-white border border-[#18123b]/10 p-5">
            <p className="text-[13.5px] text-[#4b4763] leading-relaxed">{p.detail}</p>
          </div>

          <div className="mt-12" id="waitlist"><SectionH id="waitlist-h">Join the waitlist</SectionH></div>
          <form onSubmit={submit} className="rounded-2xl bg-white border border-[#18123b]/10 p-6 space-y-4 max-w-[560px]">
            <div>
              <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="wl-service">Service</label>
              <input id="wl-service" value={p.service} readOnly className="w-full rounded-lg border border-[#18123b]/15 bg-[#f6f3ed] px-4 py-2.5 text-[14px] font-semibold text-[#18123b]/80 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="wl-email">Email</label>
              <input id="wl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="wl-langs">Languages you need reviewed</label>
              <input id="wl-langs" required value={langs} onChange={(e) => setLangs(e.target.value)} placeholder="e.g. Arabic (Maghrebi), French, English" className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="wl-note">Optional note</label>
              <textarea id="wl-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
            </div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <button type="submit" disabled={w.state === "loading"} className="px-6 py-3 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition disabled:opacity-50">
              {w.state === "loading" ? "Sending…" : "Join the waitlist"}
            </button>
            <FormNote {...w} />
          </form>
        </div>
      </div>
    </Page>
  );
}

/* ── Template: audience page (enriched) ─────────────────────────────────── */
export function TAudiencePage({ slug, goFeature }) {
  const base = {
    businesses: { title: "Meetings that write their own minutes", video: "/videos/feat-team.mp4", poster: "/videos/feat-team.jpg" },
    creators: { title: "One recording, every format", video: "/videos/hero-woman.mp4", poster: "/videos/hero-woman.jpg" },
    researchers: { title: "Interviews, coded in minutes", video: "/videos/feat-multilang.mp4", poster: "/videos/feat-multilang.jpg" },
    newsrooms: { title: "Quote accurately, publish faster", video: "/videos/feat-linkimport.mp4", poster: "/videos/feat-linkimport.jpg" },
    education: { title: "Every lecture, readable", video: "/videos/feat-team.mp4", poster: "/videos/feat-team.jpg" },
    video: { title: "Subtitles for whole libraries", video: "/videos/feat-share.mp4", poster: "/videos/feat-share.jpg" },
    consulting: { title: "Discovery interviews, structured", video: "/videos/feat-enterprise.mp4", poster: "/videos/feat-enterprise.jpg" },
  }[slug];
  const a = RICH_DATA.audiences[slug];
  if (!base || !a) return null;
  const titles = { businesses: "Businesses", creators: "Creators & podcasters", researchers: "Researchers", newsrooms: "Journalists & newsrooms", education: "Education", video: "Video accessibility", consulting: "Research & consulting" };
  const toc = [
    { id: "problem", label: "The problem" },
    { id: "how", label: "How Aud helps" },
    { id: "workflow", label: "A realistic workflow" },
    { id: "rec", label: "Recommended features" },
    { id: "tips", label: "Tips" },
    { id: "est", label: "Manual-time estimator" },
    { id: "audfaq", label: "Questions" },
  ];
  return (
    <Page section="Features" crumb={titles[slug]}>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
        <div>
          <h1 className="text-[clamp(28px,2.8vw,42px)] leading-[1.18] font-semibold tracking-[-0.015em] text-[#18123b]">{base.title}</h1>
          <p className="mt-3.5 text-[16px] leading-[1.65] text-[#4b4763]">{a.pains[0]}</p>
        </div>
        <div className="relative rounded-[26px] overflow-hidden shadow-2xl shadow-[#18123b]/25 h-[260px] sm:h-[320px]">
          <video src={base.video} poster={base.poster} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12101f]/40 to-transparent" />
        </div>
      </div>

      <div className="mt-12 grid lg:grid-cols-[220px_1fr] gap-10 items-start">
        <PageToc items={toc} />
        <div className="min-w-0">
          <SectionH id="problem">The problem</SectionH>
          <ul className="space-y-2.5 mb-2">
            {a.pains.map((p, i) => <li key={i} className="flex gap-3 text-[14px] text-[#4b4763] leading-relaxed"><span className="text-[#6415f5] font-bold">•</span>{p}</li>)}
          </ul>

          <div className="mt-10"><SectionH id="how">How Aud helps</SectionH></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {a.recommended.map(([label, s, why]) => (
              <button key={label} onClick={() => goFeature(s)} className="text-start rounded-xl bg-white border border-[#18123b]/10 p-5 hover:border-[#6415f5]/40 transition">
                <p className="text-[14.5px] font-bold text-[#18123b]">{label}</p>
                <p className="mt-1 text-[13px] text-[#4b4763] leading-relaxed">{why}</p>
              </button>
            ))}
          </div>

          <div className="mt-10"><SectionH id="workflow">A realistic workflow</SectionH></div>
          <ol className="space-y-3 mb-4">
            {a.workflow.map((s, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#6415f5] text-white text-[12px] font-bold flex items-center justify-center">{i + 1}</span>
                <p className="text-[14px] text-[#4b4763] leading-relaxed pt-1">{s}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10"><SectionH id="rec">Recommended features</SectionH></div>
          <div className="flex flex-wrap gap-2.5">
            {a.recommended.map(([label, s]) => (
              <button key={s} onClick={() => goFeature(s)} className="px-3.5 py-2 rounded-lg bg-[#6415f5]/[0.08] text-[#6415f5] text-[13px] font-semibold hover:bg-[#6415f5]/[0.14] transition">{label}</button>
            ))}
          </div>

          <div className="mt-10"><SectionH id="tips">Tips for this audience</SectionH></div>
          <div className="space-y-3">
            {a.tips.map((t, i) => (
              <div key={i} className="rounded-xl bg-white border border-[#18123b]/10 p-4 text-[13.5px] text-[#4b4763] leading-relaxed">
                <b className="text-[#18123b]">Tip {i + 1}.</b> {t}
              </div>
            ))}
          </div>

          <div className="mt-10" id="est"><SectionH id="est-h">Manual-time estimator</SectionH></div>
          <TimeEstimator workflow={a.workflow} />

          <div className="mt-10" id="audfaq"><SectionH id="audfaq-h">Questions</SectionH></div>
          <FaqBlock items={a.faq} idBase="audfaq" />
        </div>
      </div>
    </Page>
  );
}

/* ── Template: contact (posts to the backend) ───────────────────────────── */
export function TContact({ goPage }) {
  const c = SPEC_DATA.contact;
  const post = usePost("/api/public/contact");
  const [form, setForm] = useState({ name: "", email: "", topic: "Support", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const site = e.target.elements["website"]?.value || "";
    post.post({ ...form, website: site }, "Received — we reply by email.");
  };
  const missing = RICH_DATA.missing;
  return (
    <Page section="About" crumb={c.crumb} desc={c.desc}>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{c.headline}</h1>
          <p className="mt-3.5 text-[15.5px] text-[#4b4763] max-w-[420px]">{c.desc}</p>
          <div className="mt-8 space-y-5">
            {missing.supportEmail && (
              <div className="flex items-center gap-4">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]"><MenuIcon name="mail" className="w-5 h-5" /></span>
                <span><span className="block text-[14.5px] font-bold text-[#18123b]">Email</span><span className="block text-[13px] text-[#4b4763]">{missing.supportEmail}</span></span>
              </div>
            )}
            {missing.supportHours && (
              <div className="flex items-center gap-4">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]"><MenuIcon name="clock" className="w-5 h-5" /></span>
                <span><span className="block text-[14.5px] font-bold text-[#18123b]">Support hours</span><span className="block text-[13px] text-[#4b4763]">{missing.supportHours}</span></span>
              </div>
            )}
            <button onClick={() => goPage("info:help")} className="flex items-center gap-4 text-start w-full group">
              <span className="shrink-0 w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]"><MenuIcon name="help" className="w-5 h-5" /></span>
              <span><span className="block text-[14.5px] font-bold text-[#18123b] group-hover:text-[#6415f5] transition-colors">Quick answers</span><span className="block text-[13px] text-[#4b4763]">Visit the Help Center</span></span>
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white border border-[#18123b]/10 p-6 sm:p-7 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="ct-name">{c.form.name}</label>
            <input id="ct-name" required value={form.name} onChange={set("name")} placeholder={c.form.namePh} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="ct-email">{c.form.email}</label>
            <input id="ct-email" type="email" required value={form.email} onChange={set("email")} placeholder={c.form.emailPh} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="ct-topic">{c.form.topic}</label>
            <select id="ct-topic" value={form.topic} onChange={set("topic")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30">
              {c.form.topics.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="ct-msg">{c.form.message}</label>
            <textarea id="ct-msg" rows={4} required value={form.message} onChange={set("message")} placeholder={c.form.messagePh} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <button type="submit" disabled={post.state === "loading"} className="px-6 py-3 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition disabled:opacity-50">
            {post.state === "loading" ? "Sending…" : c.form.submit}
          </button>
          <FormNote {...post} />
        </form>
      </div>
    </Page>
  );
}

/* ── Template: contact support (topic fixed to Support) ─────────────────── */
export function TContactSupport({ goPage }) {
  const c = SPEC_DATA.support;
  const post = usePost("/api/public/contact");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const site = e.target.elements["website"]?.value || "";
    post.post({ ...form, topic: "Support", website: site }, "Received — support replies by email.");
  };
  return (
    <Page section="Resources" crumb={c.crumb} desc={c.desc}>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{c.headline}</h1>
          <p className="mt-3.5 text-[15.5px] text-[#4b4763] max-w-[420px]">{c.desc}</p>
          <div className="mt-8">
            <PurpleBtn outline onClick={() => goPage("info:help")}>Browse the Help Center first</PurpleBtn>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-2xl bg-white border border-[#18123b]/10 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#4b4763]">Topic</span>
            <span className="px-2.5 py-1 rounded-md bg-[#6415f5]/[0.08] text-[#6415f5] text-[11.5px] font-bold">Support</span>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="cs-name">Name</label>
            <input id="cs-name" required value={form.name} onChange={set("name")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="cs-email">Email</label>
            <input id="cs-email" type="email" required value={form.email} onChange={set("email")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="cs-msg">Message</label>
            <textarea id="cs-msg" rows={5} required value={form.message} onChange={set("message")} placeholder="What happened, and what did you expect?" className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <button type="submit" disabled={post.state === "loading"} className="px-6 py-3 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition disabled:opacity-50">
            {post.state === "loading" ? "Sending…" : "Send to support"}
          </button>
          <FormNote {...post} />
        </form>
      </div>
    </Page>
  );
}

/* ── Template: careers (application posts to the backend) ───────────────── */
export function TCareers() {
  const c = SPEC_DATA.careers;
  const post = usePost("/api/public/careers");
  const [form, setForm] = useState({ name: "", email: "", role: "General application", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const site = e.target.elements["website"]?.value || "";
    post.post({ ...form, website: site }, "Application received — thank you.");
  };
  return (
    <Page section="About" crumb={c.crumb}>
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">{c.headline}</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763]">{c.sub}</p>

      {c.roles.length === 0 && (
        <div className="mt-8"><Dashed>{RICH_DATA.careers.emptyNote}</Dashed></div>
      )}
      {c.roles.length > 0 && (
        <div className="mt-8 rounded-xl bg-white border border-[#18123b]/10 divide-y divide-[#18123b]/[0.07]">
          {c.roles.map(([title, meta, dept], i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[14.5px] font-bold text-[#18123b]">{title}</p>
                <p className="text-[12.5px] text-[#4b4763] mt-0.5">{meta}</p>
              </div>
              <span className="ms-auto shrink-0 px-2.5 py-1 rounded-md bg-[#6415f5]/[0.08] text-[#6415f5] text-[11px] font-bold">{dept}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-8 rounded-2xl bg-white border border-[#18123b]/10 p-6 sm:p-7 space-y-4 max-w-[640px]">
        <p className="text-[15px] font-bold text-[#18123b]">Apply</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="cr-name">Name</label>
            <input id="cr-name" required value={form.name} onChange={set("name")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="cr-email">Email</label>
            <input id="cr-email" type="email" required value={form.email} onChange={set("email")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="cr-role">Role</label>
          <select id="cr-role" value={form.role} onChange={set("role")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] bg-white focus:outline-none">
            {["General application", ...c.roles.map((r) => r[0])].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="cr-msg">Message</label>
          <textarea id="cr-msg" rows={4} required value={form.message} onChange={set("message")} placeholder="A few lines about you and your work…" className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button type="submit" disabled={post.state === "loading"} className="px-6 py-3 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition disabled:opacity-50">
          {post.state === "loading" ? "Sending…" : "Send application"}
        </button>
        <FormNote {...post} />
      </form>
    </Page>
  );
}

/* ── Template: company (anchor navigation, facts only) ──────────────────── */
export function TCompany() {
  const c = SPEC_DATA.company;
  const m = RICH_DATA.missing;
  return (
    <Page section="About" crumb={c.crumb}>
      <h1 className="text-[clamp(28px,3vw,44px)] leading-[1.2] font-semibold tracking-[-0.015em] text-[#18123b] max-w-[820px]">{c.headline}</h1>
      <p className="mt-4 text-[16px] text-[#4b4763]">{c.desc}</p>

      <div className="mt-12 grid lg:grid-cols-[220px_1fr] gap-10 items-start">
        <PageToc items={[{ id: "mission", label: "Mission · approach · promise" }, { id: "built", label: "What Aud is built on" }, { id: "principles", label: "How we work" }]} />
        <div className="min-w-0">
          <SectionH id="mission">Mission · approach · promise</SectionH>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ["star", "Our mission", "Turn the world's spoken words into text anyone can read, search and keep — so no idea is lost to a missing transcript."],
              ["pencil", "Our approach", "AI does the heavy lifting first; a human reviewer for the work that cannot afford doubt is planned, and every result is built to be corrected in place."],
              ["shield", "Our promise", "Your files stay private: encrypted in transit and at rest, never sold, shared only through the links you create."],
            ].map(([icon, t, d]) => (
              <div key={t} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
                <span className="w-10 h-10 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
                  <MenuIcon name={icon} className="w-5 h-5" />
                </span>
                <p className="mt-3 text-[15px] font-bold text-[#18123b]">{t}</p>
                <p className="mt-1 text-[13px] text-[#4b4763] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12"><SectionH id="built">What Aud is built on</SectionH></div>
          <div className="rounded-xl bg-white border border-[#18123b]/10 p-5">
            <p className="text-[13.5px] text-[#4b4763] leading-relaxed">Aud's transcription runs on state-of-the-art speech models — Whisper-class recognition served through Groq's fast inference — wrapped in an editor built for verification: word-level timestamps, speaker labels and an audio player that follows the text.</p>
          </div>

          <div className="mt-12"><SectionH id="principles">How we work</SectionH></div>
          <div className="space-y-3">
            {[
              ["Every feature starts from a real transcription need", "The roadmap is shaped by people who transcribe — the founder included."],
              ["Privacy is a feature, not a footnote", "Encryption, authenticated access and no data resale are part of the product, not a policy afterthought."],
              ["AI drafts, humans decide", "The tool surfaces the words; you keep the meaning. Human review is planned for the work that cannot afford doubt."],
            ].map(([h, p]) => (
              <div key={h} className="rounded-xl bg-white border border-[#18123b]/10 p-5">
                <p className="text-[15px] font-bold text-[#18123b]">{h}</p>
                <p className="mt-1 text-[13.5px] text-[#4b4763] leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

/* ── Template: human reviewers [planned] + reviewer interest form ───────── */
export function TReviewers({ goFreelancers }) {
  const r = SPEC_DATA.reviewers;
  const post = usePost("/api/public/waitlist");
  const [form, setForm] = useState({ email: "", languages: "", note: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const site = e.target.elements["website"]?.value || "";
    post.post({ kind: "reviewer", service: "Reviewer application", ...form, website: site }, "Interest received — we'll be in touch when the program opens.");
  };
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

      <div className="mt-10"><Dashed>{r.plannedNotice}</Dashed></div>

      <form onSubmit={submit} className="mt-8 rounded-2xl bg-white border border-[#18123b]/10 p-6 space-y-4 max-w-[560px]">
        <p className="text-[15px] font-bold text-[#18123b]">Interested in reviewing?</p>
        <div>
          <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="rv-email">Email</label>
          <input id="rv-email" type="email" required value={form.email} onChange={set("email")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="rv-langs">Languages you can review</label>
          <input id="rv-langs" required value={form.languages} onChange={set("languages")} placeholder="e.g. Arabic (Algerian), French" className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#18123b] mb-1.5" htmlFor="rv-note">Optional note</label>
          <textarea id="rv-note" rows={3} value={form.note} onChange={set("note")} className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button type="submit" disabled={post.state === "loading"} className="px-6 py-3 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition disabled:opacity-50">
          {post.state === "loading" ? "Sending…" : "Register interest"}
        </button>
        <FormNote {...post} />
      </form>

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
          {a.sidebar.map((x) => (
            <button key={x} onClick={() => setActive(x)}
              className={`block w-full text-start px-3 py-2 rounded-lg text-[14px] font-medium transition ${active === x ? "text-[#6415f5] bg-[#6415f5]/[0.06]" : "text-[#4b4763] hover:text-[#18123b]"}`}>
              {x}
            </button>
          ))}
        </div>
        <div>
          <h1 className="text-[clamp(28px,2.8vw,40px)] font-semibold tracking-[-0.015em] text-[#18123b]">{a.title}</h1>
          <p className="mt-3 text-[15.5px] text-[#4b4763]">{a.desc}</p>
          <pre className="mt-7 rounded-xl bg-[#18123b] p-6 text-[13.5px] leading-[1.8] text-white font-mono whitespace-pre-wrap overflow-x-auto">{a.code}</pre>
          <div className="mt-7"><Dashed title={a.todoTitle}>{a.todo}</Dashed></div>
        </div>
      </div>
    </Page>
  );
}

/* ── Template: security & privacy (expandable + copy link) ──────────────── */
export function TSecurity() {
  const s = RICH_DATA.security;
  const badges = [
    ["shield", "AES-256", "Encryption at rest"],
    ["lock", "TLS", "Encryption in transit"],
    ["users", "Per account", "Authenticated access"],
    ["globe", "GDPR · RGPD", "Your data, your rights"],
  ];
  return (
    <Page section="About" crumb="Security and Privacy">
      <h1 className="text-[clamp(28px,2.8vw,42px)] font-semibold tracking-[-0.015em] text-[#18123b]">Your recordings stay yours</h1>
      <p className="mt-3 text-[15.5px] text-[#4b4763] max-w-[620px]">The promises below are the ones Aud actually makes — each explained in plain language, with what we do and do not do with your files.</p>

      <div className="mt-9 grid sm:grid-cols-4 gap-4">
        {badges.map(([icon, h, p]) => (
          <div key={h} className="rounded-xl bg-white border border-[#18123b]/10 p-5 text-center">
            <span className="mx-auto w-11 h-11 rounded-xl bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]"><MenuIcon name={icon} className="w-5 h-5" /></span>
            <p className="mt-3 text-[14.5px] font-bold text-[#18123b]">{h}</p>
            <p className="text-[12px] text-[#4b4763]">{p}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid lg:grid-cols-[220px_1fr] gap-10 items-start">
        <PageToc items={[{ id: "dodont", label: "Do / do not" }, { id: "claims", label: "The claims, explained" }, { id: "secfaq", label: "Questions" }]} />
        <div className="min-w-0">
          <SectionH id="dodont">What we do — and do not do — with your files</SectionH>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-[#18123b]/10 p-5">
              <p className="text-[14px] font-bold text-emerald-700 mb-3">We do</p>
              <ul className="space-y-2">{s.does.map((x, i) => <li key={i} className="text-[13.5px] text-[#4b4763] leading-relaxed">✓ {x}</li>)}</ul>
            </div>
            <div className="rounded-xl bg-white border border-[#18123b]/10 p-5">
              <p className="text-[14px] font-bold text-red-600 mb-3">We do not</p>
              <ul className="space-y-2">{s.doesNot.map((x, i) => <li key={i} className="text-[13.5px] text-[#4b4763] leading-relaxed">✕ {x}</li>)}</ul>
            </div>
          </div>

          <div className="mt-10"><SectionH id="claims">The claims, explained</SectionH></div>
          <div className="space-y-3">
            {[
              ["AES-256 encryption", "Files are encrypted while stored (AES-256 — the standard used across the industry) and encrypted while traveling (TLS on every request). Encryption means the stored data is unreadable without the keys."],
              ["No data sold", "Your recordings and transcripts are never sold or handed to third parties. Processing happens for your transcription purpose — that is the business, not your data."],
              ["Private, encrypted processing", "Access is authenticated per account: one account cannot read another's transcripts. Files are not public and not searchable by anyone except you."],
              ["GDPR (RGPD)", "Aud follows the European data-protection framework: your files are yours, private by default, sharing happens only through links you create, and deletion in the studio removes the material."],
            ].map(([h, p]) => (
              <details key={h} className="group rounded-xl bg-white border border-[#18123b]/10">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-[15px] font-semibold text-[#18123b]">
                  {h}
                  <span className="shrink-0 text-[18px] text-[#4b4763] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-5 pb-4 text-[14px] text-[#4b4763] leading-relaxed">{p}</p>
              </details>
            ))}
          </div>

          <div className="mt-10" id="secfaq"><SectionH id="secfaq-h">Questions</SectionH></div>
          <FaqBlock items={s.faq} idBase="secfaq" />
        </div>
      </div>
    </Page>
  );
}

/* ── Template: terms and privacy (tabs + scroll-spy TOC + print) ────────── */
export function TTerms() {
  const t = SPEC_DATA.terms;
  const [tab, setTab] = useState(t.tabs[0]);
  return (
    <Page section="About" crumb={t.crumb}>
      <div className="flex flex-wrap items-center gap-6 border-b border-[#18123b]/10">
        <div className="flex gap-8">
          {t.tabs.map((x) => (
            <button key={x} onClick={() => setTab(x)}
              className={`pb-3 text-[14.5px] font-semibold -mb-px border-b-2 transition ${tab === x ? "text-[#6415f5] border-[#6415f5]" : "text-[#4b4763] border-transparent hover:text-[#18123b]"}`}>
              {x}
            </button>
          ))}
        </div>
        <button onClick={() => window.print()} className="ms-auto mb-2 px-3.5 py-2 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12.5px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">Print</button>
      </div>

      <div className="mt-8 grid lg:grid-cols-[240px_1fr] gap-10 items-start">
        <PageToc items={t.toc.map((x) => ({ id: "sec-" + x.split(".")[0], label: x }))} />
        <div>
          <h1 className="text-[clamp(26px,2.6vw,36px)] font-semibold tracking-[-0.015em] text-[#18123b]">{tab}</h1>
          {RICH_DATA.missing.legalText ? (
            <p className="mt-2 text-[13px] text-[#4b4763]/80">Last updated: {RICH_DATA.missing.legalText}</p>
          ) : null}
          <div className="mt-7 space-y-10">
            {t.toc.map((x) => (
              <div key={x} id={"sec-" + x.split(".")[0]} className="scroll-mt-28">
                <p className="text-[16px] font-bold text-[#18123b]">{x}</p>
                <div className="mt-3 space-y-2">
                  <span className="block h-3 rounded bg-[#18123b]/[0.07] w-full" />
                  <span className="block h-3 rounded bg-[#18123b]/[0.07] w-5/6" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10"><Dashed>{SPEC_DATA.terms.note}</Dashed></div>
        </div>
      </div>
    </Page>
  );
}
