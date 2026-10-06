"""Abstract Interfaces for PandaPulse AI Domain.

Defines ports/protocols for Dependency Inversion Principle (DIP).
Application and Infrastructure layers depend exclusively on these abstractions.
"""

from abc import ABC, abstractmethod
from typing import Any, AsyncIterator, Dict, List, Optional
from app.domain.entities import DocumentChunk, RetrievalResult, Query, LLMResponse


class ICache(ABC):
    """Abstract interface for high-performance query caching."""

    @abstractmethod
    def get(self, key: str) -> Optional[LLMResponse]:
        """Retrieve a cached LLM response by hashed key."""
        pass

    @abstractmethod
    def set(self, key: str, value: LLMResponse) -> None:
        """Store an LLM response with thread-safety."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clear all cached entries."""
        pass

    @abstractmethod
    def get_stats(self) -> Dict[str, Any]:
        """Return cache hit rate, capacity, and current size."""
        pass


class IEmbeddingProvider(ABC):
    """Abstract interface for local/remote vector embedding models."""

    @abstractmethod
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a batch of text chunks."""
        pass

    @abstractmethod
    async def embed_query(self, text: str) -> List[float]:
        """Generate embedding vector for a single search query."""
        pass

    @abstractmethod
    def get_dimension(self) -> int:
        """Return dimensionality of the embedding vector (e.g., 768 for nomic-embed-text)."""
        pass


class IVectorStore(ABC):
    """Abstract interface for persistent vector database operations."""

    @abstractmethod
    async def add_chunks(self, chunks: List[DocumentChunk]) -> int:
        """Persist document chunks and their vector embeddings into the index."""
        pass

    @abstractmethod
    async def similarity_search(self, query: str, top_k: int = 3) -> List[RetrievalResult]:
        """Perform vector similarity search (cosine distance) for query string."""
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total number of indexed vectors."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Reset and wipe the vector index collection."""
        pass

    @abstractmethod
    def get_all_chunks(self, limit: int = 50) -> List[DocumentChunk]:
        """Inspect stored chunks for the Knowledge Base UI."""
        pass


class ILLMProvider(ABC):
    """Abstract interface for Large Language Model generation and token streaming."""

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str) -> LLMResponse:
        """Execute a full completion generation."""
        pass

    @abstractmethod
    async def generate_stream(self, prompt: str, system_prompt: str) -> AsyncIterator[str]:
        """Stream generated tokens asynchronously via Server-Sent Events."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if model backend is accessible and healthy."""
        pass


class IDocLoader(ABC):
    """Abstract interface for reading technical documentation and chunking."""

    @abstractmethod
    def load_and_chunk(self, directory_path: str, chunk_size: int = 700, chunk_overlap: int = 100) -> List[DocumentChunk]:
        """Read markdown/text files and return semantic chunks with hashes."""
        pass
