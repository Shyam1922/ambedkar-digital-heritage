from pathlib import Path
from collections import Counter

from pypdf import PdfReader
from pdf2image import convert_from_path
import pytesseract


TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\Users\Lenovo\Downloads\Compressed\poppler-26.02.0\Library\bin"


def _looks_like_bad_extraction(text: str) -> bool:
    """
    Detect suspicious PDF text extraction.

    Some PDFs contain a broken text layer where pypdf technically
    extracts text, but the same phrase/object is repeated hundreds
    of times. In that situation OCR should be used instead.
    """

    text = text.strip()

    if not text:
        return True

    words = text.split()

    # Very small pages are usually not worth treating as corrupted.
    if len(words) < 40:
        return False

    # ---------------------------------------------------------
    # Check 1: repeated word sequences
    # ---------------------------------------------------------
    #
    # Example of corrupted extraction:
    #
    # "The Conference was to meet at Easter..."
    # "The Conference was to meet at Easter..."
    # "The Conference was to meet at Easter..."
    #
    # We look for repeated 8-word sequences.
    # ---------------------------------------------------------

    n = 8

    if len(words) >= n:
        ngrams = [
            tuple(words[i:i + n])
            for i in range(len(words) - n + 1)
        ]

        counts = Counter(ngrams)

        repeated = sum(
            count - 1
            for count in counts.values()
            if count > 1
        )

        repetition_ratio = repeated / len(ngrams)

        # A healthy page normally has very few repeated
        # 8-word sequences. A corrupted PDF can have a huge
        # repetition ratio.
        if repetition_ratio > 0.20:
            return True

    # ---------------------------------------------------------
    # Check 2: suspiciously repeated long chunks
    # ---------------------------------------------------------

    if len(text) > 15000:
        # Compare how many unique words exist relative to
        # the total number of words.
        unique_ratio = len(set(words)) / len(words)

        if unique_ratio < 0.12:
            return True

    return False


def _extract_pdf_page(
    reader: PdfReader,
    page_number: int,
) -> str:
    """
    Extract one page using pypdf.
    Returns an empty string if extraction fails.
    """

    try:
        page = reader.pages[page_number - 1]
        return page.extract_text() or ""
    except Exception as exc:
        print(
            f"pypdf extraction failed on page {page_number}: {exc}"
        )
        return ""


def _ocr_page(
    pdf_path: Path,
    page_number: int,
) -> str:
    """
    OCR a single PDF page.
    """

    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

    try:
        images = convert_from_path(
            str(pdf_path),
            dpi=300,
            first_page=page_number,
            last_page=page_number,
            poppler_path=POPPLER_PATH,
        )

        if not images:
            return ""

        text = pytesseract.image_to_string(
            images[0],
            lang="eng",
        )

        return text or ""

    except Exception as exc:
        print(
            f"OCR failed on page {page_number}: {exc}"
        )
        return ""


def extract_text(
    path: Path,
) -> list[tuple[int | None, str]]:
    """
    Extract text from TXT or PDF files.

    For PDFs:
    1. Try pypdf text extraction page-by-page.
    2. Check whether the extracted text looks corrupted.
    3. If a page looks corrupted, OCR only that page.
    """

    # ---------------------------------------------------------
    # TXT
    # ---------------------------------------------------------

    if path.suffix.lower() == ".txt":
        return [
            (
                None,
                path.read_text(encoding="utf-8"),
            )
        ]

    # ---------------------------------------------------------
    # PDF
    # ---------------------------------------------------------

    if path.suffix.lower() == ".pdf":

        reader = PdfReader(str(path))

        pages: list[tuple[int | None, str]] = []

        total_pages = len(reader.pages)

        print(
            f"Processing PDF: {path.name}"
        )
        print(
            f"Total pages: {total_pages}"
        )

        for page_number in range(1, total_pages + 1):

            print(
                f"Extracting page {page_number}/{total_pages}..."
            )

            # First try the normal PDF text layer.
            text = _extract_pdf_page(
                reader,
                page_number,
            )

            # -------------------------------------------------
            # Decide whether pypdf extraction is trustworthy.
            # -------------------------------------------------

            if text.strip() and not _looks_like_bad_extraction(text):

                print(
                    f"  Page {page_number}: using PDF text layer"
                )

                pages.append(
                    (
                        page_number,
                        text,
                    )
                )

            else:

                if text.strip():
                    print(
                        f"  Page {page_number}: suspicious text detected"
                    )
                else:
                    print(
                        f"  Page {page_number}: no usable text detected"
                    )

                print(
                    f"  Page {page_number}: falling back to OCR"
                )

                ocr_text = _ocr_page(
                    path,
                    page_number,
                )

                pages.append(
                    (
                        page_number,
                        ocr_text,
                    )
                )

        return pages

    # ---------------------------------------------------------
    # Unsupported file
    # ---------------------------------------------------------

    raise ValueError(
        "Only TXT and PDF files are supported."
    )


def chunk_text(
    pages: list[tuple[int | None, str]],
    size: int = 700,
    overlap: int = 100,
) -> list[tuple[int | None, str]]:
    """
    Split extracted text into chunks while preserving
    the original page number.
    """

    chunks: list[tuple[int | None, str]] = []

    for page_number, text in pages:

        # Normalize whitespace.
        clean = " ".join(text.split())

        start = 0

        while start < len(clean):

            end = min(
                len(clean),
                start + size,
            )

            if end < len(clean):

                boundary = clean.rfind(
                    " ",
                    start,
                    end,
                )

                if boundary > start:
                    end = boundary

            chunk = clean[start:end]

            if chunk:
                chunks.append(
                    (
                        page_number,
                        chunk,
                    )
                )

            # The final chunk must terminate the page.  Advancing by the
            # overlap here used to emit the last N characters repeatedly
            # (N, N-1, ..., 1), producing thousands of tiny fragments.
            if end >= len(clean):
                break

            # Move forward while preserving overlap.
            start = max(
                end - overlap,
                start + 1,
            )

    return chunks


def stitch_chunks(chunks: list[str]) -> str:
    """Reconstruct display text from overlapping retrieval chunks.

    Chunks deliberately share a suffix/prefix for retrieval continuity. They
    must therefore never be joined with a plain space for document display.
    """
    if not chunks:
        return ""

    text = chunks[0]
    for chunk in chunks[1:]:
        max_overlap = min(len(text), len(chunk))
        overlap_length = 0
        for length in range(max_overlap, 0, -1):
            if text[-length:] == chunk[:length]:
                overlap_length = length
                break
        text += chunk[overlap_length:]
    return text
