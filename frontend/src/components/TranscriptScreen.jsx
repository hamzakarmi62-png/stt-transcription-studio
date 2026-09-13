import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api.js";
import { formatTime, nextColor, uid } from "../utils.js";
import Segment from "./Segment.jsx";
import ExportMenu from "./ExportMenu.jsx";
import PlayerPanel from "./PlayerPanel.jsx";
import UserMenu from "./UserMenu.jsx";
import { ArrowLeft, Play, LayoutGrid, AlignLeft, MessageSquarePlus, Scissors, Highlighter, CornerUpLeft, CornerUpRight, Search, X, RotateCcw, RotateCw, Pause, Pencil } from "./Icons.jsx";

const VIDEO_EXTS = ["mp4", "webm", "mov", "m4v", "mkv", "avi"];

export default function TranscriptScreen({ initialSession, onBack, user, onLogout }) {
  const [session, setSession] = useState(initialSession || {});
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeWordKey, setActiveWordKey] = useState(null);
  const [editingWordKey, setEditingWordKey] = useState(null);

  const updateWordText = (segId, wordIdx, newWordText) => {
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
  };
  const [saveState, setSaveState] = useState("saved");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [playerMode, setPlayerMode] = useState("docked");
  const [viewMode, setViewMode] = useState("stream"); // stream | cards
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

  const mutate = useCallback((transform) => {
    setSession((prev) => {
      const next = transform(prev);
      setHistory((h) => {
        const sliced = h.slice(0, historyIndex + 1);
        return [...sliced, next];
      });
      setHistoryIndex((idx) => idx + 1);
      return next;
    });
    scheduleSave();
  }, [historyIndex, scheduleSave]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setSession(history[newIdx]);
      scheduleSave();
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setSession(history[newIdx]);
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

  const groupedTurns = useMemo(() => {
    const turns = [];
    let currentTurn = null;
    filteredSegments.forEach((seg, i) => {
      const spk = seg.speaker;
      if (!currentTurn || currentTurn.speaker !== spk) {
        if (currentTurn) turns.push(currentTurn);
        currentTurn = {
          id: `turn-${seg.id}`,
          speaker: spk,
          start: seg.start,
          end: seg.end,
          segments: [{ seg, index: i }],
        };
      } else {
        currentTurn.segments.push({ seg, index: i });
        currentTurn.end = seg.end;
      }
    });
    if (currentTurn) turns.push(currentTurn);
    return turns;
  }, [filteredSegments]);

  useEffect(() => {
    if (!playing || !activeSegment) return;
    const el = document.getElementById(`seg-${activeSegment.id}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeSegment, playing]);

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

  const seekTo = (t) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = t;
      audio.play().catch(() => {});
    }
  };

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

  const updateSegmentText = (id, text) =>
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
    }));

  const deleteSegment = (id) =>
    mutate((prev) => ({ ...prev, segments: prev.segments.filter((s) => s.id !== id) }));

  const splitSegment = (id, caret) => {
    if (!caret || caret <= 0) return;
    mutate((prev) => {
      const seg = prev.segments.find((s) => s.id === id);
      if (!seg || caret <= 0 || caret >= seg.text.length) return prev;
      const before = seg.text.slice(0, caret);
      const after = seg.text.slice(caret);
      if (!before.trim() || !after.trim()) return prev;
      const ratio = before.length / Math.max(seg.text.length, 1);
      const mid = (seg.start + (seg.end - seg.start) * ratio).toFixed(3);
      const leftWords = (seg.words || []).filter((w) => w.start < Number(mid));
      const rightWords = (seg.words || []).filter((w) => w.start >= Number(mid));
      const right = {
        id: uid(),
        start: Number(mid),
        end: seg.end,
        text: after.trim(),
        speaker: seg.speaker,
        words: rightWords,
      };
      const idx = prev.segments.findIndex((s) => s.id === id);
      const next = [...prev.segments];
      next[idx] = { ...seg, text: before.trim(), end: Number(mid), words: leftWords };
      next.splice(idx + 1, 0, right);
      return { ...prev, segments: next };
    });
  };

  const splitSegmentAtWord = (segId, wordIdx) => {
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
  };

  const mergeWithNext = (id) =>
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
    });

  const mergeWithPrev = (id) =>
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
    });

  const reassign = (id, speakerId) =>
    mutate((prev) => ({
      ...prev,
      segments: prev.segments.map((s) => (s.id === id ? { ...s, speaker: speakerId } : s)),
    }));

  // Reorder paragraphs; each keeps its own timing and words.
  const moveSegmentUp = (id) =>
    mutate((prev) => {
      const idx = prev.segments.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const next = [...prev.segments];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { ...prev, segments: next };
    });

  const moveSegmentDown = (id) =>
    mutate((prev) => {
      const idx = prev.segments.findIndex((s) => s.id === id);
      if (idx === -1 || idx >= prev.segments.length - 1) return prev;
      const next = [...prev.segments];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return { ...prev, segments: next };
    });

  const deleteSpeaker = (speakerId) =>
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
    });

  const renameSpeaker = (id, name) =>
    mutate((prev) => ({
      ...prev,
      speakers: prev.speakers.map((s) => (s.id === id ? { ...s, name } : s)),
    }));

  const addSpeaker = () =>
    mutate((prev) => ({
      ...prev,
      speakers: [
        ...prev.speakers,
        { id: uid(), name: `Speaker ${prev.speakers.length + 1}`, color: nextColor(prev.speakers.length) },
      ],
    }));

  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Auto-saved";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.13] blur-[130px]"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-fuchsia-600/[0.09] blur-[130px]"></div>
        <div className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] rounded-full bg-violet-600/[0.08] blur-[130px]"></div>
      </div>
      <div className="relative">
      <header className="bg-slate-950/80 backdrop-blur-2xl border-b border-white/[0.06] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> New
          </button>
          <div className="min-w-0">
            <h1 className="font-semibold truncate text-sm sm:text-base">{session.filename}</h1>
            <p className="text-xs text-slate-400">
              {session.language || "auto"} · {segments.length} segments
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {playerMode === "hidden" && (
              <button
                onClick={() => setPlayerMode("docked")}
                className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition inline-flex items-center gap-1.5"
                title="Show player"
              >
                <Play className="w-3.5 h-3.5" filled /> Show player
              </button>
            )}
            <span className={`text-xs ${saveState === "error" ? "text-red-500" : "text-slate-400"}`}>
              {saveLabel}
            </span>
            <button
              onClick={manualSave}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition"
            >
              Save
            </button>
            <div className="flex items-center bg-white/[0.06] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${viewMode === "cards" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                title="Cartes séparées"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Cards
              </button>
              <button
                onClick={() => setViewMode("stream")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${viewMode === "stream" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                title="Texte continu fluide"
              >
                <AlignLeft className="w-3.5 h-3.5" /> Stream
              </button>
            </div>
            <ExportMenu sessionId={session.id} filename={session.filename} />
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </header>

      {/* Rich Toolbar matching user's reference image */}
      <div className="sticky top-[61px] z-20 bg-slate-950/70 backdrop-blur-xl pt-2 pb-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-3xl px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* 1. Replay 15s */}
              <button
                onClick={() => skipTime(-15)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 flex items-center gap-0.5 text-xs font-medium transition-colors"
                title="Reculer de 15 s"
              >
                <RotateCcw className="w-4 h-4" /><span className="text-[10px]">15</span>
              </button>

              {/* 2. Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl hover:bg-white/10 text-white text-lg transition-colors"
                title={playing ? "Pause" : "Lecture"}
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" filled />}
              </button>

              {/* 3. Forward 30s */}
              <button
                onClick={() => skipTime(30)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 flex items-center gap-0.5 text-xs font-medium transition-colors"
                title="Avancer de 30 s"
              >
                <span className="text-[10px]">30</span><RotateCw className="w-4 h-4" />
              </button>

              <div className="h-5 w-[1px] bg-white/10 mx-1"></div>

              {/* 4. Speed 1X */}
              <select
                value={playbackSpeed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                title="Vitesse de lecture"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1X</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2X</option>
              </select>

              <div className="h-5 w-[1px] bg-white/10 mx-1"></div>

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
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 transition-colors"
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
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
                title="Couper / diviser le segment"
              >
                <Scissors className="w-4 h-4" />
              </button>

              {/* 7. Highlight tool */}
              <button
                onClick={() => {
                  if (activeSegment) setEditingId(activeSegment.id);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 border-b-2 border-fuchsia-400 transition-colors"
                title="Outil de sélection, d'édition et de surlignage"
              >
                <Highlighter className="w-4 h-4" />
              </button>

              <div className="h-5 w-[1px] bg-white/10 mx-1"></div>

              {/* 8. Undo */}
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
                title="Annuler (Undo)"
              >
                <CornerUpLeft className="w-4 h-4" />
              </button>

              {/* 9. Redo */}
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
                title="Rétablir (Redo)"
              >
                <CornerUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-5 w-[1px] bg-white/10 mx-1"></div>

              {/* 10. Download / Export */}
              <ExportMenu sessionId={session.id} filename={session.filename} />

              {/* 11. Saved status */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${saveState === "error" ? "bg-red-500/10 text-red-400 border-red-500/30" : saveState === "saving" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}>
                {saveState === "saving" ? "Saving…" : saveState === "error" ? "Error" : "Saved"}
              </span>

              <div className="h-5 w-[1px] bg-white/10 mx-1"></div>

              {/* 12. Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 transition-colors"
                title="Rechercher dans le texte"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar expandable */}
          {showSearch && (
            <div className="mt-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher dans le texte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-slate-100"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-xs text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div
          className={`grid gap-6 ${playerMode === "docked" ? "lg:grid-cols-[440px_1fr]" : "grid-cols-1"}`}
        >
          <aside className="h-fit space-y-4 lg:sticky lg:top-[72px]">
            <PlayerPanel
              src={api.audioUrl(session.id)}
              kind={mediaKind}
              filename={session.filename}
              mode={playerMode}
              onMode={setPlayerMode}
              mediaRef={audioRef}
            />
            <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Speakers
              </span>
              {speakers.map((s) =>
                renamingId === s.id ? (
                  <input
                    key={s.id}
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => {
                      if (renameValue.trim()) renameSpeaker(s.id, renameValue.trim());
                      setRenamingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="text-sm px-2 py-1 rounded-full border-2 focus:outline-none"
                    style={{ borderColor: s.color }}
                  />
                ) : (
                  <span
                    key={s.id}
                    className="inline-flex items-center rounded-full"
                    style={{ backgroundColor: s.color }}
                  >
                    <button
                      onClick={() => {
                        setRenamingId(s.id);
                        setRenameValue(s.name);
                      }}
                      className="ps-3 pe-1.5 py-1.5 text-sm font-medium text-white"
                      title="Cliquez pour renommer"
                    >
                      {s.name}
                    </button>
                    {speakers.length > 1 && (
                      <button
                        onClick={() => deleteSpeaker(s.id)}
                        className="pe-2.5 py-2 text-white/70 hover:text-white transition"
                        title="Supprimer ce locuteur — ses paragraphes passent au premier locuteur restant"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                )
              )}
              <button
                onClick={addSpeaker}
                className="px-3 py-1.5 rounded-full text-sm border border-dashed border-white/20 text-slate-300 hover:bg-white/10"
                title="Add a new speaker"
              >
                + Add speaker
              </button>
            </div>
          </aside>

          <section>
            {segments.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-10 text-center text-slate-400">
                No transcript available for this session yet.
              </div>
            ) : viewMode === "stream" ? (
              <div className="space-y-6 pb-10 max-w-4xl mx-auto">
                <div className="pb-2 mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2"><AlignLeft className="w-4 h-4 text-slate-400" /> Continuous Stream Reading View</h3>
                  <span className="text-xs text-slate-400">{segments.length} segments · cliquez sur un mot pour le corriger en direct</span>
                </div>
                <div className="text-[17px] leading-relaxed space-y-6" dir="auto">
                  {groupedTurns.map((turn) => {
                    const speaker = speakerById[turn.speaker];
                    const startColor = speaker?.color || "#94a3b8";
                    return (
                      <div key={turn.id} className="space-y-2">
                        <div className="inline-flex items-center gap-2.5 mt-4 mb-1">
                          <span
                            className="font-bold text-[15px] border-b-2 border-dotted pb-0.5"
                            style={{ color: startColor, borderColor: startColor }}
                          >
                            {speaker?.name || "Unassigned"}
                          </span>
                          <span className="h-4 w-px bg-white/10"></span>
                          <button
                            onClick={() => seekTo(turn.start)}
                            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition"
                            title="Aller au début du passage"
                          >
                            <Play className="w-3.5 h-3.5" filled />
                            <span className="text-[13px] font-bold tabular-nums">
                              {formatTime(turn.start)}
                            </span>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {turn.segments.map(({ seg }) => {
                            const isEditing = editingId === seg.id;
                            return (
                              <div key={seg.id} className="relative group py-1">
                                {isEditing ? (
                                  <textarea
                                    value={seg.text}
                                    onChange={(e) => updateSegmentText(seg.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const caret = e.target.selectionStart;
                                        splitSegment(seg.id, caret);
                                      } else if (e.key === "Backspace" && e.target.selectionStart === 0) {
                                        e.preventDefault();
                                        mergeWithPrev(seg.id);
                                      }
                                    }}
                                    onBlur={() => setEditingId(null)}
                                    rows={Math.max(1, Math.ceil(seg.text.length / 85))}
                                    className="w-full bg-transparent border-0 p-0 text-[17px] leading-relaxed resize-none focus:outline-none focus:ring-0 text-slate-100"
                                    dir="auto"
                                    autoFocus
                                  />
                                ) : (
                                  <p
                                    dir="auto"
                                    className="text-[17px] leading-relaxed select-text cursor-text hover:bg-white/[0.05] rounded px-1 transition-colors"
                                    onClick={() => setEditingId(seg.id)}
                                    title="Cliquez pour corriger en direct"
                                  >
                                    {seg.words && seg.words.length > 0 ? (
                                      seg.words.map((w, i) => {
                                        const wKey = `${seg.id}-w${i}`;
                                        const isHighlighted = activeWordKey === wKey;
                                        return (
                                          <span
                                            key={i}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              seekTo(w.start);
                                            }}
                                            className={`cursor-pointer hover:bg-blue-100 rounded px-0.5 transition-colors inline-block ${
                                              isHighlighted
                                                ? "bg-amber-300 text-slate-900 font-semibold"
                                                : ""
                                            }`}
                                            title={`Aller à la seconde ${w.start.toFixed(1)}`}
                                          >
                                            {w.word}{" "}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span>{seg.text}</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="pb-10">
                <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl shadow-black/50 p-6 sm:p-10 space-y-9">
                  {groupedTurns.map((turn) => {
                    const speaker = speakerById[turn.speaker];
                    const startColor = speaker?.color || "#475569";
                    return (
                      <div key={turn.id}>
                        <div
                          className="flex items-center gap-3 mb-1.5 flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label
                            className="inline-flex items-center gap-1.5 cursor-pointer border-b-2 border-dotted pb-0.5"
                            style={{ borderColor: startColor }}
                            title="Changer de locuteur"
                          >
                            <select
                              value={turn.segments[0]?.seg.speaker || ""}
                              onChange={(e) =>
                                turn.segments.forEach(({ seg }) => reassign(seg.id, e.target.value))
                              }
                              className="appearance-none bg-transparent font-bold text-[15px] outline-none cursor-pointer"
                              style={{ color: startColor }}
                            >
                              {speakers.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <Pencil className="w-3.5 h-3.5 opacity-70" style={{ color: startColor }} />
                          </label>
                          <span className="h-5 w-px bg-slate-200"></span>
                          <button
                            onClick={() => seekTo(turn.start)}
                            className="inline-flex items-center gap-2 text-slate-800 hover:text-indigo-600 transition"
                            title="Lire depuis le début du passage"
                          >
                            <Play className="w-[18px] h-[18px] text-slate-700" filled />
                            <span className="font-bold tabular-nums text-[15px]">
                              {formatTime(turn.start)}
                            </span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {turn.segments.map(({ seg, index }) => (
                            <Segment
                              key={seg.id}
                              segment={seg}
                              speaker={speaker}
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
                              speakers={speakers}
                              onStartEdit={(id) => setEditingId(id)}
                              onCommitEdit={updateSegmentText}
                              onDelete={(id) => {
                                if (editingId === id) setEditingId(null);
                                deleteSegment(id);
                              }}
                              onSplit={splitSegment}
                              onMerge={mergeWithNext}
                              onReassign={reassign}
                              onSeek={seekTo}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
          </div>
    </div>
  );
}