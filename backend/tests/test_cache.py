"""Unit tests for thread-safe O(1) LRU Query Cache."""

from app.domain.entities import LLMResponse
from app.infrastructure.cache.lru_cache import LRUQueryCache


def test_cache_miss_and_hit():
    cache = LRUQueryCache(capacity=2)
    resp = LLMResponse(answer="Use pd.concat()", citations=[], latency_ms=1.2, cached=False)
    
    # Initial miss
    assert cache.get("key1") is None
    
    # Store and hit
    cache.set("key1", resp)
    cached = cache.get("key1")
    assert cached is not None
    assert cached.answer == "Use pd.concat()"
    
    stats = cache.get_stats()
    assert stats["hits"] == 1
    assert stats["misses"] == 1
    assert stats["current_size"] == 1


def test_cache_lru_eviction():
    cache = LRUQueryCache(capacity=2)
    resp1 = LLMResponse(answer="Ans 1", citations=[], latency_ms=1.0)
    resp2 = LLMResponse(answer="Ans 2", citations=[], latency_ms=1.0)
    resp3 = LLMResponse(answer="Ans 3", citations=[], latency_ms=1.0)

    cache.set("k1", resp1)
    cache.set("k2", resp2)
    
    # Access k1 to make k2 the LRU item
    _ = cache.get("k1")
    
    # Insert k3, should evict k2
    cache.set("k3", resp3)
    
    assert cache.get("k1") is not None
    assert cache.get("k2") is None
    assert cache.get("k3") is not None
    assert cache.get_stats()["evictions"] == 1


def test_cache_clear():
    cache = LRUQueryCache(capacity=5)
    cache.set("a", LLMResponse(answer="A", citations=[], latency_ms=1.0))
    assert cache.get_stats()["current_size"] == 1
    cache.clear()
    assert cache.get_stats()["current_size"] == 0
    assert cache.get("a") is None
