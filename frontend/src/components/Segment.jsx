import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils.js";
import { Check, ChevronDown, ChevronUp, Copy, CornerDownRight, Pencil, Play, Scissors, Trash, User } from "./Icons.jsx";

// Document-style segment: transparent body on the white reading panel, a
// floating hover toolbar (move / split / copy / merge / edit / delete /
// per-paragraph speaker) and amber word highlight.
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
  showOwnTime = false,
  onAddSpeakerFor,
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
  const [copied, setCopied] = useState(false);

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

  const doSplit = () => {
    const mid = Math.max(1, Math.floor(segment.text.length / 2));
    const caret = editing ? (textareaRef.current?.selectionStart ?? mid) : mid;
    onSplit(segment.id, caret);
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
        isActive ? "bg-indigo-50 ring-1 ring-indigo-100" : "hover:bg-slate-50"
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
        <button onClick={doSplit} className={toolBtn} title="Couper / diviser le segment">
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
        <span className="h-4 w-px bg-slate-200 mx-0.5"></span>
        <span className="inline-flex items-center gap-1 ps-1 pe-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={segment.speaker || ""}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                onAddSpeakerFor && onAddSpeakerFor(segment.id);
              } else {
                onReassign(segment.id, e.target.value);
              }
            }}
            className="appearance-none bg-transparent text-[11px] font-bold outline-none cursor-pointer max-w-[96px] truncate"
            style={{ color: speakerColor }}
            title="Locuteur de ce paragraphe"
          >
            {speakers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value="__new__">+ Nouveau locuteur</option>
          </select>
        </span>
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
            className="w-full rounded-xl bg-white border border-indigo-300 px-3 py-2 text-[17px] leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 resize-none"
            dir="auto"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Édition — ⏎ Entrée divise le paragraphe, ⌫ Retour arrière supprime le segment.
          </p>
        </div>
      ) : (
        <p dir="auto" className="text-[17px] leading-[1.9] text-slate-800 select-text">
          {showOwnTime && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSeek(segment.start);
              }}
              className="inline-flex items-center gap-1 me-2 align-middle text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5 hover:bg-indigo-100 transition"
              title={`Lire depuis ce paragraphe (${formatTime(segment.start)}) — le paragraphe garde toujours son propre temps`}
            >
              <Play className="w-3 h-3" filled />
              {formatTime(segment.start)}
            </button>
          )}
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
                    onSeek(w.start);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onSetEditingWordKey(wKey);
                  }}
                  className={`cursor-pointer rounded px-0.5 transition-colors ${
                    isHighlighted
                      ? "bg-amber-300 text-slate-900 font-semibold"
                      : "hover:bg-indigo-100"
                  }`}
                  title="Cliquez pour lire depuis ce mot · double-cliquez pour corriger"
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
