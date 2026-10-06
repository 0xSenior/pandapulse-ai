# Python Performance, Vectorization & Concurrency

## 1. Vectorization vs Python Loops
Standard Python loops run through the CPython bytecode interpreter with dynamic type lookups on each iteration. Vectorized operations (leveraged by NumPy and Pandas) execute compiled C/SIMD instructions on contiguous memory buffers:

```python
import numpy as np
import time

# Measuring loop overhead vs vector operations
size = 1_000_000
data = list(range(size))
arr = np.arange(size)

# Slow: Iterative loop (~85ms)
start = time.perf_counter()
res_loop = [x * 2 for x in data]
t_loop = (time.perf_counter() - start) * 1000

# Fast: Vectorized multiplication (~1.1ms - 75x faster)
start = time.perf_counter()
res_vec = arr * 2
t_vec = (time.perf_counter() - start) * 1000
```

## 2. Choosing the Right Concurrency Model
- **I/O Bound Operations** (HTTP calls, database queries, file transfers): Use `asyncio` or `concurrent.futures.ThreadPoolExecutor`.
- **CPU Bound Operations** (data parsing, mathematical transformations): Use `multiprocessing.Pool` or `ProcessPoolExecutor` to bypass the Global Interpreter Lock (GIL).

```python
import asyncio
import aiohttp

async def fetch_endpoint(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return await response.json()

async def batch_fetch(urls: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_endpoint(session, url) for url in urls]
        return await asyncio.gather(*tasks)
```
