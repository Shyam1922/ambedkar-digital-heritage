# Dr. B. R. Ambedkar — Digital Heritage Archive

A Smart India Hackathon 2026 project: a complete digital archive of Dr. B. R. Ambedkar's
writings, speeches and constitutional work, with full page-by-page document reading,
grounded AI research, an interactive timeline, and an integrated admin portal.

There is **one FastAPI backend** (the source of truth) and **one React website** that
consumes it. A native exhibition **kiosk** is a separate, future application — its
backend APIs already exist, but its UI is intentionally **not** part of this repo.

```
                       ┌──────────────────────────┐
   Admin uploads PDF → │      FastAPI backend      │
                       │  ingest · retrieval · RAG │
                       │  public / admin / kiosk   │
                       └────────────┬─────────────┘
                                    │ REST
                       ┌────────────┴─────────────┐
                       │      Public website       │  ← this repo (React + Vite)
                       │  archive · reader · search │
                       │  timeline · research · admin│
                       └──────────────────────────┘
```

## Features

- **Archive Explorer** — browse, search and filter every document.
- **Full Document Reader** (`/archive/{id}/read`) — the complete extracted text, page by page.
- **Historical Timeline** with events linked to their source documents.
- **Ask the Archive** — grounded retrieval + RAG with citations (archive id, title, source, page, excerpt, link).
- **Admin Portal** (`/admin`) — login, upload + ingest PDFs, edit metadata, verify/unverify, delete.
- **Works with no API key** — search and research use local extractive retrieval by default;
  an OpenAI-compatible LLM is used only if you configure one.

## Requirements

- **Python 3.11+** (3.13 works where dependency wheels are available)
- **Node.js 20+**
- Optional, only if you re-ingest scanned PDFs: **Tesseract OCR** and **Poppler**
  (the ingestion pipeline falls back to OCR for image-only pages).

## Quick start

Clone, then run the backend and the frontend in two terminals. On first start the backend
creates a local SQLite database and seeds it with short development excerpts, so the whole
app is testable immediately — no ingestion required.

### 1. Backend (terminal 1)

```bash
git clone https://github.com/Shyam1922/ambedkar-digital-heritage.git
cd ambedkar-digital-heritage
cp .env.example .env                     # PowerShell: Copy-Item .env.example .env
python -m venv .venv
source .venv/Scripts/activate            # macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload            # serves http://localhost:8000
```

### 2. Frontend (terminal 2)

```bash
cd frontend
cp .env.example .env                     # PowerShell: Copy-Item .env.example .env
npm install
npm run dev                              # serves http://localhost:5173
```

Open **http://localhost:5173**.

### Admin portal

A default admin account is seeded on first run:

- URL: **http://localhost:5173/admin/login** (also linked in the site footer)
- Username: `admin`  ·  Password: `admin123`

> Change `SECRET_KEY` in `.env` and the seeded password before any real deployment.

## Building the full archive (optional)

The quick start runs on short seed excerpts. The full documents (e.g. the complete
*Annihilation of Caste*, the *Constitution of India*, etc.) are built by ingesting the
PDFs included under `data/raw/`. This needs Tesseract + Poppler for the OCR fallback.

```bash
cd backend
python scripts/reingest_all_documents.py   # ingest A-001…A-010 (except A-008)
python scripts/fix_a008.py                  # ingest A-008 as the Constitution of India
python scripts/generate_summaries.py        # (re)generate the short kiosk summaries
```

The generated database (`backend/archive.db`) is git-ignored, so each clone builds its own.

## API overview

| Scope  | Endpoints |
|--------|-----------|
| Public | `GET /archive`, `GET /archive/{id}`, `GET /archive/{id}/pages/{page}`, `GET /timeline`, `GET /timeline/{id}`, `POST /search`, `POST /research`, `POST /research/document/{id}` |
| Admin  | `POST /admin/login`, `GET /admin/me`, `GET /admin/archive`, `GET /admin/archive/{id}`, `POST /admin/archive`, `PATCH /admin/archive/{id}`, `DELETE /admin/archive/{id}` |
| Kiosk  | `GET /kiosk/archive`, `GET /kiosk/archive/{id}`, `GET /kiosk/timeline`, `GET /kiosk/timeline/{id}`, `GET /kiosk/search` |

Kiosk responses are restricted by schema and never include the full `extracted_text`.
Interactive API docs are available at **http://localhost:8000/docs**.

## Search & research (no key required)

Retrieval ranks stored document chunks locally and always returns grounded excerpts with
citations. If an OpenAI-compatible provider is configured (`OPENAI_API_KEY` etc. in `.env`),
`/research` uses it to synthesise an answer from the retrieved context; otherwise it returns
a transparent extractive answer. Either way, answers are grounded in the archive and the API
reports honestly when there is insufficient information.

## Tests

```bash
# backend — run from the repo root (pyproject.toml configures the paths)
pytest

# frontend — production build
cd frontend
npm run build
```

The backend tests use an isolated throwaway database, so they never touch `backend/archive.db`.

## Environment

`.env` (repo root) configures the backend. See `.env.example`:

`DATABASE_URL`, `VECTOR_STORE_PATH`, `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`,
`OPENAI_EMBEDDING_MODEL`, `FRONTEND_ORIGINS`, `SECRET_KEY`. Leave the OpenAI values blank to
use the local fallback. `frontend/.env` sets `VITE_API_BASE_URL` (defaults to
`http://localhost:8000`).

Relative `sqlite:///` paths in `DATABASE_URL` are resolved against `backend/`, so the same
database is used no matter which directory you launch from.

## Project structure

```
backend/
  app/
    api/         routes.py (public) · admin.py · kiosk.py
    core/        config.py · security.py
    db/          database.py
    models/      archive.py · admin.py
    schemas/     archive.py · admin.py
    services/    archive_ingest.py · ingestion.py · retrieval.py · rag.py · summary.py · seed.py
    main.py
  scripts/       reingest_all_documents.py · fix_a008.py · generate_summaries.py · create_admin.py
  tests/
frontend/
  src/
    api/         client.ts · archive.ts · timeline.ts · research.ts · admin.ts · auth.ts
    components/  Layout.tsx · AdminLayout.tsx · ArchiveCard.tsx · Citations.tsx · UIState.tsx
    pages/       Home · Archive · ArchiveDetail · DocumentReader · Timeline · TimelineDetail · Research · Admin*
data/raw/        source PDFs (A-001…A-010)
```

## Deployment

`render.yaml` provisions a static frontend and a FastAPI service on Render. Set
`VITE_API_BASE_URL` on the static site to the backend URL, and `FRONTEND_ORIGINS` on the
backend to the static site URL.

## Roadmap

The native kiosk application (touchscreen exhibition UI with QR hand-off to the website),
semantic vector search, and multilingual support are planned and deliberately out of scope
for this repository.
