// Static site audit — fails when the public-site data violates the page
// contracts. Run: node frontend/scripts/site-audit.mjs
// (Runtime/console checks are done separately in the browser.)
import assert from "node:assert/strict";
import { SPEC_DATA } from "../src/specData.js";
import { RICH_DATA } from "../src/specContent.js";
import { NAV_MENUS, SERVICE_PAGES, RESOURCE_LISTINGS } from "../src/siteData.js";

const problems = [];
const fail = (msg) => problems.push(msg);

// ── route tables ──────────────────────────────────────────────────────────
const featSlugs = new Set([...Object.keys(SPEC_DATA.features), ...Object.keys(RICH_DATA.groupPages)]);
const svcSlugs = new Set(Object.keys(SPEC_DATA.human.pages));
const legacySvc = new Set(Object.keys(SERVICE_PAGES || {}));
const pageKinds = new Set([
  "home", "pricing", "contact", "support", "about", "reviewers", "careers", "legal",
  "languages", "changelog", "human", "calculator", "team", "press", "freelancers",
  "partners", "locations", "info:help", "info:security", "info:api",
  "res:blog", "res:tutorials", "res:usecases", "res:guides", "res:library",
]);
for (const a of Object.keys(RICH_DATA.audiences)) pageKinds.add("aud:" + a);

function routeResolves(route) {
  if (!route) return false;
  if (route.startsWith("feat:")) return featSlugs.has(route.slice(5));
  if (route.startsWith("svc:")) return svcSlugs.has(route.slice(4)) || legacySvc.has(route.slice(4));
  if (route.includes(":")) return pageKinds.has(route);
  return pageKinds.has(route);
}

// ── 1. every menu item resolves, and its page crumb names the same topic ──
const crumbOf = (route) => {
  if (route.startsWith("feat:")) {
    const s = route.slice(5);
    return (SPEC_DATA.features[s] || RICH_DATA.groupPages[s] || {}).crumb;
  }
  if (route.startsWith("svc:")) return (SPEC_DATA.human.pages[route.slice(4)] || {}).crumb;
  const staticCrumbs = {
    about: "Company", contact: "Contact", support: "Contact Support", careers: "Careers",
    reviewers: "Our Human Reviewers", legal: "Terms and Privacy", languages: "Supported Languages",
    changelog: "Changelog", "info:help": "Help Center", "info:security": "Security and Privacy",
    "res:blog": "Blog", "res:tutorials": "Tutorials", "res:usecases": "Use Cases",
  };
  if (staticCrumbs[route]) return staticCrumbs[route];
  if (route.startsWith("aud:")) {
    const t = { businesses: "Businesses", creators: "Creators & podcasters", researchers: "Researchers", newsrooms: "Journalists & newsrooms", education: "Education", video: "Video accessibility", consulting: "Research & consulting" };
    return t[route.slice(4)];
  }
  return null;
};

// nav label → allowed crumb(s) on the target page
const alias = {
  "Timestamped text": ["AI Transcription"], "Large files": ["AI Transcription"],
  "Speaker detection": ["Speaker Detection"], "Language auto-detect": ["Language auto-detect"],
  "AI translation": ["AI Translation"], "Original kept intact": ["AI Translation"],
  "Multiple languages": ["Language auto-detect"], "Human translation": ["Human Translation"],
  "Word-level editor": ["Transcript Editor"], "Auto-save": ["Transcript Editor"],
  "Share transcript": ["Export Center"], "TXT, SRT, DOCX, PDF": ["Export Center"],
  "Folders": ["Files and Folders"], "Sessions archive": ["Files and Folders"],
  "Search": ["Files and Folders"], "Bulk upload": ["Files and Folders"],
  "Human Transcription": ["Human Transcription"], "Verified Subtitles": ["Verified Subtitles"],
};

for (const item of NAV_MENUS) {
  if (item.page) { // direct nav item (Pricing) — untouched zone
    continue;
  }
  const flat = [];
  for (const col of item.columns || []) {
    (col.items || []).forEach((x) => flat.push(x));
    (col.grid2x2 || []).forEach((g) => g.items.forEach((x) => flat.push(x)));
  }
  for (const it of flat) {
    const route = it.page || (it.slug ? "feat:" + it.slug : it.svc ? "svc:" + it.svc : null);
    if (!route) { fail(`nav "${item.label} > ${it.label}": no route`); continue; }
    if (!routeResolves(route)) fail(`nav "${item.label} > ${it.label}": route "${route}" does not resolve`);
    else if (!alias[it.label]) {
      const c = crumbOf(route);
      if (c && c !== it.label) fail(`topic mismatch: nav "${item.label}" → page crumb "${c}"`);
    } else if (!alias[it.label].includes(crumbOf(route))) {
      fail(`topic mismatch: nav "${it.label}" expects ${alias[it.label]} but page crumb is "${crumbOf(route)}"`);
    }
  }
}

// ── 2. related chips / group-page targets resolve ─────────────────────────
for (const [slug, f] of Object.entries(SPEC_DATA.features)) {
  for (const [label, target] of f.related || []) {
    if (!featSlugs.has(target)) fail(`feat "${slug}": related chip "${label}" → broken target "${target}"`);
  }
}
for (const [slug, g] of Object.entries(RICH_DATA.groupPages)) {
  for (const [label, target] of g.items || []) {
    const ok = target.includes(":") ? routeResolves(target) : featSlugs.has(target);
    if (!ok) fail(`group "${slug}": item "${label}" → broken target "${target}"`);
  }
}
for (const [slug, a] of Object.entries(RICH_DATA.audiences)) {
  for (const [label, target] of a.recommended || []) {
    if (!featSlugs.has(target)) fail(`audience "${slug}": recommended "${label}" → broken target "${target}"`);
  }
}

