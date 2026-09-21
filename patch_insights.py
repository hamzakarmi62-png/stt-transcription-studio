"""Rewrite _run_translate/_run_summary with char-capped batching + map-reduce.
The helpers (_fmt/_get/_save_settings/_parse_numbered) already exist above
the replaced region and are left untouched."""
p = "backend/app/routers/insights.py"
src = open(p, encoding="utf-8").read()

start_marker = "def _run_translate(session_id: str, language: str) -> None:"
end_marker = "def start_translation(session_id: str, req: TranslateRequest, request: Request = None):"
i1 = src.index(start_marker)
i2 = src.index(end_marker)

new_block = '''# Groq rejects oversized request bodies (413): cap every request's text and
# split oversized batches so long transcripts translate/summarize reliably.
MAX_CHUNK_CHARS = 8000
SUMMARY_CHUNK_CHARS = 12000


def _chunk_texts(texts):
    """Group texts into batches capped by count AND character size."""
    batches = []
    i = 0
    while i < len(texts):
        batch = texts[i:i + BATCH]
        while len(batch) > 1 and sum(len(t) for t in batch) + 10 * len(batch) > MAX_CHUNK_CHARS:
            batch = batch[:-1]
        batches.append(batch)
        i += len(batch)
    return batches


def _run_translate(session_id: str, language: str) -> None:
    try:
        session = _get(session_id)
        segments = session.get("segments") or []
        texts = [str(s.get("text") or "").strip() for s in segments]
        total = len(texts)
        out = []
        done = 0
        for chunk in _chunk_texts(texts):
            numbered = "\\n".join(f"{j + 1}. {t}" for j, t in enumerate(chunk) if t)
            content = groq_llm.chat(
                [
                    {
                        "role": "system",
                        "content": (
                            "You are a professional subtitle translator. Translate every "
                            "numbered line faithfully and naturally into the requested "
                            "language. Reply with ONLY the numbered lines using the SAME "
                            "numbers, no commentary."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Target language: {LANGS.get(language, language)}\\n\\n{numbered}",
                    },
                ],
                temperature=0.15,
            )
            parsed = _parse_numbered(content, len(chunk))
            for j, original in enumerate(chunk):
                seg = segments[done + j]
                out.append(
                    {
                        "start": seg.get("start"),
                        "end": seg.get("end"),
                        "speaker": seg.get("speaker"),
                        "text": parsed.get(j + 1, original),
                    }
                )
            done += len(chunk)
            sm = dict(_get(session_id).get("settings") or {})
            job = dict(sm.get("translate_job") or {})
            job["progress"] = min(done, total)
            sm["translate_job"] = job
            _save_settings(session_id, sm)

        session = _get(session_id)
        sm = dict(session.get("settings") or {})
        tr = dict(sm.get("translations") or {})
        tr[language] = out
        sm["translations"] = tr
        job = dict(sm.get("translate_job") or {})
        job.update({"status": "done", "progress": total})
        sm["translate_job"] = job
        _save_settings(session_id, sm)
    except Exception as exc:
        try:
            sm = dict(_get(session_id).get("settings") or {})
            job = dict(sm.get("translate_job") or {})
            job.update({"status": "error", "error": str(exc)[:300]})
            sm["translate_job"] = job
            _save_settings(session_id, sm)
        except Exception:
            pass


def _summarize_body(body: str, partial: bool) -> str:
    if partial:
        system = (
            "Tu es un analyste professionnel. Résume cette PARTIE de transcription "
            "en français : les points clés (liste à puces « • ») puis les actions à "
            "entreprendre si pertinentes. Sois concis. Réponds en texte brut."
        )
    else:
        system = (
            "Tu es un analyste professionnel. Résume cette transcription "
            "en français : 6 à 10 points clés (liste à puces « • »), puis une "
            "section « Actions » avec les actions à entreprendre si pertinentes. "
            "Réponds en texte brut, sans titres markdown."
        )
    return groq_llm.chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": body},
        ],
        temperature=0.3,
        max_tokens=2048,
    )


def _run_summary(session_id: str) -> None:
    try:
        session = _get(session_id)
        speakers = {s.get("id"): s.get("name") for s in (session.get("speakers") or [])}
        lines = []
        for s in session.get("segments") or []:
            who = speakers.get(s.get("speaker"), "?")
            lines.append(f"[{_fmt(s.get('start'))}] {who}: {s.get('text')}")

        # Long transcripts: map-reduce. Summarize each chunk, then a final
        # pass over the partial summaries. Groq rejects oversized bodies.
        chunks = []
        cur, cur_len = [], 0
        for line in lines:
            cur.append(line)
            cur_len += len(line) + 1
            if cur_len >= SUMMARY_CHUNK_CHARS:
                chunks.append("\\n".join(cur))
                cur, cur_len = [], 0
        if cur:
            chunks.append("\\n".join(cur))

        if len(chunks) <= 1:
            content = _summarize_body("\\n".join(lines), partial=False).strip()
        else:
            partials = []
            for idx, ch in enumerate(chunks):
                partials.append(
                    "\\u2014 Partie " + str(idx + 1) + "/" + str(len(chunks)) + " \\u2014\\n"
                    + _summarize_body(ch, partial=True).strip()
                )
                sm = dict(_get(session_id).get("settings") or {})
                job = dict(sm.get("summary_job") or {})
                job["progress"] = str(idx + 1) + "/" + str(len(chunks))
                sm["summary_job"] = job
                _save_settings(session_id, sm)
            combined = "\\n\\n".join(partials)
            try:
                content = _summarize_body(
                    "Voici les résumés partiels d'une longue transcription. "
                    "Fusionne-les en UN résumé global cohérent (points clés puis "
                    "Actions), sans répéter les parties.\\n\\n" + combined,
                    partial=False,
                ).strip()
            except Exception:
                content = combined

        sm = dict(_get(session_id).get("settings") or {})
        sm["summary"] = {"language": "fr", "text": content}
        job = dict(sm.get("summary_job") or {})
        job.update({"status": "done"})
        sm["summary_job"] = job
        _save_settings(session_id, sm)
    except Exception as exc:
        try:
            sm = dict(_get(session_id).get("settings") or {})
            job = dict(sm.get("summary_job") or {})
            job.update({"status": "error", "error": str(exc)[:300]})
            sm["summary_job"] = job
            _save_settings(session_id, sm)
        except Exception:
            pass


'''

src = src[:i1] + new_block + "\n" + src[i2:]
open(p, "w", encoding="utf-8", newline="").write(src)
print("rewritten OK")
