// Pure-function tests for the client-side tools (no deps, node:test).
// Run: node frontend/scripts/tools.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCues, toSRT, toVTT, stripTimes, shiftTimes, convert } from "../src/lib/subtitles.js";
import { checkLink } from "../src/lib/linkCheck.js";

const SRT = `1
00:00:01,000 --> 00:00:04,000
Hello there.

2
00:00:04,500 --> 00:00:07,200
Second line.
`;

const VTT = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello there.

00:00:04.500 --> 00:00:07.200
Second line.
`;

// ── SRT / VTT conversion ──────────────────────────────────────────────────
test("parse SRT cues", () => {
  const cues = parseCues(SRT);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].start, 1000);
  assert.equal(cues[1].end, 7200);
});

test("parse VTT cues (dot ms, header ignored)", () => {
  const cues = parseCues(VTT);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].start, 1000);
});

test("SRT → VTT round-trip keeps timing", () => {
  const out = convert(SRT, "srt2vtt");
  assert.match(out, /^WEBVTT/);
  assert.match(out, /00:00:01\.000 --> 00:00:04\.000/);
  assert.match(out, /Hello there\./);
});

test("VTT → SRT round-trip keeps numbering and comma ms", () => {
  const out = convert(VTT, "vtt2srt");
  assert.match(out, /1\n00:00:01,000 --> 00:00:04,000/);
  assert.match(out, /Second line\./);
});

test("strip timestamps removes timing, keeps text", () => {
  const out = stripTimes(SRT);
  assert.doesNotMatch(out, /-->/);
  assert.match(out, /Hello there\./);
  assert.match(out, /Second line\./);
});

test("shift +2.5s moves every timecode", () => {
  const cues = shiftTimes(SRT, 2.5);
  assert.equal(cues[0].start, 3500);
  assert.equal(cues[1].end, 9700);
});

test("shift -5s clamps at zero (no negative timecodes)", () => {
  const cues = shiftTimes(SRT, -5);
  assert.equal(cues[0].start, 0);
  assert.equal(cues[0].end, 0);
});

test("malformed input: no cues → clear error", () => {
  assert.throws(() => convert("just some text without timecodes", "srt2vtt"), /No subtitle cues/);
});

test("malformed input: empty string → clear error", () => {
  assert.throws(() => convert("", "strip"), /No subtitle cues/);
});

test("malformed input: truncated cue with timecode but no text errors clearly", () => {
  // a lone timecode line has no body — with no usable cues the converter
  // refuses instead of silently returning an empty file
  assert.throws(() => convert("00:00:01,000 --> 00:00:04,000\n", "srt2vtt"), /No subtitle cues/);
});

// ── link checker ──────────────────────────────────────────────────────────
test("youtube watch link is supported", () => {
  const r = checkLink("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(r.ok, true);
  assert.equal(r.type, "youtube");
});

test("youtu.be short link is supported", () => {
  assert.equal(checkLink("https://youtu.be/abc123").ok, true);
});

test("direct mp3/mp4 links are supported", () => {
  assert.equal(checkLink("https://example.com/audio/session.mp3").type, "direct");
  assert.equal(checkLink("https://example.com/video/meeting.mp4?dl=1").type, "direct");
});

test("bare domain without scheme is rejected with a tip", () => {
  const r = checkLink("youtube.com/watch?v=x");
  assert.equal(r.ok, false);
  assert.equal(r.type, "scheme");
});

test("ordinary web page is rejected with tips", () => {
  const r = checkLink("https://example.com/press-conference");
  assert.equal(r.ok, false);
  assert.equal(r.type, "page");
});

test("unsupported media extension gets an upload hint", () => {
  const r = checkLink("https://example.com/audio/lecture.wav");
  assert.equal(r.ok, false);
  assert.equal(r.type, "ext");
});

test("empty input handled", () => {
  assert.equal(checkLink("").type, "empty");
  assert.equal(checkLink(null).type, "empty");
});

test("link with spaces flagged", () => {
  assert.equal(checkLink("https://example.com/a b.mp3").type, "spaces");
});
