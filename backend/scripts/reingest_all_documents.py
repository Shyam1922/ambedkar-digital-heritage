import sys
from pathlib import Path

# Allow running as a plain script ("python scripts/reingest_all_documents.py").
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.database import SessionLocal
from app.services.archive_ingest import ingest_document


DOCUMENTS = [
    {
        "archive_id": "A-001",
        "pdf": "../data/raw/A-001/annihilation_of_caste.pdf",
        "title": "Annihilation of Caste",
        "description": "Ambedkar's undelivered address on the annihilation of caste.",
        "document_type": "Writing",
        "date": "1936",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "caste, equality, social reform",
    },
    {
        "archive_id": "A-002",
        "pdf": "../data/raw/A-002/The Buddha and His Dhamma.pdf",
        "title": "The Buddha and His Dhamma",
        "description": "A posthumously published account of the Buddha's life and teaching.",
        "document_type": "Book",
        "date": "1957",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "buddhism, dhamma, equality",
    },
    {
        "archive_id": "A-003",
        "pdf": "../data/raw/A-003/Constituent Assembly- Objectives Resolution Debate.pdf",
        "title": "Constituent Assembly: Objectives Resolution Debate",
        "description": "Intervention during deliberations on the Objectives Resolution.",
        "document_type": "Constitutional Debate",
        "date": "1946-12-17",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "constitution, democracy, unity",
    },
    {
        "archive_id": "A-004",
        "pdf": "../data/raw/A-004/Closing speech 25 Nov 1949.pdf",
        "title": "Constituent Assembly: Final Speech",
        "description": "Closing speech before adoption of the Constitution.",
        "document_type": "Constitutional Debate",
        "date": "1949-11-25",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "constitution, democracy, liberty, equality",
    },
    {
        "archive_id": "A-005",
        "pdf": "../data/raw/A-005/Speech at Mahad Satyagraha.pdf",
        "title": "Speech at Mahad Satyagraha",
        "description": "Public mobilisation for equal access to water and civic rights.",
        "document_type": "Speech",
        "date": "1927",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "mahad, equality, civil rights",
    },
    {
        "archive_id": "A-006",
        "pdf": "../data/raw/A-006/What Congress and Gandhi have done to the untouchables .pdf",
        "title": "What Congress and Gandhi Have Done to the Untouchables",
        "description": "A political analysis of representation and caste discrimination.",
        "document_type": "Book",
        "date": "1945",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "representation, rights, untouchability",
    },
    {
        "archive_id": "A-007",
        "pdf": "../data/raw/A-007/23747.pdf",
        "title": "States and Minorities",
        "description": "Memorandum proposing constitutional safeguards and economic democracy.",
        "document_type": "Writing",
        "date": "1947",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "minorities, constitution, economic democracy",
    },
    {
        "archive_id": "A-009",
        "pdf": "../data/raw/A-009/Castes in India- Their Mechanism, Genesis and Development.pdf",
        "title": "Castes in India: Their Mechanism, Genesis and Development",
        "description": "Early academic paper on caste formation.",
        "document_type": "Article",
        "date": "1916",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "caste, sociology, endogamy",
    },
    {
        "archive_id": "A-010",
        "pdf": "../data/raw/A-010/Pakistan or the Partition of India.pdf",
        "title": "Pakistan or the Partition of India",
        "description": "Study of communal politics, constitutional arrangements and partition.",
        "document_type": "Book",
        "date": "1940",
        "author_speaker": "B. R. Ambedkar",
        "source": "Ambedkar.org / public archival texts",
        "source_url": "https://ambedkar.org/",
        "tags": "politics, partition, minorities",
    },
]


def main():
    db = SessionLocal()

    try:
        for document in DOCUMENTS:
            print(f"\nIngesting {document['archive_id']}...")

            pdf_path = Path(document.pop("pdf"))

            item = ingest_document(
                db=db,
                pdf_path=pdf_path,
                **document,
            )

            print(
                f"✓ {item.archive_id} | "
                f"{len(item.extracted_text)} characters"
            )

        print("\n" + "=" * 50)
        print("ALL DOCUMENTS INGESTED SUCCESSFULLY")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print("\nINGESTION FAILED:")
        print(e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()