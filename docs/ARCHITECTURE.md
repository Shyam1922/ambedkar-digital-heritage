# Architecture

```text
React + Vite frontend
        ↓ REST / JSON
FastAPI API and services
   ↓              ↓
SQLite metadata   Retrieval / RAG services
   ↓              ↓
Archive items + chunks   FAISS index / OpenAI-compatible providers
```

SQLite is the authoritative source for archival metadata, document chunks, timeline events, and their relationships. FAISS is a rebuildable acceleration index, never the only source of metadata. The shipped fallback retrieval service ranks locally stored chunk text, allowing the demonstration to run with no remote credentials. The provider settings in `.env` reserve a clean OpenAI-compatible integration point for hosted embeddings and chat completion.

Ingestion accepts TXT and text-extractable PDFs. It separates extraction from chunking and indexing so an OCR extractor can be added later without changing the archive API.
