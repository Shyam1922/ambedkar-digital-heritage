from pathlib import Path
from pypdf import PdfReader


def extract_text(path: Path) -> list[tuple[int | None, str]]:
    if path.suffix.lower() == ".txt":
        return [(None, path.read_text(encoding="utf-8"))]
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(str(path))
        return [(number + 1, page.extract_text() or "") for number, page in enumerate(reader.pages)]
    raise ValueError("Only TXT and text-extractable PDF files are supported.")


def chunk_text(text: str, size: int = 700, overlap: int = 100) -> list[str]:
    clean = " ".join(text.split())
    chunks: list[str] = []
    start = 0
    while start < len(clean):
        end = min(len(clean), start + size)
        if end < len(clean):
            boundary = clean.rfind(" ", start, end)
            end = boundary if boundary > start else end
        chunks.append(clean[start:end])
        start = max(end - overlap, start + 1)
    return [chunk for chunk in chunks if chunk]
