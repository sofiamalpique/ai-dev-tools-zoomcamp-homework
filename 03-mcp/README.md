# Homework 3 - MCP Server (Context7 clone)

This folder contains a FastMCP server with web scraping and documentation search.

## Setup

Install uv if needed:

```bash
python3 -m pip install uv
```

Sync dependencies:

```bash
uv sync
```

## Run the MCP server

```bash
uv run python main.py
```

The welcome screen shows the transport (use this for Q2).

## Tools

- `scrape(url: str) -> str`: Fetch markdown content using Jina Reader.
- `count_word(url: str, word: str) -> int`: Count case-insensitive occurrences in Jina Reader content.
- `search_fastmcp_docs(query: str) -> list[dict]`: Top 5 search results from fastmcp docs.

## Helper scripts (Q1-Q5)

Q1: Extract first fastmcp wheel hash from `uv.lock`:

```bash
uv run python scripts/fastmcp_wheel_hash.py
```

Q3: Fetch minsearch repo page via Jina Reader and print character count:

```bash
uv run python test.py
```

Q4: Count occurrences of "data" on datatalks.club:

```bash
uv run python scripts/count_data.py
```

Q5: Build index and print top 5 filenames for query "demo":

```bash
uv run python search.py
```

## MCP client integration

Example MCP server configuration (Claude Desktop style):

```json
{
  "mcpServers": {
    "hw3-fastmcp": {
      "command": "uv",
      "args": [
        "--directory",
        "/ABSOLUTE/PATH/TO/ai-dev-tools-zoomcamp-homework/03-mcp",
        "run",
        "python",
        "main.py"
      ]
    }
  }
}
```

## Notes

- `search.py` downloads `fastmcp-main.zip` to `data/` if missing.
- All network calls require access to external URLs (Jina Reader, GitHub).
- `minsearch/append.py` is vendored from https://github.com/alexeygrigorev/minsearch.
