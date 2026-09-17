"""Groq LLM helper for post-transcription features (translation, summary).

Strictly additive: runs AFTER a transcript already exists. Never part of
the transcription pipeline itself.
"""

import requests

from ..config import settings

CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"
FALLBACK_MODEL = "openai/gpt-oss-20b"


def available() -> bool:
    return bool(settings.groq_api_key)


def chat(messages, temperature: float = 0.2, max_tokens: int = 4096, timeout: int = 110) -> str:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set")
    payload = {
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    for model in (MODEL, FALLBACK_MODEL):
        response = requests.post(
            CHAT_URL,
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            json={"model": model, **payload},
            timeout=timeout,
        )
        if response.status_code < 400:
            return response.json()["choices"][0]["message"]["content"]
        # Model unavailable (404/410) → try the fallback before failing.
        if response.status_code not in (404, 410):
            response.raise_for_status()
    response.raise_for_status()
    return ""
