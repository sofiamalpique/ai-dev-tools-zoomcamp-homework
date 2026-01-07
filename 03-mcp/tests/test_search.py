from pathlib import Path
import sys
sys.path.append(str(Path(__file__).resolve().parents[1]))

import tempfile
import zipfile

from search import iter_docs_from_zip, normalize_filename


def test_normalize_filename() -> None:
    assert (
        normalize_filename("fastmcp-main/docs/getting-started/readme.md")
        == "docs/getting-started/readme.md"
    )
    assert normalize_filename("readme.md") == "readme.md"


def test_iter_docs_from_zip_filters_and_normalizes() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = Path(tmpdir) / "sample.zip"
        with zipfile.ZipFile(zip_path, "w") as zip_file:
            zip_file.writestr("fastmcp-main/docs/readme.md", "hello")
            zip_file.writestr("fastmcp-main/docs/readme.mdx", "world")
            zip_file.writestr("fastmcp-main/docs/image.png", "nope")

        docs = iter_docs_from_zip(zip_path)
        filenames = sorted(doc["filename"] for doc in docs)
        assert filenames == ["docs/readme.md", "docs/readme.mdx"]
