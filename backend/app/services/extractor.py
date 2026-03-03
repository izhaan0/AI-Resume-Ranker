"""
Skill & keyword extraction service using spaCy NLP.

Approach:
  1. Match against a curated tech-skills vocabulary (fast, deterministic)
  2. Use spaCy NER to catch additional proper nouns / org names as potential skills
  3. Deduplicate and normalise to title-case
"""
from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)

# ── Curated skills vocabulary ─────────────────────────────────────────────────
# Lower-cased for matching; displayed in canonical form below.

SKILLS_DB: dict[str, str] = {
    # Languages
    "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript",
    "java": "Java", "c++": "C++", "c#": "C#", "golang": "Go", "go": "Go",
    "rust": "Rust", "kotlin": "Kotlin", "swift": "Swift", "ruby": "Ruby",
    "php": "PHP", "scala": "Scala", "r": "R", "matlab": "MATLAB",
    "bash": "Bash", "shell": "Shell", "perl": "Perl",

    # Web / Frontend
    "react": "React", "reactjs": "React", "react.js": "React",
    "vue": "Vue.js", "vuejs": "Vue.js", "vue.js": "Vue.js",
    "angular": "Angular", "nextjs": "Next.js", "next.js": "Next.js",
    "html": "HTML", "css": "CSS", "tailwind": "Tailwind CSS",
    "sass": "Sass", "webpack": "Webpack", "vite": "Vite",

    # Backend / Frameworks
    "fastapi": "FastAPI", "django": "Django", "flask": "Flask",
    "express": "Express.js", "expressjs": "Express.js",
    "spring": "Spring", "springboot": "Spring Boot", "spring boot": "Spring Boot",
    "laravel": "Laravel", "rails": "Ruby on Rails",
    "graphql": "GraphQL", "rest": "REST APIs", "restful": "REST APIs",
    "grpc": "gRPC", "websocket": "WebSocket",

    # ML / AI
    "machine learning": "Machine Learning", "ml": "Machine Learning",
    "deep learning": "Deep Learning", "dl": "Deep Learning",
    "nlp": "NLP", "natural language processing": "NLP",
    "computer vision": "Computer Vision", "cv": "Computer Vision",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "keras": "Keras",
    "scikit-learn": "scikit-learn", "sklearn": "scikit-learn",
    "huggingface": "HuggingFace", "transformers": "Transformers",
    "llm": "LLMs", "langchain": "LangChain", "openai": "OpenAI API",
    "xgboost": "XGBoost", "lightgbm": "LightGBM",
    "pandas": "Pandas", "numpy": "NumPy", "scipy": "SciPy",
    "matplotlib": "Matplotlib", "seaborn": "Seaborn", "plotly": "Plotly",

    # Data / DBs
    "sql": "SQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "mysql": "MySQL", "sqlite": "SQLite", "mongodb": "MongoDB",
    "redis": "Redis", "elasticsearch": "Elasticsearch", "cassandra": "Cassandra",
    "dynamodb": "DynamoDB", "bigquery": "BigQuery", "snowflake": "Snowflake",
    "dbt": "dbt", "airflow": "Apache Airflow", "spark": "Apache Spark",
    "kafka": "Apache Kafka", "hadoop": "Hadoop",

    # Cloud / DevOps
    "aws": "AWS", "amazon web services": "AWS",
    "gcp": "GCP", "google cloud": "GCP",
    "azure": "Azure", "microsoft azure": "Azure",
    "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    "terraform": "Terraform", "ansible": "Ansible",
    "ci/cd": "CI/CD", "github actions": "GitHub Actions",
    "jenkins": "Jenkins", "gitlab": "GitLab", "git": "Git",
    "nginx": "Nginx", "linux": "Linux", "unix": "Unix",

    # Testing
    "pytest": "pytest", "jest": "Jest", "unittest": "unittest",
    "selenium": "Selenium", "cypress": "Cypress", "tdd": "TDD",

    # Misc
    "agile": "Agile", "scrum": "Scrum", "jira": "Jira",
    "microservices": "Microservices", "api": "API Development",
    "system design": "System Design", "data structures": "Data Structures",
    "algorithms": "Algorithms",
}


@lru_cache(maxsize=1)
def _load_spacy():
    """Load spaCy model once and cache it."""
    try:
        import spacy
        return spacy.load("en_core_web_sm", disable=["parser", "lemmatizer"])
    except Exception as exc:
        logger.warning("spaCy model not available: %s. Falling back to regex only.", exc)
        return None


def extract_skills(text: str) -> list[str]:
    """
    Extract tech skills from resume or JD text.
    Returns deduplicated, canonical skill names.
    """
    lower = text.lower()
    found: dict[str, str] = {}  # canonical_lower → display

    # ── Pass 1: vocabulary matching ───────────────────────
    for keyword, canonical in SKILLS_DB.items():
        # Word-boundary aware matching
        pattern = r"(?<![a-zA-Z0-9\-])" + re.escape(keyword) + r"(?![a-zA-Z0-9\-])"
        if re.search(pattern, lower):
            found[canonical.lower()] = canonical

    # ── Pass 2: spaCy NER (ORG / PRODUCT entities) ────────
    nlp = _load_spacy()
    if nlp:
        doc = nlp(text[:50_000])   # cap to avoid OOM on huge docs
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT"):
                name = ent.text.strip()
                key = name.lower()
                # Only add if not already found and looks like a tech term
                if key not in found and len(name) >= 2 and len(name) <= 30:
                    # Filter out obvious non-skills
                    if not any(stop in key for stop in ("university", "college", "school", "inc", "ltd", "llc")):
                        found[key] = name

    return sorted(found.values())


def extract_skills_from_jd(jd_text: str) -> list[str]:
    """Alias for JD — same logic, same vocabulary."""
    return extract_skills(jd_text)


def compute_skill_overlap(
    resume_skills: list[str],
    jd_skills: list[str],
) -> tuple[list[str], list[str]]:
    """
    Returns (matched_skills, missing_skills) based on case-insensitive comparison.
    """
    resume_lower = {s.lower() for s in resume_skills}
    jd_lower = {s.lower(): s for s in jd_skills}

    matched = [display for key, display in jd_lower.items() if key in resume_lower]
    missing = [display for key, display in jd_lower.items() if key not in resume_lower]
    return matched, missing
