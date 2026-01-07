from pathlib import Path
import re


HASH_RE = re.compile(r'hash\s*=\s*"([^"]+)"')


def main() -> None:
    lock_path = Path(__file__).resolve().parents[1] / "uv.lock"
    in_fastmcp = False
    in_wheels = False

    for line in lock_path.read_text().splitlines():
        stripped = line.strip()
        if stripped == "[[package]]":
            in_fastmcp = False
            in_wheels = False
            continue

        if stripped.startswith("name = "):
            in_fastmcp = stripped == 'name = "fastmcp"'
            in_wheels = False
            continue

        if in_fastmcp and stripped.startswith("wheels = ["):
            in_wheels = True
            continue

        if in_fastmcp and in_wheels:
            match = HASH_RE.search(stripped)
            if match:
                print(match.group(1))
                return

    raise SystemExit("fastmcp wheel hash not found")


if __name__ == "__main__":
    main()
