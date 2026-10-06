import { useEffect, useRef, useState } from "react";
import { RICH_DATA } from "../../specContent.js";
import { checkLink } from "../../lib/linkCheck.js";
import { convert } from "../../lib/subtitles.js";
import { useAnnounce, copyText, downloadText, SampleTag, Live, CopyBtn } from "./ui.jsx";

/* ── File readiness checker — 100% in the browser, nothing is uploaded ─── */
const SUPPORTED = ["mp3", "wav", "m4a", "ogg", "mp4", "mkv"];

function humanSize(bytes) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function fmtDur(sec) {
  if (!Number.isFinite(sec)) return null;
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return `${m} min ${String(s).padStart(2, "0")} s`;
}

export function FileChecker({ compact = false }) {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null); // {duration}
  const [msg, say] = useAnnounce();
  const urlRef = useRef(null);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const onPick = (f) => {
    if (!f) { setFile(null); setMeta(null); return; }
    setFile(f); setMeta(null);
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const isMedia = f.type.startsWith("audio/") || f.type.startsWith("video/") || SUPPORTED.includes(ext);
    if (isMedia && urlRef.current) URL.revokeObjectURL(urlRef.current);
    if (isMedia) {
      const url = URL.createObjectURL(f);
      urlRef.current = url;
      const el = document.createElement(f.type.startsWith("video/") || ext === "mp4" || ext === "mkv" ? "video" : "audio");
      el.preload = "metadata";
      el.onloadedmetadata = () => setMeta({ duration: el.duration });
      el.onerror = () => setMeta({ duration: null });
      el.src = url;
    }
    say("File analyzed locally — nothing was uploaded");
  };

  const ext = file ? (file.name.split(".").pop() || "").toLowerCase() : null;
  const supported = file && SUPPORTED.includes(ext);
  const isMedia = file && (file.type.startsWith("audio/") || file.type.startsWith("video/") || SUPPORTED.includes(ext) || ["webm", "mov", "flac"].includes(ext));
  const advice = [];
  if (file) {
    if (supported) advice.push(`${ext.toUpperCase()} is one of Aud's supported formats — it can go straight into the studio.`);
    else if (isMedia) advice.push("This is media but outside the confirmed list (MP3, WAV, M4A, OGG, MP4, MKV). The studio accepts those six — convert or re-export if needed.");
    else advice.push("This doesn't look like an audio or video file — the studio accepts MP3, WAV, M4A, OGG, MP4 and MKV.");
    advice.push("Nothing from this check has left your browser — the file was only read locally.");
    if (meta && Number.isFinite(meta.duration) && meta.duration > 3600) advice.push("Long recording — that's the normal case; upload the whole session rather than splitting it.");
  }

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      {!compact && <div className="mb-4"><SampleTag>Runs in your browser — nothing is uploaded</SampleTag></div>}
      <label className="block cursor-pointer rounded-xl border-2 border-dashed border-[#6415f5]/35 bg-[#6415f5]/[0.03] px-5 py-6 text-center hover:bg-[#6415f5]/[0.06] transition">
        <input type="file" accept="audio/*,video/*" className="sr-only" onChange={(e) => onPick(e.target.files && e.target.files[0])} aria-label="Choose a local file to check" />
        <span className="block text-[14.5px] font-bold text-[#18123b]">Choose a file to check its readiness</span>
        <span className="block mt-1 text-[12.5px] text-[#4b4763]">MP3, WAV, M4A, OGG, MP4, MKV — analyzed locally, never uploaded</span>
      </label>

      {file && (
        <div className="mt-4 rounded-xl bg-[#f6f3ed] border border-[#18123b]/10 p-4" role="status" aria-live="polite">
          <p className="text-[14px] font-bold text-[#18123b] truncate">{file.name}</p>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12.5px]">
            <span><b className="text-[#4b4763]">Size:</b> {humanSize(file.size)}</span>
            <span><b className="text-[#4b4763]">Type:</b> {file.type || ext || "unknown"}</span>
            <span><b className="text-[#4b4763]">Duration:</b> {meta ? (fmtDur(meta.duration) || "could not be read") : "reading…"}</span>
            <span><b className="text-[#4b4763]">Format:</b> {supported ? "✓ supported" : isMedia ? "not in the confirmed list" : "not media"}</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {advice.map((a, i) => <li key={i} className="text-[12.5px] text-[#4b4763] leading-relaxed">• {a}</li>)}
          </ul>
        </div>
      )}
      <Live message={msg} />
    </div>
  );
}

