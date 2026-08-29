from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Table,
    Column,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


timeline_archive_items = Table(
    "timeline_archive_items",
    Base.metadata,
    Column(
        "timeline_event_id",
        ForeignKey("timeline_events.id"),
        primary_key=True,
    ),
    Column(
        "archive_item_id",
        ForeignKey("archive_items.id"),
        primary_key=True,
    ),
)


class ArchiveItem(Base):
    __tablename__ = "archive_items"

    id: Mapped[int] = mapped_column(primary_key=True)

    archive_id: Mapped[str] = mapped_column(
        String(24),
        unique=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(500))

    description: Mapped[str] = mapped_column(Text)

    # Short pre-generated summary for kiosk display
    kiosk_summary: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    type: Mapped[str] = mapped_column(
        String(80),
        index=True,
    )

    date: Mapped[str] = mapped_column(
        String(80),
        index=True,
    )

    author_speaker: Mapped[str] = mapped_column(String(300))

    language: Mapped[str] = mapped_column(
        String(80),
        default="English",
    )

    source: Mapped[str] = mapped_column(String(300))

    source_url: Mapped[str] = mapped_column(
        String(1000),
        default="",
    )

    tags: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    file_path: Mapped[str] = mapped_column(
        String(1000),
        default="",
    )

    extracted_text: Mapped[str] = mapped_column(Text)

    verification_status: Mapped[str] = mapped_column(
        String(40),
        default="VERIFIED",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    @property
    def short_summary(self) -> str:
        return self.kiosk_summary or ""

    @short_summary.setter
    def short_summary(self, value: str) -> None:
        self.kiosk_summary = value or ""

    @property
    def summary(self) -> str:
        return self.kiosk_summary or ""

    chunks: Mapped[list["DocumentChunk"]] = relationship(
        back_populates="archive_item",
        cascade="all, delete-orphan",
    )

    timeline_events: Mapped[list["TimelineEvent"]] = relationship(
        secondary=timeline_archive_items,
        back_populates="archive_items",
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(primary_key=True)

    archive_item_id: Mapped[int] = mapped_column(
        ForeignKey("archive_items.id"),
        index=True,
    )

    chunk_text: Mapped[str] = mapped_column(Text)

    chunk_index: Mapped[int] = mapped_column(Integer)

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    vector_metadata: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    archive_item: Mapped[ArchiveItem] = relationship(
        back_populates="chunks",
    )


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[int] = mapped_column(primary_key=True)

    event_id: Mapped[str] = mapped_column(
        String(24),
        unique=True,
        index=True,
    )

    date: Mapped[str] = mapped_column(
        String(80),
        index=True,
    )

    title: Mapped[str] = mapped_column(String(500))

    description: Mapped[str] = mapped_column(Text)

    image: Mapped[str] = mapped_column(
        String(1000),
        default="",
    )

    verification_status: Mapped[str] = mapped_column(
        String(40),
        default="VERIFIED",
    )

    archive_items: Mapped[list[ArchiveItem]] = relationship(
        secondary=timeline_archive_items,
        back_populates="timeline_events",
    )