import { Fragment, memo, useEffect, useRef, useState } from "react";
import { formatTime } from "../utils.js";
import { Check, ChevronDown, ChevronUp, Copy, CornerDownRight, Pencil, Play, Scissors, Trash } from "./Icons.jsx";

// Word-like flowing transcript: a speaker mark (dot + name + start time)
// appears only when the speaker changes; consecutive segments flow as plain
// paragraphs with no boxes, no backgrounds, no hover rectangles. The floating
// hover toolbar carries the segment's own timestamp + play button.
// memo(): placing the caret re-renders ONLY the touched paragraph, never the
// whole transcript — this is what keeps rapid clicking smooth on long files.
function Segment({
  segment,
  speaker,
  showMark = true,
  isActive,
  activeWordKey,
  editingWordKey,
  onSetEditingWordKey,
  onUpdateWord,
  editing,
  editingCaret = null,
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
  onSpeakerColor,
  onSeek,
  speakers,
  currentTime,
}) {
  // ONE paragraph node serves both modes: toggling contentEditable never
  // swaps the DOM, so the text cannot shift a single pixel when the caret
  // is placed for typing.
  const paragraphRef = useRef(null);
  const pendingCaretRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [spkMenu, setSpkMenu] = useState(false);
  const [editingNames, setEditingNames] = useState(false);
  const [nameDrafts, setNameDrafts] = useState({});

  // Rev-style: entering edit mode focuses the paragraph and places the caret
  // exactly where the user clicked (or at the end for the toolbar pencil).
  // The page must NOT move: focus with preventScroll and restore the exact
  // scroll position afterwards, even for words at the very bottom.
  useEffect(() => {
    if (!editing) return;
    const el = paragraphRef.current;
    if (!el) return;
    const sx = window.scrollX;
    const sy = window.scrollY;
    el.focus({ preventScroll: true });
    const target = pendingCaretRef.current != null ? pendingCaretRef.current : editingCaret;
    pendingCaretRef.current = null;
    const len = (el.textContent || "").length;
    const off = target == null ? len : Math.min(Math.max(target, 0), len);
    try {
      // Walk the text nodes so the caret lands at the exact character
      // offset — the paragraph renders words as spans, so el.firstChild is
      // an element, not a text node.
      const sel = window.getSelection();
      const range = document.createRange();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node = null;
      let remaining = off;
      let placed = false;
      while ((node = walker.nextNode())) {
        const tlen = node.textContent.length;
        if (remaining <= tlen) {
          range.setStart(node, Math.min(remaining, tlen));
          placed = true;
          break;
        }
        remaining -= tlen;
      }
      if (!placed) range.selectNodeContents(el);
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

  // Direct typing like a word processor. Enter NEVER moves the text: it just
  // saves what was typed — everything stays exactly in place.
  const commitAndClose = () => {
    const text = (paragraphRef.current?.textContent || "").replace(/\s+$/, "");
    onCommitEdit(segment.id, text);
    onStartEdit(null);
  };

  const onEditKeyDown = (e) => {
    const el = paragraphRef.current;
    if (!el) return;
    if (e.key === "Enter") {
      // Rev-style: the text after the caret goes DOWN as its own paragraph
      // with its own word-accurate timestamp. Caret at the very start gives
      // the paragraph its own brand-new speaker instead.
      e.preventDefault();
      e.stopPropagation();
      const caret = caretOffsetIn(el);
      const text = el.textContent || "";
      onCommitEdit(segment.id, text);
      onStartEdit(null);
      if (caret === 0) {
        onAddSpeakerFor && onAddSpeakerFor(segment.id);
      } else if (caret < text.length && onSplit) {
        onSplit(segment.id, caret);
      }
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

  // Clicking anywhere in the paragraph (a word or the space between words)
  // places the caret there for typing. Playback happens ONLY from the play
  // buttons — never from clicking the text.
  const caretOffsetAtEvent = (e) => {
    try {
      let range = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
        }
      }
      const p = paragraphRef.current;
      if (!range || !p || !p.contains(range.startContainer)) return null;
      const pre = range.cloneRange();
      pre.selectNodeContents(p);
      pre.setEnd(range.startContainer, range.startOffset);
      return pre.toString().length;
    } catch {
      return null;
    }
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

  const commitRename = () => {
    if (renameText.trim() && onRenameSpeaker) {
      onRenameSpeaker(segment.speaker, renameText.trim());
    }
    setRenaming(false);
  };

  const toolBtn =
    "p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500";

  // Time of the spoken word at a character offset — placing the caret moves
  // the playhead to that moment (without playing).
  const timeAtOffset = (off) => {
    let acc = 0;
    for (const w of segment.words || []) {
      if (off > acc && off <= acc + w.word.length + 1) return w.start;
      acc += w.word.length + 1;
    }
    return null;
  };

  return (
    <div
      id={`seg-${segment.id}`}
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
          title="Envoyer (le texte sélectionné) à la fin du paragraphe précédent"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => onMoveDown(segment.id)}
          disabled={!canMoveDown}
          className={toolBtn}
          title="Envoyer (le texte sélectionné) au début du paragraphe suivant"
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
        <div className="flex items-center gap-2.5 mb-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
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
              className="bg-transparent border-0 border-b-2 border-dotted font-medium text-[15px] outline-none max-w-[180px] px-0 py-0"
              style={{ color: speakerColor, borderColor: speakerColor }}
              dir="auto"
            />
          ) : (
            <div className="relative inline-block">
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSpkMenu((o) => !o)}
                  className="font-medium text-[15px] cursor-pointer max-w-[160px] truncate"
                  style={{ color: speakerColor }}
                  title="Cliquez pour changer de locuteur · la pastille de couleur est libre"
                >
                  {currentSpeaker?.name || "—"}
                </button>
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
              </div>
              {spkMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setSpkMenu(false); setEditingNames(false); }} />
                  <div className="absolute left-0 top-full mt-1.5 z-50 w-[264px] rounded-xl bg-white shadow-xl shadow-slate-900/10 border border-slate-200 py-1 overflow-hidden">
                    {speakers.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-[9px] hover:bg-slate-50 transition-colors">
                        <span className="w-4 flex items-center justify-center shrink-0 text-[#18123b]">
                          {segment.speaker === s.id ? <Check className="w-4 h-4" /> : null}
                        </span>
                        {editingNames ? (
                          <input
                            value={nameDrafts[s.id] ?? s.name}
                            onChange={(e) => {
                              setNameDrafts((d) => ({ ...d, [s.id]: e.target.value }));
                              onRenameSpeaker(s.id, e.target.value);
                            }}
                            className="flex-1 min-w-0 text-[17px] bg-transparent outline-none border-b border-dotted border-slate-300"
                            dir="auto"
                          />
                        ) : (
                          <button
                            onClick={() => { onReassign(segment.id, s.id); setSpkMenu(false); }}
                            className="flex-1 min-w-0 text-start text-[17px] text-slate-800 truncate"
                          >
                            {s.name}
                          </button>
                        )}
                        <label
                          className="w-3.5 h-3.5 rounded-full cursor-pointer shrink-0 ring-1 ring-inset ring-black/10"
                          style={{ background: s.color }}
                          title="Choisir la couleur de ce locuteur"
                        >
                          <input
                            type="color"
                            value={s.color || "#6415f5"}
                            onChange={(e) => onSpeakerColor(s.id, e.target.value)}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    ))}
                    <div className="my-1.5 border-t border-slate-200" />
                    <button
                      onClick={() => setEditingNames((o) => !o)}
                      className="w-full text-start px-4 py-[9px] text-[16px] text-slate-800 hover:bg-slate-50 transition"
                    >
                      {editingNames ? "Terminer" : "Modifier les noms des locuteurs"}
                    </button>
                    <button
                      onClick={() => { onAddSpeakerFor(segment.id); setSpkMenu(false); }}
                      className="w-full text-start px-4 py-[9px] text-[16px] text-slate-800 hover:bg-slate-50 transition flex items-center gap-2"
                    >
                      <span className="text-lg leading-none">+</span> Nouveau locuteur
                    </button>
                    {speakers.length > 1 && (
                      <button
                        onClick={() => { onDeleteSpeaker(segment.speaker); setSpkMenu(false); }}
                        className="w-full text-start px-4 py-[9px] text-[16px] text-red-500 hover:bg-red-50 transition"
                      >
                        × Supprimer ce locuteur
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          <button
            onClick={() => onSeek(segment.start)}
            className="inline-flex items-center gap-1.5 text-[#4b4763] hover:text-[#6415f5] transition"
            title="Lire depuis le début de ce paragraphe"
          >
            <span className="w-[18px] h-[18px] rounded-full border border-current flex items-center justify-center">
              <Play className="w-2.5 h-2.5" filled />
            </span>
            <span className="text-[13px] tabular-nums">{formatTime(segment.start)}</span>
          </button>
        </div>
      )}

      {/* ONE node for both modes: contentEditable toggles, the DOM (and the
          layout) never changes — the text cannot shift when typing starts. */}
      <p
        key={`${segment.id}-${editing ? "e" : "v"}`}
        ref={paragraphRef}
        dir="auto"
        contentEditable={editing}
        suppressContentEditableWarning
        spellCheck={false}
        onKeyDown={(e) => {
          if (editing) onEditKeyDown(e);
        }}
        onBlur={() => {
          if (editing) commitAndClose();
        }}
        onClick={(e) => {
          const off = caretOffsetAtEvent(e);
          if (off == null) return;
          e.stopPropagation();
          const t = timeAtOffset(off);
          if (t != null) onPositionAt?.(t);
          if (editing) return; // typing: the native caret is already there
          pendingCaretRef.current = off;
          onStartEdit(segment.id);
        }}
        className="cursor-text text-[16px] leading-[1.75] text-slate-800 select-text focus:outline-none"
      >
        {segment.words && segment.words.length > 0 ? (
          segment.words.map((w, i) => {
            const wKey = `${segment.id}-w${i}`;
            const isHighlighted = activeWordKey === wKey;
            return (
              <Fragment key={wKey}>
                <span
                  className={`rounded px-0.5 -mx-0.5 ${
                    isHighlighted ? "bg-amber-300 text-slate-900" : ""
                  }`}
                >
                  {w.word}
                </span>{" "}
              </Fragment>
            );
          })
        ) : (
          segment.text
        )}
      </p>
    </div>
  );
}

// memo: a caret placement re-renders only the touched paragraph.
export default memo(Segment);
