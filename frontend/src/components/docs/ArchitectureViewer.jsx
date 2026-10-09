import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Workflow, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Database, 
  Cpu, 
  Terminal,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const ArchitectureViewer = () => {
  const [activeTab, setActiveTab] = useState('layers'); // 'layers' | 'pipeline' | 'complexity'

  return (
    <div className="py-10 px-4 sm:px-6 max-w-6xl mx-auto pb-36 font-sans">
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#6799fe] mb-2 block">
          Clean Architecture & Execution Spec
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-medium text-white tracking-tight mb-3">
          Architecture Blueprint & Execution Spec
        </h1>
        <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Strict separation of concerns adhering to SOLID principles and the Dependency Inversion Principle (DIP).
        </p>

        {/* DeepSeek Style Tab Switcher */}
        <div className="inline-flex p-1 mt-6 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl select-none">
          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'layers'
                ? 'bg-white text-[#0a0a0a] shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Clean Architecture Layers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-white text-[#0a0a0a] shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            RAG Pipeline Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('complexity')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'complexity'
                ? 'bg-white text-[#0a0a0a] shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Complexity & Big-O
          </button>
        </div>
      </div>

      {/* Tab 1: Clean Architecture Layers */}
      {activeTab === 'layers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain Layer */}
            <div className="ds-card p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#6799fe] group-hover:scale-105 transition-transform">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white font-display">1. Domain Layer (Core Business Rules)</h3>
                  <span className="text-xs font-mono text-[#6799fe]">Pure Python • Zero Framework Dependencies</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
                Contains enterprise business entities and abstract protocols (interfaces). The application and external layers depend inward on these abstractions.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">Entities:</span> DocumentChunk, RetrievalResult, Query, PromptTemplate, LLMResponse
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">Interfaces:</span> IVectorStore, ILLMProvider, ICache, IDocLoader, IEmbeddingProvider
                </div>
              </div>
            </div>

            {/* Application Layer */}
            <div className="ds-card p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#6799fe] group-hover:scale-105 transition-transform">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white font-display">2. Application Layer (Use Cases)</h3>
                  <span className="text-xs font-mono text-[#6799fe]">Business Orchestration & Invariants</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
                Orchestrates data flow between cache, vector store, and LLM providers. Implements the cache-first routing logic and system guardrails.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">QueryPandasDocsUseCase:</span> Cache-first check, prompt guardrail formatting, SSE stream
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">IngestDocsUseCase:</span> SHA-256 hash validation, incremental chunk indexing, cache invalidation
                </div>
              </div>
            </div>

            {/* Infrastructure Layer */}
            <div className="ds-card p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#6799fe] group-hover:scale-105 transition-transform">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white font-display">3. Infrastructure Layer</h3>
                  <span className="text-xs font-mono text-[#6799fe]">Database & External Service Adapters</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
                Concrete implementations of domain interfaces. Handles disk I/O, network requests, ChromaDB persistence, and Ollama HTTP endpoints.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">ChromaVectorManager:</span> ChromaDB Cosine Collection & HybridEmbedder
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">LRUQueryCache:</span> Thread-safe OrderedDict cache with eviction stats
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">OllamaProvider:</span> Llama 3 client with async generator stream & fallback
                </div>
              </div>
            </div>

            {/* Presentation Layer */}
            <div className="ds-card p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#6799fe] group-hover:scale-105 transition-transform">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white font-display">4. Presentation Layer</h3>
                  <span className="text-xs font-mono text-[#6799fe]">FastAPI Routers & Pydantic v2 Schemas</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
                Exposes HTTP and Server-Sent Events (SSE) interfaces. Handles input sanitization, dependency injection containers, and output serialization.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">Endpoints:</span> /api/v1/stream-chat, /chat, /status, /reindex, /chunks
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80">
                  <span className="text-[#6799fe] font-semibold">Dependencies:</span> get_query_use_case(), get_vector_store(), get_cache()
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RAG Pipeline Flow */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Query Ingestion & SHA-256 Hashing',
              desc: 'Client sends query via /api/v1/stream-chat. Text is trimmed, normalized, and hashed with SHA-256 for O(1) cache indexing.',
              tag: 'Sub-millisecond Pre-processing',
            },
            {
              step: '02',
              title: 'Cache-First Routing Check',
              desc: 'Thread-safe LRU cache checks if the hashed query exists in memory. On hit, tokens are streamed immediately (< 0.8ms).',
              tag: 'O(1) Memory Lookup',
            },
            {
              step: '03',
              title: 'Cosine Vector Similarity Search',
              desc: 'On cache miss, the query is embedded via nomic-embed-text (or hybrid vectorizer). ChromaDB retrieves top-k (k=3) semantic chunks.',
              tag: 'Cosine Distance Retrieval',
            },
            {
              step: '04',
              title: 'Pandas 2.x Guardrail Injection',
              desc: 'Context is merged with system guardrails strictly prohibiting deprecated APIs (e.g. df.append(), .ix) and enforcing Copy-on-Write.',
              tag: 'Prompt Engineering Invariants',
            },
            {
              step: '05',
              title: 'Ollama Llama 3 SSE Token Stream',
              desc: 'Tokens stream back in real-time via FastAPI AsyncIterator and are cached in the LRU store for subsequent sub-millisecond retrieval.',
              tag: 'Live SSE Streaming',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="ds-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold font-mono text-[#6799fe] shrink-0 tracking-tight">
                  {item.step}
                </span>
                <div>
                  <h4 className="text-base font-semibold text-white mb-1 font-display">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] text-white/70 border border-white/[0.08] shrink-0">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Time Complexity & Big-O Analysis */}
      {activeTab === 'complexity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ds-card p-6">
            <div className="text-[#6799fe] font-mono text-xs font-medium tracking-wider mb-2">QUERY CACHE</div>
            <div className="text-3xl font-display font-medium text-white tracking-tight mb-2">O(1)</div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 font-display">LRU Memory Lookup & Eviction</h4>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Hash map lookup combined with doubly-linked list node repositioning guarantees constant-time lookups and deletions regardless of cache size.
            </p>
          </div>

          <div className="ds-card p-6">
            <div className="text-[#6799fe] font-mono text-xs font-medium tracking-wider mb-2">VECTOR RETRIEVAL</div>
            <div className="text-3xl font-display font-medium text-white tracking-tight mb-2">O(log N)</div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 font-display">ChromaDB HNSW Graph Search</h4>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Hierarchical Navigable Small World (HNSW) graph index searches logarithmic layers of vector space for fast approximate nearest neighbor retrieval.
            </p>
          </div>

          <div className="ds-card p-6">
            <div className="text-[#6799fe] font-mono text-xs font-medium tracking-wider mb-2">INDEX INGESTION</div>
            <div className="text-3xl font-display font-medium text-white tracking-tight mb-2">O(N)</div>
            <h4 className="text-sm font-semibold text-white/90 mb-2 font-display">SHA-256 Hashing & Chunking</h4>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Linear processing of documentation characters with sliding window overlap. Idempotent hash comparison skips unchanged files.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

