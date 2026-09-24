import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { Scissors, Sparkles, Loader, X } from "./Icons.jsx";
import audLogo from "../assets/aud-logo.png";

function fmtClock(sec) {
  const total = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function fmtDuration(sec) {
  const total = Math.max(0, Math.round(Number(sec) || 0));
  return `0:${String(Math.min(99, total)).padStart(2, "0")}`;
}

// Best-effort real frame from the video at time `at`; falls back to a styled
// placeholder (cross-origin sources can taint the canvas — that is fine).
function VideoThumb({ src, at }) {
  const [shot, setShot] = useState(null);
  const [failed, setFailed] = useState(false);
  const vidRef = useRef(null);

  useEffect(() => {
    setShot(null);
    setFailed(false);
    const v = vidRef.current;
    if (!v || !src) return;
    let dead = false;
    const seek = () => {
      try {
        const target = Math.min(Math.max(0.1, at), Math.max(0.2, (v.duration || at) - 0.2));
        v.currentTime = target;
      } catch {
        if (!dead) setFailed(true);
      }
    };
    const onSeeked = () => {
      try {
        const w = 320;
        const h = Math.max(90, Math.round((v.videoHeight / (v.videoWidth || w)) * w)) || 180;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(v, 0, 0, w, h);
        const url = c.toDataURL("image/jpeg", 0.72);
        if (!dead) setShot(url);
      } catch {
        if (!dead) setFailed(true);
      }
    };
    v.addEventListener("loadedmetadata", seek);
    v.addEventListener("seeked", onSeeked);
    if (v.readyState >= 1) seek();
    return () => {
      dead = true;
      v.removeEventListener("loadedmetadata", seek);
      v.removeEventListener("seeked", onSeeked);
    };
  }, [src, at]);

  const placeholder = (
    <div className="w-full h-full bg-gradient-to-br from-[#262247] via-[#151226] to-[#0b0a16] flex items-center justify-center">
      <img src={audLogo} alt="" className="w-9 h-9 object-contain opacity-80" draggable={false} />
    </div>
  );

  return (
    <div className="relative w-full aspect-video overflow-hidden">
      {shot ? (
        <img src={shot} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : failed ? (
        placeholder
      ) : (
        <div className="w-full h-full bg-[#18123b]/[0.06] animate-pulse" />
      )}
      <video
        ref={vidRef}
        src={src}
        muted
        playsInline
        preload="metadata"
        className="absolute w-px h-px opacity-0 pointer-events-none"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ── Highlights ───────────────────────────────────────────────────────────────

export function HighlightCards({ sessionId, mediaSrc, kind, highlights, hlBusy, onGenerate, onPreview }) {
  if (hlBusy && (!highlights || highlights.length === 0)) {
    return (
      <section className="mb-6 rounded-2xl bg-white/80 border border-[#18123b]/[0.08] px-5 py-4 flex items-center gap-3">
        <Loader className="w-4 h-4 animate-spin text-[#6415f5]" />
        <p className="text-sm text-[#4b4763]">
          Analyse de la transcription et création des moments clés…
        </p>
      </section>
    );
  }

  if (!highlights || highlights.length === 0) {
    return (
      <section className="mb-6 rounded-2xl bg-white/80 border border-[#18123b]/[0.08] px-5 py-4 flex items-center gap-3 flex-wrap">
        <span className="w-9 h-9 rounded-xl bg-[#6415f5]/[0.08] border border-[#6415f5]/20 text-[#6415f5] flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#18123b]">Moments clés</p>
          <p className="text-xs text-[#4b4763]">
            L'IA extrait les moments importants avec un aperçu vidéo.
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={hlBusy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6415f5] text-white text-sm font-bold hover:bg-[#5311cf] disabled:opacity-60 transition"
        >
          <Sparkles className="w-4 h-4" /> Générer
        </button>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#6415f5]" />
        <h2 className="text-sm font-bold text-[#18123b]">Moments clés</h2>
        <div className="ml-auto">
          <button
            onClick={onGenerate}
            disabled={hlBusy}
            className="text-xs font-semibold text-[#4b4763] hover:text-[#6415f5] transition inline-flex items-center gap-1 disabled:opacity-60"
            title="Régénérer les moments clés"
          >
            {hlBusy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Régénérer
          </button>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {highlights.map((h, i) => (
          <article
            key={`${h.start}-${i}`}
            className="shrink-0 w-[280px] rounded-2xl bg-white border border-[#18123b]/[0.08] shadow-sm hover:shadow-md hover:border-[#6415f5]/30 transition overflow-hidden flex flex-col"
          >
            <div className="relative">
              {kind === "video" ? (
                <VideoThumb src={mediaSrc} at={(h.start + h.end) / 2} />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-[#262247] via-[#151226] to-[#0b0a16] flex items-center justify-center">
                  <img src={audLogo} alt="" className="w-10 h-10 object-contain opacity-80" draggable={false} />
                </div>
              )}
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[11px] font-bold">
                {fmtDuration(h.end - h.start)}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-[14.5px] leading-snug text-[#18123b]">{h.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#4b4763] line-clamp-3 flex-1">{h.summary}</p>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => onPreview(h)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white text-[13px] font-bold hover:bg-[#6415f5]/[0.06] transition"
                >
                  <Scissors className="w-3.5 h-3.5" /> Preview
                </button>
                <span className="text-[11px] font-mono text-[#4b4763]">{fmtClock(h.start)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── AI Chat ──────────────────────────────────────────────────────────────────

// Render [mm:ss] citations inside an AI answer as clickable seek buttons.
function AnswerText({ text, onSeek }) {
  const parts = String(text).split(/(\d{1,2}:\d{2}(?::\d{2})?)/g);
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(part)) {
          return (
            <button
              key={i}
              onClick={() => {
                const bits = part.split(":").map(Number);
                const sec = bits.length === 3 ? bits[0] * 3600 + bits[1] * 60 + bits[2] : bits[0] * 60 + bits[1];
                onSeek(sec);
              }}
              className="mx-0.5 px-1 rounded bg-[#6415f5]/[0.1] text-[#6415f5] font-mono text-[11px] font-bold hover:bg-[#6415f5] hover:text-white transition align-baseline"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export function AiChatPanel({ sessionId, onSeek }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await api.askTranscript(sessionId, q);
      setMsgs((m) => [...m, { role: "ai", text: res.answer || "…" }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "ai", text: e.message || "Request failed", error: true }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-[#18123b]/[0.1] shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-start"
      >
        <span className="w-7 h-7 rounded-lg bg-[#6415f5] text-white flex items-center justify-center text-[13px] font-black">
          ✦
        </span>
        <span className="text-sm font-bold text-[#18123b]">Aud AI Chat</span>
        <span className="ms-auto text-[#4b4763] text-xs">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <>
          <div ref={listRef} className="max-h-64 overflow-y-auto px-4 pb-3 space-y-2.5 border-t border-[#18123b]/[0.07] pt-3">
            {msgs.length === 0 && (
              <p className="text-xs text-[#4b4763] leading-relaxed">
                Posez une question sur votre transcription — les réponses s'appuient sur son contenu, avec les horodatages cliquables.
              </p>
            )}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-md bg-[#6415f5] text-white text-[13px] leading-relaxed">
                    {m.text}
                  </p>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <p
                    className={`max-w-[90%] px-3 py-2 rounded-2xl rounded-bl-md text-[13px] leading-relaxed border ${
                      m.error
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-[#f6f3ed] border-[#18123b]/[0.08] text-[#18123b]"
                    }`}
                  >
                    {m.error ? m.text : <AnswerText text={m.text} onSeek={onSeek} />}
                  </p>
                </div>
              )
            )}
            {busy && (
              <div className="flex justify-start">
                <span className="px-3 py-2 rounded-2xl rounded-bl-md bg-[#f6f3ed] border border-[#18123b]/[0.08] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6415f5] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6415f5] animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6415f5] animate-bounce" style={{ animationDelay: "240ms" }} />
                </span>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-[#18123b]/[0.07]">
            <div className="flex items-center gap-2 rounded-2xl border-[1.5px] border-[#6415f5]/40 focus-within:border-[#6415f5] transition px-2 py-1.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Posez une question sur votre transcription…"
                className="flex-1 min-w-0 bg-transparent text-[13px] text-[#18123b] outline-none placeholder:text-[#4b4763]/70"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="w-9 h-9 rounded-xl bg-[#6415f5] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#5311cf] transition shrink-0"
                aria-label="Envoyer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
