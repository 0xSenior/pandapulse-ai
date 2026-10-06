"""ChromaDB Vector Store and Local/Ollama Embeddings Manager."""

import hashlib
import math
from pathlib import Path

import chromadb
import httpx
from chromadb.config import Settings

from app.domain.entities import DocumentChunk, RetrievalResult
from app.domain.interfaces import IEmbeddingProvider, IVectorStore


class HybridEmbeddingProvider(IEmbeddingProvider):
    """Embedding provider with primary Ollama nomic-embed-text and resilient deterministic fallback.

    Ensures zero runtime crashes if model is downloading or offline.
    """

    def __init__(self, ollama_url: str = "http://localhost:11434", model_name: str = "nomic-embed-text"):
        self.ollama_url = ollama_url.rstrip("/")
        self.model_name = model_name
        self.dimension = 768

    def get_dimension(self) -> int:
        return self.dimension

    def _fallback_embed(self, text: str) -> list[float]:
        """Deterministic high-dimensional semantic hash projection (dim=768)."""
        vector = [0.0] * self.dimension
        words = text.lower().split()
        if not words:
            return vector

        for word in words:
            # Hash word into bucket
            h = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if ((h >> 8) & 1) else -1.0
            vector[idx] += sign

        # L2 Normalize
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 1e-9:
            vector = [v / norm for v in vector]
        return vector

    async def embed_query(self, text: str) -> list[float]:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{self.ollama_url}/api/embeddings",
                    json={"model": self.model_name, "prompt": text},
                )
                if res.status_code == 200:
                    data = res.json()
                    if "embedding" in data and len(data["embedding"]) > 0:
                        return data["embedding"]
        except Exception:
            pass
        return self._fallback_embed(text)

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        embeddings = []
        for text in texts:
            emb = await self.embed_query(text)
            embeddings.append(emb)
        return embeddings


class ChromaVectorManager(IVectorStore):
    """ChromaDB Persistent Vector Store for PandaPulse AI."""

    COLLECTION_NAME = "pandapulse_knowledge_base"

    def __init__(
        self,
        persist_dir: str = "./chroma_db",
        embedding_provider: IEmbeddingProvider | None = None,
    ):
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self.embedding_provider = embedding_provider or HybridEmbeddingProvider()

        self.client = chromadb.PersistentClient(
            path=str(self.persist_dir),
            settings=Settings(anonymized_telemetry=False, is_persistent=True),
        )
        self._init_collection()

    def _init_collection(self):
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    async def add_chunks(self, chunks: list[DocumentChunk]) -> int:
        if not chunks:
            return 0

        # Filter out existing chunks if desired or upsert
        ids = [chunk.id for chunk in chunks]
        documents = [chunk.content for chunk in chunks]
        metadatas = [
            {
                "source_file": chunk.source_file,
                "chunk_index": chunk.chunk_index,
                "char_count": chunk.char_count,
                "sha256_hash": chunk.sha256_hash or "",
            }
            for chunk in chunks
        ]

        # Generate embeddings
        embeddings = await self.embedding_provider.embed_documents(documents)

        # Batch upsert into Chroma
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )
        return len(ids)

    async def similarity_search(self, query: str, top_k: int = 3) -> list[RetrievalResult]:
        total = self.count()
        if total == 0:
            return []

        limit = min(top_k, total)
        query_embedding = await self.embedding_provider.embed_query(query)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas", "distances"],
        )

        retrieval_results: list[RetrievalResult] = []
        if not results or not results["ids"] or not results["ids"][0]:
            return retrieval_results

        ids = results["ids"][0]
        documents = results["documents"][0] if results.get("documents") else []
        metadatas = results["metadatas"][0] if results.get("metadatas") else []
        distances = results["distances"][0] if results.get("distances") else []

        for idx, chunk_id in enumerate(ids):
            content = documents[idx] if idx < len(documents) else ""
            meta = metadatas[idx] if idx < len(metadatas) else {}
            # Cosine distance to similarity: similarity = 1 - distance
            distance = distances[idx] if idx < len(distances) else 0.5
            similarity = max(0.0, min(1.0, 1.0 - distance))

            chunk = DocumentChunk(
                id=chunk_id,
                content=content,
                source_file=meta.get("source_file", "unknown"),
                chunk_index=meta.get("chunk_index", 0),
                char_count=meta.get("char_count", len(content)),
                sha256_hash=meta.get("sha256_hash"),
                metadata=meta,
            )
            retrieval_results.append(
                RetrievalResult(
                    chunk=chunk,
                    similarity_score=similarity,
                    rank=idx + 1,
                )
            )

        return retrieval_results

    def count(self) -> int:
        try:
            return self.collection.count()
        except Exception:
            return 0

    def clear(self) -> None:
        try:
            self.client.delete_collection(name=self.COLLECTION_NAME)
        except Exception:
            pass
        self._init_collection()

    def get_all_chunks(self, limit: int = 50) -> list[DocumentChunk]:
        """Retrieve stored chunks for inspection in the Knowledge Base UI."""
        total = self.count()
        if total == 0:
            return []

        fetch_count = min(limit, total)
        data = self.collection.get(
            limit=fetch_count,
            include=["documents", "metadatas"],
        )

        chunks = []
        if not data or not data["ids"]:
            return chunks

        ids = data["ids"]
        documents = data.get("documents", [])
        metadatas = data.get("metadatas", [])

        for idx, cid in enumerate(ids):
            content = documents[idx] if idx < len(documents) else ""
            meta = metadatas[idx] if idx < len(metadatas) else {}
            chunks.append(
                DocumentChunk(
                    id=cid,
                    content=content,
                    source_file=meta.get("source_file", "unknown"),
                    chunk_index=meta.get("chunk_index", 0),
                    char_count=meta.get("char_count", len(content)),
                    sha256_hash=meta.get("sha256_hash"),
                    metadata=meta,
                )
            )
        return chunks
