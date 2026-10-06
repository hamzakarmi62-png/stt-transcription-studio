import { useEffect, useRef, useState } from "react";
import { CopyLinkBtn } from "./tools/ui.jsx";

// In-page table of contents with scroll-spy (IntersectionObserver).
export function PageToc({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  const refs = useRef({});
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0 }
    );
    items.forEach((it) => { const el = document.getElementById(it.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  if (!items.length) return null;
  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-[96px]">
      <p className="text-[11px] font-black tracking-[0.14em] text-[#4b4763]/70 uppercase mb-3">On this page</p>
      <div className="space-y-0.5">
        {items.map((it) => (
          <a key={it.id} href={`#${it.id}`}
            className={`block px-3 py-1.5 rounded-lg text-[13px] font-medium transition ${active === it.id ? "text-[#6415f5] bg-[#6415f5]/[0.06]" : "text-[#4b4763] hover:text-[#18123b]"}`}>
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// Section heading with a copy-link affordance (hover/focus reveal).
export function SectionH({ id, children, as = "h2", className = "" }) {
  const Tag = as;
  return (
    <div id={id} className={`scroll-mt-28 group flex items-center gap-2 ${className}`}>
      <Tag className={as === "h2" ? "text-2xl font-semibold text-[#18123b]" : "text-lg font-semibold text-[#18123b]"}>{children}</Tag>
      <CopyLinkBtn id={id} />
    </div>
  );
}

// FAQ list with Expand all / Collapse all controls.
export function FaqBlock({ items, idBase = "faq" }) {
  const refs = useRef([]);
  const allOpen = () => refs.current.forEach((d) => d && (d.open = true));
  const allClosed = () => refs.current.forEach((d) => d && (d.open = false));
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button onClick={allOpen} className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#6415f5]/50 text-[#6415f5] text-[11.5px] font-semibold bg-white hover:bg-[#6415f5]/[0.06] transition">Expand all</button>
        <button onClick={allClosed} className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#18123b]/20 text-[#4b4763] text-[11.5px] font-semibold bg-white hover:bg-[#18123b]/[0.04] transition">Collapse all</button>
      </div>
      <div className="space-y-3">
        {items.map(([q, a], i) => (
          <details key={q} ref={(el) => (refs.current[i] = el)} className="group rounded-xl bg-white border border-[#18123b]/10">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-[15px] font-semibold text-[#18123b]">
              {q}
              <span className="shrink-0 text-[18px] text-[#4b4763] group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="px-5 pb-4 text-[14px] text-[#4b4763] leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

// Highlight occurrences of `q` inside text (for help-center search).
export function Highlight({ text, q }) {
  const query = String(q || "").trim();
  if (!query) return text;
  const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-amber-200/70 rounded px-0.5">{p}</mark>
      : p
  );
}
