"""Dependency Injection Container for PandaPulse AI.

Adheres strictly to the Dependency Inversion Principle (DIP).
Use cases receive concrete implementations through FastAPI dependency providers.
"""

from fastapi import Depends

from app.application.use_cases import (
    GetStatusUseCase,
    IngestDocsUseCase,
    QueryPandasDocsUseCase,
)
from app.core.config import settings
from app.domain.interfaces import (
    ICache,
    IDocLoader,
    IEmbeddingProvider,
    ILLMProvider,
    IVectorStore,
)
from app.infrastructure.cache.lru_cache import LRUQueryCache
from app.infrastructure.llm.groq_provider import GroqProvider
from app.infrastructure.llm.ollama_provider import OllamaProvider
from app.infrastructure.loaders.markdown_loader import MarkdownDocLoader
from app.infrastructure.vector_db.chroma_manager import (
    ChromaVectorManager,
    HybridEmbeddingProvider,
)
from app.infrastructure.vector_db.hybrid_store import HybridVectorManager

# Singleton instances
_cache_instance = LRUQueryCache(capacity=settings.CACHE_CAPACITY)
_embedding_instance = HybridEmbeddingProvider(
    ollama_url=settings.OLLAMA_BASE_URL,
    model_name=settings.EMBEDDING_MODEL,
)
_chroma_instance = ChromaVectorManager(
    persist_dir=settings.CHROMA_PERSIST_DIRECTORY,
    embedding_provider=_embedding_instance,
)
_vector_store_instance = HybridVectorManager(chroma_manager=_chroma_instance)

# Hybrid LLM Selection: Auto-detect Groq API key or use local Ollama
if settings.LLM_PROVIDER == "groq" or (
    settings.LLM_PROVIDER == "auto" and bool(settings.GROQ_API_KEY.strip())
):
    _llm_instance = GroqProvider(
        api_key=settings.GROQ_API_KEY,
        model_name=settings.GROQ_MODEL,
        base_url=settings.GROQ_BASE_URL,
        temperature=settings.LLM_TEMPERATURE,
    )
else:
    _llm_instance = OllamaProvider(
        base_url=settings.OLLAMA_BASE_URL,
        model_name=settings.LLM_MODEL,
        temperature=settings.LLM_TEMPERATURE,
    )

_doc_loader_instance = MarkdownDocLoader(
    chunk_size=settings.CHUNK_SIZE,
    chunk_overlap=settings.CHUNK_OVERLAP,
)


def get_cache() -> ICache:
    """Dependency provider for in-memory LRU cache."""
    return _cache_instance


def get_embedding_provider() -> IEmbeddingProvider:
    """Dependency provider for embedding generation."""
    return _embedding_instance


def get_vector_store() -> IVectorStore:
    """Dependency provider for persistent ChromaDB vector store."""
    return _vector_store_instance


def get_llm_provider() -> ILLMProvider:
    """Dependency provider for Ollama LLM generator."""
    return _llm_instance


def get_doc_loader() -> IDocLoader:
    """Dependency provider for markdown chunking."""
    return _doc_loader_instance


def get_query_use_case(
    vector_store: IVectorStore = Depends(get_vector_store),
    llm_provider: ILLMProvider = Depends(get_llm_provider),
    cache: ICache = Depends(get_cache),
) -> QueryPandasDocsUseCase:
    """Provides QueryPandasDocsUseCase injected with interface implementations."""
    return QueryPandasDocsUseCase(
        vector_store=vector_store,
        llm_provider=llm_provider,
        cache=cache,
    )


def get_ingest_use_case(
    doc_loader: IDocLoader = Depends(get_doc_loader),
    vector_store: IVectorStore = Depends(get_vector_store),
    cache: ICache = Depends(get_cache),
) -> IngestDocsUseCase:
    """Provides IngestDocsUseCase."""
    return IngestDocsUseCase(
        doc_loader=doc_loader,
        vector_store=vector_store,
        cache=cache,
    )


def get_status_use_case(
    vector_store: IVectorStore = Depends(get_vector_store),
    cache: ICache = Depends(get_cache),
    llm_provider: ILLMProvider = Depends(get_llm_provider),
) -> GetStatusUseCase:
    """Provides GetStatusUseCase."""
    return GetStatusUseCase(
        vector_store=vector_store,
        cache=cache,
        llm_provider=llm_provider,
    )
