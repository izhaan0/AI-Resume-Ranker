"""
Centralised application settings loaded from environment variables / .env file.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── App ────────────────────────────────────────────────
    APP_NAME: str = "ATS Ranker API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── CORS ───────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # ── File upload limits ─────────────────────────────────
    MAX_FILE_SIZE_MB: int = 10
    MAX_RESUMES_PER_REQUEST: int = 20
    UPLOAD_DIR: str = "uploads"

    # ── ML / NLP ───────────────────────────────────────────
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"   # fast + accurate for resume matching
    SPACY_MODEL: str = "en_core_web_sm"

    # ── Database ───────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./ats_ranker.db"

    # ── History ────────────────────────────────────────────
    MAX_HISTORY_SESSIONS: int = 100


@lru_cache
def get_settings() -> Settings:
    return Settings()
