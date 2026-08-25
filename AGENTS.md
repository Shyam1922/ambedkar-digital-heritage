# Development Guide

- Keep the MVP grounded: sources must be represented in the data model and UI.
- Do not add OCR, authentication, translation, TTS, video/audio processing, or knowledge-graph features without an explicit scope change.
- Keep AI providers behind services; routes only validate and coordinate requests.
- Run backend tests and the frontend production build before handoff.
- Never commit `.env`, database files, generated indexes, or source media without verified rights.
