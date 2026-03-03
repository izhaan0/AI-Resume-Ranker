"""
Sentence embedding service using sentence-transformers.

The model is loaded once at startup and cached for the lifetime of the process.
Embeddings are L2-normalised so cosine similarity == dot product.
"""
from __future__ import annotations

import logging
from functools import lru_cache
from typing import Optional

import numpy as np

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@lru_cache(maxsize=1)
def load_model():
    """
    Load the sentence-transformer model once.
    Returns None if the library is unavailable (degrades gracefully).
    """
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading embedding model: %s", settings.EMBEDDING_MODEL)
        model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully.")
        return model
    except Exception as exc:
        logger.error("Failed to load embedding model: %s", exc)
        return None


def embed_text(text: str) -> Optional[np.ndarray]:
    """
    Encode a single text string into a normalised embedding vector.
    Returns None if the model is unavailable.
    """
    model = load_model()
    if model is None:
        return None
    try:
        embedding = model.encode(text, normalize_embeddings=True, show_progress_bar=False)
        return np.array(embedding, dtype=np.float32)
    except Exception as exc:
        logger.error("Embedding failed: %s", exc)
        return None


def embed_batch(texts: list[str]) -> Optional[np.ndarray]:
    """
    Encode a batch of texts. Returns shape (N, D) numpy array or None.
    """
    model = load_model()
    if model is None:
        return None
    try:
        embeddings = model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False,
            batch_size=32,
        )
        return np.array(embeddings, dtype=np.float32)
    except Exception as exc:
        logger.error("Batch embedding failed: %s", exc)
        return None


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Cosine similarity between two L2-normalised vectors.
    Since they are normalised, this is just the dot product.
    """
    return float(np.dot(vec_a, vec_b))


def models_loaded() -> bool:
    """Check if the embedding model is available."""
    return load_model() is not None