/* ── Link checker — validates a pasted URL against the supported patterns ── */
export function LinkChecker() {
  const [url, setUrl] = useState("");
  const [res, setRes] = useState(null);
  const [msg, say] = useAnnounce();
  const run = (v) => { const r = checkLink(v); setRes(r); say(r.ok ? "Link looks supported" : "Check the tips below"); };
  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="mb-4"><SampleTag>Instant check — no request is sent</SampleTag></div>
      <div className="flex flex-wrap gap-2.5">
        <input value={url} onChange={(e) => { setUrl(e.target.value); run(e.target.value); }} placeholder="Paste a YouTube or MP4/MP3 link…"
          aria-label="Link to check"
          className="flex-1 min-w-[240px] rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        <button onClick={() => copyText(url, say)} disabled={!url}
          className="px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12.5px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition disabled:opacity-40">Copy</button>
        <button onClick={() => { setUrl(""); setRes(null); say("Cleared"); }}
          className="px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#18123b]/20 text-[#4b4763] text-[12.5px] font-semibold bg-white hover:bg-[#18123b]/[0.04] transition">Clear</button>
      </div>
      {res && res.type !== "empty" && (
        <div className={`mt-4 rounded-xl border p-4 ${res.ok ? "bg-emerald-50/60 border-emerald-200" : "bg-amber-50/60 border-amber-200"}`} role="status" aria-live="polite">
          <p className={`text-[14px] font-bold ${res.ok ? "text-emerald-700" : "text-amber-700"}`}>{res.ok ? "✓" : "!"} {res.label}</p>
          <ul className="mt-2 space-y-1">
            {res.tips.map((t, i) => <li key={i} className="text-[12.5px] text-[#4b4763] leading-relaxed">• {t}</li>)}
          </ul>
        </div>
      )}
      <Live message={msg} />
    </div>
  );
}

/* ── Subtitle & transcript converter (SRT/VTT → …), fully client-side ──── */
const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,000
Welcome everyone — this is our planning session.

2
00:00:04,500 --> 00:00:07,200
I propose we record on Thursday.

