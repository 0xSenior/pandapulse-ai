"""Core configuration and settings for PandaPulse AI."""

from pathlib import Path
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Pydantic v2 Settings for application environment."""

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

    # Ollama & Local Models
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "qwen2.5-coder:1.5b"
    EMBEDDING_MODEL: str = "nomic-embed-text"
    LLM_TEMPERATURE: float = 0.65
    LLM_MAX_TOKENS: int = 2048

    # Cloud LLM Configuration (for zero-download local use & Vercel deployment)
    LLM_PROVIDER: str = "auto"  # 'auto', 'ollama', or 'groq'
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # Vector Storage & Ingestion
    CHROMA_PERSIST_DIRECTORY: str = str(Path(__file__).resolve().parent.parent.parent / "chroma_db")
    DOCS_DIRECTORY: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "pandas_docs")
    CHUNK_SIZE: int = 700
    CHUNK_OVERLAP: int = 100
    RETRIEVAL_TOP_K: int = 3

    # Caching
    CACHE_CAPACITY: int = 256
    CACHE_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
