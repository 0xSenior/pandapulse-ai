# PandaPulse AI: Enterprise Clean Architecture & Systems Specification

```
                                      +------------------------------------+
                                      |         PRESENTATION LAYER         |
                                      |   FastAPI / SSE / React 18 / Dock  |
                                      +-----------------+------------------+
                                                        |
                                                        v
                                      +-----------------+------------------+
                                      |         APPLICATION LAYER          |
                                      | Use Cases: Query / Ingest / Status |
                                      +-----------------+------------------+
                                                        |
                                                        v
                                      +-----------------+------------------+
                                      |           DOMAIN LAYER             |
                                      |  Entities & Abstract Interfaces    |
                                      +-----------------+------------------+
                                                        ^
                                                        | (Implements / Inverts)
                                      +-----------------+------------------+
                                      |       INFRASTRUCTURE LAYER         |
                                      | ChromaDB / Ollama / LRU / Splitter |
                                      +------------------------------------+
```

---

## 1. Clean Architecture & Layer Isolation

PandaPulse AI is engineered with strict adherence to Robert C. Martin's Clean Architecture and the Dependency Inversion Principle. No inner layer imports or relies on outer frameworks, databases, or UI drivers.

### 1. Domain Layer (`backend/app/domain/`)
- **Entities (`entities.py`)**:
  - `DocumentChunk`: Text unit with character bounds, chunk index, source file, and SHA-256 hash.
  - `RetrievalResult`: Retrieved document chunk mapped with Cosine similarity score and relevance rank.
  - `Query`: Sanitized search text, top-$k$ limit, and session identifiers.
  - `PromptTemplate`: System guardrails forbidding deprecated APIs and context injection renderer.
  - `LLMResponse`: Encapsulates generated answers, citations, latency benchmarks, and cache hit state.
  - `IndexManifest`: Tracks ingested file SHA-256 hashes to guarantee idempotent ingestion.
- **Interfaces (`interfaces.py`)**:
  - `IVectorStore`: Vector persistence, similarity search, and collection management.
  - `ILLMProvider`: Generation and Server-Sent Event streaming protocols.
  - `IEmbeddingProvider`: Multi-text and single-query vector embedding generation.
  - `ICache`: In-memory $O(1)$ query retrieval and metrics.
  - `IDocLoader`: File reading, hashing, and recursive text splitting.

### 2. Application Layer (`backend/app/application/`)
- **DTOs (`dto.py`)**: Strict data transfer boundaries preventing presentation schemas from leaking into domain entities.
- **Use Cases (`use_cases.py`)**:
  - `QueryPandasDocsUseCase`:
    1. Normalizes query and generates SHA-256 key.
    2. Queries `ICache` ($O(1)$). Returns immediately on hit (< 0.8ms).
    3. On cache miss, queries `IVectorStore.similarity_search()`.
    4. Formats context with system guardrails (prohibiting `.append()` and `.ix`).
    5. Calls `ILLMProvider` for generation or SSE streaming.
    6. Persists result in `ICache`.
  - `IngestDocsUseCase`:
    1. Reads markdown documents via `IDocLoader`.
    2. Validates SHA-256 digests against manifest to skip redundant embeddings.
    3. Persists chunks into `IVectorStore`.
    4. Invalidates cached queries to avoid stale responses.
  - `GetStatusUseCase`: Aggregates ChromaDB collection size, cache hit ratio, and model backend availability.

### 3. Infrastructure Layer (`backend/app/infrastructure/`)
- **`cache/lru_cache.py`**: Thread-safe LRU Cache built on `collections.OrderedDict` with `threading.RLock`. Tracks hits, misses, evictions, and capacity.
- **`vector_db/chroma_manager.py`**: ChromaDB `PersistentClient` with cosine similarity (`hnsw:space = "cosine"`). Includes `HybridEmbeddingProvider` supporting `nomic-embed-text` via Ollama and a deterministic dimensional projection fallback.
- **`llm/ollama_provider.py`**: Ollama HTTP API client supporting asynchronous token generator streaming (`AsyncIterator[str]`) and context-grounded fallback responses.
- **`loaders/markdown_loader.py`**: LangChain `RecursiveCharacterTextSplitter` configured for code-conscious markdown boundaries (700 chars, 100 overlap).

### 4. Presentation Layer (`backend/app/presentation/`)
- **`routes.py`**: Exposes `/api/v1/chat`, `/api/v1/stream-chat`, `/api/v1/status`, `/api/v1/reindex`, and `/api/v1/chunks`.
- **`schemas.py`**: Pydantic v2 validation models.
- **`dependencies.py`**: Inversion of Control container injecting concrete infrastructure adapters into application use cases.

---

## 2. SOLID Principles in Action

| Principle | Implementation in PandaPulse AI |
| :--- | :--- |
| **Single Responsibility (SRP)** | `LRUQueryCache` only manages cache memory. `ChromaVectorManager` only manages vector embeddings and indexes. `QueryPandasDocsUseCase` only orchestrates RAG flow. |
| **Open/Closed (OCP)** | New vector stores (e.g., Qdrant, Milvus) or LLM providers (e.g., OpenAI, vLLM) can be added by implementing `IVectorStore` or `ILLMProvider` without modifying any use case code. |
| **Liskov Substitution (LSP)** | `HybridEmbeddingProvider` fully substitutes any embedding client; `LRUQueryCache` adheres 100% to `ICache` contracts. |
| **Interface Segregation (ISP)** | Separate, lean interfaces (`ICache`, `IVectorStore`, `IDocLoader`, `ILLMProvider`) ensure classes only implement what they consume. |
| **Dependency Inversion (DIP)** | Use cases and route handlers depend entirely on abstract interfaces (`IVectorStore`, `ILLMProvider`), injected at runtime via `dependencies.py`. |

---

## 3. Time Complexity & Big-O Analysis

| Operation | Component | Complexity | Description |
| :--- | :--- | :--- | :--- |
| **Cache Lookup** | `LRUQueryCache.get()` | **$\mathcal{O}(1)$** | Hash map lookup with pointer shift in doubly-linked list. |
| **Cache Insertion** | `LRUQueryCache.set()` | **$\mathcal{O}(1)$** | Eviction of head and insertion at tail in constant time. |
| **Query Hash** | `compute_cache_key()` | **$\mathcal{O}(L)$** | SHA-256 digest over normalized query string of length $L$. |
| **Vector Search** | ChromaDB HNSW | **$\mathcal{O}(\log N)$** | Hierarchical Navigable Small World graph traversal for approximate nearest neighbor search. |
| **Document Split** | `MarkdownDocLoader` | **$\mathcal{O}(N)$** | Sliding window regex split over total character count $N$. |
| **Token Streaming** | SSE Async Generator | **$\mathcal{O}(T)$** | Direct line streaming of $T$ tokens over HTTP connection. |

---

## 4. Pandas 2.x Architectural Guardrails

The system prompt and domain use cases enforce modern data engineering patterns:
1. **Deprecation of `.append()`**: Permanently removed in Pandas 2.0+. Replaced with `pd.concat([df1, df2], ignore_index=True)`.
2. **Deprecation of `.ix`**: Removed in favor of explicit `.loc` (label-based) and `.iloc` (positional).
3. **Copy-on-Write (CoW)**: `pd.options.mode.copy_on_write = True` prevents subtle mutations in chained views.
4. **PyArrow Backend**: Enforcing `engine="pyarrow"` and `string[pyarrow]` for up to 70% RAM reduction and SIMD vectorization.
