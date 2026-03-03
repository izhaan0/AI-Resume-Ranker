"""
Unit tests for the skill extraction service.
"""
import pytest
from app.services.extractor import extract_skills, compute_skill_overlap


class TestExtractSkills:
    def test_python_detected(self):
        text = "I am proficient in Python and FastAPI."
        skills = extract_skills(text)
        assert "Python" in skills

    def test_multiple_skills(self):
        text = "Skills: Python, Docker, PostgreSQL, React, AWS"
        skills = extract_skills(text)
        assert "Python" in skills
        assert "Docker" in skills
        assert "PostgreSQL" in skills

    def test_case_insensitive(self):
        text = "PYTHON and FASTAPI developer"
        skills = extract_skills(text)
        assert "Python" in skills
        assert "FastAPI" in skills

    def test_ml_skills(self):
        text = "Experience with machine learning, TensorFlow, and deep learning"
        skills = extract_skills(text)
        assert "Machine Learning" in skills
        assert "TensorFlow" in skills

    def test_empty_text(self):
        skills = extract_skills("")
        assert skills == []

    def test_no_skills(self):
        text = "I love cooking and playing football on weekends."
        skills = extract_skills(text)
        assert isinstance(skills, list)


class TestComputeSkillOverlap:
    def test_full_match(self):
        matched, missing = compute_skill_overlap(
            ["Python", "Docker", "AWS"],
            ["Python", "Docker", "AWS"],
        )
        assert set(matched) == {"Python", "Docker", "AWS"}
        assert missing == []

    def test_partial_match(self):
        matched, missing = compute_skill_overlap(
            ["Python", "Docker"],
            ["Python", "Docker", "Kubernetes"],
        )
        assert "Python" in matched
        assert "Docker" in matched
        assert "Kubernetes" in missing

    def test_no_match(self):
        matched, missing = compute_skill_overlap(
            ["React", "Vue.js"],
            ["Python", "FastAPI"],
        )
        assert matched == []
        assert len(missing) == 2

    def test_case_insensitive_matching(self):
        matched, missing = compute_skill_overlap(
            ["python", "docker"],
            ["Python", "Docker"],
        )
        assert len(matched) == 2
        assert len(missing) == 0

    def test_empty_jd_skills(self):
        matched, missing = compute_skill_overlap(["Python"], [])
        assert matched == []
        assert missing == []
