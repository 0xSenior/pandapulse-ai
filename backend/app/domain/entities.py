"""Domain Entities for PandaPulse AI.

These entities encapsulate enterprise business rules and data structures,
completely decoupled from external frameworks or database engines.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class DocumentChunk:
    """A semantic text chunk extracted from technical documentation."""
    id: str
    content: str
    source_file: str
    chunk_index: int
    char_count: int
    metadata: dict[str, Any] = field(default_factory=dict)
    sha256_hash: str | None = None


@dataclass
class RetrievalResult:
    """Represents a retrieved document chunk with relevance scoring."""
    chunk: DocumentChunk
    similarity_score: float
    rank: int


@dataclass
class Query:
    """User input representation with domain validation."""
    raw_text: str
    sanitized_text: str
    top_k: int = 3
    session_id: str | None = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class PromptTemplate:
    """System and context templates with Pandas 2.x architectural guardrails."""
    system_prompt: str
    user_prompt: str
    guardrails: list[str] = field(default_factory=list)

    def render_context(self, retrieved_chunks: list[RetrievalResult]) -> str:
        """Format retrieved context chunks cleanly for the LLM prompt."""
        if not retrieved_chunks:
            return "No specific local documentation found for this query."

        formatted = []
        for res in retrieved_chunks:
            source = res.chunk.source_file
            score = f"{res.similarity_score:.4f}"
            formatted.append(
                f"--- SOURCE: {source} (Relevance Score: {score}) ---\n{res.chunk.content}\n"
            )
        return "\n".join(formatted)


@dataclass
class LLMResponse:
    """Encapsulates generated answer, citations, performance benchmarks and cache indicators."""
    answer: str
    citations: list[dict[str, Any]]
    latency_ms: float
    cached: bool = False
    tokens_generated: int | None = None
    model_name: str | None = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class IndexManifest:
    """Tracks ingested file SHA-256 hashes to guarantee idempotent and incremental vector indexing."""
    file_hashes: dict[str, str] = field(default_factory=dict)
    total_chunks: int = 0
    last_indexed_at: str | None = None
