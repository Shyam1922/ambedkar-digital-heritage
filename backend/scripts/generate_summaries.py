import sys
from pathlib import Path

# Allow running as a plain script ("python scripts/generate_summaries.py").
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.database import SessionLocal
from app.models import ArchiveItem
from app.services.summary import generate_short_summary


db = SessionLocal()

try:
    items = db.query(ArchiveItem).order_by(
        ArchiveItem.archive_id
    ).all()

    for item in items:
        summary = generate_short_summary(
            item.extracted_text,
            max_sentences=8,
        )

        item.kiosk_summary = summary

        print(
            item.archive_id,
            "| SUMMARY LENGTH:",
            len(summary),
        )

    db.commit()

    print("\nAll kiosk summaries generated successfully.")

finally:
    db.close()