3
00:00:08,000 --> 00:00:11,500
Thursday works, as long as we keep it under an hour.
`;

export function SubtitleConverter() {
  const [input, setInput] = useState(SAMPLE_SRT);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const [shift, setShift] = useState("1.5");
  const [msg, say] = useAnnounce();

  const run = (mode) => {
    setErr("");
    try {
      const out = convert(input, mode, parseFloat(shift));
      setOutput(out);
      say("Conversion done");
    } catch (e) {
      setOutput("");
      setErr(e.message || "Conversion failed — check the input text.");
    }
  };

  const modes = [
    ["srt2vtt", "SRT → VTT"], ["vtt2srt", "VTT → SRT"], ["strip", "Strip timestamps"],
  ];

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SampleTag>Runs in your browser</SampleTag>
        <button onClick={() => { setInput(SAMPLE_SRT); setOutput(""); setErr(""); say("Sample restored"); }}
          className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#18123b]/20 text-[#4b4763] text-[12px] font-semibold bg-white hover:bg-[#18123b]/[0.04] transition">Restore sample</button>
      </div>

      <label className="block text-[12px] font-semibold text-[#4b4763] mb-1.5" htmlFor="cv-in">Paste SRT or VTT text (a sample is prefilled):</label>
      <textarea id="cv-in" value={input} onChange={(e) => setInput(e.target.value)} rows={7} spellCheck={false}
        className="w-full rounded-xl border border-[#18123b]/15 px-4 py-3 text-[12.5px] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        {modes.map(([m, l]) => (
          <button key={m} onClick={() => run(m)}
            className="px-3.5 py-2 rounded-lg bg-[#6415f5] text-white text-[12.5px] font-semibold hover:bg-[#5311cf] transition">{l}</button>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <input value={shift} onChange={(e) => setShift(e.target.value)} inputMode="decimal" aria-label="Shift seconds (negative allowed)"
            className="w-20 rounded-lg border border-[#18123b]/15 px-2.5 py-2 text-[12.5px] font-mono focus:outline-none" />
          <button onClick={() => run("shift")} className="px-3.5 py-2 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12.5px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">Shift ±s</button>
        </span>
      </div>

      {err && <p role="alert" className="mt-3 text-[13px] font-semibold text-red-600">{err}</p>}

      {output && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-1.5">
            <p className="text-[12px] font-semibold text-[#4b4763]">Result:</p>
            <CopyBtn text={output} />
            <button onClick={() => { downloadText("converted.txt", output); say("Downloaded result"); }}
              className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">Download</button>
          </div>
          <textarea value={output} readOnly rows={7} aria-label="Conversion result" spellCheck={false}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 text-[12.5px] font-mono leading-relaxed focus:outline-none" />
        </div>
      )}
      <p className="mt-3 text-[11.5px] text-[#4b4763]/80">The conversion never sends your text anywhere — it runs entirely on this page.</p>
      <Live message={msg} />
    </div>
  );
}

/* ── Time estimator (audience pages): assumption-based, editable ratio ──── */
export function TimeEstimator({ workflow = [] }) {
  const [hours, setHours] = useState(3);
  const [ratio, setRatio] = useState(4);
  const [msg, say] = useAnnounce();
  const h = Number(hours), r = Number(ratio);
  const valid = Number.isFinite(h) && h > 0 && Number.isFinite(r) && r > 0;
  const manual = valid ? h * r : null;
  const fmtH = (x) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10);
  const workflowText = workflow.map((s, i) => `${i + 1}. ${s}`).join("\n");

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/10 shadow-sm p-5 sm:p-6">
      <div className="mb-4"><SampleTag>Assumption calculator — editable inputs</SampleTag></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-[#4b4763] mb-1.5" htmlFor="te-h">Hours of audio you handle</label>
          <input id="te-h" value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal"
            className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#4b4763] mb-1.5" htmlFor="te-r">Manual minutes per audio minute <span className="font-normal">(your assumption — adjust it)</span></label>
          <input id="te-r" value={ratio} onChange={(e) => setRatio(e.target.value)} inputMode="decimal"
            className="w-full rounded-lg border border-[#18123b]/15 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30" />
        </div>
      </div>
      <p role="status" aria-live="polite" className="mt-4 text-[14.5px] font-semibold text-[#18123b]">
        {valid
          ? <>≈ <span className="text-[#6415f5]">{fmtH(manual)} hours</span> of manual transcription at {r}× — a common rule-of-thumb range is 3×–6×; type your own.</>
          : <span className="text-red-600">Enter positive numbers for both fields.</span>}
      </p>
      <p className="mt-2 text-[11.5px] text-[#4b4763]/80">This is a generic industry assumption for typing by hand — it is not a measurement or a promise about Aud.</p>
      {workflow.length > 0 && (
        <div className="mt-4">
          <CopyBtn text={workflowText} label="Copy this workflow" />
          <span role="status" aria-live="polite" className="text-[11px] font-semibold text-emerald-600 ms-2">{msg === "Copied to clipboard" ? "Copied ✓" : ""}</span>
        </div>
      )}
      <Live message={msg} />
    </div>
  );
}
