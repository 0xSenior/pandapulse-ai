"""Unit tests for Clean Architecture domain entities and use cases."""

import pytest
from app.application.dto import QueryRequestDTO, IngestRequestDTO
from app.application.use_cases import QueryPandasDocsUseCase, IngestDocsUseCase
from app.domain.entities import DocumentChunk, LLMResponse, RetrievalResult
from app.domain.interfaces import ICache, IDocLoader, ILLMProvider, IVectorStore


class MockVectorStore(IVectorStore):
    def __init__(self):
        self.chunks = []

    async def add_chunks(self, chunks):
        self.chunks.extend(chunks)
        return len(chunks)

    async def similarity_search(self, query: str, top_k: int = 3):
        return [
            RetrievalResult(
                chunk=DocumentChunk(
                    id="c1",
                    content="Always use pd.concat([df1, df2]) instead of deprecated append.",
                    source_file="02_merging.md",
                    chunk_index=0,
                    char_count=60,
                ),
                similarity_score=0.95,
                rank=1,
            )
        ]

    def count(self):
        return len(self.chunks)

    def clear(self):
        self.chunks.clear()

    def get_all_chunks(self, limit: int = 50):
        return self.chunks[:limit]


class MockLLMProvider(ILLMProvider):
    async def generate(self, prompt: str, system_prompt: str) -> LLMResponse:
        return LLMResponse(
            answer="In modern Pandas 2.x, use pd.concat() because .append() was removed.",
            citations=[],
            latency_ms=10.0,
            model_name="mock-llama3",
        )

    async def generate_stream(self, prompt: str, system_prompt: str):
        yield "In "
        yield "modern "
        yield "Pandas "
        yield "2.x"

    async def is_available(self) -> bool:
        return True


class MockCache(ICache):
    def __init__(self):
        self.store = {}

    def get(self, key: str):
        return self.store.get(key)

    def set(self, key: str, value: LLMResponse):
        self.store[key] = value

    def clear(self):
        self.store.clear()

    def get_stats(self):
        return {"hits": 0, "misses": 0, "current_size": len(self.store)}


@pytest.mark.asyncio
async def test_query_use_case_flow():
    vector_store = MockVectorStore()
    llm = MockLLMProvider()
    cache = MockCache()

    use_case = QueryPandasDocsUseCase(vector_store, llm, cache)

    # First call - cache miss
    req = QueryRequestDTO(query="How to append rows in pandas?", top_k=3)
    res = await use_case.execute(req)

    assert res.cached is False
    assert "pd.concat" in res.answer
    assert len(res.citations) == 1
    assert res.citations[0]["source"] == "02_merging.md"

    # Second call - cache hit!
    res2 = await use_case.execute(req)
    assert res2.cached is True
    assert res2.answer == res.answer
