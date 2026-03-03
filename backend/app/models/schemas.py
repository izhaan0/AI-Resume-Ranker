"""
Pydantic schemas for request / response validation.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


# ── Parsed Resume ──────────────────────────────────────────────────────────────

class ParsedResume(BaseModel):
    """Structured data extracted from a single resume file."""
    filename: str
    raw_text: str = Field(exclude=True)          # excluded from API responses
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    experience_years: Optional[float] = None
    education: Optional[str] = None
    job_titles: list[str] = []
    summary: Optional[str] = None


# ── Ranked Candidate ───────────────────────────────────────────────────────────

class RankedCandidate(BaseModel):
    filename: str
    name: Optional[str] = None
    email: Optional[str] = None
    ats_score: float = Field(..., ge=0, le=100, description="0–100 relevance score")
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    experience_years: Optional[float] = None
    education: Optional[str] = None
    job_titles: list[str] = []
    summary: Optional[str] = None


# ── API Request / Response ────────────────────────────────────────────────────

class RankResponse(BaseModel):
    ranked_candidates: list[RankedCandidate]
    total: int
    job_description_preview: str     # first 200 chars of JD


class ParseResponse(BaseModel):
    filename: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    experience_years: Optional[float] = None
    education: Optional[str] = None
    job_titles: list[str] = []


# ── History ───────────────────────────────────────────────────────────────────

class HistoryEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_description_preview: str
    candidate_count: int
    top_score: float
    file_names: list[str] = []
    created_at: datetime


class HistoryResponse(BaseModel):
    sessions: list[HistoryEntry]
    total: int


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    models_loaded: bool
