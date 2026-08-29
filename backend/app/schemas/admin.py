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

class AdminDocumentOut(BaseModel):
    archive_id: str
    title: str
    verification_status: str
    short_summary: str


class AdminIngestionResponse(BaseModel):
    message: str
    document: AdminDocumentOut