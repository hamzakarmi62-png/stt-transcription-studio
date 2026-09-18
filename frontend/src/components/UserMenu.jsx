import { useEffect, useRef, useState } from "react";
import { Phone, Globe } from "./Icons.jsx";

export default function UserMenu({ user, onLogout, dark = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) return null;
  const displayName = user.full_name || user.username || "Utilisateur";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-2xl px-2 py-1.5 hover:bg-white/[0.07] transition"
        title="Mon compte"
      >
        <span className="w-9 h-9 rounded-2xl border-[1.5px] border-[#18123b]/30 bg-white flex items-center justify-center text-[#18123b] text-[11px] font-black shrink-0">
          {initials}
        </span>
        <span className="hidden sm:block text-start leading-tight">
          <span className="block text-xs font-bold text-white">{displayName}</span>
          <span className="block text-[10px] text-slate-400">Compte gratuit</span>
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 mt-3 w-64 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden z-50">
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl border-[1.5px] border-[#18123b]/30 bg-white flex items-center justify-center text-[#18123b] text-sm font-black shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{displayName}</p>
                <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
            {(user.phone || user.country) && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                {user.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</span>}
                {user.country && <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" /> {user.country}</span>}
              </div>
            )}
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setOpen(false);
                onLogout && onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
