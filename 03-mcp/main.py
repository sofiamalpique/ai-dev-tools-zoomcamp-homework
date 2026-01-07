from fastmcp import FastMCP

from search import search_docs
from utils import count_word_occurrences, fetch_markdown

mcp = FastMCP("Demo 🚀")


@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b


@mcp.tool
def scrape(url: str) -> str:
    """Fetch a URL via Jina Reader and return markdown content."""
    return fetch_markdown(url)


@mcp.tool
def count_word(url: str, word: str) -> int:
    """Count case-insensitive occurrences for a URL using Jina Reader content."""
    content = fetch_markdown(url)
    return count_word_occurrences(content, word)


@mcp.tool
def search_fastmcp_docs(query: str) -> list[dict[str, str]]:
    """Search fastmcp docs (top 5) and return filename/content pairs."""
    return search_docs(query, top_k=5)


if __name__ == "__main__":
    mcp.run()
