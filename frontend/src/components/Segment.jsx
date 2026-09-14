import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils.js";
import { Check, ChevronDown, ChevronUp, Copy, CornerDownRight, Pencil, Play, Scissors, Trash } from "./Icons.jsx";

// Rev-style paragraph: every segment carries its own header — speaker name
// (dotted underline, click to change) + play button + its own timestamp —
// followed by the text, with a floating hover toolbar.
export default function Segment({
  segment,
  speaker,
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
  onReassign,
  onSeek,
  speakers,
  currentTime,
}) {
  const textareaRef = useRef(null);
  const paragraphRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState("");

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
    }
  }, [editing]);

  const currentSpeaker = speakers.find((s) => s.id === segment.speaker);
  const speakerColor = currentSpeaker?.color || "#64748b";

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
    const caret = editing
      ? (textareaRef.current?.selectionStart ?? mid)
      : fromSelection > 0
      ? fromSelection
      : mid;
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
          onSeek(segment.start);
        }
      }}
      className={`group relative rounded-2xl -mx-3 px-3 py-2 transition-all ${
        isActive ? "bg-indigo-50" : "hover:bg-slate-50"
      }`}
    >
      {/* Floating toolbar — visible on hover, always on active/editing */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute -top-3 end-2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 px-1 py-0.5 z-10 transition-opacity ${
          isActive || editing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
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

      {/* Per-paragraph header: speaker (click name or pencil) + play + own time */}
      <div className="flex items-center gap-3 mb-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
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
            className="inline-flex items-center gap-1.5 cursor-pointer border-b-2 border-dotted pb-0.5"
            style={{ borderColor: speakerColor }}
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
              className="opacity-70 hover:opacity-100 transition"
              style={{ color: speakerColor }}
              title="Renommer ce locuteur"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </label>
        )}
        <span className="h-5 w-px bg-slate-200"></span>
        <button
          onClick={() => onSeek(segment.start)}
          className="inline-flex items-center gap-2 text-slate-800 hover:text-indigo-600 transition"
          title="Lire depuis le début du paragraphe"
        >
          <Play className="w-[18px] h-[18px] text-slate-700" filled />
          <span className="font-bold tabular-nums text-[15px]">{formatTime(segment.start)}</span>
        </button>
      </div>

      {editing ? (
        <div onClick={(e) => e.stopPropagation()}>
          <textarea
            ref={textareaRef}
            value={segment.text}
            onChange={(e) => onCommitEdit(segment.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const caret = textareaRef.current?.selectionStart ?? -1;
                onSplit(segment.id, caret);
              } else if (e.key === "Backspace" && !segment.text.trim()) {
                e.preventDefault();
                onDelete(segment.id);
              }
            }}
            rows={Math.max(2, Math.ceil(segment.text.length / 80))}
            className="w-full bg-indigo-50/60 border-0 rounded-lg px-2 py-1 text-[17px] leading-[1.9] text-slate-800 focus:outline-none resize-none"
            dir="auto"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Édition — ⏎ Entrée divise le paragraphe, ⌫ Retour arrière supprime le segment.
          </p>
        </div>
      ) : (
        <p ref={paragraphRef} dir="auto" className="text-[17px] leading-[1.9] text-slate-800 select-text">
          {segment.words && segment.words.length > 0 ? (
            segment.words.map((w, i) => {
              const wKey = `${segment.id}-w${i}`;
              const isEditingWord = editingWordKey === wKey;
              const isHighlighted = activeWordKey === wKey;
              if (isEditingWord) {
                return (
                  <input
                    key={wKey}
                    autoFocus
                    value={w.word}
                    onChange={(e) => onUpdateWord(segment.id, i, e.target.value)}
                    onBlur={() => onSetEditingWordKey(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="w-24 bg-transparent border-b-2 border-indigo-400 px-1 text-[15px] text-slate-800 focus:outline-none inline-block mx-0.5"
                  />
                );
              }
              return (
                <span
                  key={wKey}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetEditingWordKey(wKey);
                  }}
                  className={`cursor-pointer rounded px-0.5 transition-colors ${
                    isHighlighted
                      ? "bg-amber-300 text-slate-900 font-semibold"
                      : "hover:bg-indigo-100"
                  }`}
                  title="Cliquez pour corriger ce mot"
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
