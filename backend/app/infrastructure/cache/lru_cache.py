"""Thread-safe O(1) LRU Cache implementation for PandaPulse AI."""

from collections import OrderedDict
import threading
from typing import Any, Dict, Optional
from app.domain.entities import LLMResponse
from app.domain.interfaces import ICache


class LRUQueryCache(ICache):
    """In-memory thread-safe LRU cache with SHA-256 hashed keys.

    Provides O(1) average time complexity for lookups and insertions.
    """

    def __init__(self, capacity: int = 256):
        self.capacity = max(1, capacity)
        self._cache: OrderedDict[str, LLMResponse] = OrderedDict()
        self._lock = threading.RLock()
        self._hits = 0
        self._misses = 0
        self._evictions = 0

    def get(self, key: str) -> Optional[LLMResponse]:
        with self._lock:
            if key not in self._cache:
                self._misses += 1
                return None

            # Move to end to mark as recently used
            self._cache.move_to_end(key)
            self._hits += 1
            return self._cache[key]

    def set(self, key: str, value: LLMResponse) -> None:
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            else:
                if len(self._cache) >= self.capacity:
                    # Pop least recently used item (first item)
                    self._cache.popitem(last=False)
                    self._evictions += 1
            self._cache[key] = value

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def get_stats(self) -> Dict[str, Any]:
        with self._lock:
            total_requests = self._hits + self._misses
            hit_ratio = (self._hits / total_requests) if total_requests > 0 else 0.0
            return {
                "capacity": self.capacity,
                "current_size": len(self._cache),
                "hits": self._hits,
                "misses": self._misses,
                "evictions": self._evictions,
                "hit_ratio": round(hit_ratio, 4),
                "hit_percentage": f"{round(hit_ratio * 100, 2)}%",
            }
