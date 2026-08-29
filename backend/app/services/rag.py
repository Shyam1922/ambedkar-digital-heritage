import httpx
from sqlalchemy.orm import Session
from app.schemas.archive import ResearchResponse
from app.services.retrieval import retrieve
from app.services.provider import provider

INSUFFICIENT = "There is insufficient information in the available archive to answer this question reliably."



def build_extractive_answer(results: list) -> str:
    """Build a transparent answer from retrieved archive excerpts."""

    if not results:
        return INSUFFICIENT

    excerpts = []
    seen = set()

    for result in results:
        excerpt = result.citation.excerpt.strip()

        if not excerpt:
            continue

        # Avoid returning essentially identical excerpts.
        normalized = " ".join(excerpt.lower().split())

        if normalized in seen:
            continue

        seen.add(normalized)
        excerpts.append(excerpt)

        if len(excerpts) == 3:
            break

    if not excerpts:
        return INSUFFICIENT

    return (
        "Based on the retrieved archive material:\n\n"
        + "\n\n".join(
            f"• {excerpt}"
            for excerpt in excerpts
        )
    )


def research(db: Session, query: str, limit: int = 5, archive_id: str | None = None) -> ResearchResponse:
    results = retrieve(db, query, limit, archive_id)
    if not results:
        return ResearchResponse(answer=INSUFFICIENT, sources=[], mode="extractive-fallback", insufficient_information=True)
    answer = build_extractive_answer(results)
    mode = "extractive-fallback"
    context = "\n\n".join(
        result.citation.excerpt
        for result in results[:3]
    )
    if provider.configured:
        try:
            answer = provider.answer(query, "\n\n".join(context))
            mode = "openai-compatible-rag"
        except (httpx.HTTPError, KeyError, RuntimeError):
            # A provider outage must never remove the transparent local fallback.
            pass
    return ResearchResponse(answer=answer, sources=[result.citation for result in results], mode=mode, insufficient_information=False)
