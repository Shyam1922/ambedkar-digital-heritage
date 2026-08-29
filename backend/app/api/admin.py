from pathlib import Path
import shutil

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    decode_access_token,
    verify_password,
)
from app.db.database import get_db
from app.models import Admin, ArchiveItem
from app.schemas.archive import ArchiveItemOut
from app.schemas.admin import (
    AdminLoginRequest,
    AdminOut,
    AdminArchiveUpdate,
    TokenResponse,
    AdminIngestionResponse,
    AdminDocumentOut,
)
from app.services.admin_ingestion import ingest_document


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

security = HTTPBearer()

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Admin:

    username = decode_access_token(
        credentials.credentials
    )

    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    admin = db.scalar(
        select(Admin).where(
            Admin.username == username
        )
    )

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found",
        )

    return admin


def archive_out(item: ArchiveItem) -> ArchiveItemOut:
    return ArchiveItemOut(
        archive_id=item.archive_id,
        title=item.title,
        description=item.description,
        type=item.type,
        date=item.date,
        author_speaker=item.author_speaker,
        language=item.language,
        source=item.source,
        source_url=item.source_url,
        tags=[
            tag.strip()
            for tag in item.tags.split(",")
            if tag.strip()
        ],
        file_path=item.file_path,
        extracted_text=item.extracted_text,
        verification_status=item.verification_status,
        short_summary=item.short_summary,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: AdminLoginRequest,
    db: Session = Depends(get_db),
):
    admin = db.scalar(
        select(Admin).where(
            Admin.username == payload.username
        )
    )

    if not admin or not verify_password(
        payload.password,
        admin.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(
        admin.username
    )

    return TokenResponse(
        access_token=token
    )


@router.get(
    "/me",
    response_model=AdminOut,
)
def get_me(
    admin: Admin = Depends(get_current_admin),
):
    return AdminOut(
        id=admin.id,
        username=admin.username,
    )


@router.get("/archive", response_model=list[ArchiveItemOut])
def admin_list_archive(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    items = db.scalars(
        select(ArchiveItem)
        .order_by(ArchiveItem.created_at.desc())
    ).all()

    return [archive_out(item) for item in items]


@router.get("/archive/{archive_id}", response_model=ArchiveItemOut)
def admin_get_archive_item(
    archive_id: str,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    item = db.scalar(
        select(ArchiveItem).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archive item not found",
        )

    return archive_out(item)


@router.patch("/archive/{archive_id}", response_model=ArchiveItemOut)
def admin_update_archive_item(
    archive_id: str,
    payload: AdminArchiveUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    item = db.scalar(
        select(ArchiveItem).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archive item not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields provided to update",
        )

    for field, value in updates.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return archive_out(item)


@router.post("/archive", response_model=ArchiveItemOut)
def admin_create_archive_item(
    archive_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    type: str | None = Form(None),
    document_type: str | None = Form(None),
    date: str = Form(...),
    author_speaker: str = Form(...),
    language: str = Form("English"),
    source: str = Form(...),
    source_url: str = Form(""),
    tags: str = Form(""),
    content_start_page: int = Form(1),
    file: UploadFile = File(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    doc_type = type or document_type or "Document"

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File is required",
        )

    suffix = Path(file.filename).suffix.lower()

    if suffix not in {".pdf", ".txt"}:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported",
        )

    existing = db.scalar(
        select(ArchiveItem).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Archive ID already exists",
        )

    safe_name = f"{archive_id}{suffix}"
    file_path = UPLOAD_DIR / safe_name

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        item = ingest_document(
            db=db,
            archive_id=archive_id,
            title=title,
            description=description,
            document_type=doc_type,
            date=date,
            author_speaker=author_speaker,
            language=language,
            source=source,
            source_url=source_url,
            tags=tags,
            file_path=file_path,
            content_start_page=content_start_page,
        )

    except ValueError as exc:
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        if file_path.exists():
            file_path.unlink()

        raise

    return archive_out(item)


@router.delete("/archive/{archive_id}")
def admin_delete_archive(
    archive_id: str,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    item = db.scalar(
        select(ArchiveItem).where(
            ArchiveItem.archive_id == archive_id
        )
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archive item not found",
        )

    if item.file_path:
        file_path = Path(item.file_path)
        if file_path.exists() and file_path.is_file():
            try:
                file_path.unlink()
            except Exception:
                pass

    db.delete(item)
    db.commit()

    return {
        "message": "Archive item deleted successfully",
        "archive_id": archive_id,
    }


@router.post(
    "/documents/ingest",
    response_model=AdminIngestionResponse,
)
def ingest_archive_document(
    archive_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    document_type: str = Form(...),
    date: str = Form(...),
    author_speaker: str = Form(...),
    language: str = Form("English"),
    source: str = Form(...),
    source_url: str = Form(""),
    tags: str = Form(""),
    content_start_page: int = Form(1),
    file: UploadFile = File(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    item = admin_create_archive_item(
        archive_id=archive_id,
        title=title,
        description=description,
        type=document_type,
        document_type=document_type,
        date=date,
        author_speaker=author_speaker,
        language=language,
        source=source,
        source_url=source_url,
        tags=tags,
        content_start_page=content_start_page,
        file=file,
        admin=admin,
        db=db,
    )

    return AdminIngestionResponse(
        message="Document ingested successfully",
        document=AdminDocumentOut(
            archive_id=item.archive_id,
            title=item.title,
            verification_status=item.verification_status,
            short_summary=item.short_summary,
        ),
    )