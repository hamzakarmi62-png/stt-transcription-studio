import { useEffect, useRef, useState } from "react";
import { RICH_DATA } from "../../specContent.js";
import { useAnnounce, copyText, downloadText, SampleTag, Live } from "./ui.jsx";

/* ── Sample transcript: click-highlight, inline speaker rename, timestamps
   toggle, copy text, download TXT. Shared by several pages. ───────────── */
export function SampleTranscript({ title = "Sample transcript" }) {
  const d = RICH_DATA.demoTranscript;
  const [names, setNames] = useState(d.speakers.map((s) => s.name));
  const [editing, setEditing] = useState(null);
  const [sel, setSel] = useState(null);
  const [showT, setShowT] = useState(true);
  const [msg, say] = useAnnounce();

  const plain = () => d.lines.map((l) => `${showT ? `[${l.t}] ` : ""}${names[l.s]}: ${l.text}`).join("\n");

  const commitName = (i, val) => {
    const v = val.trim();
    if (v) {
      setNames((n) => n.map((x, j) => (j === i ? v : x)));
      say(`Speaker renamed to ${v}`);
    }
    setEditing(null);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <SampleTag>{title}</SampleTag>
        <button onClick={() => { setShowT((v) => !v); say(showT ? "Timestamps hidden" : "Timestamps shown"); }}
          aria-pressed={showT}
          className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">
          {showT ? "Hide timestamps" : "Show timestamps"}
        </button>
        <button onClick={() => copyText(plain(), say)}
          className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">
          Copy text
        </button>
        <button onClick={() => { downloadText("aud-sample-transcript.txt", plain()); say("Downloaded sample transcript"); }}
          className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">
          Download TXT
        </button>
      </div>

      <div className="space-y-1.5" role="list" aria-label="Sample transcript lines">
        {d.lines.map((l, i) => (
          <div key={i} role="listitem">
            <button onClick={() => { setSel(i); say(`Line ${i + 1} selected`); }}
              className={`w-full text-start rounded-xl px-4 py-2.5 transition border ${sel === i ? "bg-[#6415f5]/[0.07] border-[#6415f5]/30" : "bg-white border-transparent hover:bg-[#18123b]/[0.03]"}`}>
              <span className="flex items-center gap-2">
                {editing === l.s ? (
                  <input autoFocus defaultValue={names[l.s]} onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => { if (e.key === "Enter") commitName(l.s, e.target.value); }}
                    onBlur={(e) => commitName(l.s, e.target.value)}
                    aria-label="Rename speaker"
                    className="w-36 px-2 py-0.5 rounded-md border border-[#6415f5]/40 text-[13px] font-bold focus:outline-none" />
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setEditing(l.s); }}
                    title="Click to rename this speaker"
                    className="text-[13px] font-bold hover:underline decoration-dotted underline-offset-2"
                    style={{ color: d.speakers[l.s].color }}>
                    {names[l.s]}
                  </button>
                )}
                {showT && <span className="text-[11.5px] font-semibold text-[#4b4763]/70">{l.t}</span>}
              </span>
              <span className="block text-[14px] text-[#18123b]/90 mt-0.5">{l.text}</span>
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11.5px] text-[#4b4763]/80">Click a line to highlight it · click a speaker name to rename it everywhere · nothing here touches your files.</p>
      <Live message={msg} />
    </div>
  );
}

/* ── Sample Q&A (Aud AI Chat / Key Moments): suggested questions, prepared
   answers with a timestamp chip that highlights the matching line. ─────── */
