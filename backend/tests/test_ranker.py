"""
Unit tests for the ranking / scoring logic.
"""
import pytest
from unittest.mock import patch
import numpy as np

from app.models.schemas import ParsedResume
from app.services.ranker import compute_ats_score, _skill_score, _experience_score


class TestSkillScore:
    def test_perfect_skill_match(self):
        score = _skill_score(["Python", "Docker", "AWS"], ["Python", "Docker", "AWS"])
        assert score == 100.0

    def test_half_match(self):
        score = _skill_score(["Python"], ["Python", "Docker"])
        assert score == 50.0

    def test_no_match(self):
        score = _skill_score([], ["Python", "Docker"])
        assert score == 0.0

    def test_empty_jd_skills(self):
        score = _skill_score(["Python"], [])
        assert score == 50.0   # neutral fallback


class TestExperienceScore:
    def test_ten_years(self):
        assert _experience_score(10.0) == 100.0

    def test_five_years(self):
        assert _experience_score(5.0) == 50.0

    def test_over_ten_years_capped(self):
        assert _experience_score(15.0) == 100.0

    def test_zero_years(self):
        assert _experience_score(0.0) == 0.0

    def test_none_experience(self):
        # Unknown experience → below-average fallback
        score = _experience_score(None)
        assert 0 <= score <= 60


class TestComputeAtsScore:
    def _make_resume(self, skills, exp_years, text="Python developer with FastAPI experience"):
        return ParsedResume(
            filename="test_resume.pdf",
            raw_text=text,
            name="Test User",
            skills=skills,
            experience_years=exp_years,
        )

    def test_score_in_range(self):
        resume = self._make_resume(["Python", "FastAPI"], 4.0)
        jd_skills = ["Python", "FastAPI", "Docker"]
        # Mock embedding to return neutral values
        dummy_emb = np.ones(384, dtype=np.float32) / np.sqrt(384)
        score, matched, missing = compute_ats_score(resume, jd_skills, dummy_emb)
        assert 0 <= score <= 100

    def test_matched_skills_correct(self):
        resume = self._make_resume(["Python", "Docker"], 3.0)
        jd_skills = ["Python", "Docker", "Kubernetes"]
        score, matched, missing = compute_ats_score(resume, jd_skills, None)
        assert "Python" in matched
        assert "Docker" in matched
        assert "Kubernetes" in missing

    def test_high_skill_match_gives_high_score(self):
        resume = self._make_resume(["Python", "FastAPI", "Docker", "AWS"], 8.0)
        jd_skills = ["Python", "FastAPI", "Docker", "AWS"]
        score, matched, missing = compute_ats_score(resume, jd_skills, None)
        # With perfect skill match + 8 yrs exp, score should be well above 50
        assert score > 50

    def test_no_skills_match_gives_low_score(self):
        resume = self._make_resume([], 0.0, text="I enjoy hiking and cooking.")
        jd_skills = ["Python", "FastAPI", "Docker", "Machine Learning"]
        score, matched, missing = compute_ats_score(resume, jd_skills, None)
        # No skills + no exp → low score
        assert score < 55
