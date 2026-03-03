"""
File handling utilities — validation, temp storage, cleanup.
"""
import os
import uuid
import shutil
import logging
from pathlib import Path
from typing import Optional

from fastapi import UploadFile, HTTPException, status

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def validate_file(file: UploadFile) -> None:
    """Raise HTTPException if the uploaded file is invalid."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{ext}'. Only PDF and DOCX are accepted.",
        )


async def save_upload_file(file: UploadFile, upload_dir: str = "uploads") -> Path:
    """
    Save an uploaded file to a temporary location.
    Returns the Path to the saved file.
    """
    Path(upload_dir).mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "resume").suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = Path(upload_dir) / unique_name

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File '{file.filename}' exceeds the {settings.MAX_FILE_SIZE_MB} MB limit.",
        )

    dest.write_bytes(content)
    logger.debug("Saved upload: %s → %s (%.2f MB)", file.filename, dest, size_mb)
    return dest


def cleanup_files(paths: list[Path]) -> None:
    """Delete temporary files, silently ignore errors."""
    for p in paths:
        try:
            p.unlink(missing_ok=True)
        except Exception as exc:
            logger.warning("Could not delete temp file %s: %s", p, exc)


def get_file_extension(filename: Optional[str]) -> str:
    if not filename:
        return ""
    return Path(filename).suffix.lower()
