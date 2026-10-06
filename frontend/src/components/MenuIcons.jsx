// Menu icon set — 24×24 stroke SVGs (1.7px, round caps), Rev-style.
// Shared by the header dropdowns (LandingScreen) and the spec page templates (SpecPages).
import React from "react";

export const MENU_ICONS = {
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /><path d="M9 21h6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.2 3.4-4.8 6.5-4.8s5.7 1.6 6.5 4.8" /><circle cx="17.5" cy="9.5" r="2.5" /><path d="M16.5 14.6c2.3.4 4.1 1.7 4.8 4.4" /></>,
  pencil: <><path d="M4 20l1.2-4.2L16.4 4.6a2.1 2.1 0 0 1 3 3L8.2 18.8 4 20z" /><path d="M14.5 6.5l3 3" /></>,
  chat: <path d="M12 3.5a8.3 8.3 0 0 1 8.5 8.1 8.3 8.3 0 0 1-8.5 8.1c-1.4 0-2.7-.3-3.9-.9L3.5 20l1.2-4a7.9 7.9 0 0 1-1.2-4.4A8.3 8.3 0 0 1 12 3.5z" />,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" />,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z" /></>,
  export: <><path d="M12 14V4" /><path d="M7.5 8L12 3.5 16.5 8" /><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /></>,
  upload: <><path d="M12 14V4" /><path d="M7.5 8L12 3.5 16.5 8" /><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /></>,
  link: <><path d="M10.5 13.5a4 4 0 0 1 0-5.6l2.8-2.8a4 4 0 0 1 5.6 5.6l-1.6 1.6" /><path d="M13.5 10.5a4 4 0 0 1 0 5.6l-2.8 2.8a4 4 0 0 1-5.6-5.6l1.6-1.6" /></>,
  folder: <path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5V7z" />,
  userCheck: <><circle cx="9" cy="8" r="3.5" /><path d="M2.8 20c.8-3.2 3.3-4.8 6.2-4.8 1.3 0 2.5.3 3.5.9" /><path d="M14.5 17.5l2 2 4-4.5" /></>,
  fileText: <><path d="M7 3.5h6.5L19 9v10.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" /><path d="M13.5 3.5V9H19" /><path d="M9.5 13h5.5" /><path d="M9.5 16.5h5.5" /></>,
  captions: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M7 12h4.5" /><path d="M14.5 12H17" /><path d="M7 15h7" /></>,
  code: <><path d="M9 8.5L5.5 12 9 15.5" /><path d="M15 8.5l3.5 3.5-3.5 3.5" /></>,
  list: <><circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" /><path d="M8.5 6H20" /><path d="M8.5 12H20" /><path d="M8.5 18H20" /></>,
  briefcase: <><rect x="3.5" y="8" width="17" height="12" rx="2" /><path d="M9.5 8V6.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2V8" /><path d="M3.5 13h17" /></>,
  podcast: <><rect x="9.5" y="3" width="5" height="10" rx="2.5" /><path d="M6.5 11a5.5 5.5 0 0 0 11 0" /><path d="M12 16.5V20" /><path d="M9 20h6" /></>,
  flask: <><path d="M10 3.5h4" /><path d="M10.5 3.5v5l-5 8.5a1.8 1.8 0 0 0 1.6 2.8h9.8a1.8 1.8 0 0 0 1.6-2.8l-5-8.5v-5" /><path d="M8 14h8" /></>,
  pen: <><path d="M17 3.5l3.5 3.5L8 19.5l-4.5 1 1-4.5L17 3.5z" /><path d="M14.5 6l3.5 3.5" /></>,
  help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.2a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8" /><circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none" /></>,
  cap: <><path d="M2.5 9.5L12 5l9.5 4.5L12 14 2.5 9.5z" /><path d="M6.5 11.8v4c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4" /><path d="M21.5 9.5v5" /></>,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7.5l8.5 5.5 8.5-5.5" /></>,
  building: <><path d="M5 21V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V21" /><path d="M15 9h2.5a1.5 1.5 0 0 1 1.5 1.5V21" /><path d="M3 21h18" /><path d="M8.5 8h3" /><path d="M8.5 12h3" /><path d="M8.5 16h3" /></>,
  shield: <path d="M12 3l7 2.8v5.7c0 4.4-2.9 7.4-7 9-4.1-1.6-7-4.6-7-9V5.8L12 3z" />,
  rocket: <><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.5-.5 5-2c.7-.7.7-2 0-2.7-.8-.8-2-.8-3-.3z" /><path d="M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 21.5 2.5c0 2.7-.8 7.5-6 11a22 22 0 0 1-3.5 1.5z" /><path d="M9 12H4.5s.5-3 2-4c1.6-1 4.5 0 4.5 0" /><path d="M12 15v4.5s3-.5 4-2c1-1.6 0-4.5 0-4.5" /></>,
  scale: <><path d="M16 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1z" /><path d="M2 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  play: <><circle cx="12" cy="12" r="8.5" /><path d="M10 8.8v6.4L15.4 12 10 8.8z" /></>,
  newsroom: <><rect x="3.5" y="5" width="14" height="15" rx="1.5" /><path d="M17.5 8.5H19a1.5 1.5 0 0 1 1.5 1.5v8a2 2 0 0 1-2 2H5" /><path d="M6.5 9h8" /><path d="M6.5 12.5h8" /><path d="M6.5 16h5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.4-4.4" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></>,
  chevron: <path d="M9 6l6 6-6 6" />,
};

export function MenuIcon({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {MENU_ICONS[name] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

// Icon inside the tinted menu square.
export function MenuGlyph({ icon }) {
  return (
    <span className="shrink-0 w-8 h-8 rounded-lg bg-[#6415f5]/[0.07] border border-[#6415f5]/15 flex items-center justify-center text-[#6415f5]">
      <MenuIcon name={icon} className="w-4 h-4" />
    </span>
  );
}
