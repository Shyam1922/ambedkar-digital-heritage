from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import ArchiveItem, DocumentChunk
from app.services.ingestion import chunk_text, extract_text, select_content_pages


def ingest_document(
    db: Session,
    archive_id: str,
    pdf_path: Path,
    title: str,
    description: str,
    document_type: str,
    date: str,
    author_speaker: str,
    source: str,
    source_url: str,
    tags: str = "",
    language: str = "English",
    verification_status: str = "DEMO / NOT VERIFIED",
    content_start_page: int = 1,
    excluded_pages: set[int] | None = None,
) -> ArchiveItem:

    pages = select_content_pages(
        extract_text(
            pdf_path,
            content_start_page=content_start_page,
            excluded_pages=excluded_pages,
        ),
        content_start_page=content_start_page,
        excluded_pages=excluded_pages,
    )

    if not any(text.strip() for _, text in pages):
        raise ValueError(f"No text could be extracted from {pdf_path}")

    full_text = "\n\n".join(
        text for _, text in pages if text.strip()
    )

    chunks = chunk_text(pages)

    item = db.scalar(
        select(ArchiveItem).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if item is None:
        item = ArchiveItem(
            archive_id=archive_id,
            title=title,
            description=description,
            type=document_type,
            date=date,
            author_speaker=author_speaker,
            language=language,
            source=source,
            source_url=source_url,
            tags=tags,
            file_path=str(pdf_path),
            extracted_text=full_text,
            verification_status=verification_status,
        )

        db.add(item)
        db.flush()

    else:
        # Update the existing archive item and replace, rather than append,
        # its chunks. A direct delete is robust even if the relationship has
        # not been loaded in this Session.
        item.title = title
        item.description = description
        item.type = document_type
        item.date = date
        item.author_speaker = author_speaker
        item.language = language
        item.source = source
        item.source_url = source_url
        item.tags = tags
        item.verification_status = verification_status
        item.extracted_text = full_text
        item.file_path = str(pdf_path)
        db.execute(delete(DocumentChunk).where(DocumentChunk.archive_item_id == item.id))
        db.flush()

    # Add the newly extracted chunks
    for index, (page_number, text) in enumerate(chunks):
        db.add(
            DocumentChunk(
                archive_item_id=item.id,
                chunk_text=text,
                chunk_index=index,
                page_number=page_number,
                vector_metadata="fallback-keyword",
            )
        )

    db.commit()
    db.refresh(item)

    return item


# ---------------------------------------------------------
# Run this file directly to ingest/re-ingest A-001
# ---------------------------------------------------------

if __name__ == "__main__":

    from app.db.database import SessionLocal

    db = SessionLocal()

    try:
        pdf_path = Path(
            "../data/raw/A-001/annihilation_of_caste.pdf"
        )

        item = ingest_document(
            db=db,
            archive_id="A-001",
            pdf_path=pdf_path,
            title="Annihilation of Caste",
            description=(
                "Ambedkar's undelivered address on "
                "the annihilation of caste."
            ),
            document_type="Speech",
            date="1936",
            author_speaker="B. R. Ambedkar",
            source="Annihilation of Caste",
            source_url="",
            tags="caste, social reform, Ambedkar",
            language="English",
        )

        print()
        print("=" * 50)
        print("Ingestion completed successfully")
        print("=" * 50)
        print(f"Title:      {item.title}")
        print(f"Archive ID: {item.archive_id}")
        print(f"Characters: {len(item.extracted_text)}")
        print(f"Chunks:     {len(item.chunks)}")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print()
        print("INGESTION FAILED")
        print(str(e))
        raise

    finally:
        db.close()
