from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.database import get_db
from app.models import ArchiveItem, DocumentChunk, TimelineEvent
from app.schemas.archive import (
    ArchiveItemOut,
    ArchiveSummaryOut,
    DocumentPageOut,
    ArchiveListOut,
    ResearchRequest,
    ResearchResponse,
    SearchRequest,
    SearchResult,
    TimelineEventOut,
)
from app.services.rag import research
from app.services.retrieval import retrieve
from app.services.ingestion import stitch_chunks


router = APIRouter()


def _tags(item: ArchiveItem) -> list[str]:
    return [
        tag.strip()
        for tag in item.tags.split(",")
        if tag.strip()
    ]


def archive_summary_out(item: ArchiveItem) -> ArchiveSummaryOut:
    """Metadata-only projection for list and timeline responses."""
    return ArchiveSummaryOut(
        archive_id=item.archive_id,
        title=item.title,
        description=item.description,
        type=item.type,
        date=item.date,
        author_speaker=item.author_speaker,
        language=item.language,
        source=item.source,
        source_url=item.source_url,
        tags=_tags(item),
        file_path=item.file_path,
        verification_status=item.verification_status,
        short_summary=item.short_summary,
    )


def archive_out(item: ArchiveItem) -> ArchiveItemOut:
    return ArchiveItemOut(
        archive_id=item.archive_id,
        title=item.title,
        description=item.description,
        type=item.type,
        date=item.date,
        author_speaker=item.author_speaker,
        language=item.language,
        source=item.source,
        source_url=item.source_url,
        tags=_tags(item),
        file_path=item.file_path,
        extracted_text=item.extracted_text,
        verification_status=item.verification_status,
        short_summary=item.short_summary,
    )


def timeline_out(event: TimelineEvent) -> TimelineEventOut:
    return TimelineEventOut(
        event_id=event.event_id,
        date=event.date,
        title=event.title,
        description=event.description,
        image=event.image,
        verification_status=event.verification_status,
        related_archive_items=[
            archive_summary_out(item)
            for item in event.archive_items
        ],
    )


@router.get("/health")
def health():
    return {"status": "ok"}


# =========================================================
# ARCHIVE
# =========================================================

@router.get("/archive", response_model=ArchiveListOut)
def list_archive(
    q: str = "",
    type: str | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(ArchiveItem).order_by(ArchiveItem.date)

    if type:
        stmt = stmt.where(
            ArchiveItem.type == type
        )

    if q:
        needle = f"%{q}%"

        stmt = stmt.where(
            ArchiveItem.title.ilike(needle)
            | ArchiveItem.description.ilike(needle)
            | ArchiveItem.tags.ilike(needle)
        )

    items = db.scalars(stmt).all()

    return ArchiveListOut(
        items=[
            archive_summary_out(item)
            for item in items
        ],
        total=len(items),
    )


@router.get(
    "/archive/{archive_id}",
    response_model=ArchiveItemOut,
)
def archive_detail(
    archive_id: str,
    db: Session = Depends(get_db),
):
    item = db.scalar(
        select(ArchiveItem).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Archive item not found",
        )

    return archive_out(item)


# =========================================================
# DOCUMENT READER
# =========================================================

@router.get(
    "/archive/{archive_id}/pages/{page_number}",
    response_model=DocumentPageOut,
)
def archive_page(
    archive_id: str,
    page_number: int,
    db: Session = Depends(get_db),
):
    # Get archive item
    item = db.scalar(
        select(ArchiveItem).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Archive item not found",
        )

    # Get all chunks in correct order
    chunks = db.scalars(
        select(DocumentChunk)
        .where(
            DocumentChunk.archive_item_id == item.id
        )
        .order_by(DocumentChunk.chunk_index)
    ).all()

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Document has no extracted content",
        )

    # -----------------------------------------------------
    # Case 1: Document has NO page numbers
    # Example: TXT files or older seeded documents
    # Treat entire document as one logical page
    # -----------------------------------------------------

    has_page_numbers = any(
        chunk.page_number is not None
        for chunk in chunks
    )

    if not has_page_numbers:
        if page_number != 1:
            raise HTTPException(
                status_code=404,
                detail="Page not found",
            )

        text = stitch_chunks(
            [chunk.chunk_text for chunk in chunks]
        )

        return DocumentPageOut(
            archive_id=item.archive_id,
            title=item.title,
            page_number=1,
            total_pages=1,
            original_page_number=None,
            text=text,
        )

    # -----------------------------------------------------
    # Case 2: Document has real page numbers
    # Example: PDF documents
    # -----------------------------------------------------

    original_pages = sorted(
        {
            chunk.page_number
            for chunk in chunks
            if chunk.page_number is not None
        }
    )

    total_pages = len(original_pages)

    if page_number < 1 or page_number > total_pages:
        raise HTTPException(
            status_code=404,
            detail="Page not found",
        )

    # Logical page -> original PDF page
    original_page_number = original_pages[page_number - 1]

    page_chunks = [
        chunk
        for chunk in chunks
        if chunk.page_number == original_page_number
    ]

    if not page_chunks:
        raise HTTPException(
            status_code=404,
            detail="Page content not found",
        )

    text = stitch_chunks(
        [chunk.chunk_text for chunk in page_chunks]
    )

    return DocumentPageOut(
        archive_id=item.archive_id,
        title=item.title,
        page_number=page_number,
        total_pages=total_pages,
        original_page_number=original_page_number,
        text=text,
    )


# =========================================================
# TIMELINE
# =========================================================

@router.get(
    "/timeline",
    response_model=list[TimelineEventOut],
)
def list_timeline(
    db: Session = Depends(get_db),
):
    events = db.scalars(
        select(TimelineEvent)
        .options(
            selectinload(
                TimelineEvent.archive_items
            )
        )
        .order_by(TimelineEvent.date)
    ).all()

    return [
        timeline_out(event)
        for event in events
    ]


@router.get(
    "/timeline/{event_id}",
    response_model=TimelineEventOut,
)
def timeline_detail(
    event_id: str,
    db: Session = Depends(get_db),
):
    event = db.scalar(
        select(TimelineEvent)
        .options(
            selectinload(
                TimelineEvent.archive_items
            )
        )
        .where(
            TimelineEvent.event_id == event_id
        )
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Timeline event not found",
        )

    return timeline_out(event)


# =========================================================
# SEARCH
# =========================================================

@router.post(
    "/search",
    response_model=list[SearchResult],
)
def search(
    payload: SearchRequest,
    db: Session = Depends(get_db),
):
    return retrieve(
        db,
        payload.query,
        payload.limit,
    )


# =========================================================
# AI RESEARCH
# =========================================================

@router.post(
    "/research",
    response_model=ResearchResponse,
)
def research_archive(
    payload: ResearchRequest,
    db: Session = Depends(get_db),
):
    return research(
        db,
        payload.query,
        payload.limit,
    )


@router.post(
    "/research/document/{archive_id}",
    response_model=ResearchResponse,
)
def research_document(
    archive_id: str,
    payload: ResearchRequest,
    db: Session = Depends(get_db),
):
    item_exists = db.scalar(
        select(ArchiveItem.id).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if not item_exists:
        raise HTTPException(
            status_code=404,
            detail="Archive item not found",
        )

    return research(
        db,
        payload.query,
        payload.limit,
        archive_id,
    )