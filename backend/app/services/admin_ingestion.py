from pathlib import Path

from sqlalchemy.orm import Session

from app.models import ArchiveItem, DocumentChunk
from app.services.ingestion import (
    extract_text,
    select_content_pages,
    chunk_text,
)
from app.services.summary import generate_short_summary


def ingest_document(
    db: Session,
    *,
    archive_id: str,
    title: str,
    description: str,
    document_type: str,
    date: str,
    author_speaker: str,
    language: str,
    source: str,
    source_url: str,
    tags: str,
    file_path: Path,
    content_start_page: int = 1,
) -> ArchiveItem:

    # 1. Extract text while preserving page numbers
    pages = extract_text(
        file_path,
        content_start_page=content_start_page,
    )

    # 2. Keep meaningful content pages
    pages = select_content_pages(
        pages,
        content_start_page=content_start_page,
    )

    # 3. Combine full document text
    full_text = "\n\n".join(
        text
        for _, text in pages
        if text.strip()
    )

    if not full_text.strip():
        raise ValueError(
            "No readable text could be extracted from the document"
        )

    # 4. Generate kiosk summary
    short_summary = generate_short_summary(full_text)

    # 5. Create archive item
    item = ArchiveItem(
        archive_id=archive_id,
        title=title,
        description=description,
        kiosk_summary=short_summary,
        type=document_type,
        date=date,
        author_speaker=author_speaker,
        language=language,
        source=source,
        source_url=source_url,
        tags=tags,
        file_path=str(file_path),
        extracted_text=full_text,
        verification_status="PENDING",
    )

    db.add(item)
    db.flush()

    # 6. Chunk document for retrieval/RAG
    chunks = chunk_text(pages)

    for index, (page_number, text) in enumerate(chunks):
        db.add(
            DocumentChunk(
                archive_item_id=item.id,
                chunk_text=text,
                chunk_index=index,
                page_number=page_number,
            )
        )

    # 7. Commit everything
    db.commit()
    db.refresh(item)

    return item