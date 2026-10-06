"""Application Use Cases for PandaPulse AI.

Implements business orchestration, cache-first routing, architectural guardrails,
and streaming token pipeline according to Clean Architecture.
"""

import hashlib
import time
from typing import AsyncIterator, List, Optional
from app.application.dto import (
    QueryRequestDTO,
    QueryResponseDTO,
    IngestRequestDTO,
    IngestResponseDTO,
    StatusResponseDTO,
)
from app.domain.entities import LLMResponse, PromptTemplate, RetrievalResult
from app.domain.interfaces import ICache, IDocLoader, ILLMProvider, IVectorStore


class QueryPandasDocsUseCase:
    """Orchestrates Cache-first Retrieval-Augmented Generation for Pandas queries."""

    # Architectural System Prompt with Strict Pandas 2.x Guardrails
    SYSTEM_PROMPT = """You are PandaPulse AI, the sub-millisecond neural engine for modern Pandas data engineering.
You adhere strictly to modern Pandas 2.0+ idioms, Clean Architecture, and high-performance practices.

STRICT GUARDRAILS & INVARIANTS:
1. NEVER suggest `df.append()` or `Series.append()`. It has been permanently REMOVED in Pandas 2.0+. ALWAYS use `pd.concat([df1, df2], ignore_index=True)`.
2. NEVER suggest `.ix` indexing. It is completely removed. Use explicit `.loc` (label-based) or `.iloc` (positional).
3. Warn against chained indexing that causes `SettingWithCopyWarning`. Highlight modern Copy-on-Write (`pd.options.mode.copy_on_write = True`).
4. Avoid inefficient row loops (`df.iterrows()`). Always suggest vectorization, `np.select()`, `pd.Series.map()`, or PyArrow string engines.
5. Emphasize PyArrow data types (`dtype_backend='pyarrow'`, `string[pyarrow]`) for modern memory efficiency.
6. When code examples are provided, write concise, production-ready, readable Python.
7. Base your answers firmly on the provided documentation context when available, while providing clear, authoritative explanations."""

    def __init__(
        self,
        vector_store: IVectorStore,
        llm_provider: ILLMProvider,
        cache: ICache,
    ):
        self.vector_store = vector_store
        self.llm_provider = llm_provider
        self.cache = cache

    @staticmethod
    def compute_cache_key(query: str, top_k: int) -> str:
        """Generate deterministic SHA-256 hash for normalized query and parameters."""
        normalized = f"{query.strip().lower()}::{top_k}"
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    async def execute(self, request: QueryRequestDTO) -> QueryResponseDTO:
        """Execute query with cache-first routing."""
        start_time = time.perf_counter()
        cache_key = self.compute_cache_key(request.query, request.top_k)

        # 1. Cache-First Lookup (O(1))
        cached_result = self.cache.get(cache_key)
        if cached_result:
            latency_ms = (time.perf_counter() - start_time) * 1000
            return QueryResponseDTO(
                answer=cached_result.answer,
                citations=cached_result.citations,
                latency_ms=round(latency_ms, 2),
                cached=True,
                tokens_generated=cached_result.tokens_generated,
                model_name=cached_result.model_name,
            )

        # 2. Vector Store Similarity Search (Cosine Distance)
        retrieved_results: List[RetrievalResult] = await self.vector_store.similarity_search(
            query=request.query,
            top_k=request.top_k,
        )

        # 3. Construct Guardrailed Prompt
        prompt_template = PromptTemplate(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=request.query,
        )
        context_str = prompt_template.render_context(retrieved_results)

        full_prompt = (
            f"DOCUMENTATION CONTEXT:\n{context_str}\n\n"
            f"USER QUERY: {request.query}\n\n"
            f"Provide an authoritative, modern Pandas 2.x solution following the guardrails."
        )

        # 4. Generate Response from LLM
        response: LLMResponse = await self.llm_provider.generate(
            prompt=full_prompt,
            system_prompt=self.SYSTEM_PROMPT,
        )

        # 5. Extract Citations
        citations = []
        for res in retrieved_results:
            citations.append({
                "source": res.chunk.source_file,
                "score": round(res.similarity_score, 4),
                "snippet": res.chunk.content[:200] + "..." if len(res.chunk.content) > 200 else res.chunk.content,
                "chunk_id": res.chunk.id,
            })
        response.citations = citations

        latency_ms = (time.perf_counter() - start_time) * 1000
        response.latency_ms = round(latency_ms, 2)

        # 6. Store in LRU Cache
        self.cache.set(cache_key, response)

        return QueryResponseDTO(
            answer=response.answer,
            citations=response.citations,
            latency_ms=response.latency_ms,
            cached=False,
            tokens_generated=response.tokens_generated,
            model_name=response.model_name,
        )

    async def execute_stream(
        self, request: QueryRequestDTO
    ) -> AsyncIterator[dict]:
        """Stream response tokens via Server-Sent Events (SSE)."""
        start_time = time.perf_counter()
        cache_key = self.compute_cache_key(request.query, request.top_k)

        # Cache check
        cached_result = self.cache.get(cache_key)
        if cached_result:
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            yield {
                "event": "meta",
                "data": {
                    "cached": True,
                    "citations": cached_result.citations,
                    "model": cached_result.model_name or "cache",
                    "latency_ms": latency_ms,
                },
            }
            # Stream cached tokens smoothly
            words = cached_result.answer.split(" ")
            for i, word in enumerate(words):
                token = word if i == len(words) - 1 else word + " "
                yield {"event": "token", "data": {"token": token}}
            yield {"event": "done", "data": {"status": "complete", "latency_ms": latency_ms}}
            return

        # Vector Retrieval
        retrieved_results = await self.vector_store.similarity_search(
            query=request.query,
            top_k=request.top_k,
        )

        citations = [
            {
                "source": res.chunk.source_file,
                "score": round(res.similarity_score, 4),
                "snippet": res.chunk.content[:200] + "..." if len(res.chunk.content) > 200 else res.chunk.content,
                "chunk_id": res.chunk.id,
            }
            for res in retrieved_results
        ]

        model_id = getattr(self.llm_provider, "model_name", "qwen2.5-coder:1.5b")
        yield {
            "event": "meta",
            "data": {
                "cached": False,
                "citations": citations,
                "model": model_id,
            },
        }

        # Prompt formatting
        prompt_template = PromptTemplate(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=request.query,
        )
        context_str = prompt_template.render_context(retrieved_results)
        full_prompt = (
            f"DOCUMENTATION CONTEXT:\n{context_str}\n\n"
            f"USER QUERY: {request.query}\n\n"
            f"Provide an authoritative, modern Pandas 2.x solution following the guardrails."
        )

        accumulated_tokens = []
        token_count = 0
        async for token in self.llm_provider.generate_stream(full_prompt, self.SYSTEM_PROMPT):
            accumulated_tokens.append(token)
            token_count += 1
            yield {"event": "token", "data": {"token": token}}

        total_latency = round((time.perf_counter() - start_time) * 1000, 2)
        full_answer = "".join(accumulated_tokens)

        # Store in cache
        response_obj = LLMResponse(
            answer=full_answer,
            citations=citations,
            latency_ms=total_latency,
            cached=False,
            tokens_generated=token_count,
            model_name=model_id,
        )
        self.cache.set(cache_key, response_obj)

        yield {
            "event": "done",
            "data": {
                "status": "complete",
                "latency_ms": total_latency,
                "tokens": token_count,
            },
        }


