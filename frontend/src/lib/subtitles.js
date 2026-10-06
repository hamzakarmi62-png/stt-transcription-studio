// SRT / VTT parsing, conversion and timecode shifting — pure functions
// (no DOM), exercised by frontend/scripts/tools.test.mjs.

const TS = /(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})/;

function toMs(h, m, s, ms) {
  return ((+h * 60 + +m) * 60 + +s) * 1000 + +String(ms).padEnd(3, "0").slice(0, 3);
}

function fmt(ms, comma) {
  ms = Math.max(0, Math.round(ms));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const f = String(ms % 1000).padStart(3, "0");
  return `${h}:${m}:${s}${comma ? "," : "."}${f}`;
}

// Parse SRT or VTT text into [{start, end, text}]. Throws on no cues.
export function parseCues(raw) {
  const text = String(raw || "").replace(/\r/g, "").replace(/^WEBVTT.*$/m, "");
  const blocks = text.split(/\n{2,}/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim() !== "" && !/^NOTE\b/.test(l));
    if (!lines.length) continue;
    const tsLine = lines.find((l) => TS.test(l));
    if (!tsLine) continue;
    const m = tsLine.match(TS);
    const idx = lines.indexOf(tsLine);
    const body = lines.slice(idx + 1).join("\n").trim();
    if (!body) continue;
    cues.push({ start: toMs(m[1], m[2], m[3], m[4]), end: toMs(m[5], m[6], m[7], m[8]), text: body });
  }
  if (!cues.length) throw new Error("No subtitle cues found. Check that the text contains timecode lines like 00:00:01,000 --> 00:00:04,000.");
  return cues;
}

export function toSRT(cues) {
  return cues
    .map((c, i) => `${i + 1}\n${fmt(c.start, true)} --> ${fmt(c.end, true)}\n${c.text}`)
    .join("\n\n") + "\n";
}

export function toVTT(cues) {
  return "WEBVTT\n\n" + cues
    .map((c) => `${fmt(c.start, false)} --> ${fmt(c.end, false)}\n${c.text}`)
    .join("\n\n") + "\n";
}

// Remove timing entirely → plain text (cue text only, one block per line group).
export function stripTimes(raw) {
  const cues = parseCues(raw);
  const out = [];
  let prev = null;
  for (const c of cues) {
    if (prev !== null && c.text === prev) continue; // VTT/SRT duplicated lines
    out.push(c.text);
    prev = c.text;
  }
  return out.join("\n\n") + "\n";
}

// Shift all timecodes by ±seconds (negative allowed, clamped at 0).
export function shiftTimes(raw, seconds) {
  const delta = Math.round(Number(seconds) * 1000);
  if (!Number.isFinite(delta)) throw new Error("Shift value must be a number of seconds.");
  const cues = parseCues(raw).map((c) => ({
    ...c,
    start: Math.max(0, c.start + delta),
    end: Math.max(0, c.end + delta),
  }));
  return cues;
}

export function convert(raw, mode, seconds) {
  switch (mode) {
    case "srt2vtt": return toVTT(parseCues(raw));
    case "vtt2srt": return toSRT(parseCues(raw));
    case "strip": return stripTimes(raw);
    case "shift": return toSRT(shiftTimes(raw, seconds));
    default: throw new Error("Unknown conversion mode.");
  }
}
