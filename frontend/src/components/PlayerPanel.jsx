import { useRef, useState } from "react";
import audLogo from "../assets/aud-logo.png";

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

export default function PlayerPanel({
  src,
  kind,
  filename,
  mode,
  onMode,
  mediaRef,
  audioOnly = false,
}) {
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const [pos, setPos] = useState(() => ({
    x: typeof window !== "undefined" ? Math.max(window.innerWidth - 420, 8) : 420,
    y: 80,
  }));

  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const x = clamp(d.ox + e.clientX - d.sx, 0, window.innerWidth - d.w);
    const y = clamp(d.oy + e.clientY - d.sy, 0, window.innerHeight - d.h - 8);
    setPos({ x, y });
  };

  const onUp = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };

  const startDrag = (e) => {
    if (mode !== "floating") return;
    e.preventDefault();
    const rect = panelRef.current.getBoundingClientRect();
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      ox: pos.x,
      oy: pos.y,
      w: rect.width,
      h: rect.height,
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (mode === "hidden") return null;

  const isVideo = kind === "video";
  // A video session whose archived copy is audio-only would render a black
  // <video> rectangle with sound — show a proper audio card instead.
  const audioFallback = isVideo && audioOnly;
  const floating = mode === "floating";

  const toolbar = (
    <div className="flex items-center gap-1 shrink-0">
      {floating ? (
        <button
          onClick={() => onMode("docked")}
          className="text-xs px-2 py-1 rounded-lg border border-[#18123b]/20 text-[#4b4763] hover:bg-[#18123b]/[0.06]"
          title="Dock player"
        >
          Dock
        </button>
      ) : (
        <button
          onClick={() => onMode("floating")}
          className="text-xs px-2 py-1 rounded-lg border border-[#18123b]/20 text-[#4b4763] hover:bg-[#18123b]/[0.06]"
          title="Undock as floating player"
        >
          Float
        </button>
      )}
      <button
        onClick={() => onMode("hidden")}
        className="text-xs px-2 py-1 rounded-lg border border-[#18123b]/20 text-[#4b4763] hover:bg-[#18123b]/[0.06]"
        title="Hide player"
      >
        Hide
      </button>
    </div>
  );

  const header = (
    <div
      onPointerDown={startDrag}
      className={`flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] select-none ${
        floating ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      title={floating ? "Drag to move player" : filename}
    >
      <span className="text-xs font-medium text-[#4b4763] truncate min-w-0">{filename}</span>
      <span className="text-[10px] uppercase tracking-wide text-[#4b4763]">
        {isVideo && !audioFallback ? "video" : "audio"}
      </span>
      <div className="ml-auto">{toolbar}</div>
    </div>
  );

  const media = audioFallback ? (
    <div className="rounded-b-2xl bg-[#12101f] px-5 py-6 text-center">
      <div className="relative inline-block">
        <div className="absolute -inset-4 rounded-full bg-[#6415f5]/25 blur-2xl" />
        <img src={audLogo} alt="" className="relative w-16 h-16 object-contain" draggable={false} />
      </div>
      <p className="mt-3 text-[11px] font-semibold text-white/75 leading-relaxed">
        Vidéo volumineuse : seule la piste audio est archivée.
        <br />
        L'écoute fonctionne normalement.
      </p>
      <audio ref={mediaRef} src={src} controls preload="auto" className="w-full mt-4" />
    </div>
  ) : isVideo ? (
    <video
      ref={mediaRef}
      src={src}
      controls
      playsInline
      preload="auto"
      className="w-full aspect-video bg-black rounded-b-2xl"
    />
  ) : (
    <audio ref={mediaRef} src={src} controls preload="auto" className="w-full rounded-b-2xl" />
  );

  if (floating) {
    return (
      <div
        ref={panelRef}
        className="fixed z-50 w-[400px] max-w-[calc(100vw-16px)] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl shadow-[#18123b]/20 border border-[#18123b]/15"
        style={{ left: pos.x, top: pos.y }}
      >
        {header}
        {media}
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border border-[#18123b]/15 shadow-lg shadow-[#18123b]/15">
      {header}
      {media}
    </div>
  );
}