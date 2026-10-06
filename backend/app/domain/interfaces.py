"""Abstract Interfaces for PandaPulse AI Domain.

Defines ports/protocols for Dependency Inversion Principle (DIP).
Application and Infrastructure layers depend exclusively on these abstractions.
"""

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any

from app.domain.entities import DocumentChunk, LLMResponse, RetrievalResult


class ICache(ABC):
    """Abstract interface for high-performance query caching."""

    @abstractmethod
    def get(self, key: str) -> LLMResponse | None:
        """Retrieve a cached LLM response by hashed key."""

    @abstractmethod
    def set(self, key: str, value: LLMResponse) -> None:
        """Store an LLM response with thread-safety."""

    @abstractmethod
    def clear(self) -> None:
        """Clear all cached entries."""

    @abstractmethod
    def get_stats(self) -> dict[str, Any]:
        """Return cache hit rate, capacity, and current size."""


class IEmbeddingProvider(ABC):
    """Abstract interface for local/remote vector embedding models."""

    @abstractmethod
    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Generate embedding vectors for a batch of text chunks."""

    @abstractmethod
    async def embed_query(self, text: str) -> list[float]:
        """Generate embedding vector for a single search query."""

    @abstractmethod
    def get_dimension(self) -> int:
        """Return dimensionality of the embedding vector (e.g., 768 for nomic-embed-text)."""


class IVectorStore(ABC):
    """Abstract interface for persistent vector database operations."""

    @abstractmethod
    async def add_chunks(self, chunks: list[DocumentChunk]) -> int:
        """Persist document chunks and their vector embeddings into the index."""

    @abstractmethod
    async def similarity_search(self, query: str, top_k: int = 3) -> list[RetrievalResult]:
        """Perform vector similarity search (cosine distance) for query string."""

    @abstractmethod
    def count(self) -> int:
        """Return total number of indexed vectors."""

    @abstractmethod
    def clear(self) -> None:
        """Reset and wipe the vector index collection."""

    @abstractmethod
    def get_all_chunks(self, limit: int = 50) -> list[DocumentChunk]:
        """Inspect stored chunks for the Knowledge Base UI."""


class ILLMProvider(ABC):
    """Abstract interface for Large Language Model generation and token streaming."""

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str) -> LLMResponse:
        """Execute a full completion generation."""

    @abstractmethod
    async def generate_stream(self, prompt: str, system_prompt: str) -> AsyncIterator[str]:
        """Stream generated tokens asynchronously via Server-Sent Events."""

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if model backend is accessible and healthy."""


class IDocLoader(ABC):
    """Abstract interface for reading technical documentation and chunking."""

    @abstractmethod
    def load_and_chunk(self, directory_path: str, chunk_size: int = 700, chunk_overlap: int = 100) -> list[DocumentChunk]:
        """Read markdown/text files and return semantic chunks with hashes."""
