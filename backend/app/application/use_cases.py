"""Application Use Cases for PandaPulse AI.

Implements business orchestration, cache-first routing, architectural guardrails,
strict domain scope filtering, and streaming token pipeline according to Clean Architecture.
"""

import asyncio
import hashlib
import re
import time
from collections.abc import AsyncIterator

from app.application.dto import (
    IngestRequestDTO,
    IngestResponseDTO,
    QueryRequestDTO,
    QueryResponseDTO,
    StatusResponseDTO,
)
from app.domain.entities import LLMResponse, PromptTemplate, RetrievalResult
from app.domain.interfaces import ICache, IDocLoader, ILLMProvider, IVectorStore


class QueryPandasDocsUseCase:
    """Orchestrates Cache-first Retrieval-Augmented Generation for Pandas queries."""

    # Generative AI Prompt with DeepSeek / ChatGPT lively conversational reasoning
    SYSTEM_PROMPT = """أنت PandaPulse AI، مهندس برمجيات وذكاء اصطناعي خبير ومبدع، متخصص في لغة Python بكافة مستوياتها (الأساسيات، الدوال، الهياكل، البرمجة الكائنية OOP، التعامل مع الملفات والبيانات) ومكتبة Pandas 2.0+ المتقدمة.

أنت ذكي ومبدع وتفكر بعمق مثل ChatGPT و DeepSeek:
1. الفهم المباشر والإجابة على قدر السؤال تحديداً:
   - افهم ما يطلبه المستخدم بدقة وأجب عليه مباشرة دون أي حشو أو مقدمات مسبقة الصنع.
   - إذا طلب كود بايثون عام أو بسيط (مثل "اكتبي كود بايثون" أو "اشرح الدوال في بايثون")، اكتب كود بايثون نظيفاً ومباشراً مع شرح موجز ومفيد، ولا تجبر السؤال على مكتبة Pandas إلا إذا كان السؤال يتعلق بالبيانات أو طلب ذلك المستخدم.
   - إذا سأل استفساراً حوارياً أو متابعة (مثل "اتخيل ماذا؟")، تفاعل معه بحوار ذكي، عفوي ولطيف دون خطب أو تشبيهات متكلفة.
   - ممنوع تماماً ومطلقاً تكرار أي عبارة محفوظة مثل "تخيل أن إكسل خارق بمحركات نفاثة" أو أي افتتاحية مكررة. كل رسالة يجب أن تكون فريدة كلياً وتبدأ مباشرة في صلب الموضوع.
2. نطاق التخصص (Python & Pandas):
   - تجيب باحترافية عن كل ما يخص لغة Python ومكتبة Pandas وهندسة وتحليل البيانات.
   - إذا كان السؤال عن Pandas، التزم بأحدث معايير 2.0+ (استخدام pd.concat بدلاً من .append، ومحرك Arrow، وأمان Copy-on-Write).
3. عند الخروج التام عن السياق البرمجي والتقني:
   - إذا سُئلت عن موضوع غير تقني تماماً (مثل الطبخ، الرياضة، السياسة)، رد برسالة قصيرة وموجزة جداً من سطر واحد فقط توضح تخصصك.
4. الأسلوب واللغة:
   - لغة عربية فصحى طبيعية وسلسة وممتعة دون تكلف.
   - الأكواد البرمجية داخل كتل ```python نظيفة ومباشرة وتعمل فوراً."""

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
        "دالة": "function def parameters return callable",
        "دوال": "functions methods arguments return",
        "كلاس": "class object oop dataclass",
        "كلاسات": "classes objects oop inheritance",
        "وراثة": "inheritance polymorphism oop",
        "مصفوفة": "array numpy list vector ndarray",
        "قائمة": "list array collection append pop slice",
        "قوائم": "lists collections sequences",
        "قاموس": "dict dictionary key value hash map",
        "قواميس": "dictionaries dicts hash maps",
        "مجموعة": "set unique membership deduplication",
        "مجموعات": "sets unique collections",
        "حلقة": "loop for while iteration iterator",
        "تكرار": "iteration loop range enumerate",
        "استثناء": "exception try except error raise handling",
        "استثناءات": "exceptions error handling try except",
        "أخطاء": "errors exception handling try except",
        "خطأ": "error exception traceback",
        "مولد": "generator yield lazy stream iterator",
        "مولدات": "generators yield stream memory",
        "نوع": "type typing typehint annotation",
        "أنواع": "types typing annotations literals",
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
        """Domain guardrail: rejects explicit non-technical noise while allowing the LLM full generative freedom."""
        lower = query.lower()

        offtopic_terms = [
            "نابليون", "سياسة", "طبخ", "طعام", "وصفة", "شعر", "قصيدة", "أغنية", "اغنية",
            "فيلم", "مسلسل", "كرة", "رياضة", "نكتة", "طقس", "عاصمة", "رئيس", "دين", "فلسفة",
            "علاج", "دواء", "سيارة", "لعبة", "كيك", "بيتزا", "مطبخ",
            "politics", "cook", "recipe", "poem", "poetry", "song", "movie", "film",
            "football", "soccer", "basketball", "sport", "joke", "weather", "president",
            "religion", "philosophy", "medicine", "pill", "game", "cake", "pizza", "kitchen"
        ]
        if any(term in lower for term in offtopic_terms):
            return False

        # Allow all programming, data, comparative, and follow-up inquiries to reach the LLM directly
        return True

    @classmethod
    def get_greeting_response(cls, is_arabic: bool) -> str:
        if is_arabic:
            return (
                "أهلاً بك! أنا **PandaPulse AI**، مساعدك المتخصص في لغة **Python** ومكتبة **Pandas** وهندسة البيانات. 🚀\n\n"
                "كيف يمكنني مساعدتك برمجياً اليوم؟ يمكنك سؤالي عن:\n"
                "- كتابة أكواد وتطبيقات بايثون المتنوعة\n"
                "- دمج ومعالجة الجداول في Pandas (`pd.concat` و `pd.merge`)\n"
                "- الفهرسة والتصفية الاحترافية (`.loc` و `.iloc`)\n"
                "- تسريع الأداء وخفض الذاكرة عبر محرك **Apache Arrow**\n"
                "- تنظيف البيانات وتجميع الإحصائيات (`groupby` و `dropna`)"
            )
        return (
            "Hello! I am **PandaPulse AI**, your copilot specialized in **Python** programming, modern **Pandas 2.0+**, and data engineering. 🚀\n\n"
            "How can I help you today? Feel free to ask about:\n"
            "- Python programming concepts and scripts\n"
            "- Modern Pandas dataframe transformations and joins\n"
            "- Vectorized operations & Apache Arrow acceleration\n"
            "- Aggregations, groupings, and data cleansing"
        )

    @classmethod
    def get_out_of_scope_response(cls, is_arabic: bool) -> str:
        if is_arabic:
            return "عذراً، تخصصي محصور في لغة بايثون ومكتبة Pandas وهندسة البيانات 🐼. كيف يمكنني مساعدتك برمجياً؟"
        return "I specialize exclusively in Python programming, Pandas, and data engineering 🐼. How can I assist you with your code?"

    @classmethod
    def generate_reasoning_thoughts(
        cls, query: str, retrieved_results: list[RetrievalResult], is_arabic: bool
    ) -> list[str]:
        """Generates dynamic, intellectual Chain-of-Thought reasoning steps (DeepSeek-R1 / ChatGPT style)."""
        q_lower = query.lower()
        if is_arabic:
            # 1. General Python queries (basics, scripts, code, functions, loops)
            if any(k in q_lower for k in ["بايثون", "python", "كود", "دالة", "حلقة", "قائمة", "كلاس", "برنامج", "script", "def", "class", "loop", "print"]):
                return [
                    f"المستخدم يطلب كتابة أو استفساراً عن بايثون: '{query.strip()}'.",
                    "دعني أحدد المطلوب برمجياً بدقة وأصيغ حلاً بيانياً ونظيفاً في بايثون.",
                    "سأراعي كتابة كود سليم ومباشر مع تعليقات وشرح موجز وواضح.",
                    "الآن، سأبدأ في كتابة الكود المطلوب والشرح المفيد..."
                ]

            # 2. Short Conversational / Dialogue inquiries (e.g. "اتخيل ماذا؟")
            words_count = len(query.strip().split())
            if words_count <= 4 and not any(k in q_lower for k in ["pandas", "بانداس", "بيانات", "جدول", "dataframe", "series"]):
                return [
                    f"المستخدم يطرح استفساراً حوارياً: '{query.strip()}'.",
                    "دعني أتفاعل معه بذكاء وأسلوب حواري طبيعي ولبق مثل ChatGPT.",
                    "سأجيب بتلقائية دون أي تكلف أو قوالب مسبقة، مع إمكانية توجيه الحديث برمجياً.",
                    "الآن، سأصيغ الرد المباشر..."
                ]

            # 3. Overview / Introduction to Pandas
            if any(k in q_lower for k in ["اشرحلي", "ما هي", "عرفني", "شرح", "مكتبة", "بانداس", "نبذة"]):
                return [
                    f"المستخدم يطلب شرحاً عن: '{query.strip()}'. حسناً، سأقدم نظرة شاملة وذكية.",
                    "سأوضح الركائز الأساسية مثل Series و DataFrame وأحدث مزايا Pandas 2.0+.",
                    "سأبتعد عن الحشو وأقدم مثالاً تطبيقياً سريعاً وواضحاً.",
                    "الآن، سأبدأ في صياغة الشرح بلغة عربية فصيحة وسلسة..."
                ]

            # 4. Comparison & Distinctions
            if any(k in q_lower for k in ["يميزها", "مميزات", "ميزة", "مقارنة", "مقارنه", "فرق", "الفرق", "باقي", "غيرها", "بديل", "polars", "numpy", "إكسل", "اكسل"]):
                return [
                    f"استفسار محوري ومقارنة تقنية: '{query.strip()}'.",
                    "سأحلل الفروق المعمارية ونقاط القوة والضعف بشكل موضوعي وعملي.",
                    "سأوضح التفوق في الأتمتة البرمجية والتكامل مع أدوات الذكاء الاصطناعي.",
                    "سأبدأ الآن في عرض المقارنة بشكل منظم ومباشر..."
                ]

            # 5. Concat / Merge
            if any(k in q_lower for k in ["دمج", "ربط", "concat", "merge", "join", "append"]):
                return [
                    f"السؤال يتعلق بدمج أو ربط البيانات: '{query.strip()}'.",
                    "سأعتمد على pd.concat و pd.merge مع مراعاة إلغاء دالة append في Pandas الحديثة.",
                    "سأكتب كوداً توضيحياً مباشراً وسهل التطبيق.",
                    "الآن، سأصيغ الرد والكود بدقة..."
                ]

            # 6. Performance & Memory
            if any(k in q_lower for k in ["أداء", "اداء", "ذاكرة", "تسريع", "arrow", "pyarrow", "cow", "copy on write"]):
                return [
                    f"المستخدم مهتم بتحسين الأداء واستهلاك الذاكرة: '{query.strip()}'.",
                    "سأركز على دعم Apache Arrow والعمليات المتجهة (Vectorization) و Copy-on-Write.",
                    "سأكتب مثالاً برمجياً يقارن أو يوضح التفعيل الفعلي.",
                    "دعني أصيغ الرد الآن بأسلوب تقني عميق ومباشر..."
                ]

            # General Technical Query
            return [
                f"المستخدم يستفسر عن: '{query.strip()}'. دعني أحلل المطلوب البرمجي بدقة.",
                "سأتحقق من المعايير الصحيحة وأحدد أسهل وأفضل طريقة للتطبيق في بايثون أو بانداس.",
                "سأبتعد عن الحشو وأركز على تقديم إجابة مباشرة وحل برمجي سليم.",
                "الآن، سأبدأ في صياغة الإجابة..."
            ]
        else:
            # English CoT
            return [
                f"The user is asking: '{query.strip()}'. Let's break this down systematically.",
                "Formulating an idiomatic, clean Python/Pandas solution according to modern standards.",
                "Ensuring code is verified, concise, and directly answers the user's intent.",
                "Synthesizing the final response now..."
            ]

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
        retrieved_results: list[RetrievalResult] = await self.vector_store.similarity_search(
            query=retrieval_query,
            top_k=request.top_k,
        )

        # 5. Construct Guardrailed In-Scope Distinctive Prompt
        prompt_template = PromptTemplate(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=request.query,
        )
        context_str = prompt_template.render_context(retrieved_results)

        if is_ar:
            guidelines = (
                "أجب بذكاء وسلاسة ودقة على سؤال المستخدم المحدد فقط. "
                "إذا طلب كود بايثون بسيط أو عام (مثل 'اكتبي كود بايثون')، اكتب كود بايثون نظيفاً ومباشراً مع شرح موجز ومفيد ولا تقحم Pandas. "
                "إذا سأل استفساراً حوارياً أو متابعة (مثل 'اتخيل ماذا؟')، أجب بشكل حواري طبيعي وذكي دون تكرار أي مقدمات أو تشبيهات سابقة. "
                "إياك وتكرار نفس المقدمة أو التشبيه في كل رسالة؛ اجعل كل رد مخصصاً ومفصلاً لما طلبه المستخدم تحديداً. "
                "التوثيق المرفق أعلاه للاستئناس فقط إذا كان السؤال عن Pandas؛ إذا لم يكن السؤال عن Pandas فتجاهل التوثيق وأجب مباشرة عن بايثون."
            )
            full_prompt = (
                f"--- توثيق PANDAS (للاستئناس فقط إن كان السؤال يخصها) ---\n{context_str}\n\n"
                f"--- سؤال المستخدم ---\n{request.query}\n\n"
                f"[توجيه حاسم: {guidelines} الإجابة باللغة العربية الفصحى السليمة.]\n\n"
                f"--- الإجابة المباشرة ---\n"
            )
        else:
            guidelines = (
                "Answer the user's specific request directly, accurately, and naturally. "
                "If they ask for simple Python code, provide clean, idiomatic Python code with concise explanation, without forcing Pandas. "
                "If they ask a conversational follow-up, engage naturally without repeating prior canned introductions. "
                "Pandas context is for reference only; if the query is general Python, focus entirely on pure Python."
            )
            full_prompt = (
                f"--- PANDAS CONTEXT (Reference only) ---\n{context_str}\n\n"
                f"--- USER QUESTION ---\n{request.query}\n\n"
                f"[Guidance: {guidelines}]\n\n"
                f"--- DIRECT ANSWER ---\n"
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

        # Emit status event: Analyzing & Retrieval
        yield {
            "event": "status",
            "data": {
                "step": "analyzing",
                "message": "تحليل السؤال وتحديد معايير Pandas 2.0+..." if is_ar else "Analyzing query and verifying cache...",
            },
        }

        # 4. Vector Retrieval with Query Expansion
        retrieval_query = self.expand_query_for_retrieval(request.query)
        retrieved_results = await self.vector_store.similarity_search(
            query=retrieval_query,
            top_k=request.top_k,
        )

        yield {
            "event": "status",
            "data": {
                "step": "retrieving",
                "message": f"تم استرجاع {len(retrieved_results)} مصادر توثيق معتمدة..." if is_ar else f"Retrieved {len(retrieved_results)} verified docs...",
            },
        }

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

        # 5. DeepSeek-R1 / ChatGPT Active Thinking Phase
        yield {
            "event": "status",
            "data": {
                "step": "thinking",
                "message": "جاري التفكير والاستدلال العصبي..." if is_ar else "Neural reasoning and chain-of-thought...",
            },
        }

        reasoning_thoughts = self.generate_reasoning_thoughts(request.query, retrieved_results, is_ar)
        for thought in reasoning_thoughts:
            yield {"event": "thought", "data": {"thought": thought}}
            await asyncio.sleep(0.18)

        yield {
            "event": "status",
            "data": {
                "step": "synthesizing",
                "message": "صياغة الحل البرمجي الأمثل وتوليد الكود..." if is_ar else "Synthesizing idiomatic solution and generating code...",
            },
        }

        # 6. In-Scope Distinctive RAG Prompt
        prompt_template = PromptTemplate(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=request.query,
        )
        context_str = prompt_template.render_context(retrieved_results)

        if is_ar:
            stream_guidelines = (
                "أجب بذكاء وسلاسة ودقة على سؤال المستخدم المحدد فقط. "
                "إذا طلب كود بايثون بسيط أو عام (مثل 'اكتبي كود بايثون')، اكتب كود بايثون نظيفاً ومباشراً مع شرح موجز ومفيد ولا تقحم Pandas. "
                "إذا سأل استفساراً حوارياً أو متابعة (مثل 'اتخيل ماذا؟')، أجب بشكل حواري طبيعي وذكي دون تكرار أي مقدمات أو تشبيهات سابقة. "
                "إياك وتكرار نفس المقدمة أو التشبيه في كل رسالة؛ اجعل كل رد مخصصاً ومفصلاً لما طلبه المستخدم تحديداً. "
                "التوثيق المرفق أعلاه للاستئناس فقط إذا كان السؤال عن Pandas؛ إذا لم يكن السؤال عن Pandas فتجاهل التوثيق وأجب مباشرة عن بايثون."
            )
            full_prompt = (
                f"--- توثيق PANDAS (للاستئناس فقط إن كان السؤال يخصها) ---\n{context_str}\n\n"
                f"--- سؤال المستخدم ---\n{request.query}\n\n"
                f"[توجيه حاسم: {stream_guidelines} الإجابة باللغة العربية الفصحى السليمة.]\n\n"
                f"--- الإجابة المباشرة ---\n"
            )
        else:
            stream_guidelines = (
                "Answer the user's specific request directly, accurately, and naturally. "
                "If they ask for simple Python code, provide clean, idiomatic Python code with concise explanation, without forcing Pandas. "
                "If they ask a conversational follow-up, engage naturally without repeating prior canned introductions. "
                "Pandas context is for reference only; if the query is general Python, focus entirely on pure Python."
            )
            full_prompt = (
                f"--- PANDAS CONTEXT (Reference only) ---\n{context_str}\n\n"
                f"--- USER QUESTION ---\n{request.query}\n\n"
                f"[Guidance: {stream_guidelines}]\n\n"
                f"--- DIRECT ANSWER ---\n"
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