class IngestDocsUseCase:
    """Orchestrates document loading, chunking, hash checking, and vector store population."""

    def __init__(
        self,
        doc_loader: IDocLoader,
        vector_store: IVectorStore,
        cache: ICache,
    ):
        self.doc_loader = doc_loader
        self.vector_store = vector_store
        self.cache = cache

    async def execute(self, request: IngestRequestDTO) -> IngestResponseDTO:
        start_time = time.perf_counter()
        dir_path = request.directory_path or "./data/pandas_docs"

        # Load and chunk documents
        chunks = self.doc_loader.load_and_chunk(dir_path)

        if not chunks:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return IngestResponseDTO(
                status="no_documents_found",
                indexed_files=0,
                skipped_files=0,
                total_chunks=0,
                duration_ms=duration_ms,
            )

        # If force_reindex, clear vector store
        if request.force_reindex:
            self.vector_store.clear()
            self.cache.clear()

        # Ingest into vector store
        indexed_count = await self.vector_store.add_chunks(chunks)

        # Invalidate cache when new documents are ingested
        self.cache.clear()

        # Identify unique files
        unique_files = {c.source_file for c in chunks}

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return IngestResponseDTO(
            status="success",
            indexed_files=len(unique_files),
            skipped_files=0,
            total_chunks=indexed_count,
            duration_ms=duration_ms,
            manifest_summary={
                "unique_files": list(unique_files),
                "total_chunks_stored": self.vector_store.count(),
            },
        )


class GetStatusUseCase:
    """Orchestrates system diagnostics, cache statistics, and vector metrics."""

    def __init__(
        self,
        vector_store: IVectorStore,
        cache: ICache,
        llm_provider: ILLMProvider,
    ):
        self.vector_store = vector_store
        self.cache = cache
        self.llm_provider = llm_provider

    async def execute(self) -> StatusResponseDTO:
        total_chunks = self.vector_store.count()
        cache_stats = self.cache.get_stats()
        is_ollama_online = await self.llm_provider.is_available()

        return StatusResponseDTO(
            service="PandaPulse AI Core",
            version="1.0.0",
            status="healthy",
            total_indexed_chunks=total_chunks,
            cache_stats=cache_stats,
            ollama_status="online" if is_ollama_online else "offline / fallback_mode",
            active_model=getattr(self.llm_provider, "model_name", "qwen2.5-coder:1.5b"),
            embedding_model="nomic-embed-text",
        )
