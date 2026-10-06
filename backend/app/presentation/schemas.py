"""Presentation API schemas for request validation and serialization (Pydantic v2)."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """User prompt query schema."""
    query: str = Field(..., min_length=1, max_length=2000, description="Pandas question or code query")
    top_k: int = Field(default=3, ge=1, le=10, description="Top-k similar document chunks to retrieve")
    session_id: Optional[str] = Field(default=None, description="Optional conversational session ID")


class CitationSchema(BaseModel):
    """Retrieved document reference snippet."""
    source: str
    score: float
    snippet: str
    chunk_id: str


class ChatResponse(BaseModel):
    """RAG generated answer with performance benchmarks."""
    answer: str
    citations: List[CitationSchema] = Field(default_factory=list)
    latency_ms: float
    cached: bool
    tokens_generated: Optional[int] = None
    model_name: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReindexRequest(BaseModel):
    """Manual reindexing trigger payload."""
    directory_path: Optional[str] = Field(default=None, description="Custom documentation directory")
    force_reindex: bool = Field(default=False, description="Wipe existing vector database before ingest")


class ReindexResponse(BaseModel):
    """Result of vector database reindexing."""
    status: str
    indexed_files: int
    skipped_files: int
    total_chunks: int
    duration_ms: float
    manifest_summary: Dict[str, Any] = Field(default_factory=dict)


class StatusResponse(BaseModel):
    """System health and diagnostics metrics."""
    service: str
    version: str
    status: str
    total_indexed_chunks: int
    cache_stats: Dict[str, Any]
    ollama_status: str
    active_model: str
    embedding_model: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChunkInspectionSchema(BaseModel):
    """Chunk details for Knowledge Base inspection."""
    id: str
    content: str
    source_file: str
    chunk_index: int
    char_count: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