export function SampleQA({ kind = "chat" }) {
  const d = RICH_DATA.demoTranscript;
  const items = kind === "chat" ? RICH_DATA.chatExamples : RICH_DATA.momentsExamples;
  const [active, setActive] = useState(null);
  const [msg, say] = useAnnounce();
  const item = active === null ? null : items[active];

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="mb-4"><SampleTag>Sample Q &amp; A</SampleTag></div>
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Suggested questions">
        {items.map((x, i) => (
          <button key={x.q} onClick={() => { setActive(i); say("Answer shown"); }}
            aria-pressed={active === i}
            className={`px-3.5 py-2 rounded-lg text-[12.5px] font-semibold border transition ${active === i ? "bg-[#6415f5] text-white border-[#6415f5]" : "bg-white text-[#4b4763] border-[#18123b]/15 hover:border-[#6415f5]/40"}`}>
            {x.q}
          </button>
        ))}
      </div>

      {item && (
        <div className="mt-5 rounded-xl bg-[#f6f3ed] border border-[#18123b]/10 p-4">
          <p className="text-[14px] text-[#18123b]/90 leading-relaxed">{item.a || item.note}</p>
          <button onClick={() => say(`Highlighted line at ${item.t}`)}
            className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#6415f5] text-white text-[11.5px] font-bold">
            ▶ {item.t}
          </button>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-[#18123b]/10 bg-white p-2" aria-label="Sample transcript">
        {d.lines.map((l, i) => {
          const hi = item && i === item.line;
          return (
            <div key={i} className={`rounded-lg px-3 py-1.5 transition ${hi ? "bg-[#6415f5]/[0.1] ring-1 ring-[#6415f5]/40" : ""}`}>
              <span className="text-[12px] font-bold" style={{ color: d.speakers[l.s].color }}>{d.speakers[l.s].name} · {l.t}</span>
              <span className="block text-[13px] text-[#18123b]/85">{l.text}</span>
            </div>
          );
        })}
      </div>
      {item && <p className="mt-2 text-[11.5px] text-[#4b4763]/80">The highlighted line is the cited moment — in the real app, the chip plays the audio from exactly there.</p>}
      <Live message={msg} />
    </div>
  );
}

/* ── Translation sample: Original/Translated toggle + language picker ──── */
export function TranslationSample() {
  const t = RICH_DATA.translation.sample;
  const [mode, setMode] = useState("orig");
  const [lang, setLang] = useState(t.langs[1][0]);
  const langLabel = t.langs.find(([c]) => c === lang)?.[1] || lang;
  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <SampleTag>Side-by-side sample</SampleTag>
        <div className="inline-flex rounded-lg border border-[#18123b]/15 overflow-hidden" role="group" aria-label="View mode">
          {[["orig", "Original"], ["trans", "Translated"]].map(([v, l]) => (
            <button key={v} onClick={() => setMode(v)} aria-pressed={mode === v}
              className={`px-3.5 py-1.5 text-[12px] font-semibold transition ${mode === v ? "bg-[#6415f5] text-white" : "bg-white text-[#4b4763] hover:bg-[#18123b]/[0.03]"}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Translation language"
          className="rounded-lg border border-[#18123b]/15 bg-white px-3 py-1.5 text-[12px] font-semibold focus:outline-none">
          {t.langs.map(([c, l]) => <option key={c} value={c}>{l}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {t.lines.map((l, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2">
            <div className={`rounded-lg px-3.5 py-2.5 text-[13.5px] transition ${mode === "orig" ? "bg-[#6415f5]/[0.06] text-[#18123b]" : "bg-[#f6f3ed] text-[#4b4763]"}`}>{l.en}</div>
            <div className={`rounded-lg px-3.5 py-2.5 text-[13.5px] transition ${mode === "trans" ? "bg-[#6415f5]/[0.06] text-[#18123b]" : "bg-[#f6f3ed] text-[#4b4763]"}`}>{l[lang]}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11.5px] text-[#4b4763]/80">{t.note} Left column: the original. Right column: {langLabel} — the original is never replaced, only paired.</p>
    </div>
  );
}

/* ── Sample folders demo (in-memory only) ──────────────────────────────── */
export function SampleFolders() {
  const [folders, setFolders] = useState(["Interviews", "Meetings"]);
  const [files, setFiles] = useState([
    { name: "interview_sarah.mp3", folder: "Interviews" },
    { name: "standup_week12.mp4", folder: "Meetings" },
  ]);
  const [newFolder, setNewFolder] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [msg, say] = useAnnounce();

  const addFolder = () => {
    const v = newFolder.trim();
    if (!v) return;
    if (folders.some((f) => f.toLowerCase() === v.toLowerCase())) { say("That folder already exists"); return; }
    setFolders((f) => [...f, v]); setNewFolder(""); say(`Folder "${v}" created`);
  };
  const renameFolder = (oldN, next) => {
    const v = next.trim();
    if (!v || v === oldN) { setRenaming(null); return; }
    setFolders((f) => f.map((x) => (x === oldN ? v : x)));
    setFiles((fs) => fs.map((f) => (f.folder === oldN ? { ...f, folder: v } : f)));
    say(`Renamed to "${v}"`); setRenaming(null);
  };
  const deleteFolder = (name) => {
    if (files.some((f) => f.folder === name)) { say("Empty the folder first — move its files out"); return; }
    setFolders((f) => f.filter((x) => x !== name)); say(`Folder "${name}" deleted`);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="mb-4"><SampleTag>Folder demo</SampleTag></div>
      <div className="flex flex-wrap gap-2.5 mb-4">
        <input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="New folder name…"
          aria-label="New folder name"
          onKeyDown={(e) => e.key === "Enter" && addFolder()}
          className="rounded-lg border border-[#18123b]/15 px-3.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        <button onClick={addFolder} className="px-3.5 py-2 rounded-lg bg-[#6415f5] text-white text-[12.5px] font-semibold hover:bg-[#5311cf] transition">Create folder</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2" aria-label="Folders">
          {folders.map((f) => (
            <div key={f} className="rounded-xl bg-[#f6f3ed] border border-[#18123b]/10 px-4 py-2.5 flex items-center gap-2">
              {renaming === f ? (
                <input autoFocus defaultValue={f} aria-label="Rename folder"
                  onKeyDown={(e) => e.key === "Enter" && renameFolder(f, e.target.value)}
                  onBlur={(e) => renameFolder(f, e.target.value)}
                  className="flex-1 px-2 py-0.5 rounded-md border border-[#6415f5]/40 text-[13px] focus:outline-none" />
              ) : (
                <button onClick={() => setRenaming(f)} title="Click to rename" className="text-[13.5px] font-bold text-[#18123b] hover:text-[#6415f5] transition">📁 {f}</button>
              )}
              <span className="ms-auto text-[11px] text-[#4b4763]">{files.filter((x) => x.folder === f).length} files</span>
              <button onClick={() => deleteFolder(f)} aria-label={`Delete folder ${f}`} className="text-[#4b4763]/50 hover:text-red-600 transition text-[13px] px-1">✕</button>
            </div>
          ))}
        </div>
        <div className="space-y-2" aria-label="Sample files">
          {files.map((f, i) => (
            <div key={f.name} className="rounded-xl bg-white border border-[#18123b]/10 px-4 py-2.5 flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#18123b] truncate">📄 {f.name}</span>
              <select value={f.folder} aria-label={`Move ${f.name}`} onChange={(e) => { const v = e.target.value; setFiles((fs) => fs.map((x, j) => (j === i ? { ...x, folder: v } : x))); say(`Moved to ${v}`); }}
                className="ms-auto rounded-md border border-[#18123b]/15 bg-white px-2 py-1 text-[11.5px] font-semibold focus:outline-none">
                {folders.map((x) => <option key={x}>{x}</option>)}
              </select>
              <button onClick={() => { setFiles((fs) => fs.filter((_, j) => j !== i)); say("File removed from the demo"); }} aria-label={`Delete ${f.name}`} className="text-[#4b4763]/50 hover:text-red-600 transition text-[13px] px-1">✕</button>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11.5px] text-[#4b4763]/80">Everything here lives in this page's memory only — your real archive is untouched.</p>
      <Live message={msg} />
    </div>
  );
}

/* ── Sample editor: edit a line, undo/redo, saved indicator, speed + bar ── */
export function SampleEditor() {
  const base = RICH_DATA.demoTranscript.lines.slice(0, 4);
  const [texts, setTexts] = useState(base.map((l) => l.text));
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pos, setPos] = useState(12); // % of the sample track
  const undo = useRef([]); const redo = useRef([]);
  const savedTimer = useRef(null);

  const commit = (next) => {
    undo.current.push(texts); redo.current = [];
    setTexts(next); setSaved(false);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(true), 700);
  };
  const doUndo = () => { if (!undo.current.length) return; redo.current.push(texts); setTexts(undo.current.pop()); };
  const doRedo = () => { if (!redo.current.length) return; undo.current.push(texts); setTexts(redo.current.pop()); };

  useEffect(() => {
    const iv = setInterval(() => setPos((p) => (p >= 100 ? 0 : p + 0.5 * speed)), 120);
    return () => clearInterval(iv);
  }, [speed]);

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <SampleTag>Editor demo</SampleTag>
        <button onClick={doUndo} disabled={!undo.current.length} className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition disabled:opacity-40">Undo</button>
        <button onClick={doRedo} disabled={!redo.current.length} className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition disabled:opacity-40">Redo</button>
        <span aria-live="polite" className={`text-[11.5px] font-bold transition-opacity ${saved ? "text-emerald-600 opacity-100" : "opacity-0"}`}>✓ Saved</span>
      </div>

      <div className="space-y-1.5 mb-4" role="list">
        {base.map((l, i) => (
          <button key={i} role="listitem" onClick={() => setActive(i)}
            className={`w-full text-start rounded-xl px-4 py-2 transition border ${active === i ? "bg-[#6415f5]/[0.06] border-[#6415f5]/30" : "bg-white border-transparent hover:bg-[#18123b]/[0.03]"}`}>
            <span className="text-[12px] font-bold" style={{ color: RICH_DATA.demoTranscript.speakers[l.s].color }}>
              {RICH_DATA.demoTranscript.speakers[l.s].name} · {l.t}
            </span>
            <span className="block text-[13.5px] text-[#18123b]/90">{texts[i]}</span>
          </button>
        ))}
      </div>

      <label className="block text-[12px] font-semibold text-[#4b4763] mb-1.5" htmlFor="smp-edit">Editing line {active + 1} — type your correction:</label>
      <input id="smp-edit" value={texts[active]} onChange={(e) => commit(texts.map((x, j) => (j === active ? e.target.value : x)))}
        className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />

      <div className="mt-5">
        <div className="flex items-center gap-2 mb-2" role="group" aria-label="Playback speed">
          {[0.5, 1, 1.5, 2].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} aria-pressed={speed === s}
              className={`px-3 py-1 rounded-md text-[11.5px] font-bold transition ${speed === s ? "bg-[#6415f5] text-white" : "bg-[#f6f3ed] text-[#4b4763] hover:bg-[#18123b]/[0.06]"}`}>
              {s}×
            </button>
          ))}
          <span className="text-[11.5px] text-[#4b4763]">sample playback at {speed}× — the bar below moves at that speed</span>
        </div>
        <div className="h-2 rounded-full bg-[#18123b]/[0.08] overflow-hidden" role="progressbar" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-[#6415f5] transition-[width] duration-100" style={{ width: `${pos}%` }} />
        </div>
      </div>
    </div>
  );
}
