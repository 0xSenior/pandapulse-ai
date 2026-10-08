"""Data Transfer Objects (DTO) for PandaPulse AI Application Layer."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class QueryRequestDTO:
    """Input DTO for documentation RAG queries."""
    query: str
    top_k: int = 3
    session_id: str | None = None
    history: list[dict[str, str]] | None = None
    model: str | None = None
    provider: str | None = None


@dataclass
class QueryResponseDTO:
    """Output DTO for answered RAG queries."""
    answer: str
    citations: list[dict[str, Any]]
    latency_ms: float
    cached: bool
    tokens_generated: int | None = None
    model_name: str | None = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class IngestRequestDTO:
    """Input DTO for vector indexing triggers."""
    directory_path: str | None = None
    force_reindex: bool = False


@dataclass
class IngestResponseDTO:
    """Output DTO summarizing vector ingestion."""
    status: str
    indexed_files: int
    skipped_files: int
    total_chunks: int
    duration_ms: float
    manifest_summary: dict[str, Any] = field(default_factory=dict)


@dataclass
class StatusResponseDTO:
    """System health, vector database metrics, and cache status DTO."""
    service: str
    version: str
    status: str
    total_indexed_chunks: int
    cache_stats: dict[str, Any]
    ollama_status: str
    active_model: str
    embedding_model: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
