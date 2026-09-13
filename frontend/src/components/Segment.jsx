import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils.js";
import { Check, Copy, CornerDownRight, Pencil, Play, Scissors, Trash } from "./Icons.jsx";

// Document-style segment: transparent body on the white reading panel, a
// floating hover toolbar (split / copy / merge / delete) and amber word highlight.
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
  onStartEdit,
  onCommitEdit,
  onDelete,
  onSplit,
  onMerge,
  onReassign,
  onSeek,
  currentTime,
}) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
    }
  }, [editing]);

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
