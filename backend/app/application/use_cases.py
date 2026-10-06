"""Application Use Cases for PandaPulse AI.

Implements business orchestration, cache-first routing, architectural guardrails,
strict domain scope filtering, and streaming token pipeline according to Clean Architecture.
"""

import hashlib
import re
import time
from typing import AsyncIterator, List, Optional
from app.application.dto import (
    QueryRequestDTO,
    QueryResponseDTO,
    IngestRequestDTO,
    IngestResponseDTO,
    StatusResponseDTO,
)
from app.domain.entities import LLMResponse, PromptTemplate, RetrievalResult
from app.domain.interfaces import ICache, IDocLoader, ILLMProvider, IVectorStore


class QueryPandasDocsUseCase:
    """Orchestrates Cache-first Retrieval-Augmented Generation for Pandas queries."""

    # Architectural System Prompt with Strict Pandas 2.x Guardrails and Scope Enforcement
    SYSTEM_PROMPT = """You are PandaPulse AI, an elite, specialized AI Copilot dedicated EXCLUSIVELY to Python Pandas (version 2.0+) and modern tabular data engineering.

STRICT DOMAIN SCOPE & INVARIANTS:
1. GREETINGS & CASUAL INTERACTION:
   If the user greets you (e.g. "مرحبا", "أهلاً", "hello", "hi", "السلام عليكم"):
   Respond politely and warmly in the user's language, introduce yourself as PandaPulse AI (the specialized Pandas 2.x data engineering assistant), and invite them to ask their Pandas or data engineering question. DO NOT output random code blocks.

2. STRICT OUT-OF-SCOPE REFUSAL:
   If the user asks ANY question outside of Pandas, data science, data manipulation, or tabular data engineering (e.g. history, politics, cooking, casual chat, general science, poetry, non-coding questions):
   You MUST POLITELY REFUSE to answer. State clearly in the user's language that you are an AI assistant specialized strictly and exclusively in the Pandas library and data engineering.

3. IN-SCOPE PANDAS INQUIRIES:
   When answering Pandas and data engineering questions:
   - Base your answer firmly on the provided DOCUMENTATION CONTEXT.
   - Explain the modern Pandas 2.x solution with clarity, depth, and best practices.
   - Strictly forbid deprecated APIs:
     * NEVER suggest `df.append()` or `Series.append()` (removed in Pandas 2.0+; ALWAYS use `pd.concat([df1, df2], ignore_index=True)`).
     * NEVER suggest `.ix` (removed; use `.loc` for labels or `.iloc` for positions).
     * Enforce Copy-on-Write safety (`pd.options.mode.copy_on_write = True`) to prevent SettingWithCopyWarning.
     * Eliminate row loops (`iterrows()`); advocate vectorization, `np.select`, and PyArrow engines (`string[pyarrow]`).
   - Provide production-ready, well-commented Python code blocks.
   - Respond in the language used by the user (Arabic if asked in Arabic, English if asked in English)."""

    ARABIC_SYNONYMS = {
        "دمج": "concat merge join combine",
        "جدول": "dataframe table",
        "جدولين": "two dataframes concat merge",
        "جداول": "dataframes tables",
        "عمود": "column series",
        "اعمدة": "columns",
        "أعمدة": "columns",
        "سطر": "row index",
        "صفوف": "rows indices",
        "فهرس": "index loc iloc",
        "فهرسة": "indexing loc iloc selection",
        "تصفية": "filter boolean indexing loc query",
        "فلترة": "filter boolean indexing loc query",
        "تجميع": "groupby aggregate agg named aggregation",
        "مفقود": "missing values dropna fillna isna",
        "مفقودة": "missing values dropna fillna isna",
        "فارغ": "missing isna dropna",
        "فارغة": "missing isna dropna",
        "ذاكرة": "memory optimization pyarrow arrow",
        "اداء": "performance vectorization pyarrow copy_on_write",
        "أداء": "performance vectorization pyarrow copy_on_write",
        "تسريع": "performance pyarrow speed vectorization",
        "ملف": "read_csv read_parquet IO",
        "قراءة": "read_csv read_parquet",
        "حفظ": "to_csv to_parquet",
    }

    def __init__(
        self,
        vector_store: IVectorStore,
        llm_provider: ILLMProvider,
        cache: ICache,
    ):
        self.vector_store = vector_store
        self.llm_provider = llm_provider
        self.cache = cache

    @staticmethod
    def contains_arabic(text: str) -> bool:
        """Check if text contains Arabic characters."""
        return bool(re.search(r"[\u0600-\u06FF]", text))

    @classmethod
    def expand_query_for_retrieval(cls, query: str) -> str:
        """Enrich retrieval queries with domain synonyms for high vector similarity."""
        expanded = [query]
        q_lower = query.lower()
        for ar_term, en_synonyms in cls.ARABIC_SYNONYMS.items():
            if ar_term in q_lower:
                expanded.append(en_synonyms)
        return " ".join(expanded)

    @classmethod
    def is_greeting(cls, query: str) -> bool:
        """Detect greeting words and pleasantries in Arabic or English."""
        cleaned = re.sub(r"[^\w\s]", "", query.strip().lower())
        words = cleaned.split()
        if not words:
            return False

        greeting_words = {
            "مرحبا", "مرحباً", "أهلا", "اهلا", "أهلاً", "سلام", "السلام", "عليكم",
            "صباح", "مساء", "هلا", "هاي", "الو", "مرحبتين", "تحياتي", "يا",
            "عامل", "ايه", "إيه", "اخبارك", "أخبارك", "حالك", "كيفك",
            "hello", "hi", "hey", "greetings", "good", "morning", "afternoon", "evening",
            "howdy", "sup", "yo", "there", "everyone"
        }

        if len(words) <= 5:
            matching = sum(1 for w in words if w in greeting_words)
            if matching >= 1 and (matching / len(words)) >= 0.4:
                return True

        phrases = [
            "السلام عليكم", "صباح الخير", "مساء الخير", "كيف حالك", "ازيك", "عامل ايه",
            "hello there", "good morning", "good evening", "how are you"
        ]
        return any(p in cleaned for p in phrases) and len(words) <= 6

    @classmethod
    def is_in_scope(cls, query: str) -> bool:
        """Strict domain verification: only accept Pandas and tabular data engineering queries."""
        lower = query.lower()
        normalized = re.sub(r"[-_]", " ", lower)

        offtopic_terms = [
            "نابليون", "تاريخ", "سياسة", "طبخ", "طعام", "وصفة", "شعر", "قصيدة", "أغنية", "اغنية",
            "فيلم", "مسلسل", "كرة", "رياضة", "نكتة", "طقس", "عاصمة", "رئيس", "دين", "فلسفة",
            "علاج", "دواء", "سيارة", "لعبة", "كيك", "بيتزا", "مطبخ",
            "history", "politics", "cook", "recipe", "poem", "poetry", "song", "movie", "film",
            "football", "soccer", "basketball", "sport", "joke", "weather", "capital", "president",
            "religion", "philosophy", "medicine", "pill", "game", "cake", "pizza", "kitchen"
        ]
        if any(term in lower for term in offtopic_terms):
            return False

        data_keywords = [
            "بانداز", "باندا", "داتافريم", "داتا فريم", "جدول", "جداول", "عمود", "أعمدة", "اعمدة",
            "سطر", "صفوف", "سلسلة", "بيانات", "فهرس", "فهرسة", "تصفية", "فلتر", "فلترة", "دمج",
            "ربط", "تجميع", "مفقود", "مفقودة", "فارغ", "فارغة", "تحويل", "تنظيف", "استعلام", "بايثون",
            "مصفوفة", "تكرار", "إحصاء", "احصاء", "متوسط", "قراءة", "حفظ", "اكسل", "إكسل", "سيريس",
            "ذاكرة", "أداء", "اداء", "تسريع", "نوع", "أنواع", "انواع", "معالجة", "تحليل", "استخراج",
            "تجميعي", "شريحة", "شرائح", "مؤشر",
            "pandas", "dataframe", "df", "series", "loc", "iloc", "concat", "merge", "join",
            "groupby", "agg", "aggregate", "arrow", "pyarrow", "parquet", "csv", "excel", "sql",
            "table", "column", "row", "index", "reindex", "dropna", "fillna", "isna", "notna",
            "dtype", "astype", "vectorize", "iterrows", "itertuples", "copy on write", "copy_on_write",
            "cow", "settingwithcopy", "query", "apply", "map", "melt", "pivot", "crosstab", "rolling",
            "resample", "datetime", "timestamp", "sort values", "sort_values", "sort index", "reset index",
            "reset_index", "set index", "set_index", "drop", "rename", "duplicated", "drop duplicates",
            "drop_duplicates", "memory usage", "memory_usage", "chunksize", "to csv", "to_csv",
            "read csv", "read_csv", "read parquet", "read_parquet", "python", "numpy", "array",
            "data", "dataset", "tabular", "clean", "filter", "slice", "correlation", "describe",
            "head", "tail", "shape", "info"
        ]

        return any(k in lower or k in normalized for k in data_keywords)

    @classmethod
    def get_greeting_response(cls, is_arabic: bool) -> str:
        if is_arabic:
            return (
                "أهلاً بك! أنا **PandaPulse AI**، مساعدك المتخصص حصرياً في مكتبة **Pandas 2.0+** وهندسة البيانات في بايثون. 🚀\n\n"
                "كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن أي عملية في معالجة البيانات مثل:\n"
                "- دمج وتجميع الجداول بدون أخطاء (`pd.concat` و `pd.merge`)\n"
                "- الفهرسة والاختيار الاحترافي (`.loc` و `.iloc`)\n"
                "- تسريع الأداء وخفض استهلاك الذاكرة عبر محرك **Apache Arrow**\n"
                "- تجميع البيانات والإحصائيات المتقدمة (`groupby` و `agg`)\n"
                "- معالجة القيم المفقودة وتنظيف البيانات (`dropna` و `fillna`)"
            )
        return (
            "Hello! I am **PandaPulse AI**, your neural copilot specialized exclusively in modern **Pandas 2.0+** and Python data engineering. 🚀\n\n"
            "How can I help you today? Feel free to ask about:\n"
            "- Concatenating and merging tables (`pd.concat` & `pd.merge`)\n"
            "- Selection & indexing (`.loc` and `.iloc`)\n"
            "- Memory reduction & vectorization with **Apache Arrow**\n"
            "- Aggregations and grouped analytics (`groupby`)\n"
            "- Missing data handling and cleaning"
        )

    @classmethod
    def get_out_of_scope_response(cls, is_arabic: bool) -> str:
        if is_arabic:
            return (
                "عذراً، بصفتي **PandaPulse AI**، أنا نظام ذكاء اصطناعي متخصص **حصرياً** في مكتبة **Pandas 2.x** وهندسة ومعالجة البيانات في بايثون. 🛡️\n\n"
                "لا يمكنني الإجابة على استفسارات خارج هذا النطاق التخصصي. يُرجى طرح سؤال يتعلق بالجداول (`DataFrames`)، تنظيف وتصفية البيانات، أو تحسين أداء استعلامات Pandas وسأكون سعيداً بتقديم كود وشرح تفصيلي."
            )
        return (
            "Sorry, as **PandaPulse AI**, I am specialized **exclusively** in the Python **Pandas 2.x** library and tabular data engineering. 🛡️\n\n"
            "I cannot answer queries outside this technical domain. Please ask a question related to DataFrames, data cleaning, transformations, indexing, or performance optimization, and I will be happy to assist you."
        )

    @staticmethod
    def compute_cache_key(query: str, top_k: int) -> str:
        """Generate deterministic SHA-256 hash for normalized query and parameters."""
        normalized = f"{query.strip().lower()}::{top_k}"
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    async def execute(self, request: QueryRequestDTO) -> QueryResponseDTO:
        """Execute query with cache-first routing and scope guardrails."""
        start_time = time.perf_counter()
        is_ar = self.contains_arabic(request.query)

        # 1. Scope Guardrail: Greetings
        if self.is_greeting(request.query):
            greeting_text = self.get_greeting_response(is_ar)
            latency_ms = (time.perf_counter() - start_time) * 1000
            return QueryResponseDTO(
                answer=greeting_text,
                citations=[],
                latency_ms=round(latency_ms, 2),
                cached=False,
                model_name=getattr(self.llm_provider, "model_name", "qwen2.5-coder:1.5b"),
            )

        # 2. Scope Guardrail: Out of Scope
        if not self.is_in_scope(request.query):
            refusal_text = self.get_out_of_scope_response(is_ar)
            latency_ms = (time.perf_counter() - start_time) * 1000
            return QueryResponseDTO(
                answer=refusal_text,
                citations=[],
                latency_ms=round(latency_ms, 2),
                cached=False,
                model_name=getattr(self.llm_provider, "model_name", "qwen2.5-coder:1.5b"),
            )

        # 3. Cache-First Lookup (O(1))
        cache_key = self.compute_cache_key(request.query, request.top_k)
        cached_result = self.cache.get(cache_key)
        if cached_result:
            latency_ms = (time.perf_counter() - start_time) * 1000
            return QueryResponseDTO(
                answer=cached_result.answer,
                citations=cached_result.citations,
                latency_ms=round(latency_ms, 2),
                cached=True,
                tokens_generated=cached_result.tokens_generated,
                model_name=cached_result.model_name,
            )

        # 4. Vector Store Similarity Search with query expansion
        retrieval_query = self.expand_query_for_retrieval(request.query)
        retrieved_results: List[RetrievalResult] = await self.vector_store.similarity_search(
            query=retrieval_query,
            top_k=request.top_k,
        )

        # 5. Construct Guardrailed In-Scope Distinctive Prompt
        prompt_template = PromptTemplate(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=request.query,
        )
        context_str = prompt_template.render_context(retrieved_results)

        full_prompt = (
            f"You are PandaPulse AI, an elite Python Pandas 2.x specialist and data engineering copilot.\n\n"
            f"DOCUMENTATION CONTEXT:\n{context_str}\n\n"
            f"USER QUERY:\n{request.query}\n\n"
            f"RESPONSE REQUIREMENTS:\n"
            f"1. Explain the modern solution in depth, based on the documentation context above.\n"
            f"2. Provide clean, production-ready, readable Python code blocks using modern Pandas 2.0+ patterns.\n"
            f"3. Strictly forbid deprecated APIs (no .append(), no .ix, use pd.concat, explicit .loc/.iloc).\n"
            f"4. Highlight best practices (Copy-on-Write, vectorization, PyArrow engines).\n"
            f"5. Language: Respond in {'Arabic' if is_ar else 'English'}."
        )

        # 6. Generate Response from LLM
        response: LLMResponse = await self.llm_provider.generate(
            prompt=full_prompt,
            system_prompt=self.SYSTEM_PROMPT,
        )

        # 7. Extract Citations
        citations = []
        for res in retrieved_results:
            citations.append({
                "source": res.chunk.source_file,
                "score": round(res.similarity_score, 4),
                "snippet": res.chunk.content[:200] + "..." if len(res.chunk.content) > 200 else res.chunk.content,
                "chunk_id": res.chunk.id,
            })
        response.citations = citations

        latency_ms = (time.perf_counter() - start_time) * 1000
        response.latency_ms = round(latency_ms, 2)

        # 8. Store in LRU Cache
        self.cache.set(cache_key, response)

        return QueryResponseDTO(
            answer=response.answer,
            citations=response.citations,
            latency_ms=response.latency_ms,
            cached=False,
            tokens_generated=response.tokens_generated,
            model_name=response.model_name,
        )

    async def execute_stream(
        self, request: QueryRequestDTO
    ) -> AsyncIterator[dict]:
        """Stream response tokens via Server-Sent Events (SSE) with Scope Guardrails."""
        start_time = time.perf_counter()
        is_ar = self.contains_arabic(request.query)
        model_id = getattr(self.llm_provider, "model_name", "qwen2.5-coder:1.5b")

        # 1. Scope Guardrail: Greeting
        if self.is_greeting(request.query):
            greeting_text = self.get_greeting_response(is_ar)
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            yield {
                "event": "meta",
                "data": {"cached": False, "citations": [], "model": model_id, "latency_ms": latency_ms},
            }
            words = greeting_text.split(" ")
            for i, word in enumerate(words):
                token = word if i == len(words) - 1 else word + " "
                yield {"event": "token", "data": {"token": token}}
            yield {"event": "done", "data": {"status": "complete", "latency_ms": latency_ms}}
            return

        # 2. Scope Guardrail: Out of Scope
        if not self.is_in_scope(request.query):
            refusal_text = self.get_out_of_scope_response(is_ar)
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            yield {
                "event": "meta",
                "data": {"cached": False, "citations": [], "model": model_id, "latency_ms": latency_ms},
            }
            words = refusal_text.split(" ")
            for i, word in enumerate(words):
                token = word if i == len(words) - 1 else word + " "
                yield {"event": "token", "data": {"token": token}}
            yield {"event": "done", "data": {"status": "complete", "latency_ms": latency_ms}}
            return

        # 3. Cache-First Check
        cache_key = self.compute_cache_key(request.query, request.top_k)
        cached_result = self.cache.get(cache_key)
        if cached_result:
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            yield {
                "event": "meta",
                "data": {
                    "cached": True,
                    "citations": cached_result.citations,
                    "model": cached_result.model_name or "cache",
                    "latency_ms": latency_ms,
                },
            }
            words = cached_result.answer.split(" ")
            for i, word in enumerate(words):
                token = word if i == len(words) - 1 else word + " "
                yield {"event": "token", "data": {"token": token}}
            yield {"event": "done", "data": {"status": "complete", "latency_ms": latency_ms}}
            return

        # 4. Vector Retrieval with Query Expansion
        retrieval_query = self.expand_query_for_retrieval(request.query)
        retrieved_results = await self.vector_store.similarity_search(
            query=retrieval_query,
            top_k=request.top_k,
        )

        citations = [
            {
                "source": res.chunk.source_file,
                "score": round(res.similarity_score, 4),
                "snippet": res.chunk.content[:200] + "..." if len(res.chunk.content) > 200 else res.chunk.content,
                "chunk_id": res.chunk.id,
            }
            for res in retrieved_results
        ]

        yield {
            "event": "meta",
            "data": {
                "cached": False,
                "citations": citations,
                "model": model_id,
            },
        }

        # 5. In-Scope Distinctive RAG Prompt
        prompt_template = PromptTemplate(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=request.query,
        )
        context_str = prompt_template.render_context(retrieved_results)
        full_prompt = (
            f"You are PandaPulse AI, an elite Python Pandas 2.x specialist and data engineering copilot.\n\n"
            f"DOCUMENTATION CONTEXT:\n{context_str}\n\n"
            f"USER QUERY:\n{request.query}\n\n"
            f"RESPONSE REQUIREMENTS:\n"
            f"1. Explain the modern solution in depth, based on the documentation context above.\n"
            f"2. Provide clean, production-ready, readable Python code blocks using modern Pandas 2.0+ patterns.\n"
            f"3. Strictly forbid deprecated APIs (no .append(), no .ix, use pd.concat, explicit .loc/.iloc).\n"
            f"4. Highlight best practices (Copy-on-Write, vectorization, PyArrow engines).\n"
            f"5. Language: Respond in {'Arabic' if is_ar else 'English'}."
        )

        accumulated_tokens = []
        token_count = 0
        async for token in self.llm_provider.generate_stream(full_prompt, self.SYSTEM_PROMPT):
            accumulated_tokens.append(token)
            token_count += 1
            yield {"event": "token", "data": {"token": token}}

        total_latency = round((time.perf_counter() - start_time) * 1000, 2)
        full_answer = "".join(accumulated_tokens)

        # Store in cache only if tokens were generated
        if full_answer.strip():
            response_obj = LLMResponse(
                answer=full_answer,
                citations=citations,
                latency_ms=total_latency,
                cached=False,
                tokens_generated=token_count,
                model_name=model_id,
            )
            self.cache.set(cache_key, response_obj)

        yield {
            "event": "done",
            "data": {
                "status": "complete",
                "latency_ms": total_latency,
                "tokens": token_count,
            },
        }


