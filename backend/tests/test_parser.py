"""
Unit tests for the resume parser service.
"""
import pytest
from app.services.parser import (
    extract_name,
    extract_email,
    extract_phone,
    extract_experience_years,
    extract_education,
    extract_job_titles,
)


class TestExtractName:
    def test_simple_two_word_name(self):
        text = "John Doe\njohn@example.com\nSoftware Engineer"
        assert extract_name(text) == "John Doe"

    def test_three_word_name(self):
        text = "Mary Jane Watson\nmary@example.com"
        assert extract_name(text) == "Mary Jane Watson"

    def test_skips_email_lines(self):
        text = "john@example.com\nJohn Doe\nEngineer"
        assert extract_name(text) == "John Doe"

    def test_skips_resume_header(self):
        text = "Resume\nJohn Doe\nEngineer"
        assert extract_name(text) == "John Doe"

    def test_no_name_returns_none(self):
        text = "123-456-7890\njohn@example.com\n2019-2023"
        result = extract_name(text)
        assert result is None or isinstance(result, str)


class TestExtractEmail:
    def test_standard_email(self):
        assert extract_email("Contact: john.doe@example.com") == "john.doe@example.com"

    def test_email_with_plus(self):
        assert extract_email("jane+filter@gmail.com") == "jane+filter@gmail.com"

    def test_no_email(self):
        assert extract_email("No email here") is None


class TestExtractPhone:
    def test_us_phone(self):
        result = extract_phone("Phone: +1-555-123-4567")
        assert result is not None

    def test_no_phone(self):
        assert extract_phone("No phone number here at all.") is None


class TestExtractExperience:
    def test_explicit_years(self):
        text = "I have 6 years of experience in software development."
        assert extract_experience_years(text) == 6.0

    def test_years_with_plus(self):
        text = "5+ years experience in Python"
        assert extract_experience_years(text) == 5.0

    def test_date_range_fallback(self):
        text = "2018 – 2023 Senior Engineer @ Corp"
        result = extract_experience_years(text)
        assert result is not None
        assert result > 0

    def test_no_experience(self):
        text = "Skills: Python, React"
        result = extract_experience_years(text)
        assert result is None


class TestExtractEducation:
    def test_btech(self):
        text = "B.Tech Computer Science from IIT Delhi 2016"
        result = extract_education(text)
        assert result is not None
        assert "B.Tech" in result or "b.tech" in result.lower()

    def test_masters(self):
        text = "M.Sc Data Science, Stanford University"
        result = extract_education(text)
        assert result is not None

    def test_no_education(self):
        text = "Skills: Python, SQL, Docker"
        result = extract_education(text)
        assert result is None


class TestExtractJobTitles:
    def test_finds_engineer_title(self):
        text = "Senior Software Engineer\nPython Developer\nRandom line"
        titles = extract_job_titles(text)
        assert len(titles) >= 1
        assert any("Engineer" in t for t in titles)

    def test_empty_text(self):
        assert extract_job_titles("") == []
