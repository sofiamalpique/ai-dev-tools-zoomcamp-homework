from __future__ import annotations

from functools import lru_cache
from pathlib import Path
import zipfile

import requests

from minsearch import AppendableIndex

FASTMCP_ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
DATA_DIR = Path(__file__).parent / "data"
ZIP_PATH = DATA_DIR / "fastmcp-main.zip"
DOC_EXTENSIONS = {".md", ".mdx"}


def ensure_fastmcp_zip() -> Path:
    if ZIP_PATH.exists():
        return ZIP_PATH

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with requests.get(FASTMCP_ZIP_URL, stream=True, timeout=60) as response:
        response.raise_for_status()
        with open(ZIP_PATH, "wb") as file:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    file.write(chunk)

    return ZIP_PATH


def normalize_filename(path: str) -> str:
    parts = path.split("/", 1)
    if len(parts) == 2:
        return parts[1]
    return path


def iter_docs_from_zip(zip_path: Path) -> list[dict[str, str]]:
    docs: list[dict[str, str]] = []
    with zipfile.ZipFile(zip_path) as zip_file:
        for member in zip_file.infolist():
            if member.is_dir():
                continue
            suffix = Path(member.filename).suffix.lower()
            if suffix not in DOC_EXTENSIONS:
                continue
            raw = zip_file.read(member)
            text = raw.decode("utf-8", errors="replace")
            docs.append(
                {
                    "filename": normalize_filename(member.filename),
                    "content": text,
                }
            )
    return docs


@lru_cache(maxsize=1)
def build_index() -> AppendableIndex:
    zip_path = ensure_fastmcp_zip()
    docs = iter_docs_from_zip(zip_path)
    index = AppendableIndex(text_fields=["content"])
    index.fit(docs)
    return index


def search_docs(query: str, top_k: int = 5) -> list[dict[str, str]]:
    index = build_index()
    return index.search(query, num_results=top_k)


def main() -> None:
    results = search_docs("demo", top_k=5)
    for result in results:
        print(result["filename"])


if __name__ == "__main__":
    main()
