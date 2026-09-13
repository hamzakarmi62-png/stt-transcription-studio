import { useRef, useState } from "react";
import { api } from "../api.js";
import { downloadBlob } from "../utils.js";

const FORMATS = [
  { key: "txt", label: "Text (.txt)" },
  { key: "srt", label: "Subtitles (.srt)" },
  { key: "docx", label: "Word (.docx)" },
  { key: "pdf", label: "PDF (.pdf)" },
];

export default function ExportMenu({ sessionId, filename }) {
  const [open, setOpen] = useState(false);
  const [includeSpeakers, setIncludeSpeakers] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef(null);

  const doExport = async (format) => {
    setBusy(true);
    try {
      const res = await fetch(
        api.exportUrl(sessionId, {
          format,
          includeSpeakers,
          includeTimestamps,
        })
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const base = (filename || "transcript").replace(/\.[^.]+$/, "") || "transcript";
      downloadBlob(blob, `${base}.${format}`);
      setOpen(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-sm font-bold hover:bg-emerald-500 hover:text-white transition"
      >
        ⬇ Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/50 border border-white/10 p-3 z-20">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Options
          </div>
          <label className="flex items-center gap-2 text-sm py-1 text-slate-200">
            <input
              type="checkbox"
              checked={includeSpeakers}
              onChange={(e) => setIncludeSpeakers(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
            Include speaker names
          </label>
          <label className="flex items-center gap-2 text-sm py-1 text-slate-200">
            <input
              type="checkbox"
              checked={includeTimestamps}
              onChange={(e) => setIncludeTimestamps(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
            Include timestamps
          </label>
          <div className="text-xs text-slate-500 mt-1 mb-2">
            SRT always includes timings.
          </div>
          <div className="space-y-1">
            {FORMATS.map((f) => (
              <button
                key={f.key}
                disabled={busy}
                onClick={() => doExport(f.key)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50 transition"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}