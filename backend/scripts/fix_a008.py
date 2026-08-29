"""Fix and (re-)ingest A-008 as 'The Constitution of India'.

A-008 originally pointed at 'The Problem of the Rupee' but only held a short
seed excerpt, while the PDF shipped under ``data/raw/A-008`` is actually the
Constitution of India. Per project decision, A-008 now represents the
Constitution of India, using that PDF.

Run from the backend/ directory once the PDF is in place:

    ../.venv/Scripts/python.exe scripts/fix_a008.py

The script extracts and (re-)ingests the document, replaces its chunks, and
regenerates its kiosk summary. It aborts if the PDF is missing or if its text
does not look like the Constitution, so an unrelated document cannot be
ingested into A-008 by accident.
"""

import sys
from pathlib import Path

# Allow running as a plain script ("python scripts/fix_a008.py") by ensuring
# the backend/ directory (which contains the app package) is importable.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.database import SessionLocal
from app.services.archive_ingest import ingest_document
from app.services.ingestion import extract_text
from app.services.summary import generate_short_summary


DEFAULT_PDF = Path("../data/raw/A-008/constitution_of_india_english.pdf")

METADATA = dict(
    archive_id="A-008",
    title="The Constitution of India",
    description=(
        "The Constitution of India — the supreme law establishing the "
        "framework of government, fundamental rights and directive "
        "principles. Drafted by the Constituent Assembly with Dr. B. R. "
        "Ambedkar as Chairman of the Drafting Committee."
    ),
    document_type="Constitutional Document",
    date="1949-11-26",
    author_speaker="Constituent Assembly of India (Drafting Committee chaired by B. R. Ambedkar)",
    source="Ambedkar.org / public archival texts",
    source_url="https://ambedkar.org/",
    tags="constitution, fundamental rights, law, democracy",
    language="English",
    verification_status="DEMO / NOT VERIFIED",
)

# The ingested text must contain these to confirm it really is the Constitution.
_EXPECTED_MARKERS = (
    "WE, THE PEOPLE OF INDIA",
    "CONSTITUTION OF INDIA",
)


def _resolve_pdf() -> Path:
    if DEFAULT_PDF.exists():
        return DEFAULT_PDF
    folder = DEFAULT_PDF.parent
    if folder.is_dir():
        pdfs = sorted(folder.glob("*.pdf"))
        if len(pdfs) == 1:
            return pdfs[0]
        if len(pdfs) > 1:
            raise SystemExit(
                f"Multiple PDFs found in {folder}. Keep only the Constitution "
                f"of India PDF, or set DEFAULT_PDF explicitly."
            )
    raise SystemExit(
        f"Constitution PDF not found. Place it at {DEFAULT_PDF} (or as the "
        f"only .pdf in {folder}) and re-run."
    )


def main() -> None:
    pdf_path = _resolve_pdf()

    # Sanity-check the content before writing anything to the database.
    sample = "\n".join(text for _, text in extract_text(pdf_path)[:5]).upper()
    if not any(marker in sample for marker in _EXPECTED_MARKERS):
        raise SystemExit(
            f"{pdf_path.name} does not look like the Constitution of India. "
            f"Aborting so an unrelated document is not ingested into A-008."
        )

    db = SessionLocal()
    try:
        item = ingest_document(db=db, pdf_path=pdf_path, **METADATA)
        item.kiosk_summary = generate_short_summary(
            item.extracted_text, max_sentences=8
        )
        db.commit()
        db.refresh(item)

        print("=" * 50)
        print("A-008 (re-)ingested successfully as the Constitution of India")
        print("=" * 50)
        print(f"Title:         {item.title}")
        print(f"PDF:           {pdf_path}")
        print(f"Characters:    {len(item.extracted_text):,}")
        print(f"Summary chars: {len(item.kiosk_summary):,}")
        print("=" * 50)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