// ── 3. contract: forbidden phrases per feature page ───────────────────────
const blob = (o) => JSON.stringify([o.headline, o.desc, o.steps, o.faq, o.cards,
  ...(o.related || []).map((r) => r[0])]);
const contracts = {
  "ai-transcription": [/translat/i, /export/i, /folder/i, /\bchat\b/i],
  "speaker-detection": [/translat/i, /export/i, /upload format/i],
  "editor": [/upload/i, /format/i, /export comparison/i],
  "ask": [/upload/i, /folder/i, /export/i],
  "key-moments": [/translat/i, /export/i, /upload/i],
  "translation": [/upload/i, /folder/i, /speaker detection/i],
  "share": [/upload format/i, /speaker detection/i, /translat/i],
  "link-import": [/export/i, /\beditor\b/i],
  "files-folders": [/how.*transcrib/i, /export/i, /translat/i],
};
for (const [slug, rules] of Object.entries(contracts)) {
  const f = SPEC_DATA.features[slug];
  if (!f) { fail(`contract: missing page "${slug}"`); continue; }
  const text = blob(f);
  for (const re of rules) if (re.test(text)) fail(`contract violation on "${slug}": matches ${re}`);
}

// human pages: each its own topic, planned-only, no shared sentences
const humanTexts = {};
for (const [slug, p] of Object.entries(SPEC_DATA.human.pages)) {
  humanTexts[slug] = blob(p);
  if (/accuracy|turnaround|available|\$\d|48 hours/i.test(JSON.stringify(p)))
    fail(`human page "${slug}": makes an accuracy/speed/price/availability claim`);
  if (!p.service) fail(`human page "${slug}": missing preselected service`);
}
const hs = Object.values(humanTexts);
if (hs[0] && hs[1] && similarity(hs[0], hs[1]) > 0.6) fail("human pages share too much text (1↔2)");
if (hs[0] && hs[2] && similarity(hs[0], hs[2]) > 0.6) fail("human pages share too much text (1↔3)");
if (hs[1] && hs[2] && similarity(hs[1], hs[2]) > 0.6) fail("human pages share too much text (2↔3)");

// ── 4. no invented claims / visible placeholders in reachable data ────────
const scan = (obj, where) => {
  const t = JSON.stringify(obj);
  if (/TODO|PLACEHOLDER|Lorem ipsum/i.test(t)) fail(`visible placeholder in ${where}`);
  if (/(98%|99%|\d+%\s*(accuracy)?|<3 min|48 hours)/i.test(t) && where !== "siteData:trust") {
    if (/\d+%/.test(t)) fail(`invented statistic in ${where}`);
  }
  if (/\$(?!0")[\d]/.test(t) && where.startsWith("human") === false && !where.includes("PLANS")) {
    if (where.includes("audiences") || where.includes("features") || where.includes("blog") || where.includes("help") || where.includes("tutorials"))
      fail(`invented price in ${where}`);
  }
};
scan(SPEC_DATA.features, "features");
scan(RICH_DATA.groupPages, "groupPages");
scan(RICH_DATA.audiences, "audiences");
scan(RICH_DATA.blog.posts, "blog");
scan(RICH_DATA.help.articles, "help");
scan(RICH_DATA.tutorials.items, "tutorials");
scan(RICH_DATA.security, "security");
scan(SPEC_DATA.human.pages, "human pages");
scan(SPEC_DATA.reviewers, "reviewers");
scan(SPEC_DATA.careers, "careers");
scan(RICH_DATA.chatExamples, "chatExamples");
scan(RICH_DATA.momentsExamples, "momentsExamples");
scan(RICH_DATA.translation.sample, "translation sample");
scan(RICH_DATA.demoTranscript, "demo transcript");

// menu stats: only factual stats allowed
for (const item of NAV_MENUS) {
  for (const [n] of item.stats || []) {
    if (/98%|<3|24\/7|100%/.test(n)) fail(`invented menu stat: "${n}"`);
  }
}

// ── 5. near-identical paragraphs across feature + audience pages ──────────
const blobs = {};
for (const [s, f] of Object.entries(SPEC_DATA.features)) blobs["feat:" + s] = blob(f);
for (const [s, a] of Object.entries(RICH_DATA.audiences)) blobs["aud:" + s] = JSON.stringify(a);
const keys = Object.keys(blobs);
for (let i = 0; i < keys.length; i++) {
  for (let j = i + 1; j < keys.length; j++) {
    const sim = similarity(blobs[keys[i]], blobs[keys[j]]);
    if (sim > 0.8) fail(`near-identical pages: ${keys[i]} ↔ ${keys[j]} (${Math.round(sim * 100)}%)`);
  }
}

// ── 6. API page hidden while there is no API ──────────────────────────────
if (SPEC_DATA.api?.enabled !== false) fail("api.enabled must be false while no public API exists");
for (const item of NAV_MENUS) {
  const flat = JSON.stringify(item.columns || []);
  if (flat.includes("info:api")) fail("API menu item must be hidden while api.enabled is false");
}

// ── similarity helper (token-set Jaccard) ─────────────────────────────────
function similarity(a, b) {
  const tok = (x) => new Set(String(x).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3));
  const A = tok(a), B = tok(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

// ── report ────────────────────────────────────────────────────────────────
if (problems.length) {
  console.error(`\nSITE AUDIT FAILED — ${problems.length} problem(s):`);
  for (const p of problems) console.error("  ✖ " + p);
  process.exit(1);
} else {
  console.log("SITE AUDIT PASSED — routes, topics, contracts, honesty, similarity, menu stats: all clear.");
}
