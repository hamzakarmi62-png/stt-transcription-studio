import { useEffect, useMemo, useRef, useState } from "react";
import audLogo from "../assets/aud-logo.png";

// Read-only transcript page opened by a share link (/share/:id?t=...).
// Self-contained: it never touches the logged-in app state, so recipients
// need no account and owners' other sessions stay private.

function fmtClock(sec) {
  const total = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export default function ShareView({ sessionId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  const shareToken = useMemo(
    () => new URLSearchParams(window.location.search).get("t") || "",
    []
  );

  useEffect(() => {
    let alive = true;
    fetch(`/api/share/${sessionId}?t=${encodeURIComponent(shareToken)}`)
      .then(async (res) => {
        if (!res.ok) {
          let detail = "Lien de partage invalide.";
          try {
            detail = (await res.json()).detail || detail;
          } catch {
            /* ignore */
          }
          throw new Error(detail);
        }
        return res.json();
      })
      .then((d) => {
        if (!alive) return;
        setData(d);
        document.title = d.filename || "Transcription partagée";
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [sessionId, shareToken]);

  const seek = (sec) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Number(sec) || 0);
    el.play?.().catch(() => {});
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f3ed] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-[#18123b]/10 shadow-xl p-8 max-w-sm text-center">
          <img src={audLogo} alt="Aud" className="w-16 h-16 object-contain mx-auto mb-4 opacity-60" />
          <h1 className="font-bold text-[#18123b] text-lg mb-1">Lien indisponible</h1>
          <p className="text-sm text-[#4b4763] mb-5">{error}</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#6415f5] text-white text-sm font-bold hover:bg-[#5311cf] transition"
          >
            Découvrir Aud Studio
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f6f3ed] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#6415f5]/25 border-t-[#6415f5] animate-spin" />
      </div>
    );
  }

  const speakers = data.speakers || [];
  const segments = data.segments || [];
  const words = segments.reduce(
    (n, s) => n + ((s.words && s.words.length) || String(s.text || "").split(/\s+/).filter(Boolean).length),
    0
  );

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-[#18123b]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#6415f5]/[0.07] blur-[130px]"></div>
        <div className="absolute -bottom-32 right-1/4 w-[420px] h-[420px] rounded-full bg-[#6415f5]/[0.04] blur-[130px]"></div>
      </div>

      <header className="relative bg-white/85 backdrop-blur-2xl border-b border-[#18123b]/[0.08]">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
          <img src={audLogo} alt="Aud Studio" className="w-9 h-9 object-contain" draggable={false} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{data.filename}</p>
            <p className="text-xs text-[#4b4763]">Transcription partagée · Aud Studio</p>
          </div>
          <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#6415f5]/[0.08] border border-[#6415f5]/25 text-[#6415f5]">
            Lecture seule
          </span>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-6 py-8">
        {/* Meta strip */}
        <div className="flex flex-wrap items-center gap-2 mb-5 text-xs font-semibold">
          {data.language && (
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#18123b]/12">{data.language}</span>
          )}
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#18123b]/12">
            {fmtClock(data.duration)}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#18123b]/12">
            {segments.length} segments
          </span>
          {speakers.length > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#18123b]/12">
              {speakers.length} locuteurs
            </span>
          )}
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#18123b]/12">{words} mots</span>
        </div>

        {/* Player */}
        <div className="bg-white rounded-2xl border border-[#18123b]/10 shadow-sm p-4 mb-8">
          <audio ref={audioRef} controls preload="metadata" src={data.audio_url} className="w-full" />
        </div>

        {/* Transcript */}
        <article className="space-y-1 pb-16">
          {segments.map((s, i) => {
            const prev = segments[i - 1];
            const showName = s.speaker && (!prev || prev.speaker !== s.speaker);
            const spk = speakers.find((x) => x.id === s.speaker);
            return (
              <div key={s.id || i}>
                {showName && (
                  <div className="flex items-center gap-2 mt-5 mb-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: spk?.color || "#6415f5" }}
                    />
                    <span className="text-sm font-bold">{spk?.name || s.speaker}</span>
                  </div>
                )}
                <p dir="auto" className="text-[15.5px] leading-[1.85] text-[#18123b] group">
                  <button
                    onClick={() => seek(s.start)}
                    title={`Écouter à partir de ${fmtClock(s.start)}`}
                    className="mr-2.5 align-baseline font-mono text-[11px] text-[#4b4763] px-1.5 py-0.5 rounded-md bg-[#18123b]/[0.05] hover:bg-[#6415f5] hover:text-white transition"
                  >
                    {fmtClock(s.start)}
                  </button>
                  {s.text}
                </p>
              </div>
            );
          })}
        </article>

        <footer className="relative pb-10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[#4b4763] hover:text-[#6415f5] transition"
          >
            Transcription partagée avec
            <img src={audLogo} alt="Aud" className="w-4 h-4 object-contain" />
            <span className="font-bold">Aud Studio</span>
          </a>
        </footer>
      </main>
    </div>
  );
}
