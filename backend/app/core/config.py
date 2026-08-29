from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# backend/ directory (parent of the app package). Used to anchor relative
# paths so the process working directory can never change which database or
# .env file is used.
BASE_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT = BASE_DIR.parent
ENV_FILE = REPO_ROOT / ".env"

_SQLITE_PREFIX = "sqlite:///"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ENV_FILE), extra="ignore")

    database_url: str = "sqlite:///./archive.db"
    vector_store_path: str = "../data/processed/archive.faiss"

    openai_base_url: str = "https://api.openai.com/v1"
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    frontend_origins: str = "http://localhost:5173"

    # Admin authentication
    secret_key: str = "change-this-to-a-secure-secret-key"

    @property
    def origins(self) -> list[str]:
        return [
            value.strip()
            for value in self.frontend_origins.split(",")
            if value.strip()
        ]

    @property
    def resolved_database_url(self) -> str:
        """Database URL with relative sqlite paths anchored to backend/.

        ``sqlite:///./archive.db`` otherwise resolves against the current
        working directory, which silently produces a different (seed-only)
        database when the app is launched from the repository root instead of
        backend/. Anchoring to BASE_DIR guarantees a single canonical file.
        Absolute paths and non-sqlite URLs are returned unchanged.
        """
        if not self.database_url.startswith(_SQLITE_PREFIX):
            return self.database_url

        raw = self.database_url[len(_SQLITE_PREFIX):]
        if not raw or raw == ":memory:":
            return self.database_url

        path = Path(raw)
        if not path.is_absolute():
            path = (BASE_DIR / path).resolve()
        return f"{_SQLITE_PREFIX}{path.as_posix()}"

    def database_path(self) -> Path:
        return Path(
            self.resolved_database_url.replace(_SQLITE_PREFIX, "")
        ).resolve()


settings = Settings()