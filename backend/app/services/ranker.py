"""
Resume ranking & ATS scoring service.

Scoring formula (weighted):
  - Semantic similarity (embedding cosine)  → 60 %
  - Skill overlap ratio                     → 30 %
  - Experience bonus                        → 10 %

All three components are normalised to [0, 100] before weighting.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import numpy as np

from app.models.schemas import ParsedResume, RankedCandidate
from app.services import parser, extractor, embedder

logger = logging.getLogger(__name__)

# ── Weights ───────────────────────────────────────────────────────────────────
W_SEMANTIC   = 0.60
W_SKILL      = 0.30
W_EXPERIENCE = 0.10

# Experience years considered "full marks" for the experience component
MAX_EXP_YEARS = 10.0


# ── Resume parsing pipeline ───────────────────────────────────────────────────

def parse_resume_file(path: Path, original_filename: str) -> ParsedResume:
    """Parse a single resume file into a structured ParsedResume object."""
    raw_text = parser.extract_text(path)

    skills    = extractor.extract_skills(raw_text)
    exp_years = parser.extract_experience_years(raw_text)

    # Generate a brief summary from the first meaningful lines
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    summary_text = " ".join(lines[:6])[:400] if lines else None

    return ParsedResume(
        filename=original_filename,
        raw_text=raw_text,
        name=parser.extract_name(raw_text),
        email=parser.extract_email(raw_text),
        phone=parser.extract_phone(raw_text),
        skills=skills,
        experience_years=exp_years,
        education=parser.extract_education(raw_text),
        job_titles=parser.extract_job_titles(raw_text),
        summary=summary_text,
    )


# ── Scoring ───────────────────────────────────────────────────────────────────

def _semantic_score(resume_text: str, jd_embedding: Optional[np.ndarray]) -> float:
    """Returns 0–100 semantic similarity score."""
    if jd_embedding is None:
        return 50.0   # neutral fallback when model unavailable

    resume_emb = embedder.embed_text(resume_text)
    if resume_emb is None:
        return 50.0

    sim = embedder.cosine_similarity(jd_embedding, resume_emb)
    # Cosine similarity is in [-1, 1]; map to [0, 100]
    return round(max(0.0, (sim + 1) / 2 * 100), 2)


def _skill_score(matched: list[str], jd_skills: list[str]) -> float:
    """Returns 0–100 based on fraction of JD skills found in resume."""
    if not jd_skills:
        return 50.0
    return round(len(matched) / len(jd_skills) * 100, 2)


def _experience_score(exp_years: Optional[float]) -> float:
    """Returns 0–100 based on years of experience (capped at MAX_EXP_YEARS)."""
    if exp_years is None:
        return 40.0   # unknown → below average
    return round(min(exp_years / MAX_EXP_YEARS * 100, 100), 2)


def compute_ats_score(
    resume: ParsedResume,
    jd_skills: list[str],
    jd_embedding: Optional[np.ndarray],
) -> tuple[float, list[str], list[str]]:
    """
    Compute the final ATS score for a resume against a job description.

    Returns:
        (ats_score, matched_skills, missing_skills)
    """
    matched, missing = extractor.compute_skill_overlap(resume.skills, jd_skills)

    sem   = _semantic_score(resume.raw_text, jd_embedding)
    skill = _skill_score(matched, jd_skills)
    exp   = _experience_score(resume.experience_years)

    ats = round(
        W_SEMANTIC   * sem   +
        W_SKILL      * skill +
        W_EXPERIENCE * exp,
        1,
    )
    return ats, matched, missing


# ── Main ranking entry point ──────────────────────────────────────────────────

def rank_resumes(
    resume_paths: list[tuple[Path, str]],   # (temp_path, original_filename)
    job_description: str,
) -> list[RankedCandidate]:
    """
    Parse, score and rank a list of resume files against a job description.

    Args:
        resume_paths: list of (temp file path, original filename) tuples
        job_description: raw JD text

    Returns:
        Sorted list of RankedCandidate (highest score first)
    """
    if not resume_paths:
        return []

    logger.info("Ranking %d resumes…", len(resume_paths))

    # Precompute JD embedding and skills once
    jd_embedding = embedder.embed_text(job_description)
    jd_skills    = extractor.extract_skills_from_jd(job_description)

    logger.debug("JD skills detected: %s", jd_skills)

    ranked: list[RankedCandidate] = []

    for path, original_filename in resume_paths:
        try:
            resume = parse_resume_file(path, original_filename)
            score, matched, missing = compute_ats_score(resume, jd_skills, jd_embedding)

            ranked.append(RankedCandidate(
                filename=resume.filename,
                name=resume.name,
                email=resume.email,
                ats_score=score,
                matched_skills=matched,
                missing_skills=missing,
                experience_years=resume.experience_years,
                education=resume.education,
                job_titles=resume.job_titles,
                summary=resume.summary,
            ))
            logger.debug("Scored %s → %.1f", original_filename, score)

        except Exception as exc:
            logger.error("Failed to process %s: %s", original_filename, exc)
            # Include a zero-score entry so the user knows it failed
            ranked.append(RankedCandidate(
                filename=original_filename,
                name=None,
                ats_score=0.0,
                matched_skills=[],
                missing_skills=jd_skills,
                summary=f"⚠ Could not parse this file: {exc}",
            ))

    ranked.sort(key=lambda c: c.ats_score, reverse=True)
    logger.info("Ranking complete. Top score: %.1f", ranked[0].ats_score if ranked else 0)
    return ranked
