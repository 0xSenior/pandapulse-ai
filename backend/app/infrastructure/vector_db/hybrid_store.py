"""Hybrid Vector Store combining ChromaDB Dense Embeddings and BM25 Sparse Search.

Employs Reciprocal Rank Fusion (RRF) to blend semantic vector similarity with exact
lexical keyword matching, achieving state-of-the-art retrieval accuracy for technical APIs.
"""

from app.domain.entities import DocumentChunk, RetrievalResult
from app.domain.interfaces import IVectorStore
from app.infrastructure.vector_db.bm25_index import BM25Index
from app.infrastructure.vector_db.chroma_manager import ChromaVectorManager


class HybridVectorManager(IVectorStore):
    """Hybrid Retrieval Store blending ChromaDB and BM25 with Reciprocal Rank Fusion."""

    def __init__(self, chroma_manager: ChromaVectorManager, bm25_index: BM25Index | None = None):
        self.chroma = chroma_manager
        self.bm25 = bm25_index or BM25Index()
        # Initialize BM25 with any existing chunks from ChromaDB
        self._sync_bm25_from_chroma()

    def _sync_bm25_from_chroma(self) -> None:
        """Warm up BM25 index with existing chunks in Chroma collection."""
        existing_chunks = self.chroma.get_all_chunks(limit=1000)
        if existing_chunks:
            self.bm25.add_chunks(existing_chunks)

    async def add_chunks(self, chunks: list[DocumentChunk]) -> int:
        """Upsert chunks into both ChromaDB and the BM25 index."""
        count = await self.chroma.add_chunks(chunks)
        self.bm25.add_chunks(chunks)
        return count

    async def similarity_search(self, query: str, top_k: int = 3) -> list[RetrievalResult]:
        """Perform Hybrid Search using Reciprocal Rank Fusion (RRF)."""
        fetch_k = max(top_k * 3, 10)

        # 1. Dense Semantic Search from ChromaDB
        dense_results: list[RetrievalResult] = await self.chroma.similarity_search(query=query, top_k=fetch_k)

        # 2. Sparse Lexical Search from BM25
        sparse_hits: list[tuple[DocumentChunk, float]] = self.bm25.search(query=query, top_k=fetch_k)

        # If BM25 has no results, fall back to pure dense
        if not sparse_hits:
            return dense_results[:top_k]

        # If dense has no results, wrap BM25 results
        if not dense_results:
            results = []
            for rank, (chunk, score) in enumerate(sparse_hits[:top_k], 1):
                norm_score = min(score / 10.0, 1.0)
                results.append(RetrievalResult(chunk=chunk, similarity_score=round(norm_score, 4), rank=rank))
            return results

        # 3. Reciprocal Rank Fusion (RRF)
        # Formula: RRF_score(d) = sum(1 / (k + rank(d))) with k = 60
        k_const = 60.0
        rrf_scores: dict[str, float] = {}
        chunks_map: dict[str, DocumentChunk] = {}

        # Dense ranks
        for rank, res in enumerate(dense_results, 1):
            cid = res.chunk.id
            chunks_map[cid] = res.chunk
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k_const + rank))

        # Sparse ranks
        for rank, (chunk, _) in enumerate(sparse_hits, 1):
            cid = chunk.id
            chunks_map[cid] = chunk
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k_const + rank))

        # Sort by RRF score descending
        sorted_chunk_ids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)[:top_k]

        # Normalize final scores to [0.0, 1.0]
        max_possible_rrf = 2.0 / (k_const + 1.0)
        final_results: list[RetrievalResult] = []

        for final_rank, cid in enumerate(sorted_chunk_ids, 1):
            raw_score = rrf_scores[cid]
            normalized = min(raw_score / max_possible_rrf, 1.0)
            final_results.append(
                RetrievalResult(
                    chunk=chunks_map[cid],
                    similarity_score=round(normalized, 4),
                    rank=final_rank,
                )
            )

        return final_results

    def count(self) -> int:
        return self.chroma.count()

    def clear(self) -> None:
        self.chroma.clear()
        self.bm25.clear()

    def get_all_chunks(self, limit: int = 50) -> list[DocumentChunk]:
        return self.chroma.get_all_chunks(limit=limit)
