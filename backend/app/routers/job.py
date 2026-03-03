"""
Job / session router — history retrieval and health check.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.database import get_db, RankingSession
from app.models.schemas import HistoryEntry, HistoryResponse, HealthResponse
from app.services.embedder import models_loaded

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api", tags=["Job / Health"])


# ── GET /api/history ───────────────────────────────────────────────────────────

@router.get(
    "/history",
    response_model=HistoryResponse,
    summary="Retrieve past ranking sessions",
)
async def get_history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Return paginated list of past ranking sessions stored in the database."""
    total_q = await db.execute(select(func.count()).select_from(RankingSession))
    total = total_q.scalar_one()

    rows_q = await db.execute(
        select(RankingSession)
        .order_by(desc(RankingSession.created_at))
        .limit(limit)
        .offset(offset)
    )
    sessions = rows_q.scalars().all()

    entries = [
        HistoryEntry(
            id=s.id,
            job_description_preview=s.job_description_preview,
            candidate_count=s.candidate_count,
            top_score=s.top_score,
            file_names=s.file_names or [],
            created_at=s.created_at,
        )
        for s in sessions
    ]

    return HistoryResponse(sessions=entries, total=total)


# ── GET /api/health ────────────────────────────────────────────────────────────

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="API health check",
)
async def health_check():
    """Returns service status and whether NLP models are loaded."""
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        models_loaded=models_loaded(),
    )
