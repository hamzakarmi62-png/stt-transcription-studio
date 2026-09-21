import { useRef, useState } from "react";
import { api } from "../api.js";
import { downloadBlob } from "../utils.js";
import { Download } from "./Icons.jsx";

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
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6415f5] text-white border border-[#6415f5] text-sm font-bold hover:bg-[#5311cf] transition"
      >
        <Download className="w-4 h-4" /> Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl shadow-[#18123b]/20 border border-[#18123b]/15 p-3 z-50">
          <div className="text-xs font-semibold text-[#4b4763] uppercase tracking-wide mb-2">
            Options
          </div>
          <label className="flex items-center gap-2 text-sm py-1 text-[#18123b]">
            <input
              type="checkbox"
              checked={includeSpeakers}
              onChange={(e) => setIncludeSpeakers(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
            Include speaker names
          </label>
          <label className="flex items-center gap-2 text-sm py-1 text-[#18123b]">
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
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-[#18123b] hover:bg-white/10 disabled:opacity-50 transition"
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