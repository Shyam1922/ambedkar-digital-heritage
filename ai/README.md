# AI Modules

This directory is reserved for independently runnable ingestion, embedding, retrieval, and RAG jobs. The Base MVP keeps the active service implementations in `backend/app/services` so the FastAPI deployment remains simple. Move batch-oriented code here as ingestion volume grows; preserve SQLite metadata as the source of truth.
