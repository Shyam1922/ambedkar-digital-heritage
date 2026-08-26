from pydantic import BaseModel, Field


class Citation(BaseModel):
    archive_id: str
    title: str
    source: str
    source_url: str
    page_number: int | None = None
    excerpt: str
    detail_url: str


class ArchiveItemOut(BaseModel):
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
    file_path: str
    extracted_text: str
    verification_status: str

class DocumentPageOut(BaseModel):
    archive_id: str
    title: str
    page_number: int
    total_pages: int
    original_page_number: int | None = None
    text: str


class ArchiveListOut(BaseModel):
    items: list[ArchiveItemOut]
    total: int


class TimelineEventOut(BaseModel):
    event_id: str
    date: str
    title: str
    description: str
    image: str
    verification_status: str
    related_archive_items: list[ArchiveItemOut] = []


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    limit: int = Field(default=6, ge=1, le=20)


class SearchResult(BaseModel):
    citation: Citation
    score: float


class ResearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=1000)
    limit: int = Field(default=5, ge=1, le=10)


class ResearchResponse(BaseModel):
    answer: str
    sources: list[Citation]
    mode: str
    insufficient_information: bool
