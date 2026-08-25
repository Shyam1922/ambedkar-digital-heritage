# Dr. B. R. Ambedkar Digital Heritage Archive

A compact Smart India Hackathon 2026 base MVP for browsing heritage material, finding relevant archival excerpts, asking grounded research questions, and exploring a connected historical timeline.

## Architecture

The React/Vite client calls a FastAPI REST API. FastAPI stores archive metadata, chunks and timeline links in SQLite. Local keyword retrieval is always available. The configuration reserves an OpenAI-compatible embedding/chat provider and a rebuildable FAISS index for a future semantic adapter. See [architecture notes](docs/ARCHITECTURE.md).

## Requirements

- Python 3.11+ (3.13 supported where dependency wheels are available)
- Node.js 20+

## Run locally

```powershell
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
Set-Location backend
uvicorn app.main:app --reload
```

In a second terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open `http://localhost:5173`. On first backend start, SQLite is initialized and the development seed archive is loaded.

## Environment

`DATABASE_URL`, `VECTOR_STORE_PATH`, `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`, `OPENAI_EMBEDDING_MODEL`, and `FRONTEND_ORIGINS` are documented in `.env.example`. Leave API credentials blank to use the transparent local fallback.

## API

- `GET /health`
- `GET /archive`, `GET /archive/{archive_id}`
- `GET /timeline`, `GET /timeline/{event_id}`
- `POST /search`
- `POST /research`, `POST /research/document/{archive_id}`

Research responses contain structured citations with archive ID, source, excerpt, optional page number, and a frontend detail route. With no relevant retrieval, the API explicitly reports insufficient archive information.

## Ingestion and data

`backend/app/services/ingestion.py` supports TXT and text-extractable PDF text extraction/chunking. Seed records are compact development excerpts with public-source attribution; review and replace them with institutionally verified full records before public release. Clearly label any later placeholders as `DEMO / NOT VERIFIED`.

## Tests

```powershell
Set-Location backend
pytest
Set-Location ..\frontend
npm run build
```

## Render deployment

`render.yaml` creates a static frontend and FastAPI service. Configure `VITE_API_URL` on the static site with the backend’s public URL, and set `FRONTEND_ORIGINS` on the backend to the static site URL. The backend service uses its persistent disk for SQLite and future vector-index files.

## Future roadmap

OCR, multilingual support, audio/video archives, authentication, advanced metadata tools, preservation workflows and knowledge graphs are deliberately excluded from this MVP.
