"""
Shared pytest fixtures for the ATS Ranker test suite.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.database import Base, get_db


# ── In-memory SQLite for tests ────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    """Create all tables before each test, drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    """Async HTTP client with DB dependency overridden."""
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ── Sample text fixtures ──────────────────────────────────────────────────────

@pytest.fixture
def sample_resume_text():
    return """
John Doe
john.doe@email.com | +1-555-123-4567

Senior Software Engineer with 6 years of experience in Python, FastAPI, and Machine Learning.

Skills: Python, FastAPI, Docker, PostgreSQL, Machine Learning, TensorFlow, React, AWS, Git

Experience:
2018 – 2024  Senior Engineer @ TechCorp
2016 – 2018  Junior Developer @ StartupXYZ

Education: B.Tech Computer Science, IIT Delhi
"""


@pytest.fixture
def sample_jd_text():
    return """
We are looking for a Senior ML Engineer with 4+ years of experience.
Required skills: Python, Machine Learning, Docker, FastAPI, PostgreSQL, AWS.
Nice to have: Kubernetes, TensorFlow, React.
"""
