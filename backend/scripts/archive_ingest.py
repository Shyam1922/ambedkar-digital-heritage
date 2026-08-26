from pathlib import Path
import sys

# Keep this module executable with `python scripts/archive_ingest.py` as well
# as importable from the backend package.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.database import SessionLocal
from app.services.archive_ingest import ingest_document


DOCUMENTS = [
    {
        "archive_id": "A-001",
        "pdf_path": Path("../data/raw/A-001/annihilation_of_caste.pdf"),
        "title": "Annihilation of Caste",
        "description": "A public address prepared for the Jat-Pat-Todak Mandal.",
        "document_type": "Writing", "date": "1936", "author_speaker": "B. R. Ambedkar",
        "source": "Columbia University / Ambedkar Digital Repository",
        "source_url": "https://ccnmtl.columbia.edu/projects/mmt/ambedkar/web/texts.html",
        "tags": "caste, equality, social reform", "verification_status": "VERIFIED",
    },
    {
        "archive_id": "A-004", "pdf_path": Path("../data/raw/A-004/Closing speech 25 Nov 1949.pdf"),
        "title": "Constituent Assembly Closing Speech", "description": "Closing speech before adoption of the Constitution.",
        "document_type": "Constitutional Debate", "date": "1949-11-25", "author_speaker": "B. R. Ambedkar",
        "source": "Lok Sabha Secretariat", "source_url": "https://eparlib.nic.in/", "tags": "constitution, democracy, equality", "verification_status": "VERIFIED",
    },
    {
        "archive_id": "A-007", "pdf_path": Path("../data/raw/A-007/23747.pdf"),
        "title": "States and Minorities", "description": "Memorandum on rights and constitutional safeguards.",
        "document_type": "Writing", "date": "1947", "author_speaker": "B. R. Ambedkar",
        "source": "Internet Archive", "source_url": "https://archive.org/details/StatesAndMinorities", "tags": "constitution, minorities, social justice",
        "excluded_pages": {2, 4}, "verification_status": "VERIFIED",
    },
    {
        "archive_id": "A-008", "pdf_path": Path("../data/raw/A-008/constitution_of_india_english.pdf"),
        "title": "The Constitution of India (English-Kannada Edition)",
        "description": "Official consolidated edition of the Constitution of India.",
        "document_type": "Other", "date": "1949-11-26 (2025 edition)", "author_speaker": "Constituent Assembly of India",
        "source": "Ministry of Law and Justice, Government of India",
        "source_url": "https://www.legislative.gov.in/static/uploads/2025/07/359f70a69695affb9d72f8393102bd2e.pdf",
        "tags": "constitution, democracy, equality, law",
        "excluded_pages": {1}, "verification_status": "VERIFIED",
    },
]


def main():
    db = SessionLocal()

    try:
        for metadata in DOCUMENTS:
            item = ingest_document(db=db, language="English", **metadata)
            chunks = sorted(item.chunks, key=lambda chunk: chunk.chunk_index)
            page_count = len({chunk.page_number for chunk in chunks if chunk.page_number is not None})
            print(f"Ingested: {item.title} ({item.archive_id})")
            print(f"Pages: {page_count} | Characters: {len(item.extracted_text)} | Chunks: {len(chunks)}")
            print(f"First: {chunks[0].chunk_text[:100]!r}")
            print(f"Last:  {chunks[-1].chunk_text[-100:]!r}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
    
