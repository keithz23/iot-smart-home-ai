from pathlib import Path
import re


KNOWLEDGE_FILE = (
    Path(__file__).resolve().parents[4] / "docs" / "AI_RAG_IOT.md"
)


def retrieve_knowledge(query: str, limit: int = 3) -> list[str]:
    if not KNOWLEDGE_FILE.exists():
        return []

    words = {
        word.lower()
        for word in re.findall(r"[a-zA-Z0-9_À-ỹ]+", query)
        if len(word) > 2
    }
    sections = KNOWLEDGE_FILE.read_text(encoding="utf-8").split("\n## ")
    scored_sections: list[tuple[int, str]] = []

    for section in sections:
        score = sum(
            1
            for word in words
            if word in section.lower()
        )
        if score:
            scored_sections.append((score, section.strip()))

    scored_sections.sort(key=lambda item: item[0], reverse=True)
    return [section[:2000] for _, section in scored_sections[:limit]]
