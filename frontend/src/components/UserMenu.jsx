import { useEffect, useRef, useState } from "react";

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
        className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition ${
          dark ? "hover:bg-white/10" : "hover:bg-slate-100"
        }`}
        title="Mon compte"
      >
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[11px] font-black shadow-md shadow-indigo-500/30 shrink-0">
          {initials}
        </span>
        <span className={`hidden sm:block text-start leading-tight`}>
          <span className={`block text-xs font-bold ${dark ? "text-white" : "text-slate-900"}`}>
            {displayName}
          </span>
          <span className={`block text-[10px] ${dark ? "text-slate-400" : "text-slate-400"}`}>
            Compte gratuit
          </span>
        </span>
        <svg
          className={`w-3.5 h-3.5 ${dark ? "text-slate-400" : "text-slate-400"} transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-100 overflow-hidden z-50">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-sm font-black border border-white/30">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{displayName}</p>
                <p className="text-indigo-100 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
            {(user.phone || user.country) && (
              <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-indigo-100">
                {user.phone && <span>📞 {user.phone}</span>}
                {user.country && <span>🌍 {user.country}</span>}
              </div>
            )}
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setOpen(false);
                onLogout && onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition"
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
