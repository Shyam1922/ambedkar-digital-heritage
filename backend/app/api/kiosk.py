from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.database import get_db
from app.models import ArchiveItem, TimelineEvent
from app.schemas.archive import (
    ArchiveItemOut,
    TimelineEventOut,
)
from app.services.summary import generate_summary


router = APIRouter(
    prefix="/kiosk",
    tags=["Kiosk"],
)


def kiosk_archive_out(item: ArchiveItem) -> dict:
    """
    Lightweight archive representation for the kiosk.

    Full extracted document text is intentionally NOT exposed.
    """

    return {
        "archive_id": item.archive_id,
        "title": item.title,
        "description": item.description,
        "summary": item.summary,
        "type": item.type,
        "date": item.date,
        "author_speaker": item.author_speaker,
        "language": item.language,
        "tags": [
            tag.strip()
            for tag in item.tags.split(",")
            if tag.strip()
        ],
        "detail_url": f"/archive/{item.archive_id}",
    }


@router.get("/archive")
def list_kiosk_archive(
    q: str = Query(default=""),
    type: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    List archive items for kiosk browsing/search.
    """

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

    return {
        "items": [
            kiosk_archive_out(item)
            for item in items
        ],
        "total": len(items),
    }


@router.get("/archive/{archive_id}")
def kiosk_archive_detail(
    archive_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a single archive item for kiosk display.
    """

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

    return kiosk_archive_out(item)


@router.get("/timeline")
def kiosk_timeline(
    db: Session = Depends(get_db),
):
    """
    Timeline data optimized for kiosk display.
    """

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
        {
            "event_id": event.event_id,
            "date": event.date,
            "title": event.title,
            "description": event.description,
            "image": event.image,
            "related_archive_items": [
                {
                    "archive_id": item.archive_id,
                    "title": item.title,
                    "summary": item.summary,
                    "detail_url": (
                        f"/archive/{item.archive_id}"
                    ),
                }
                for item in event.archive_items
            ],
        }
        for event in events
    ]


@router.get("/timeline/{event_id}")
def kiosk_timeline_detail(
    event_id: str,
    db: Session = Depends(get_db),
):
    """
    Get one timeline event.
    """

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

    return {
        "event_id": event.event_id,
        "date": event.date,
        "title": event.title,
        "description": event.description,
        "image": event.image,
        "related_archive_items": [
            {
                "archive_id": item.archive_id,
                "title": item.title,
                "summary": item.summary,
                "detail_url": (
                    f"/archive/{item.archive_id}"
                ),
            }
            for item in event.archive_items
        ],
    }


@router.get("/search")
def kiosk_search(
    q: str = Query(min_length=2),
    limit: int = Query(default=10, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Simple metadata search for the kiosk.

    Designed to work locally without requiring RAG/API calls.
    """

    needle = f"%{q}%"

    items = db.scalars(
        select(ArchiveItem)
        .where(
            ArchiveItem.title.ilike(needle)
            | ArchiveItem.description.ilike(needle)
            | ArchiveItem.tags.ilike(needle)
            | ArchiveItem.author_speaker.ilike(needle)
        )
        .order_by(ArchiveItem.date)
        .limit(limit)
    ).all()

    return [
        kiosk_archive_out(item)
        for item in items
    ]