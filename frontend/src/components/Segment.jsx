import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils.js";
import { Check, ChevronDown, ChevronUp, Copy, CornerDownRight, Pencil, Play, Scissors, Trash } from "./Icons.jsx";

// Word-like flowing transcript: a speaker mark (dot + name + start time)
// appears only when the speaker changes; consecutive segments flow as plain
// paragraphs with no boxes, no backgrounds, no hover rectangles. The floating
// hover toolbar carries the segment's own timestamp + play button.
export default function Segment({
  segment,
  speaker,
  showMark = true,
  isActive,
  activeWordKey,
  editingWordKey,
  onSetEditingWordKey,
  onUpdateWord,
  editing,
  canMerge,
  canMoveUp = true,
  canMoveDown = true,
  onMoveUp,
  onMoveDown,
  onAddSpeakerFor,
  onRenameSpeaker,
  onDeleteSpeaker,
  onStartEdit,
  onCommitEdit,
  onDelete,
  onSplit,
  onMerge,
  onMergePrev,
  onPositionAt,
  onReassign,
  onSeek,
  speakers,
  currentTime,
}) {
  const textRef = useRef(null);
  const paragraphRef = useRef(null);
  const pendingCaretRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState("");

  // Rev-style: entering edit mode focuses the paragraph and places the caret
  // exactly where the user clicked (or at the end for the toolbar pencil).
  // The page must NOT move: focus with preventScroll and restore the exact
  // scroll position afterwards, even for words at the very bottom.
  useEffect(() => {
    if (!editing) return;
    const el = textRef.current;
    if (!el) return;
    const sx = window.scrollX;
    const sy = window.scrollY;
    el.focus({ preventScroll: true });
    const target = pendingCaretRef.current;
    pendingCaretRef.current = null;
    const len = (el.textContent || "").length;
    const off = target == null ? len : Math.min(Math.max(target, 0), len);
    try {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.setStart(el.firstChild || el, off);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {
      /* caret placement is best-effort */
    }
    window.scrollTo(sx, sy);
  }, [editing]);

  const currentSpeaker = speakers.find((s) => s.id === segment.speaker);
  const speakerColor = currentSpeaker?.color || "#64748b";

  const caretOffsetIn = (el) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return -1;
    const r = sel.getRangeAt(0);
    const pre = r.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(r.startContainer, r.startOffset);
    return pre.toString().length;
  };

  // Direct typing like a word processor: save the typed text, then let
  // Enter split at the caret / Backspace at position 0 merge with the previous.
  const commitAndClose = () => {
    const text = textRef.current?.textContent || "";
    onCommitEdit(segment.id, text);
    onStartEdit(null);
  };

  const onEditKeyDown = (e) => {
    const el = textRef.current;
    if (!el) return;
    const len = (el.textContent || "").length;
    if (e.key === "Enter") {
      // The user's rule: Enter ALWAYS moves the paragraph down — even while
      // correcting text. Save what was typed, leave edit mode, move.
      e.preventDefault();
      e.stopPropagation();
      const id = segment.id;
      onCommitEdit(segment.id, el.textContent || "");
      onStartEdit(null);
      onMoveDown && onMoveDown(id);
    } else if (e.key === "Backspace") {
      const sel = window.getSelection();
      if (caretOffsetIn(el) === 0 && sel && sel.isCollapsed) {
        e.preventDefault();
        e.stopPropagation();
        onCommitEdit(segment.id, el.textContent || "");
        onStartEdit(null);
        onMergePrev && onMergePrev(segment.id);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      commitAndClose();
    }
  };

  // Click a word: playhead moves to that exact moment WITHOUT playing
  // (playback starts only from a play button), and the caret lands right
  // after the word ready to type the correction.
  const editAtWord = (i, wordStart) => {
    (onPositionAt || onSeek)?.(wordStart);
    pendingCaretRef.current = segment.words
      .slice(0, i + 1)
      .reduce((n, w) => n + w.word.length + 1, 0);
    onStartEdit(segment.id);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(segment.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Character offset of the current mouse selection inside the paragraph, so
  // the scissors splits exactly where the user highlighted (Rev-style).
  const getSelectionCaret = () => {
    try {
      const sel = window.getSelection();
      const p = paragraphRef.current;
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !p) return -1;
      const range = sel.getRangeAt(0);
      if (!p.contains(range.endContainer)) return -1;
      const pre = range.cloneRange();
      pre.selectNodeContents(p);
      pre.setEnd(range.endContainer, range.endOffset);
      return pre.toString().length;
    } catch {
      return -1;
    }
  };

  const doSplit = () => {
    const mid = Math.max(1, Math.floor(segment.text.length / 2));
    const fromSelection = getSelectionCaret();
    const caret = fromSelection > 0 ? fromSelection : mid;
    onSplit(segment.id, caret);
  };

  const handleSpeakerChange = (e) => {
    if (e.target.value === "__new__") {
      onAddSpeakerFor && onAddSpeakerFor(segment.id);
    } else if (e.target.value === "__delete__") {
      onDeleteSpeaker && onDeleteSpeaker(segment.speaker);
    } else {
      onReassign(segment.id, e.target.value);
    }
  };

  const commitRename = () => {
    if (renameText.trim() && onRenameSpeaker) {
      onRenameSpeaker(segment.speaker, renameText.trim());
    }
    setRenaming(false);
  };

  const toolBtn =
    "p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500";

  return (
    <div
      id={`seg-${segment.id}`}
      onClick={(e) => {
        if (e.target.tagName !== "BUTTON" && e.target.tagName !== "SELECT" && !editing) {
          (onPositionAt || onSeek)?.(segment.start);
        }
      }}
      className="group relative py-2"
    >
      {/* Floating toolbar — visible on hover, always on active/editing.
          It floats; it never frames the paragraph itself. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute -top-3 end-2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 px-1 py-0.5 z-10 transition-opacity ${
          isActive || editing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          onClick={() => onSeek(segment.start)}
          className="inline-flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition tabular-nums"
          title="Lire depuis le début du paragraphe"
        >
          <Play className="w-3.5 h-3.5" filled />
          <span className="text-[11px] font-bold">{formatTime(segment.start)}</span>
        </button>
        <span className="h-4 w-px bg-slate-200 mx-0.5"></span>
        <button
          onClick={() => onMoveUp(segment.id)}
          disabled={!canMoveUp}
          className={toolBtn}
          title="Monter le paragraphe (il garde son temps)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => onMoveDown(segment.id)}
          disabled={!canMoveDown}
          className={toolBtn}
          title="Descendre le paragraphe (il garde son temps)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <span className="h-4 w-px bg-slate-200 mx-0.5"></span>
        <button onClick={doSplit} className={toolBtn} title="Couper à la sélection / au curseur">
          <Scissors className="w-4 h-4" />
        </button>
        <button onClick={copyText} className={toolBtn} title="Copier le texte">
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <button onClick={() => onMerge(segment.id)} disabled={!canMerge} className={toolBtn} title="Fusionner avec le suivant">
          <CornerDownRight className="w-4 h-4" />
        </button>
        {!editing ? (
          <button onClick={() => onStartEdit(segment.id)} className={toolBtn} title="Modifier le texte">
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => onStartEdit(null)} className={toolBtn} title="Terminer la modification">
            <Check className="w-4 h-4 text-emerald-500" />
          </button>
        )}
        <button
          onClick={() => onDelete(segment.id)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          title="Supprimer le segment"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>

      {/* Speaker mark — only when the speaker changes (Word-like flow) */}
      {showMark && (
        <div className="flex items-center gap-2 mb-0.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: speakerColor }}></span>
          {renaming ? (
            <input
              autoFocus
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="bg-transparent border-0 border-b-2 border-dotted font-bold text-[15px] outline-none max-w-[180px] px-0 py-0"
              style={{ color: speakerColor, borderColor: speakerColor }}
              dir="auto"
            />
          ) : (
            <label
              className="inline-flex items-center gap-1 cursor-pointer"
              title="Cliquez sur le nom pour changer · le crayon pour renommer"
            >
              <select
                value={segment.speaker || ""}
                onChange={handleSpeakerChange}
                className="appearance-none bg-transparent font-bold text-[15px] outline-none cursor-pointer max-w-[160px] truncate"
                style={{ color: speakerColor }}
              >
                {speakers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="__new__">+ Nouveau locuteur</option>
                {speakers.length > 1 && <option value="__delete__">× Supprimer ce locuteur</option>}
              </select>
              <button
                onClick={() => {
                  setRenameText(currentSpeaker?.name || "");
                  setRenaming(true);
                }}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition"
                style={{ color: speakerColor }}
                title="Renommer ce locuteur"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </label>
          )}
          <span className="text-[12px] text-slate-400 tabular-nums opacity-70">
            {formatTime(segment.start)}
          </span>
        </div>
      )}

      {editing ? (
        <p
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          onClick={(e) => e.stopPropagation()}
          onKeyDown={onEditKeyDown}
          onBlur={commitAndClose}
          dir="auto"
          className="text-[19px] leading-[2] text-slate-800 select-text focus:outline-none"
        >
          {segment.text}
        </p>
      ) : (
        <p ref={paragraphRef} dir="auto" className="text-[19px] leading-[2] text-slate-800 select-text">
          {segment.words && segment.words.length > 0 ? (
            segment.words.map((w, i) => {
              const wKey = `${segment.id}-w${i}`;
              const isHighlighted = activeWordKey === wKey;
              return (
                <span
                  key={wKey}
                  onClick={(e) => {
                    e.stopPropagation();
                    editAtWord(i, w.start);
                  }}
                  className={`cursor-text rounded px-0.5 transition-colors ${
                    isHighlighted
                      ? "bg-amber-300 text-slate-900 font-semibold"
                      : "hover:bg-indigo-100"
                  }`}
                  title="Cliquez : l'audio saute ici et vous corrigez directement"
                >
                  {w.word}{" "}
                </span>
              );
            })
          ) : (
            segment.text
          )}
        </p>
      )}
    </div>
  );
}