class IngestDocsUseCase:
    """Orchestrates document loading, chunking, hash checking, and vector store population."""

    def __init__(
        self,
        doc_loader: IDocLoader,
        vector_store: IVectorStore,
        cache: ICache,
    ):
        self.doc_loader = doc_loader
        self.vector_store = vector_store
        self.cache = cache

    async def execute(self, request: IngestRequestDTO) -> IngestResponseDTO:
        start_time = time.perf_counter()
        dir_path = request.directory_path or "./data/pandas_docs"

        chunks = self.doc_loader.load_and_chunk(dir_path)

        if not chunks:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return IngestResponseDTO(
                status="no_documents_found",
                indexed_files=0,
                skipped_files=0,
                total_chunks=0,
                duration_ms=duration_ms,
            )

        if request.force_reindex:
            self.vector_store.clear()
            self.cache.clear()

        indexed_count = await self.vector_store.add_chunks(chunks)
        self.cache.clear()

        unique_files = {c.source_file for c in chunks}
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return IngestResponseDTO(
            status="success",
            indexed_files=len(unique_files),
            skipped_files=0,
            total_chunks=indexed_count,
            duration_ms=duration_ms,
            manifest_summary={
                "unique_files": list(unique_files),
                "total_chunks_stored": self.vector_store.count(),
            },
        )


class GetStatusUseCase:
    """Orchestrates system diagnostics, cache statistics, and vector metrics."""

    def __init__(
        self,
        vector_store: IVectorStore,
        cache: ICache,
        llm_provider: ILLMProvider,
    ):
        self.vector_store = vector_store
        self.cache = cache
        self.llm_provider = llm_provider

    async def execute(self) -> StatusResponseDTO:
        total_chunks = self.vector_store.count()
        cache_stats = self.cache.get_stats()
        is_ollama_online = await self.llm_provider.is_available()

        return StatusResponseDTO(
            service="PandaPulse AI Core",
            version="1.0.0",
            status="healthy",
            total_indexed_chunks=total_chunks,
            cache_stats=cache_stats,
            ollama_status="online" if is_ollama_online else "offline / fallback_mode",
            active_model=getattr(self.llm_provider, "model_name", "qwen2.5-coder:1.5b"),
            embedding_model="nomic-embed-text",
        )
