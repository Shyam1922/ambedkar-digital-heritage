import re


def generate_short_summary(
    text: str,
    max_sentences: int = 8,
) -> str:
    """
    Generate a deterministic short summary suitable for kiosk display.

    This does not depend on an external AI service, so it works offline.
    """

    clean = " ".join(text.split())

    if not clean:
        return ""

    sentences = re.split(
        r"(?<=[.!?])\s+",
        clean,
    )

    sentences = [
        sentence.strip()
        for sentence in sentences
        if len(sentence.strip()) > 40
    ]

    return " ".join(sentences[:max_sentences])


generate_summary = generate_short_summary