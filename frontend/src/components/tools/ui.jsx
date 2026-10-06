import { useCallback, useRef, useState } from "react";

// Shared primitives for the interactive page tools: copy button with live
// confirmation, aria-live region, download helper, and a form-post hook
// with loading / success / error states that keeps the user's input.

export function announce(setter, message) {
  setter(message);
  setTimeout(() => setter(""), 2500);
}

export function Live({ message }) {
  return <span role="status" aria-live="polite" className="sr-only">{message}</span>;
}

export function useAnnounce() {
  const [msg, setMsg] = useState("");
  const say = useCallback((m) => announce(setMsg, m), []);
  return [msg, say];
}

export async function copyText(text, say) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard API can be unavailable (http, permissions) — fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    document.body.removeChild(ta);
  }
  if (say) say("Copied to clipboard");
}

export function CopyBtn({ text, label = "Copy", className = "" }) {
  const [msg, say] = useAnnounce();
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button type="button" onClick={() => copyText(text, say)}
        className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[12px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">
        {label}
      </button>
      <span role="status" aria-live="polite" className="text-[11px] font-semibold text-emerald-600">{msg === "Copied to clipboard" ? "Copied ✓" : ""}</span>
    </span>
  );
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 300);
}

export function CopyLinkBtn({ id, label = "Copy link" }) {
  const [msg, say] = useAnnounce();
  const link = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    copyText(url, say);
  };
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={link} aria-label={`${label} for section ${id}`}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition px-2 py-0.5 rounded-md text-[11px] font-semibold text-[#6415f5] bg-[#6415f5]/[0.08]">
        {label}
      </button>
      <span role="status" aria-live="polite" className="text-[11px] font-semibold text-emerald-600">{msg === "Copied to clipboard" ? "Copied ✓" : ""}</span>
    </span>
  );
}

// POST JSON to a public endpoint; keeps caller-owned inputs intact on error.
export function usePost(url) {
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const busy = useRef(false);
  const post = useCallback(async (payload, successMsg) => {
    if (busy.current) return;
    busy.current = true;
    setState("loading"); setError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data = {};
      try { data = await res.json(); } catch { /* non-JSON error page */ }
      if (!res.ok || data.ok === false) {
        setError(data.error || `Something went wrong (${res.status}). Please try again.`);
        setState("error");
      } else {
        setDone(data.message || successMsg || "Received — thank you.");
        setState("success");
      }
    } catch {
      setError("The service could not be reached. Please try again in a moment.");
      setState("error");
    } finally {
      busy.current = false;
    }
  }, [url]);
  return { state, error, done, post };
}

export function FormNote({ state, error, done }) {
  if (state === "error") {
    return <p role="alert" className="text-[13px] font-semibold text-red-600">{error}</p>;
  }
  if (state === "success") {
    return <p role="status" aria-live="polite" className="text-[13px] font-semibold text-emerald-600">{done}</p>;
  }
  return null;
}

export function SampleTag({ children = "Sample" }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-md bg-[#6415f5]/[0.08] text-[#6415f5] text-[10px] font-black tracking-wide uppercase">
      {children} — not the live engine
    </span>
  );
}

export const fieldCls = "w-full rounded-lg border border-[#18123b]/15 bg-white px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6415f5]/30";
