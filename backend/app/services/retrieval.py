import re
from collections import Counter
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models import ArchiveItem, DocumentChunk
from app.schemas.archive import Citation, SearchResult

STOPWORDS = {"the", "a", "an", "is", "are", "of", "and", "to", "in", "for", "on", "what", "were", "was", "about", "his", "her"}


def terms(text: str) -> set[str]:
    return {word for word in re.findall(r"[a-zA-Z]{3,}", text.lower()) if word not in STOPWORDS}


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
        haystack = f"{chunk.archive_item.title} {chunk.archive_item.tags} {chunk.chunk_text}".lower()
        counts = Counter(re.findall(r"[a-zA-Z]{3,}", haystack))
        score = sum(1 + min(counts[term], 3) * 0.2 for term in query_terms if term in counts)
        if score:
            ranked.append((score, chunk))
    ranked.sort(key=lambda entry: entry[0], reverse=True)
    return [SearchResult(citation=citation(chunk), score=round(score, 3)) for score, chunk in ranked[:limit]]
