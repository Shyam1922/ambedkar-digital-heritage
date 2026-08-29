from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

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

    def database_path(self) -> Path:
        return Path(
            self.database_url.replace("sqlite:///", "")
        ).resolve()


settings = Settings()