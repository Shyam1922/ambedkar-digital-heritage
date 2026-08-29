import os
import tempfile
from pathlib import Path

# Point the application at an isolated, throwaway SQLite database *before* the
# app package is imported by any test module. Otherwise the suite runs against
# the real archive database and its ingest/delete tests leave residue in it
# (e.g. a stray TEST-ADMIN-001 record). An environment variable takes
# precedence over the .env file in pydantic-settings, so this wins.
_TEST_DB = Path(tempfile.gettempdir()) / "ambedkar_archive_test.db"
if _TEST_DB.exists():
    _TEST_DB.unlink()

os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB.as_posix()}"

# The app seeds this fresh database with the compact development excerpts on
# startup (via its lifespan handler), which satisfies the suite's expectations
# for seeded archive items, timeline events, and keyword search results.
