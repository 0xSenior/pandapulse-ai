"""BM25 (Best Matching 25) Lexical Retrieval Index for PandaPulse AI.

Provides ultra-fast sparse keyword search to complement dense vector embeddings.
Captures exact Pandas methods, keywords, and error flags (e.g. 'SettingWithCopyWarning',
'pd.concat', 'pyarrow', 'copy_on_write') with zero heavy external dependencies.
"""

import math
import re
from collections import Counter
from dataclasses import dataclass, field

from app.domain.entities import DocumentChunk


@dataclass
class BM25Document:
    """Indexed document representation for BM25."""

    chunk: DocumentChunk
    tokens: list[str]
    length: int
    term_frequencies: Counter = field(default_factory=Counter)


class BM25Index:
    """Okapi BM25 Sparse Inverted Index for Hybrid Retrieval."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.documents: list[BM25Document] = []
        self.doc_len_sum = 0
        self.avg_doc_len = 0.0
        self.doc_count = 0
        self.inverted_index: dict[str, list[int]] = {}
        self.idf_cache: dict[str, float] = {}

    @staticmethod
    def tokenize(text: str) -> list[str]:
        """Tokenize text into lowercase keywords and code tokens (e.g. 'pd.concat', 'copy_on_write')."""
        if not text:
            return []
        # Match alphanumeric sequences and code identifiers
        tokens = re.findall(r"[a-zA-Z0-9_.]+|[\u0600-\u06FF]+", text.lower())
        return [t.strip(".") for t in tokens if len(t.strip(".")) > 1]

    def add_chunks(self, chunks: list[DocumentChunk]) -> None:
        """Add and index document chunks."""
        for chunk in chunks:
            tokens = self.tokenize(chunk.content)
            doc_len = len(tokens)
            doc_idx = len(self.documents)

            doc = BM25Document(
                chunk=chunk,
                tokens=tokens,
                length=doc_len,
                term_frequencies=Counter(tokens),
            )
            self.documents.append(doc)
            self.doc_len_sum += doc_len

            # Update inverted index
            for term in set(tokens):
                if term not in self.inverted_index:
                    self.inverted_index[term] = []
                self.inverted_index[term].append(doc_idx)

        self.doc_count = len(self.documents)
        self.avg_doc_len = (self.doc_len_sum / self.doc_count) if self.doc_count > 0 else 0.0
        self._compute_all_idfs()

    def _compute_all_idfs(self) -> None:
        """Precompute Robertson-Spärck Jones IDF for all vocabulary terms."""
        self.idf_cache.clear()
        n = self.doc_count
        for term, posting_list in self.inverted_index.items():
            df = len(posting_list)
            # Okapi BM25 standard positive IDF formula
            idf = math.log(1.0 + (n - df + 0.5) / (df + 0.5))
            self.idf_cache[term] = max(idf, 0.05)

    def search(self, query: str, top_k: int = 5) -> list[tuple[DocumentChunk, float]]:
        """Search index and return top_k chunks with BM25 scores."""
        if not self.documents:
            return []

        query_tokens = self.tokenize(query)
        if not query_tokens:
            return []

        scores: dict[int, float] = {}
        for term in query_tokens:
            if term not in self.inverted_index:
                continue

            idf = self.idf_cache.get(term, 0.0)
            postings = self.inverted_index[term]

            for doc_idx in postings:
                doc = self.documents[doc_idx]
                tf = doc.term_frequencies[term]
                # BM25 term weighting formula
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc.length / (self.avg_doc_len or 1.0)))
                term_score = idf * (numerator / denominator)
                scores[doc_idx] = scores.get(doc_idx, 0.0) + term_score

        if not scores:
            return []

        # Sort documents by BM25 score descending
        sorted_indices = sorted(scores.keys(), key=lambda idx: scores[idx], reverse=True)[:top_k]
        return [(self.documents[idx].chunk, scores[idx]) for idx in sorted_indices]

    def clear(self) -> None:
        """Reset the index."""
        self.documents.clear()
        self.inverted_index.clear()
        self.idf_cache.clear()
        self.doc_len_sum = 0
        self.avg_doc_len = 0.0
        self.doc_count = 0
