import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api.js";
import { formatTime, nextColor, uid } from "../utils.js";
import Segment from "./Segment.jsx";
import ExportMenu from "./ExportMenu.jsx";
import PlayerPanel from "./PlayerPanel.jsx";
import UserMenu from "./UserMenu.jsx";
import { ArrowLeft, Play, MessageSquarePlus, Scissors, Highlighter, CornerUpLeft, CornerUpRight, Search, X, RotateCcw, RotateCw, Pause, Languages, Sparkles, Chart } from "./Icons.jsx";

const VIDEO_EXTS = ["mp4", "webm", "mov", "m4v", "mkv", "avi"];

export default function TranscriptScreen({ initialSession, onBack, user, onLogout }) {
  const [session, setSession] = useState(initialSession || {});
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ── Instant seeking: download the WHOLE media file once in the background
  // and serve the player from a local blob URL. Seeks to any timestamp then
  // start instantly instead of waiting on network range requests. Skipped
  // for very large files (long videos) to protect memory.
  const [mediaSrc, setMediaSrc] = useState(api.audioUrl(session.id));
  const blobUrlRef = useRef(null);
  useEffect(() => {
    const sid = session.id;
    let alive = true;
    setMediaSrc(api.audioUrl(sid));
    (async () => {
      try {
        const res = await fetch(api.audioUrl(sid));
        if (!res.ok || !alive) return;
        const len = Number(res.headers.get("content-length") || 0);
        if (len > 300 * 1024 * 1024) return; // too big (long videos) — stay progressive
        const blob = await res.blob();
        if (!alive) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        const a = audioRef.current;
        const t = a ? a.currentTime : 0;
        const wasPlaying = a ? !a.paused && !a.ended : false;
        setMediaSrc(url);
        // keep the playhead and playback state across the src swap
        requestAnimationFrame(() => {
          const el = audioRef.current;
          if (!el) return;
          const apply = () => {
            try {
              el.currentTime = t;
            } catch {
              /* best effort */
            }
            if (wasPlaying) el.play().catch(() => {});
          };
          if (el.readyState >= 1) apply();
          else el.addEventListener("loadedmetadata", apply, { once: true });
        });
      } catch {
        /* keep the progressive URL */
      }
    })();
    return () => {
      alive = false;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [session.id]);

  // Caret position to place when entering edit mode (0 = start of the new
  // paragraph after a Rev-style split, so pressing Enter again gives the
  // new paragraph its own speaker).
  const [editingCaret, setEditingCaret] = useState(null);
  const [activeWordKey, setActiveWordKey] = useState(null);
  const [editingWordKey, setEditingWordKey] = useState(null);

  // useCallback with a ref-based mutate: the identity is stable across
  // renders, so memo(Segment) can actually skip untouched paragraphs.
  const updateWordText = useCallback((segId, wordIdx, newWordText) => {
    mutate((prev) => ({
      ...prev,
      segments: prev.segments.map((s) => {
        if (s.id !== segId) return s;
        const newWords = [...(s.words || [])];
        if (newWords[wordIdx]) {
          newWords[wordIdx] = { ...newWords[wordIdx], word: newWordText };
        }
        const newText = newWords.map((w) => w.word).join(" ");
        return { ...s, text: newText, words: newWords };
      }),
    }));
  }, []);
  const [saveState, setSaveState] = useState("saved");
  const [playerMode, setPlayerMode] = useState("docked");
  const [highlightOffset, setHighlightOffset] = useState(() => {
    try {
      const v = parseFloat(localStorage.getItem("zendocs:syncOffset"));
      return Number.isFinite(v) ? Math.min(1.5, Math.max(-1.5, v)) : 0.25;
    } catch {
      return 0.25;
    }
  });
  const [history, setHistory] = useState([initialSession || {}]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const audioRef = useRef(null);
  const saveTimerRef = useRef(null);
  const sessionRef = useRef(session);

  // ── Insights drawer (translation / summary / stats) — additive only ──
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsTab, setInsightsTab] = useState("translate");
  const [translateJob, setTranslateJob] = useState(null);
  const [translations, setTranslations] = useState({});
  const [activeLang, setActiveLang] = useState(null);
  const [summaryJob, setSummaryJob] = useState(null);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [insightsError, setInsightsError] = useState("");
  const [translateTarget, setTranslateTarget] = useState("fr");

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const speakers = session?.speakers || [];
  const segments = session?.segments || [];

  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    const q = searchQuery.toLowerCase();
    return segments.filter((s) => s.text.toLowerCase().includes(q));
  }, [segments, searchQuery]);

  const mediaKind = useMemo(() => {
    if (session?.kind) return session.kind;
    const p = (session?.audio_path || "").toLowerCase();
    return VIDEO_EXTS.some((e) => p.endsWith(e)) ? "video" : "audio";
  }, [session?.kind, session?.audio_path]);

  const speakerById = useMemo(() => {
    const m = {};
    speakers.forEach((s) => {
      if (s && s.id) m[s.id] = s;
    });
    return m;
  }, [speakers]);

  const skipTime = (seconds) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  };

  const setSpeed = (spd) => {
    setPlaybackSpeed(spd);
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = spd;
    }
  };

  useEffect(() => {
    if (!initialSession) return;
    const segs = (initialSession.segments || []).map((s) => {
      const seg = { ...s, words: s.words || [] };
      // Sessions transcribed without word timestamps (e.g. Groq turbo) get
      // synthesized timings so the yellow word highlight still tracks.
      if (seg.words.length === 0 && seg.text && seg.end > seg.start) {
        seg.words = generateWordsForText(seg.text, seg.start, seg.end);
      }
      return seg;
    });
    let spk = initialSession.speakers || [];
    if (spk.length === 0 && segs.length > 0) {
      spk = [{ id: "s1", name: "Speaker 1", color: "#2563eb" }];
      segs.forEach((s) => (s.speaker = "s1"));
    }
    setSession({ ...initialSession, segments: segs, speakers: spk });
  }, [initialSession]);

  useEffect(() => {
    let raf;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        setCurrentTime(audio.currentTime);
        setPlaying(!audio.paused && !audio.ended);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("zendocs:syncOffset", String(highlightOffset));
    } catch {
      /* private mode */
    }
  }, [highlightOffset]);

  const payloadFor = useCallback((s) => ({
    segments: s.segments,
    speakers: s.speakers,
    settings: s.settings || {},
    language: s.language,
    duration: s.duration,
  }), []);

  const scheduleSave = useCallback(() => {
    setSaveState("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.saveSession(sessionRef.current.id, payloadFor(sessionRef.current));
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 900);
  }, [payloadFor]);

  // History lives in a ref (source of truth) so several mutates fired in the
  // same event handler — commit + Rev-style split on one Enter — never slice
  // the stack with a stale index. The states below mirror it for the UI.
  const historyRef = useRef({ list: [initialSession || {}], idx: 0 });

  const mutate = useCallback((transform) => {
    const prev = sessionRef.current;
    const next = transform(prev);
    sessionRef.current = next;
    const h = historyRef.current;
    const list = [...h.list.slice(0, h.idx + 1), next];
    historyRef.current = { list, idx: list.length - 1 };
    setSession(next);
    setHistory(list);
    setHistoryIndex(list.length - 1);
    scheduleSave();
  }, [scheduleSave]);

  const undo = () => {
    const h = historyRef.current;
    if (h.idx > 0) {
      h.idx -= 1;
      const s = h.list[h.idx];
      sessionRef.current = s;
      setSession(s);
      setHistoryIndex(h.idx);
      scheduleSave();
    }
  };

  const redo = () => {
    const h = historyRef.current;
    if (h.idx < h.list.length - 1) {
      h.idx += 1;
      const s = h.list[h.idx];
      sessionRef.current = s;
      setSession(s);
      setHistoryIndex(h.idx);
      scheduleSave();
    }
  };

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    []
  );

  const manualSave = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState("saving");
    try {
      await api.saveSession(sessionRef.current.id, payloadFor(sessionRef.current));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const activeIdx = useMemo(() => {
    let idx = -1;
    segments.forEach((s, i) => {
      if (currentTime >= s.start && currentTime < s.end) idx = i;
    });
    return idx;
  }, [currentTime, segments]);

  const activeSegment = activeIdx >= 0 ? segments[activeIdx] : null;
  const activeSegRef = useRef(null);
  activeSegRef.current = activeSegment;

  // No auto-scroll while playing: the page stays exactly where the reader
  // put it (hovering a word, correcting…), even as playback advances.

  useEffect(() => {
    if (segments.length === 0) {
      setActiveWordKey(null);
      return;
    }
    let foundKey = null;
    const speechTime = currentTime + highlightOffset;

    let allWords = [];
    segments.forEach(seg => {
      (seg.words || []).forEach((w, i) => {
        allWords.push({ key: `${seg.id}-w${i}`, start: w.start, end: w.end });
      });
    });

    if (allWords.length > 0) {
      let activeWord = null;
      let lastPastWord = null;

      for (const w of allWords) {
        if (speechTime >= w.start && speechTime <= w.end) {
          activeWord = w;
          break;
        }
        if (speechTime > w.end) {
          lastPastWord = w;
        }
      }

      if (activeWord) {
        foundKey = activeWord.key;
      } else if (lastPastWord) {
        const nextWord = allWords.find(w => w.start > lastPastWord.end);
        if (!nextWord || speechTime < nextWord.start) {
          foundKey = lastPastWord.key;
        }
      }
    }

    setActiveWordKey(foundKey);
  }, [currentTime, segments, highlightOffset]);

  const seekTo = useCallback((t) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = t;
      audio.play().catch(() => {});
    }
  }, []);

  // Position the playhead WITHOUT starting playback — clicking a word or a
  // paragraph must never auto-play; only the play buttons do.
  const positionAt = useCallback((t) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = t;
  }, []);

  const generateWordsForText = (text, start, end) => {
    const parts = text.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return [];
    const totalChars = parts.reduce((acc, p) => acc + Math.max(p.length, 1), 0);
    const minDurationNeeded = parts.length * 0.08;
    const effectiveEnd = Math.max(end, start + minDurationNeeded);
    const duration = effectiveEnd - start;
    let curTime = start;
    return parts.map((w, idx) => {
      const charWeight = Math.max(w.length, 1);
      const wDuration = (charWeight / totalChars) * duration;
      let wStart = curTime;
      if (idx > 0) {
        wStart = Math.max(curTime, start + (idx * 0.05));
      }
      let wEnd = wStart + wDuration;
      if (wEnd <= wStart) {
        wEnd = wStart + 0.05;
      }
      if (idx === parts.length - 1 && wEnd < effectiveEnd) {
        wEnd = effectiveEnd;
      }
      curTime = wEnd;
      return {
        word: w,
        start: Number(wStart.toFixed(3)),
        end: Number(wEnd.toFixed(3)),
      };
    });
  };

  const alignWords = (oldWords, newParts, segStart, segEnd) => {
    const n = oldWords.length;
    const m = newParts.length;
    
    if (n === 0 || m === 0) {
      const duration = Math.max(segEnd - segStart, m * 0.15);
      let cur = segStart;
      return newParts.map((w) => {
        const wDur = duration / m;
        const start = cur;
        const end = cur + wDur;
        cur = end;
        return { word: w, start: Number(start.toFixed(3)), end: Number(end.toFixed(3)) };
      });
    }

    const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (oldWords[i - 1].word.toLowerCase() === newParts[j - 1].toLowerCase()) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    let i = n, j = m;
    const matches = [];
    while (i > 0 && j > 0) {
      if (oldWords[i - 1].word.toLowerCase() === newParts[j - 1].toLowerCase()) {
        matches.unshift({ oldIdx: i - 1, newIdx: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    const result = Array(m);
    for (const match of matches) {
      result[match.newIdx] = {
        word: newParts[match.newIdx],
        start: oldWords[match.oldIdx].start,
        end: oldWords[match.oldIdx].end,
      };
    }

    let lastAssignedEnd = segStart;
    for (let idx = 0; idx < m; idx++) {
      if (result[idx]) {
        lastAssignedEnd = result[idx].end;
        continue;
      }

      let nextMatchedStart = segEnd;
      let k = idx;
      while (k < m && !result[k]) {
        k++;
      }
      if (k < m) {
        nextMatchedStart = result[k].start;
      }

      const unassignedCount = k - idx;
      const availableDuration = Math.max(0.15 * unassignedCount, nextMatchedStart - lastAssignedEnd);
      const step = availableDuration / unassignedCount;

      let cur = lastAssignedEnd;
      for (let subIdx = idx; subIdx < k; subIdx++) {
        const start = cur;
        const end = Math.min(nextMatchedStart, cur + step);
        result[subIdx] = {
          word: newParts[subIdx],
          start: Number(start.toFixed(3)),
          end: Number(Math.max(end, start + 0.1).toFixed(3)),
        };
        cur = result[subIdx].end;
      }
      idx = k - 1;
      lastAssignedEnd = cur;
    }

    return result;
  };

  const updateSegmentText = useCallback((id, text) =>
    mutate((prev) => ({
      ...prev,
      segments: prev.segments.map((s) => {
        if (s.id !== id) return s;
        const newParts = text.trim().split(/\s+/).filter(Boolean);
        const oldWords = s.words || [];

        if (newParts.length === 0) {
          return { ...s, text, words: [] };
        }

        const words = alignWords(oldWords, newParts, s.start, s.end);
        const lastWordEnd = words[words.length - 1]?.end || s.end;
        const newEnd = Math.max(s.end, lastWordEnd);

        return {
          ...s,
          text,
          end: Number(newEnd.toFixed(3)),
          words,
        };
      }),
    })), [mutate]);

  const deleteSegment = useCallback((id) =>
    mutate((prev) => ({ ...prev, segments: prev.segments.filter((s) => s.id !== id) })), [mutate]);

  // Stable identities for memo(Segment): these never change across renders.
  const startEditing = useCallback((id) => {
    setEditingCaret(null);
    setEditingId(id);
  }, []);

  const removeSegment = useCallback((id) => {
    setEditingId((cur) => (cur === id ? null : cur));
    deleteSegment(id);
  }, [deleteSegment]);

  const splitSegment = useCallback((id, caret, newId = uid()) => {
    mutate((prev) => {
      const seg = prev.segments.find((s) => s.id === id);
      if (!seg || seg.text.trim().length < 2) return prev;
      // Clamp: the caret may come from a text selection past edge cases.
      const c = Math.min(Math.max(Math.floor(caret), 1), seg.text.length - 1);
      const before = seg.text.slice(0, c);
      const after = seg.text.slice(c);
      if (!before.trim() || !after.trim()) return prev;
      // Word-accurate split time: the tail starts when its first spoken word
      // starts (the word under the caret goes down with the tail, like Rev).
      let acc = 0;
      let rightStart = null;
      const leftWords = [];
      const rightWords = [];
      for (const w of seg.words || []) {
        const a = acc;
        const b = acc + w.word.length + 1;
        acc = b;
        if (rightStart === null && b > c) rightStart = w.start;
        (b <= c ? leftWords : rightWords).push(w);
      }
      const right = {
        id: newId,
        start: Number(
          (rightStart ?? seg.start + (seg.end - seg.start) * (c / Math.max(seg.text.length, 1))).toFixed(3)
        ),
        end: seg.end,
        text: after.trim(),
        speaker: seg.speaker,
        words: rightWords,
      };
      const idx = prev.segments.findIndex((s) => s.id === id);
      const next = [...prev.segments];
      next[idx] = {
        ...seg,
        text: before.trim(),
        end: Number((leftWords[leftWords.length - 1]?.end ?? right.start).toFixed(3)),
        words: leftWords,
      };
      next.splice(idx + 1, 0, right);
      return { ...prev, segments: next };
  });
}, [mutate]);

  const splitSegmentAtWord = useCallback((segId, wordIdx) => {
    if (wordIdx <= 0) return;
    mutate((prev) => {
      const seg = prev.segments.find((s) => s.id === segId);
      if (!seg || !seg.words || wordIdx >= seg.words.length) return prev;
      
      const leftWords = seg.words.slice(0, wordIdx);
      const rightWords = seg.words.slice(wordIdx);
      
      if (leftWords.length === 0 || rightWords.length === 0) return prev;

      const leftText = leftWords.map(w => w.word).join(" ");
      const rightText = rightWords.map(w => w.word).join(" ");
      const splitTime = rightWords[0].start;

      const right = {
        id: uid(),
        start: splitTime,
        end: seg.end,
        text: rightText,
        speaker: seg.speaker,
        words: rightWords,
      };

      const idx = prev.segments.findIndex((s) => s.id === segId);
      const next = [...prev.segments];
      next[idx] = { ...seg, text: leftText, end: splitTime, words: leftWords };
      next.splice(idx + 1, 0, right);
      return { ...prev, segments: next };
  });
}, [mutate]);

  const mergeWithNext = useCallback((id) =>
    mutate((prev) => {
      const idx = prev.segments.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.segments.length - 1) return prev;
      const cur = prev.segments[idx];
      const nxt = prev.segments[idx + 1];
      const merged = {
        ...cur,
        text: `${cur.text} ${nxt.text}`.trim(),
        end: nxt.end,
        words: [...(cur.words || []), ...(nxt.words || [])],
      };
      const next = [...prev.segments];
      next[idx] = merged;
      next.splice(idx + 1, 1);
      return { ...prev, segments: next };
    }), [mutate]);

  // Backspace at the start of a paragraph (Rev-style) merges it into the previous one.
  const mergeWithPrev = useCallback((id) =>
    mutate((prev) => {
      const idx = prev.segments.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const cur = prev.segments[idx];
      const prv = prev.segments[idx - 1];
      const merged = {
        ...prv,
        text: `${prv.text} ${cur.text}`.trim(),
        end: cur.end,
        words: [...(prv.words || []), ...(cur.words || [])],
      };
      const next = [...prev.segments];
      next[idx - 1] = merged;
      next.splice(idx, 1);
      return { ...prev, segments: next };
    }), [mutate]);

  const reassign = useCallback((id, speakerId) =>
    mutate((prev) => ({
      ...prev,
      segments: prev.segments.map((s) => (s.id === id ? { ...s, speaker: speakerId } : s)),
    })), [mutate]);

  // ── Word-like paragraph flow ─────────────────────────────────────────────
  // DOWN: the paragraph — or just the selected words — is sent to the START
  // of the next paragraph. UP: to the END of the previous one. The moved
  // words carry their own timings, so playback follows the new text order.

  // Character offsets {start, end} of the current selection inside a
  // segment's paragraph, or null when nothing is selected there.
  const selectionRangeIn = (id) => {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
      const range = sel.getRangeAt(0);
      const segEl = document.getElementById(`seg-${id}`);
      if (!segEl || !segEl.contains(range.startContainer) || !segEl.contains(range.endContainer)) return null;
      const p = segEl.querySelector("p[dir='auto']") || segEl.querySelector("p");
      if (!p) return null;
      const abs = (which) => {
        const pre = range.cloneRange();
        pre.selectNodeContents(p);
        pre.setEnd(
          which === "start" ? range.startContainer : range.endContainer,
          which === "start" ? range.startOffset : range.endOffset
        );
        return pre.toString().length;
      };
      const start = abs("start");
      const end = abs("end");
      return start < end ? { start, end } : null;
    } catch {
      return null;
    }
  };

  const moveSegmentDown = useCallback((id) => {
    const sel = selectionRangeIn(id);
    window.getSelection()?.removeAllRanges();
    mutate((prev) => {
      const idx = prev.segments.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.segments.length - 1) return prev;
      const cur = prev.segments[idx];
      const nxt = prev.segments[idx + 1];
      const text = cur.text || "";
      const s = sel ? Math.max(0, Math.min(sel.start, text.length)) : 0;
      const e = sel ? Math.max(0, Math.min(sel.end, text.length)) : text.length;
      const movedText = text.slice(s, e).trim();
      const restText = (text.slice(0, s) + " " + text.slice(e)).replace(/\s+/g, " ").trim();
      if (!movedText) return prev;
      // Map the moved/rest words by their character spans.
      const spans = [];
      let acc = 0;
      for (const w of cur.words || []) {
        spans.push({ w, a: acc, b: acc + w.word.length + 1 });
        acc += w.word.length + 1;
      }
      const movedWords = spans.filter((sp) => sp.a < e && sp.b > s).map((sp) => sp.w);
      const restWords = spans.filter((sp) => !(sp.a < e && sp.b > s)).map((sp) => sp.w);
      if (!restText) {
        // The whole paragraph goes down: it simply merges into the next one.
        const merged = {
          ...cur,
          text: `${cur.text} ${nxt.text}`.trim(),
          end: nxt.end,
          words: [...(cur.words || []), ...(nxt.words || [])],
        };
        const arr = [...prev.segments];
        arr[idx] = merged;
        arr.splice(idx + 1, 1);
        return { ...prev, segments: arr };
      }
      const movedStart = Number(
        (movedWords[0]?.start ?? cur.start + (cur.end - cur.start) * (s / Math.max(text.length, 1))).toFixed(3)
      );
      const arr = [...prev.segments];
      arr[idx] = {
        ...cur,
        text: restText,
        end: Number((restWords[restWords.length - 1]?.end ?? cur.end).toFixed(3)),
        words: restWords,
      };
      // The moved words land at the START of the next paragraph.
      arr[idx + 1] = {
        ...nxt,
        start: movedStart,
        text: `${movedText} ${nxt.text}`.trim(),
        words: [...movedWords, ...(nxt.words || [])],
        speaker: cur.speaker,
      };
      return { ...prev, segments: arr };
  });
}, [mutate]);

  const moveSegmentUp = useCallback((id) => {
    const sel = selectionRangeIn(id);
    window.getSelection()?.removeAllRanges();
    mutate((prev) => {
      const idx = prev.segments.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const cur = prev.segments[idx];
      const prv = prev.segments[idx - 1];
      const text = cur.text || "";
      const s = sel ? Math.max(0, Math.min(sel.start, text.length)) : 0;
      const e = sel ? Math.max(0, Math.min(sel.end, text.length)) : text.length;
      const movedText = text.slice(s, e).trim();
      const restText = (text.slice(0, s) + " " + text.slice(e)).replace(/\s+/g, " ").trim();
      if (!movedText) return prev;
      const spans = [];
      let acc = 0;
      for (const w of cur.words || []) {
        spans.push({ w, a: acc, b: acc + w.word.length + 1 });
        acc += w.word.length + 1;
      }
      const movedWords = spans.filter((sp) => sp.a < e && sp.b > s).map((sp) => sp.w);
      const restWords = spans.filter((sp) => !(sp.a < e && sp.b > s)).map((sp) => sp.w);
      if (!restText) {
        // The whole paragraph goes up: it merges into the previous one.
        const merged = {
          ...prv,
          text: `${prv.text} ${cur.text}`.trim(),
          end: cur.end,
          words: [...(prv.words || []), ...(cur.words || [])],
        };
        const arr = [...prev.segments];
        arr[idx - 1] = merged;
        arr.splice(idx, 1);
        return { ...prev, segments: arr };
      }
      const arr = [...prev.segments];
      // The moved words land at the END of the previous paragraph.
      arr[idx - 1] = {
        ...prv,
        text: `${prv.text} ${movedText}`.trim(),
        end: Number((movedWords[movedWords.length - 1]?.end ?? Math.max(prv.end, cur.start)).toFixed(3)),
        words: [...(prv.words || []), ...movedWords],
      };
      arr[idx] = {
        ...cur,
        text: restText,
        start: Number((restWords[0]?.start ?? cur.start).toFixed(3)),
        words: restWords,
      };
      return { ...prev, segments: arr };
  });
}, [mutate]);

  const deleteSpeaker = useCallback((speakerId) =>
    mutate((prev) => {
      if (prev.speakers.length <= 1) return prev;
      const remaining = prev.speakers.filter((s) => s.id !== speakerId);
      if (remaining.length === prev.speakers.length) return prev;
      const fallback = remaining[0].id;
      return {
        ...prev,
        speakers: remaining,
        segments: prev.segments.map((s) =>
          s.speaker === speakerId ? { ...s, speaker: fallback } : s
        ),
      };
  }), [mutate]);

  // Create a brand-new speaker and assign exactly one paragraph to it.
  const addSpeakerForSegment = useCallback((segId) =>
    mutate((prev) => {
      const spk = {
        id: uid(),
        name: `Speaker ${prev.speakers.length + 1}`,
        color: nextColor(prev.speakers.length),
      };
      return {
        ...prev,
        speakers: [...prev.speakers, spk],
        segments: prev.segments.map((s) => (s.id === segId ? { ...s, speaker: spk.id } : s)),
      };
  }), [mutate]);

  // Full keyboard control (Word-like):
  // - Entrée = NEVER moves text: it only validates what was typed —
  //   everything stays exactly in place. Splitting = the scissors button.
  // - Alt+↑ / Alt+↓ = send text to the end of the previous / start of the
  //   next paragraph (selection-aware)
  // - Ctrl+Z / Ctrl+Y (or Ctrl+Shift+Z) → undo / redo
  const keyHandlersRef = useRef({});
  keyHandlersRef.current = {
    up: moveSegmentUp,
    down: moveSegmentDown,
    mergePrev: mergeWithPrev,
    undo,
    redo,
  };

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      const h = keyHandlersRef.current;

      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === "z" && !e.shiftKey) {
          e.preventDefault();
          h.undo?.();
          return;
        }
        if (k === "y" || (k === "z" && e.shiftKey)) {
          e.preventDefault();
          h.redo?.();
          return;
        }
        return;
      }

      if (e.key === "Enter") {
        // Text must never move on Enter — nothing happens here.
        e.preventDefault();
      } else if (e.key === "Delete") {
        e.preventDefault();
        // Delete merges the active paragraph with the one ABOVE it.
        const seg = activeSegRef.current;
        if (seg) h.mergePrev?.(seg.id);
      } else if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const seg = activeSegRef.current;
        if (seg) (e.key === "ArrowDown" ? h.down : h.up)?.(seg.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const renameSpeaker = useCallback((id, name) =>
    mutate((prev) => ({
      ...prev,
      speakers: prev.speakers.map((s) => (s.id === id ? { ...s, name } : s)),
    })), [mutate]);

  const addSpeaker = useCallback(() =>
    mutate((prev) => ({
      ...prev,
      speakers: [
        ...prev.speakers,
        { id: uid(), name: `Speaker ${prev.speakers.length + 1}`, color: nextColor(prev.speakers.length) },
      ],
    })), [mutate]);

  // ── Insights helpers (translation / summary / stats) ──
  const openInsights = (tab) => {
    setInsightsTab(tab);
    setInsightsOpen(true);
    setInsightsError("");
  };

  const startTranslation = async (language) => {
    setInsightsError("");
    try {
      const res = await api.startTranslate(session.id, language);
      setTranslateJob(res.job);
    } catch (e) {
      setInsightsError(e.message);
    }
  };

  const startSummary = async () => {
    setInsightsError("");
    try {
      const res = await api.startSummary(session.id);
      setSummaryJob(res.job);
    } catch (e) {
      setInsightsError(e.message);
    }
  };

  const downloadTxt = (name, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const LANG_NAMES = {
    fr: "Français", en: "English", ar: "العربية",
    es: "Español", de: "Deutsch", tr: "Türkçe",
  };

  // Poll the translate job while it runs
  useEffect(() => {
    if (translateJob?.status !== "running") return;
    const t = setInterval(async () => {
      try {
        const s = await api.translateStatus(session.id);
        setTranslateJob(s.job);
        setTranslations(s.translations || {});
      } catch { /* keep polling */ }
    }, 2500);
    return () => clearInterval(t);
  }, [translateJob?.status, session.id]);

  // Poll the summary job while it runs
  useEffect(() => {
    if (summaryJob?.status !== "running") return;
    const t = setInterval(async () => {
      try {
        const s = await api.summaryStatus(session.id);
        setSummaryJob(s.job);
        if (s.summary) setSummary(s.summary);
      } catch { /* keep polling */ }
    }, 2500);
    return () => clearInterval(t);
  }, [summaryJob?.status, session.id]);

  // One-time load of existing translations/summary + stats for the drawer
  useEffect(() => {
    if (!insightsOpen) return;
    api.translateStatus(session.id)
      .then((s) => {
        setTranslateJob(s.job);
        setTranslations(s.translations || {});
        const done = Object.entries(s.translations || {}).find(([, v]) => Array.isArray(v));
        if (done && !activeLang) setActiveLang(done[0]);
      })
      .catch(() => {});
    api.summaryStatus(session.id)
      .then((s) => {
        setSummaryJob(s.job);
        if (s.summary) setSummary(s.summary);
      })
      .catch(() => {});
    if (insightsTab === "stats" && !stats) {
      api.stats(session.id).then(setStats).catch(() => setStats({ error: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightsOpen, insightsTab, session.id]);

  // While the drawer is open, keep the insights state in sync with the
  // server — finished jobs appear within seconds, whatever the timing.
  useEffect(() => {
    if (!insightsOpen) return;
    const sync = () => {
      api.translateStatus(session.id)
        .then((s) => {
          setTranslateJob(s.job);
          setTranslations(s.translations || {});
        })
        .catch(() => {});
      api.summaryStatus(session.id)
        .then((s) => {
          setSummaryJob(s.job);
          if (s.summary) setSummary(s.summary);
        })
        .catch(() => {});
    };
    sync();
    const t = setInterval(sync, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightsOpen, session.id]);

  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Auto-saved";

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-[#18123b] relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#6415f5]/[0.07] blur-[130px]"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-[#6415f5]/[0.04] blur-[130px]"></div>
        <div className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] rounded-full bg-[#6415f5]/[0.03] blur-[130px]"></div>
      </div>
      <div className="relative">
      <header className="bg-white/85 backdrop-blur-2xl border-b border-[#18123b]/[0.08]">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl border border-[#18123b]/15 text-[#4b4763] text-sm hover:bg-[#18123b]/[0.06] transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> New
          </button>
          <div className="min-w-0">
            <h1 className="font-semibold truncate text-sm sm:text-base">{session.filename}</h1>
            <p className="text-xs text-[#4b4763]">
              {session.language || "auto"} · {segments.length} segments
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {playerMode === "hidden" && (
              <button
                onClick={() => setPlayerMode("docked")}
                className="px-3 py-1.5 rounded-xl border border-[#18123b]/15 text-[#4b4763] text-sm hover:bg-[#18123b]/[0.06] transition inline-flex items-center gap-1.5"
                title="Show player"
              >
                <Play className="w-3.5 h-3.5" filled /> Show player
              </button>
            )}
            <span className={`text-xs ${saveState === "error" ? "text-red-500" : "text-[#4b4763]"}`}>
              {saveLabel}
            </span>
            <button
              onClick={manualSave}
              className="px-3 py-1.5 rounded-xl border border-[#18123b]/15 text-[#4b4763] text-sm hover:bg-[#18123b]/[0.06] transition"
            >
              Save
            </button>
            <ExportMenu sessionId={session.id} filename={session.filename} />
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </header>

      {/* Rich Toolbar matching user's reference image */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl pt-2 pb-2 border-b border-[#18123b]/[0.08]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/85 border border-[#18123b]/[0.1] backdrop-blur-xl rounded-3xl px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* 1. Replay 15s */}
              <button
                onClick={() => skipTime(-15)}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] flex items-center gap-0.5 text-xs font-medium transition-colors"
                title="Reculer de 15 s"
              >
                <RotateCcw className="w-4 h-4" /><span className="text-[10px]">15</span>
              </button>

              {/* 2. Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#18123b] text-lg transition-colors"
                title={playing ? "Pause" : "Lecture"}
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" filled />}
              </button>

              {/* 3. Forward 30s */}
              <button
                onClick={() => skipTime(30)}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] flex items-center gap-0.5 text-xs font-medium transition-colors"
                title="Avancer de 30 s"
              >
                <span className="text-[10px]">30</span><RotateCw className="w-4 h-4" />
              </button>

              <div className="h-5 w-[1px] bg-[#18123b]/[0.06] mx-1"></div>

              {/* 4. Speed 1X */}
              <select
                value={playbackSpeed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-white border border-[#18123b]/15 rounded-xl px-2 py-1.5 text-xs font-semibold text-[#18123b] focus:outline-none cursor-pointer"
                title="Vitesse de lecture"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1X</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2X</option>
              </select>

              <div className="h-5 w-[1px] bg-[#18123b]/[0.06] mx-1"></div>

              {/* 5. Add segment */}
              <button
                onClick={() => {
                  const t = audioRef.current?.currentTime || 0;
                  mutate((prev) => ({
                    ...prev,
                    segments: [
                      ...prev.segments,
                      {
                        id: uid(),
                        start: t,
                        end: t + 3,
                        text: "Nouveau segment...",
                        speaker: prev.speakers[0]?.id || "s1",
                        words: [],
                      },
                    ].sort((a, b) => a.start - b.start),
                  }));
                }}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] transition-colors"
                title="Ajouter un segment"
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>

              {/* 6. Split active segment */}
              <button
                onClick={() => {
                  if (activeSegment) {
                    splitSegment(activeSegment.id, Math.floor(activeSegment.text.length / 2));
                  }
                }}
                disabled={!activeSegment}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] disabled:opacity-40 transition-colors"
                title="Couper / diviser le segment"
              >
                <Scissors className="w-4 h-4" />
              </button>

              {/* 7. Highlight tool */}
              <button
                onClick={() => {
                  const target = activeSegment || filteredSegments[0];
                  if (target) {
                    setEditingId(target.id);
                    setEditingCaret(null);
                  }
                }}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] border-b-2 border-fuchsia-400 transition-colors"
                title="Outil de sélection, d'édition et de surlignage"
              >
                <Highlighter className="w-4 h-4" />
              </button>

              {/* 7b. Insights — translation / summary / stats */}
              <button
                onClick={() => openInsights("translate")}
                className={`p-2 rounded-xl hover:bg-[#18123b]/[0.06] transition-colors ${insightsOpen && insightsTab === "translate" ? "text-[#6415f5]" : "text-[#4b4763]"}`}
                title="Traduction du transcript"
              >
                <Languages className="w-4 h-4" />
              </button>
              <button
                onClick={() => openInsights("summary")}
                className={`p-2 rounded-xl hover:bg-[#18123b]/[0.06] transition-colors ${insightsOpen && insightsTab === "summary" ? "text-amber-600" : "text-[#4b4763]"}`}
                title="Résumé IA"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => openInsights("stats")}
                className={`p-2 rounded-xl hover:bg-[#18123b]/[0.06] transition-colors ${insightsOpen && insightsTab === "stats" ? "text-sky-400" : "text-[#4b4763]"}`}
                title="Statistiques du dialogue"
              >
                <Chart className="w-4 h-4" />
              </button>

              <div className="h-5 w-[1px] bg-[#18123b]/[0.06] mx-1"></div>

              {/* 8. Undo */}
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] disabled:opacity-40 transition-colors"
                title="Annuler (Undo)"
              >
                <CornerUpLeft className="w-4 h-4" />
              </button>

              {/* 9. Redo */}
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] disabled:opacity-40 transition-colors"
                title="Rétablir (Redo)"
              >
                <CornerUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-5 w-[1px] bg-[#18123b]/[0.06] mx-1"></div>

              {/* 10. Download / Export */}
              <ExportMenu sessionId={session.id} filename={session.filename} />

              {/* 11. Saved status */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${saveState === "error" ? "bg-red-500/10 text-red-600 border-red-500/30" : saveState === "saving" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}`}>
                {saveState === "saving" ? "Saving…" : saveState === "error" ? "Error" : "Saved"}
              </span>

              <div className="h-5 w-[1px] bg-[#18123b]/[0.06] mx-1"></div>

              {/* 12. Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] transition-colors"
                title="Rechercher dans le texte"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar expandable */}
          {showSearch && (
            <div className="mt-2 bg-white/75 border border-[#18123b]/[0.1] rounded-2xl p-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#4b4763]" />
              <input
                type="text"
                placeholder="Rechercher dans le texte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-[#18123b]"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-xs text-[#4b4763] hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div
          className={`grid gap-6 ${playerMode === "docked" ? "lg:grid-cols-[340px_1fr]" : "grid-cols-1"}`}
        >
          <aside className="h-fit space-y-4 lg:sticky lg:top-[86px] lg:z-20">
            <PlayerPanel
              src={mediaSrc}
              kind={mediaKind}
              filename={session.filename}
              mode={playerMode}
              onMode={setPlayerMode}
              mediaRef={audioRef}
            />
          </aside>

          <section>
            {segments.length === 0 ? (
              <div className="bg-white/65 border border-[#18123b]/[0.1] rounded-3xl p-10 text-center text-[#4b4763]">
                No transcript available for this session yet.
              </div>
            ) : activeLang && translations[activeLang] ? (
              <div className="pb-10">
                <div className="bg-white rounded-[28px] border border-slate-200 shadow-xl shadow-[#18123b]/10 p-6 sm:p-10 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <h3 className="font-black text-[#18123b] text-sm flex items-center gap-2">
                      <Languages className="w-4 h-4 text-[#6415f5]" />
                      Traduction — {LANG_NAMES[activeLang] || activeLang}
                    </h3>
                    <button
                      onClick={() => setActiveLang(null)}
                      className="text-[11px] font-bold text-[#6415f5] hover:underline"
                    >
                      Revenir à l'original
                    </button>
                  </div>
                  {translations[activeLang].map((tr, i) => {
                    const seg = segments[i] || {};
                    const spk = speakerById[seg.speaker];
                    const color = spk?.color || "#475569";
                    const showMark = i === 0 || segments[i - 1]?.speaker !== seg.speaker;
                    return (
                      <div key={i}>
                        {showMark && (
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }}></span>
                            <span className="font-bold text-[15px]" style={{ color }}>
                              {spk?.name || "—"}
                            </span>
                            <span className="text-[12px] text-[#4b4763] tabular-nums opacity-70">
                              {formatTime(seg.start || 0)}
                            </span>
                          </div>
                        )}
                        <p dir="auto" className="text-[19px] leading-[2] text-[#18123b] select-text">
                          {tr.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (

              <div className="pb-10">
                <div className="bg-white rounded-[28px] border border-slate-200 shadow-xl shadow-[#18123b]/10 p-6 sm:p-10 space-y-1">
                  {filteredSegments.map((seg, index) => (
                    <Segment
                      key={seg.id}
                      segment={seg}
                      speaker={speakerById[seg.speaker]}
                      showMark={index === 0 || filteredSegments[index - 1]?.speaker !== seg.speaker}
                      isActive={activeSegment?.id === seg.id}
                      activeWordKey={activeWordKey}
                      editingWordKey={editingWordKey}
                      onSetEditingWordKey={setEditingWordKey}
                      onUpdateWord={updateWordText}
                      editing={editingId === seg.id}
                      canMerge={index < segments.length - 1}
                      canMoveUp={index > 0}
                      canMoveDown={index < segments.length - 1}
                      onMoveUp={moveSegmentUp}
                      onMoveDown={moveSegmentDown}
                      onAddSpeakerFor={addSpeakerForSegment}
                      onRenameSpeaker={renameSpeaker}
                      onDeleteSpeaker={deleteSpeaker}
                      speakers={speakers}
                      onStartEdit={startEditing}
                      onCommitEdit={updateSegmentText}
                      onDelete={removeSegment}
                      onSplit={splitSegment}
                      onMerge={mergeWithNext}
                      onMergePrev={mergeWithPrev}
                      onPositionAt={positionAt}
                      onReassign={reassign}
                      onSeek={seekTo}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#4b4763] text-center mt-4">
                  Entrée = valider le texte (rien ne bouge) · ✂ = couper à la sélection
                  (le texte après descend avec son propre temps) · Alt+↑/↓ = envoyer au paragraphe voisin ·
                  Ctrl+Z / Ctrl+Y = annuler / rétablir
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Insights drawer: translation / summary / stats ── */}
      <div
        className={`fixed inset-y-0 right-0 w-[92vw] max-w-[430px] z-40 transform transition-transform duration-300 ${
          insightsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-white/95 backdrop-blur-2xl border-s border-[#18123b]/15 p-5 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm uppercase tracking-widest text-[#4b4763]">
              {insightsTab === "translate" ? "Traduction IA" : insightsTab === "summary" ? "Résumé IA" : "Statistiques"}
            </h3>
            <button
              onClick={() => setInsightsOpen(false)}
              className="p-2 rounded-xl hover:bg-[#18123b]/[0.06] text-[#4b4763] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {insightsError && (
            <div className="mb-3 text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              {insightsError}
            </div>
          )}

          {insightsTab === "translate" && (
            <div className="space-y-4">
              <p className="text-xs text-[#4b4763] leading-relaxed">
                Traduisez tout le dialogue vers une autre langue avec l'IA (Llama 3.3 · Groq).
                Le texte original reste intact — vous basculez à tout moment.
              </p>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#4b4763] mb-1.5">
                  Langue cible
                </label>
                <select
                  value={translateTarget}
                  onChange={(e) => setTranslateTarget(e.target.value)}
                  className="w-full rounded-2xl border border-[#18123b]/15 bg-white/5 px-3.5 py-3 text-sm font-bold text-[#18123b] focus:outline-none cursor-pointer"
                >
                  {Object.entries(LANG_NAMES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => startTranslation(translateTarget)}
                disabled={translateJob?.status === "running"}
                className="w-full py-3.5 rounded-2xl bg-[#6415f5] text-white font-bold text-sm hover:bg-[#5311cf] disabled:opacity-40 transition shadow-lg shadow-indigo-950/50"
              >
                {translateJob?.status === "running" ? "Traduction en cours…" : "Traduire maintenant"}
              </button>

              {translateJob?.status === "running" && (
                <div>
                  <div className="flex justify-between text-xs text-[#4b4763] mb-1.5">
                    <span>Traduction…</span>
                    <span className="text-[#6415f5] font-bold">
                      {Math.round(((translateJob.progress || 0) / (segments.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#18123b]/10 overflow-hidden">
                    <div
                      className="h-full bg-[#6415f5] transition-all duration-300"
                      style={{ width: `${Math.round(((translateJob.progress || 0) / (segments.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {translateJob?.status === "error" && (
                <div className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {translateJob.error}
                </div>
              )}

              {Object.keys(translations).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#4b4763]">
                    Traductions prêtes — cliquez pour afficher
                  </p>
                  {Object.entries(translations).map(([lang, arr]) => (
                    <div
                      key={lang}
                      onClick={() => setActiveLang(activeLang === lang ? null : lang)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                        activeLang === lang
                          ? "border-[#6415f5]/40 bg-[#6415f5]/10"
                          : "border-[#18123b]/15 bg-white/65 hover:border-[#6415f5]/40"
                      }`}
                    >
                      <span className="text-sm font-bold text-[#18123b]">
                        {LANG_NAMES[lang] || lang} · {arr.length} segments
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTxt(
                            `${(session.filename || "transcript").replace(/\.[^.]+$/, "")}-${lang}.txt`,
                            arr.map((t) => t.text).join("\n")
                          );
                        }}
                        className="text-[10px] font-black text-[#6415f5] hover:underline"
                      >
                        .txt
                      </button>
                    </div>
                  ))}
                  {activeLang && (
                    <p className="text-[11px] text-emerald-600">
                      Affichage actuel : {LANG_NAMES[activeLang] || activeLang} — « Revenir à l'original » en haut du document.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {insightsTab === "summary" && (
            <div className="space-y-4">
              <p className="text-xs text-[#4b4763] leading-relaxed">
                L'IA lit tout le dialogue et produit un résumé structuré : points clés puis actions.
              </p>
              <button
                onClick={startSummary}
                disabled={summaryJob?.status === "running"}
                className="w-full py-3.5 rounded-2xl bg-[#6415f5] text-white font-bold text-sm hover:bg-[#5311cf] disabled:opacity-40 transition shadow-lg"
              >
                {summaryJob?.status === "running"
                  ? "Analyse du dialogue…"
                  : summary?.text
                  ? "Régénérer le résumé"
                  : "Générer le résumé"}
              </button>

              {summaryJob?.status === "running" && (
                <div className="h-2 rounded-full bg-gradient-to-r from-amber-500/40 via-fuchsia-500 to-indigo-500/40 animate-pulse" />
              )}

              {summaryJob?.status === "error" && (
                <div className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {summaryJob.error}
                </div>
              )}

              {summary?.text && (
                <>
                  <div className="rounded-2xl border border-[#18123b]/15 bg-white/65 p-4 text-sm text-[#18123b] whitespace-pre-wrap leading-relaxed">
                    {summary.text}
                  </div>
                  <button
                    onClick={() =>
                      downloadTxt(
                        `${(session.filename || "transcript").replace(/\.[^.]+$/, "")}-resume.txt`,
                        summary.text
                      )
                    }
                    className="text-[11px] font-black text-[#6415f5] hover:underline"
                  >
                    Télécharger le résumé (.txt)
                  </button>
                </>
              )}
            </div>
          )}

          {insightsTab === "stats" && (
            <div className="space-y-4">
              {!stats ? (
                <p className="text-xs text-[#4b4763]">Chargement…</p>
              ) : stats.error ? (
                <p className="text-xs text-red-600">Impossible de charger les statistiques.</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Durée", value: formatTime(stats.duration || 0) },
                      { label: "Mots", value: String(stats.words ?? 0) },
                      { label: "Segments", value: String(stats.segments ?? 0) },
                    ].map((c) => (
                      <div key={c.label} className="rounded-2xl border border-[#18123b]/15 bg-white/65 p-3 text-center">
                        <p className="text-lg font-black text-[#18123b]">{c.value}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#4b4763] mt-0.5">{c.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#4b4763]">Temps de parole</p>
                    {(stats.speakers || []).map((s) => {
                      const maxS = Math.max(...(stats.speakers || []).map((x) => x.seconds || 1), 1);
                      return (
                        <div key={s.name} className="rounded-2xl border border-[#18123b]/15 bg-white/65 p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-[#18123b]">{s.name}</span>
                            <span className="text-xs font-bold text-[#6415f5] tabular-nums">
                              {formatTime(s.seconds)} · {s.words} mots
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#18123b]/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#6415f5]"
                              style={{ width: `${Math.round(((s.seconds || 0) / maxS) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
          </div>
    </div>
  );
}