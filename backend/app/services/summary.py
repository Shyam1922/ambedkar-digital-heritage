import re

from app.services.provider import provider


# Runs of layout characters PDFs use for rules/leaders (underscores, dashes,
# dots, bullets). Collapsed to a space so they do not appear as a horizontal
# line or pollute a summary.
_SEPARATOR_RUN = re.compile(r"[ \t]*[_·•.\-–—=]{3,}[ \t]*")

# Strong front-matter/boilerplate signals that are very unlikely to occur in
# the body prose we want to surface: imprint/copyright pages, tables of
# contents, and library slips.
_BOILERPLATE = re.compile(
    r"\b(table of contents|contents|preface|foreword|index|isbn|"
    r"all rights reserved|reprint(?:ed)?|first published|"
    r"printed (?:by|in|at)|published by|secretariat|copyright|"
    r"publications?|press\b|limited\b|ltd\b|"
    r"author\s*:|title\s*:|returned on or before)\b",
    re.IGNORECASE,
)

# Table-of-contents entries ("Chapter IV : ...", "PART III - ...").
_TOC_ENTRY = re.compile(
    r"\b(chapter\s+[ivxlcdm\d]+|part\s+[ivxlcdm]+)\b",
    re.IGNORECASE,
)


def _looks_like_content(sentence: str) -> bool:
    """Heuristic: keep body prose, drop title banners / TOC / rules / imprints."""
    s = sentence.strip()
    if len(s) < 40:
        return False

    # Mostly non-letters (page numbers, separator remnants, reference codes).
    letters = sum(ch.isalpha() for ch in s)
    if letters < 0.6 * len(s):
        return False

    # Heavy OCR corruption (stray tildes/mid-word breaks) — skip so a cleaner
    # sentence further in is chosen instead.
    if s.count("~") >= 2:
        return False

    # SHOUTY ALL-CAPS lines are almost always cover/title/header banners.
    alpha = [ch for ch in s if ch.isalpha()]
    if alpha and sum(ch.isupper() for ch in alpha) / len(alpha) > 0.6:
        return False

    if _BOILERPLATE.search(s) or _TOC_ENTRY.search(s):
        return False

    return True


def generate_short_summary(
    text: str,
    max_sentences: int = 8,
) -> str:
    """
    Generate a concise kiosk-friendly archival summary.

    Uses the configured LLM when available.
    Falls back to deterministic extraction when unavailable.
    """

    # Remove PDF separator rules before anything else so they neither reach the
    # LLM context nor render as a horizontal line in extracted summaries.
    stripped = _SEPARATOR_RUN.sub(" ", text)
    clean = " ".join(stripped.split())

    if not clean:
        return ""

    # Don't send an entire 800k-character book to the LLM.
    # This gives enough context while keeping the request manageable.
    context = clean[:12000]

    if provider.configured:
        try:
            question = (
                f"Create a concise archival summary of this document in "
                f"approximately {max_sentences} sentences. "
                "Explain the document's main subject, arguments, historical "
                "context, and significance. Write for visitors at a museum "
                "kiosk. Do not mention that you are summarizing. Do not invent "
                "facts. Return only the summary."
            )

            return provider.answer(question, context)

        except Exception:
            pass

    # Offline fallback: prefer real body prose, skipping cover pages, tables of
    # contents, imprint lines and separator rules that lead many scanned PDFs.
    sentences = re.split(r"(?<=[.!?])\s+", clean)

    content = [
        sentence.strip()
        for sentence in sentences
        if _looks_like_content(sentence)
    ]

    if not content:
        # Nothing passed the content heuristic — fall back to any reasonably
        # long sentence so a summary is still produced.
        content = [
            sentence.strip()
            for sentence in sentences
            if len(sentence.strip()) > 40
        ]

    return " ".join(content[:max_sentences])


generate_summary = generate_short_summary
