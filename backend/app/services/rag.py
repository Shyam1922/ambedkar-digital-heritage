import httpx
from sqlalchemy.orm import Session
from app.schemas.archive import ResearchResponse
from app.services.retrieval import retrieve
from app.services.provider import provider

INSUFFICIENT = "There is insufficient information in the available archive to answer this question reliably."


def research(db: Session, query: str, limit: int = 5, archive_id: str | None = None) -> ResearchResponse:
    results = retrieve(db, query, limit, archive_id)
    if not results:
        return ResearchResponse(answer=INSUFFICIENT, sources=[], mode="extractive-fallback", insufficient_information=True)
    excerpts = [result.citation.excerpt for result in results[:3]]
    answer = "Based on the retrieved archive material:\n\n" + "\n\n".join(excerpts)
    mode = "extractive-fallback"
    if provider.configured:
        try:
            answer = provider.answer(query, "\n\n".join(excerpts))
            mode = "openai-compatible-rag"
        except (httpx.HTTPError, KeyError, RuntimeError):
            # A provider outage must never remove the transparent local fallback.
            pass
    return ResearchResponse(answer=answer, sources=[result.citation for result in results], mode=mode, insufficient_information=False)
