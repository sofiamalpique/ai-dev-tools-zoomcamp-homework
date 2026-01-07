from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from utils import count_word_occurrences, fetch_markdown


def main() -> None:
    url = "https://datatalks.club/"
    content = fetch_markdown(url)
    import re
    count = len(re.findall("data", content, flags=re.IGNORECASE))
    print(count)


if __name__ == "__main__":
    main()
