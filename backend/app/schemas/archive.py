from pydantic import BaseModel, Field


# --------------------------------------------------
# Shared schemas
# --------------------------------------------------

class Citation(BaseModel):
    archive_id: str
    title: str
    source: str
    source_url: str
    page_number: int | None = None
    excerpt: str
    detail_url: str


# --------------------------------------------------
# Public archival website
# --------------------------------------------------

class ArchiveSummaryOut(BaseModel):
    """Archive metadata without the full document body.

    Used for list and timeline responses so they do not ship megabytes of
    ``extracted_text`` the client never renders there. The full text is served
    by the detail endpoint (``ArchiveItemOut``) and the page reader.
    """

    archive_id: str
    title: str
    description: str
    type: str
    date: str
    author_speaker: str
    language: str
    source: str
    source_url: str
    tags: list[str]
    file_path: str = ""
    verification_status: str
    short_summary: str = ""


class ArchiveItemOut(ArchiveSummaryOut):
    extracted_text: str = ""


class ArchiveDetailOut(ArchiveItemOut):
    pass


class ArchiveListOut(BaseModel):
    items: list[ArchiveSummaryOut]
    total: int


# --------------------------------------------------
# Kiosk application
# --------------------------------------------------

class KioskArchiveItemOut(BaseModel):
    """Kiosk archive projection. Full ``extracted_text`` is deliberately
    absent: the kiosk shows the concise ``summary`` and links visitors to the
    public website for the complete document. Used as a response_model so the
    field can never leak even if a mapper is changed."""

    archive_id: str
    title: str
    description: str
    summary: str = ""
    type: str
    date: str
    author_speaker: str
    language: str
    tags: list[str]
    detail_url: str


class KioskArchiveListOut(BaseModel):
    items: list[KioskArchiveItemOut]
    total: int


class KioskRelatedArchiveItemOut(BaseModel):
    archive_id: str
    title: str
    summary: str = ""
    detail_url: str


class KioskTimelineEventOut(BaseModel):
    event_id: str
    date: str
    title: str
    description: str
    image: str
    related_archive_items: list[KioskRelatedArchiveItemOut] = []


# --------------------------------------------------
# Admin portal
# --------------------------------------------------

class AdminArchiveItemOut(BaseModel):
    archive_id: str
    title: str
    description: str
    short_summary: str = ""
    type: str
    date: str
    author_speaker: str
    language: str
    source: str
    source_url: str
    tags: list[str]
    file_path: str = ""
    extracted_text: str = ""
    verification_status: str


# --------------------------------------------------
# Document reader
# --------------------------------------------------

class DocumentPageOut(BaseModel):
    archive_id: str
    title: str

    page_number: int
    total_pages: int

    original_page_number: int | None = None

    text: str


# --------------------------------------------------
# Timeline
# --------------------------------------------------

class TimelineEventOut(BaseModel):
    event_id: str
    date: str
    title: str
    description: str
    image: str
    verification_status: str

    related_archive_items: list[ArchiveSummaryOut] = []


# --------------------------------------------------
# Search
# --------------------------------------------------

class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)

    limit: int = Field(
        default=6,
        ge=1,
        le=20,
    )


class SearchResult(BaseModel):
    citation: Citation
    score: float


# --------------------------------------------------
# Research / RAG
# --------------------------------------------------

class ResearchRequest(BaseModel):
    query: str = Field(
        min_length=2,
        max_length=1000,
    )

    limit: int = Field(
        default=5,
        ge=1,
        le=10,
    )


class ResearchResponse(BaseModel):
    answer: str
    sources: list[Citation]

    mode: str

    insufficient_information: bool