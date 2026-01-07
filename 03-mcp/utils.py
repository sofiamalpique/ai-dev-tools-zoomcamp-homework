from __future__ import annotations

import re

import requests

JINA_PREFIX = "https://r.jina.ai/"


def normalize_url(url: str) -> str:
    url = url.strip()
    if not url:
        raise ValueError("url is empty")
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return url


def jina_reader_url(url: str) -> str:
    return f"{JINA_PREFIX}{normalize_url(url)}"


def fetch_markdown(url: str, timeout_s: int = 30) -> str:
    response = requests.get(jina_reader_url(url), timeout=timeout_s)
    response.raise_for_status()
    return response.text


def count_word_occurrences(text: str, word: str) -> int:
    if not word:
        raise ValueError("word is empty")
    pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
    return len(pattern.findall(text))
