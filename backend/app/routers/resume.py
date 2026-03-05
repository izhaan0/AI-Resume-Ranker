# """
# Resume router — handles file uploads, ranking, and single-resume parsing.
# """
# from __future__ import annotations

# import logging
# from pathlib import Path
# from typing import Annotated

# from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.config import get_settings
# from app.db.database import get_db, RankingSession
# from app.models.schemas import RankResponse, ParseResponse, RankedCandidate
# from app.services import ranker
# from app.services.parser import (
#     extract_text,
#     extract_name,
#     extract_email,
#     extract_phone,
#     extract_experience_years,
#     extract_education,
#     extract_job_titles,
# )
# from app.services.extractor import extract_skills
# from app.utils.file_utils import validate_file, save_upload_file, cleanup_files

# logger = logging.getLogger(__name__)
# settings = get_settings()

# router = APIRouter(prefix="/api", tags=["Resume"])


# # ── POST /api/rank ─────────────────────────────────────────────────────────────

# @router.post(
#     "/rank",
#     response_model=RankResponse,
#     summary="Rank resumes against a job description",
# )
# async def rank_resumes(
#     job_description: Annotated[str, Form(min_length=20, max_length=10_000)],
#     resumes: Annotated[list[UploadFile], File()],
#     db: AsyncSession = Depends(get_db),
# ):
#     """
#     Accept a job description and one or more resume files (PDF/DOCX).
#     Returns candidates ranked by ATS score (highest first).
#     """
#     if len(resumes) > settings.MAX_RESUMES_PER_REQUEST:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Maximum {settings.MAX_RESUMES_PER_REQUEST} resumes per request.",
#         )

#     # Validate all files first (before saving any)
#     for file in resumes:
#         validate_file(file)

#     # Save to temp directory
#     temp_paths: list[Path] = []
#     original_names: list[str] = []
#     try:
#         for file in resumes:
#             path = await save_upload_file(file, upload_dir=settings.UPLOAD_DIR)
#             temp_paths.append(path)
#             original_names.append(file.filename or path.name)

#         # Run ranking pipeline
#         resume_path_pairs = list(zip(temp_paths, original_names))
#         ranked: list[RankedCandidate] = ranker.rank_resumes(resume_path_pairs, job_description)

#         # Persist session to DB
#         top_score = ranked[0].ats_score if ranked else 0.0
#         session = RankingSession(
#             job_description_preview=job_description[:300],
#             candidate_count=len(ranked),
#             top_score=top_score,
#             file_names=original_names,
#         )
#         db.add(session)
#         await db.commit()

#     finally:
#         cleanup_files(temp_paths)

#     return RankResponse(
#         ranked_candidates=ranked,
#         total=len(ranked),
#         job_description_preview=job_description[:200],
#     )


# # ── POST /api/parse ────────────────────────────────────────────────────────────

# @router.post(
#     "/parse",
#     response_model=ParseResponse,
#     summary="Parse a single resume and return structured data",
# )
# async def parse_resume(
#     resume: Annotated[UploadFile, File()],
# ):
#     """
#     Parse a single PDF or DOCX resume.
#     Returns name, email, phone, skills, experience, and education.
#     """
#     validate_file(resume)
#     temp_path: Path | None = None
#     try:
#         temp_path = await save_upload_file(resume, upload_dir=settings.UPLOAD_DIR)
#         text = extract_text(temp_path)

#         return ParseResponse(
#             filename=resume.filename or temp_path.name,
#             name=extract_name(text),
#             email=extract_email(text),
#             phone=extract_phone(text),
#             skills=extract_skills(text),
#             experience_years=extract_experience_years(text),
#             education=extract_education(text),
#             job_titles=extract_job_titles(text),
#         )
#     finally:
#         if temp_path:
#             cleanup_files([temp_path])



"""
Resume router — handles file uploads, ranking, and single-resume parsing.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.database import get_db, RankingSession
from app.models.schemas import RankResponse, ParseResponse, RankedCandidate
from app.services import ranker
from app.services.parser import (
    extract_text,
    extract_name,
    extract_email,
    extract_phone,
    extract_experience_years,
    extract_education,
    extract_job_titles,
)
from app.services.extractor import extract_skills
from app.utils.file_utils import validate_file, save_upload_file, cleanup_files

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api", tags=["Resume"])


# ── POST /api/rank ─────────────────────────────────────────────────────────────

@router.post(
    "/rank",
    response_model=RankResponse,
    summary="Rank resumes against a job description",
)
async def rank_resumes(
    job_description: Annotated[str, Form(min_length=20, max_length=10_000)],
    resumes: Annotated[list[UploadFile], File()],
    db: AsyncSession = Depends(get_db),
):
    """
    Accept a job description and one or more resume files (PDF/DOCX).
    Returns candidates ranked by ATS score (highest first).
    """
    if len(resumes) > settings.MAX_RESUMES_PER_REQUEST:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {settings.MAX_RESUMES_PER_REQUEST} resumes per request.",
        )

    # Validate files
    for file in resumes:
        validate_file(file)

    temp_paths: list[Path] = []
    original_names: list[str] = []

    try:
        for file in resumes:
            path = await save_upload_file(file, upload_dir=settings.UPLOAD_DIR)
            temp_paths.append(path)
            original_names.append(file.filename or path.name)

        resume_path_pairs = list(zip(temp_paths, original_names))

        ranked: list[RankedCandidate] = ranker.rank_resumes(
            resume_path_pairs,
            job_description,
        )

        # Save session
        top_score = ranked[0].ats_score if ranked else 0.0

        session = RankingSession(
            job_description_preview=job_description[:300],
            candidate_count=len(ranked),
            top_score=top_score,
            file_names=original_names,
        )

        db.add(session)
        await db.commit()

        response = RankResponse(
            ranked_candidates=ranked,
            total=len(ranked),
            job_description_preview=job_description[:200],
        )

    finally:
        cleanup_files(temp_paths)

    # IMPORTANT FIX
    return {
        "payload": response
    }


# ── POST /api/parse ────────────────────────────────────────────────────────────

@router.post(
    "/parse",
    response_model=ParseResponse,
    summary="Parse a single resume and return structured data",
)
async def parse_resume(
    resume: Annotated[UploadFile, File()],
):
    """
    Parse a single PDF or DOCX resume.
    Returns name, email, phone, skills, experience, and education.
    """
    validate_file(resume)

    temp_path: Path | None = None

    try:
        temp_path = await save_upload_file(resume, upload_dir=settings.UPLOAD_DIR)

        text = extract_text(temp_path)

        response = ParseResponse(
            filename=resume.filename or temp_path.name,
            name=extract_name(text),
            email=extract_email(text),
            phone=extract_phone(text),
            skills=extract_skills(text),
            experience_years=extract_experience_years(text),
            education=extract_education(text),
            job_titles=extract_job_titles(text),
        )

        return response

    finally:
        if temp_path:
            cleanup_files([temp_path])