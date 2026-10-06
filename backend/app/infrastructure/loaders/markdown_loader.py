"""Markdown and Technical Documentation Loader for PandaPulse AI."""

import hashlib
import os
from pathlib import Path
from typing import Dict, List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.domain.entities import DocumentChunk, IndexManifest
from app.domain.interfaces import IDocLoader


class MarkdownDocLoader(IDocLoader):
    """Loads markdown technical documents and splits them into code-conscious chunks."""

    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n```\n",      # Code block boundaries
                "\n## ",        # Level 2 Headings
                "\n### ",       # Level 3 Headings
                "\n\n",         # Paragraph breaks
                "\n",           # Line breaks
                " ",            # Word boundaries
                "",
            ],
            keep_separator=True,
        )
        self.manifest = IndexManifest()

    @staticmethod
    def compute_sha256(content: str) -> str:
        """Compute SHA-256 digest of text."""
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @staticmethod
    def compute_file_hash(file_path: Path) -> str:
        """Compute SHA-256 hash of a file on disk."""
        sha = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                sha.update(chunk)
        return sha.hexdigest()

    def load_and_chunk(
        self,
        directory_path: str,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
    ) -> List[DocumentChunk]:
        """Read markdown files, calculate SHA-256 hashes, and split into DocumentChunks."""
        target_dir = Path(directory_path)
        if not target_dir.exists():
            return []

        splitter = self.splitter
        if chunk_size or chunk_overlap:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size or self.chunk_size,
                chunk_overlap=chunk_overlap or self.chunk_overlap,
                separators=["\n```\n", "\n## ", "\n### ", "\n\n", "\n", " ", ""],
                keep_separator=True,
            )

        document_chunks: List[DocumentChunk] = []
        md_files = sorted(list(target_dir.glob("*.md")) + list(target_dir.glob("*.txt")))

        for file_path in md_files:
            try:
                content = file_path.read_text(encoding="utf-8")
            except Exception:
                continue

            file_hash = self.compute_sha256(content)
            self.manifest.file_hashes[file_path.name] = file_hash

            splits = splitter.split_text(content)
            for idx, text in enumerate(splits):
                chunk_id = f"{file_path.stem}_{idx}_{file_hash[:8]}"
                chunk_hash = self.compute_sha256(text)
                document_chunks.append(
                    DocumentChunk(
                        id=chunk_id,
                        content=text.strip(),
                        source_file=file_path.name,
                        chunk_index=idx,
                        char_count=len(text.strip()),
                        sha256_hash=chunk_hash,
                        metadata={
                            "source": file_path.name,
                            "index": idx,
                            "file_hash": file_hash,
                            "char_count": len(text.strip()),
                        },
                    )
                )

        self.manifest.total_chunks = len(document_chunks)
        return document_chunks
