"""
Integration tests for the FastAPI endpoints.
Tests use an in-memory SQLite DB and mock the file parsing pipeline.
"""
import pytest
import pytest_asyncio
import io
from unittest.mock import patch, MagicMock

from app.models.schemas import RankedCandidate


MOCK_RANKED = [
    RankedCandidate(
        filename="alice.pdf",
        name="Alice Smith",
        ats_score=88.5,
        matched_skills=["Python", "FastAPI"],
        missing_skills=["Docker"],
        experience_years=5.0,
    ),
    RankedCandidate(
        filename="bob.docx",
        name="Bob Jones",
        ats_score=62.0,
        matched_skills=["Python"],
        missing_skills=["FastAPI", "Docker"],
        experience_years=2.0,
    ),
]


@pytest.mark.asyncio
async def test_health_check(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "version" in body


@pytest.mark.asyncio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    assert "name" in resp.json()


@pytest.mark.asyncio
async def test_rank_resumes_success(client):
    """Rank endpoint should return sorted candidates."""
    with patch("app.routers.resume.ranker.rank_resumes", return_value=MOCK_RANKED), \
         patch("app.utils.file_utils.save_upload_file") as mock_save, \
         patch("app.utils.file_utils.cleanup_files"):
        from pathlib import Path
        mock_save.return_value = Path("/tmp/fake_resume.pdf")

        pdf_bytes = b"%PDF-1.4 fake content"
        files = [
            ("resumes", ("alice.pdf", io.BytesIO(pdf_bytes), "application/pdf")),
        ]
        data = {"job_description": "We need a Python developer with FastAPI and Docker experience."}

        resp = await client.post("/api/rank", data=data, files=files)

    assert resp.status_code == 200
    body = resp.json()
    assert "ranked_candidates" in body
    assert body["total"] == len(MOCK_RANKED)
    # First candidate should have highest score
    assert body["ranked_candidates"][0]["ats_score"] >= body["ranked_candidates"][1]["ats_score"]


@pytest.mark.asyncio
async def test_rank_too_short_jd(client):
    """Job description shorter than 20 chars should return 422."""
    pdf_bytes = b"%PDF-1.4 fake"
    files = [("resumes", ("r.pdf", io.BytesIO(pdf_bytes), "application/pdf"))]
    resp = await client.post("/api/rank", data={"job_description": "Too short"}, files=files)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_rank_unsupported_file_type(client):
    """Non-PDF/DOCX files should return 415."""
    txt_bytes = b"plain text resume"
    files = [("resumes", ("resume.txt", io.BytesIO(txt_bytes), "text/plain"))]
    data = {"job_description": "Looking for a Python developer with 3+ years of experience."}
    resp = await client.post("/api/rank", data=data, files=files)
    assert resp.status_code == 415


@pytest.mark.asyncio
async def test_history_empty(client):
    """History should return empty list on a fresh DB."""
    resp = await client.get("/api/history")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 0
    assert body["sessions"] == []


@pytest.mark.asyncio
async def test_history_after_rank(client):
    """History should record a session after a successful rank call."""
    with patch("app.routers.resume.ranker.rank_resumes", return_value=MOCK_RANKED), \
         patch("app.utils.file_utils.save_upload_file") as mock_save, \
         patch("app.utils.file_utils.cleanup_files"):
        from pathlib import Path
        mock_save.return_value = Path("/tmp/fake.pdf")

        pdf_bytes = b"%PDF-1.4 fake"
        files = [("resumes", ("alice.pdf", io.BytesIO(pdf_bytes), "application/pdf"))]
        data = {"job_description": "Python FastAPI engineer with Docker and cloud experience needed."}
        await client.post("/api/rank", data=data, files=files)

    resp = await client.get("/api/history")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
