"""Tests for BM25 Sparse Index and Hybrid Retrieval with RRF."""

import pytest
from app.domain.entities import DocumentChunk
from app.infrastructure.vector_db.bm25_index import BM25Index
from app.infrastructure.vector_db.hybrid_store import HybridVectorManager


def test_bm25_indexing_and_scoring():
    index = BM25Index()
    chunk1 = DocumentChunk(
        id="c1",
        content="Use pd.concat to merge DataFrames in Pandas 2.0 without SettingWithCopyWarning.",
        source_file="concat.md",
        chunk_index=0,
        char_count=80,
    )
    chunk2 = DocumentChunk(
        id="c2",
        content="Apache Arrow and PyArrow provide memory-efficient string and numeric types.",
        source_file="pyarrow.md",
        chunk_index=1,
        char_count=75,
    )
    index.add_chunks([chunk1, chunk2])

    # Search for exact keyword in chunk1
    results = index.search("SettingWithCopyWarning pd.concat", top_k=2)
    assert len(results) > 0
    top_chunk, score = results[0]
    assert top_chunk.id == "c1"
    assert score > 0

    # Search for PyArrow
    results_arrow = index.search("pyarrow memory", top_k=2)
    assert len(results_arrow) > 0
    assert results_arrow[0][0].id == "c2"


@pytest.mark.asyncio
async def test_hybrid_vector_manager():
    # Test hybrid store with mock-like chroma
    class FakeChroma:
        def __init__(self):
            self.chunks = []

        async def add_chunks(self, chunks):
            self.chunks.extend(chunks)
            return len(chunks)

        async def similarity_search(self, query: str, top_k: int = 3):
            from app.domain.entities import RetrievalResult
            return [
                RetrievalResult(chunk=c, similarity_score=0.9, rank=i + 1)
                for i, c in enumerate(self.chunks[:top_k])
            ]

        def count(self):
            return len(self.chunks)

        def clear(self):
            self.chunks.clear()

        def get_all_chunks(self, limit: int = 50):
            return self.chunks[:limit]

    fake_chroma = FakeChroma()
    hybrid = HybridVectorManager(chroma_manager=fake_chroma)

    chunk = DocumentChunk(
        id="c1",
        content="Test copy-on-write functionality.",
        source_file="test.md",
        chunk_index=0,
        char_count=30,
    )
    await hybrid.add_chunks([chunk])
    assert hybrid.count() == 1

    results = await hybrid.similarity_search("copy-on-write", top_k=1)
    assert len(results) == 1
    assert results[0].chunk.id == "c1"
