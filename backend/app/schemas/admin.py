from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=100)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminOut(BaseModel):
    id: int
    username: str


class AdminArchiveUpdate(BaseModel):
    """Editable metadata fields for an existing archive item.

    Only the fields provided are changed. The document body (extracted_text)
    and its chunks are produced by ingestion and are not editable here.
    """

    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    type: str | None = Field(default=None, min_length=1, max_length=80)
    date: str | None = Field(default=None, min_length=1, max_length=80)
    author_speaker: str | None = Field(default=None, max_length=300)
    language: str | None = Field(default=None, max_length=80)
    source: str | None = Field(default=None, max_length=300)
    source_url: str | None = Field(default=None, max_length=1000)
    tags: str | None = None
    verification_status: str | None = Field(default=None, max_length=40)

class AdminDocumentOut(BaseModel):
    archive_id: str
    title: str
    verification_status: str
    short_summary: str


class AdminIngestionResponse(BaseModel):
    message: str
    document: AdminDocumentOut