# Python Functions, Generators, and Modern OOP

## 1. Generators & Memory-Efficient Streaming
When processing large datasets or logs in Python, eagerly materializing lists causes out-of-memory errors. Use generator functions (`yield`) and generator expressions:

```python
from typing import Generator

def stream_log_lines(filepath: str) -> Generator[dict, None, None]:
    """Streams and parses massive log files row-by-row with minimal RAM footprint."""
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("ERROR"):
                parts = line.strip().split("|")
                yield {"timestamp": parts[1], "message": parts[2]}

# Generator expression (lazy evaluation)
error_stream = (entry["message"] for entry in stream_log_lines("app.log"))
```

## 2. Modern OOP with Python `@dataclass`
In modern Python 3.7+, `@dataclass` eliminates boilerplate `__init__`, `__repr__`, and `__eq__` implementations while guaranteeing strict typing and immutability:

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional

@dataclass(frozen=True, slots=True)
class PipelineJob:
    """Immutable, low-memory job definition utilizing Python slots."""
    job_id: str
    target_table: str
    batch_size: int = 1000
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def validate(self) -> bool:
        return self.batch_size > 0 and len(self.target_table) > 0
```

## 3. Function Decorators & Context Managers
Decorators allow modular cross-cutting concerns like caching, timing, and error retries:

```python
import functools
import time
from typing import Callable, Any

def timed_execution(func: Callable) -> Callable:
    """Measures latency of high-throughput functions."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration_ms = (time.perf_counter() - start) * 1000
        print(f"[{func.__name__}] executed in {duration_ms:.2f}ms")
        return result
    return wrapper
```
