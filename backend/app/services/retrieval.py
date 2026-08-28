import re
from collections import Counter
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models import ArchiveItem, DocumentChunk
from app.schemas.archive import Citation, SearchResult

STOPWORDS = {"the", "a", "an", "is", "are", "of", "and", "to", "in", "for", "on", "what", "were", "was", "about", "his", "her","did","do","does","how","why","when","where","who","which","can","could","would","should","tell","say","said"}


def terms(text: str) -> set[str]:
    return {word for word in re.findall(r"[a-zA-Z]{3,}", text.lower()) if word not in STOPWORDS}

def is_front_matter(text: str) -> bool:
    text = text.lower()

    markers = (
        "table of contents",
        "contents",
        "index",
        "preface",
        "foreword",
        "title page",
    )

    return any(marker in text for marker in markers)


def citation(chunk: DocumentChunk) -> Citation:
    item = chunk.archive_item
    excerpt = chunk.chunk_text.strip().replace("\n", " ")
    return Citation(archive_id=item.archive_id, title=item.title, source=item.source,
                    source_url=item.source_url, page_number=chunk.page_number,
                    excerpt=excerpt[:360] + ("…" if len(excerpt) > 360 else ""),
                    detail_url=f"/archive/{item.archive_id}")


def retrieve(db: Session, query: str, limit: int = 6, archive_id: str | None = None) -> list[SearchResult]:
    query_terms = terms(query)
    stmt = select(DocumentChunk).options(joinedload(DocumentChunk.archive_item))
    if archive_id:
        stmt = stmt.join(DocumentChunk.archive_item).where(ArchiveItem.archive_id == archive_id)
    chunks = db.scalars(stmt).unique().yield_per(200)
    ranked: list[tuple[float, DocumentChunk]] = []
    for chunk in chunks:

        text_counts = Counter(
            re.findall(r"[a-zA-Z]{3,}", chunk.chunk_text.lower())
        )

        tag_terms = set(
            re.findall(r"[a-zA-Z]{3,}", chunk.archive_item.tags.lower())
        )

        title_terms = set(
            re.findall(r"[a-zA-Z]{3,}", chunk.archive_item.title.lower())
        )

        score = 0.0

        for term in query_terms:
            if term in text_counts:
                score += 1 + min(text_counts[term], 3) * 0.2

            if term in tag_terms:
                score += 0.5

            if term in title_terms:
                score += 0.25
        if is_front_matter(chunk.chunk_text):
            continue
        
        if score:
            ranked.append((score, chunk))
    ranked.sort(key=lambda entry: entry[0], reverse=True)
    selected: list[SearchResult] = []
    seen_pages: set[tuple[str, int | None]] = set()

    for score, chunk in ranked:
        if chunk.page_number is not None:
            page_key = (chunk.archive_item.archive_id, chunk.page_number)

            if page_key in seen_pages:
                continue

            seen_pages.add(page_key)

        selected.append(
            SearchResult(
                citation=citation(chunk),
                score=round(score, 3),
            )
        )

        if len(selected) == limit:
            break

    return selected
