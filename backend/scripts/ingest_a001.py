from pathlib import Path

from app.db.database import SessionLocal
from app.services.archive_ingest import ingest_document


PDF_PATH = Path("../data/raw/A-001/annihilation_of_caste.pdf")


def main():
    db = SessionLocal()

    try:
        item = ingest_document(
            db=db,
            archive_id="A-001",
            pdf_path=PDF_PATH,
            title="Annihilation of Caste",
            description="A public address prepared for the Jat-Pat-Todak Mandal.",
            document_type="Writing",
            date="1936",
            author_speaker="B. R. Ambedkar",
            source="Columbia University / Ambedkar Digital Repository",
            source_url="https://ccnmtl.columbia.edu/projects/mmt/ambedkar/web/texts.html",
            tags="caste, equality, social reform",
        )

        print(f"Ingested: {item.title}")
        print(f"Archive ID: {item.archive_id}")
        print(f"Characters: {len(item.extracted_text)}")
        print(f"Chunks: {len(item.chunks)}")

    finally:
        db.close()


if __name__ == "__main__":
    main()