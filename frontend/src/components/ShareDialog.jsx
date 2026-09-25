import { useEffect, useRef, useState } from "react";
import { api, getAuthToken } from "../api.js";
import { downloadBlob } from "../utils.js";

// iOS-style "export out of a box" glyph, matching the Share transcript button.
export function ShareIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" />
      <polyline points="8 7 12 3 16 7" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

const QUICK_FILES = [
  { key: "pdf", label: "PDF" },
  { key: "docx", label: "Word" },
  { key: "txt", label: "Text" },
  { key: "srt", label: "SRT" },
  { key: "json", label: "JSON" },
  { key: "xml", label: "XML" },
];

export default function ShareDialog({ open, onClose, sessionId, filename }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busyFile, setBusyFile] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    setError("");
    setLoading(true);
    let alive = true;
    api
      .createShareLink(sessionId)
      .then((d) => alive && setUrl(d.share_url))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, sessionId]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      inputRef.current?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = () => {
    const text = `Transcription : "${filename}" — Aud Studio`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");
  };

  const downloadFile = async (format) => {
    setBusyFile(format);
    try {
      const token = getAuthToken();
      const res = await fetch(api.exportUrl(sessionId, { format, includeSpeakers: true, includeTimestamps: true }), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const base = (filename || "transcript").replace(/\.[^.]+$/, "") || "transcript";
      downloadBlob(blob, `${base}.${format}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyFile("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[500] bg-[#18123b]/45 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl shadow-[#18123b]/30 w-full max-w-lg p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[#18123b]/[0.06] text-[#4b4763] flex items-center justify-center transition"
          aria-label="Fermer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-2xl bg-[#6415f5]/[0.08] border border-[#6415f5]/25 text-[#6415f5] flex items-center justify-center">
            <ShareIcon className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#18123b]">Share transcript</h2>
            <p className="text-xs text-[#4b4763] truncate max-w-[320px]">{filename}</p>
          </div>
        </div>
        <p className="text-sm text-[#4b4763] mt-2 mb-4">
          Anyone with this link can view the transcript — read only. They never see your account.
        </p>

        {loading && <div className="h-11 rounded-xl bg-[#18123b]/[0.05] animate-pulse mb-4" />}
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">{error}</div>}

        {url && (
          <>
            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#f6f3ed] border border-[#18123b]/15 text-sm text-[#18123b] truncate"
              />
              <button
                onClick={copy}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition shrink-0 ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-[#6415f5] text-white hover:bg-[#5311cf]"
                }`}
              >
                {copied ? "Copié ✓" : "Copier"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-5">
              <button
                onClick={whatsapp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#18123b]/15 text-sm font-semibold text-[#18123b] hover:bg-[#18123b]/[0.06] transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.4 0 .1 0 .8-.4 1.5Z" />
                </svg>
                WhatsApp
              </button>
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`Transcription : "${filename}" — Aud Studio`)}&body=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#18123b]/15 text-sm font-semibold text-[#18123b] hover:bg-[#18123b]/[0.06] transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
                E-mail
              </a>
            </div>

            <div className="border-t border-[#18123b]/[0.08] pt-4">
              <div className="text-[10px] font-bold text-[#4b4763] uppercase tracking-widest mb-2">
                Ou envoyer le fichier directement
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_FILES.map((f) => (
                  <button
                    key={f.key}
                    disabled={!!busyFile}
                    onClick={() => downloadFile(f.key)}
                    className="px-3.5 py-2 rounded-xl border border-[#18123b]/15 text-sm font-semibold text-[#18123b] hover:bg-[#18123b]/[0.06] disabled:opacity-50 transition"
                  >
                    {busyFile === f.key ? "…" : f.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
