from utils import fetch_markdown


def main() -> None:
    url = "https://github.com/alexeygrigorev/minsearch"
    content = fetch_markdown(url)
    print(len(content))


if __name__ == "__main__":
    main()
