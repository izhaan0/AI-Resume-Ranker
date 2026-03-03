"""
Async SQLAlchemy database setup with SQLite (default) or PostgreSQL.
Switch DATABASE_URL in .env to use PostgreSQL.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, timezone

from app.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


# ── ORM Models ────────────────────────────────────────────────────────────────

class RankingSession(Base):
    __tablename__ = "ranking_sessions"

    id                      = Column(Integer, primary_key=True, index=True)
    job_description_preview = Column(String(300), nullable=False)
    candidate_count         = Column(Integer, default=0)
    top_score               = Column(Float, default=0.0)
    file_names              = Column(JSON, default=list)   # stored as JSON array
    created_at              = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ── Helpers ───────────────────────────────────────────────────────────────────

async def init_db() -> None:
    """Create all tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        yield session
