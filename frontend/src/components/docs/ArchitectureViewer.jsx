import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { GlassCard } from '../ui/GlassCard';

export const ArchitectureViewer = () => {
  const [activeTab, setActiveTab] = useState('layers'); // 'layers' | 'pipeline' | 'complexity'

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto pb-24">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Interactive <span className="text-gradient-cyan">Clean Architecture</span> Blueprint
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Strict separation of concerns adhering to SOLID principles and the Dependency Inversion Principle (DIP).
        </p>

        {/* Tab switcher */}
        <div className="inline-flex p-1 mt-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'layers'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Clean Architecture Layers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RAG Pipeline Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('complexity')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'complexity'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
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
            <GlassCard className="border-cyan-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">1. Domain Layer (Core Business Rules)</h3>
                  <span className="text-xs font-mono text-cyan-400">Pure Python • Zero Framework Dependencies</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Contains enterprise business entities and abstract protocols (interfaces). The application and external layers depend inward on these abstractions.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-cyan-400 font-semibold">Entities:</span> DocumentChunk, RetrievalResult, Query, PromptTemplate, LLMResponse
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-cyan-400 font-semibold">Interfaces:</span> IVectorStore, ILLMProvider, ICache, IDocLoader, IEmbeddingProvider
                </div>
              </div>
            </GlassCard>

            {/* Application Layer */}
            <GlassCard className="border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">2. Application Layer (Use Cases)</h3>
                  <span className="text-xs font-mono text-blue-400">Business Orchestration & Invariants</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Orchestrates data flow between cache, vector store, and LLM providers. Implements the cache-first routing logic and system guardrails.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-blue-400 font-semibold">QueryPandasDocsUseCase:</span> Cache-first check, prompt guardrail formatting, SSE stream
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-blue-400 font-semibold">IngestDocsUseCase:</span> SHA-256 hash validation, incremental chunk indexing, cache invalidation
                </div>
              </div>
            </GlassCard>

            {/* Infrastructure Layer */}
            <GlassCard className="border-indigo-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">3. Infrastructure Layer</h3>
                  <span className="text-xs font-mono text-indigo-400">Database & External Service Adapters</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Concrete implementations of domain interfaces. Handles disk I/O, network requests, ChromaDB persistence, and Ollama HTTP endpoints.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-indigo-400 font-semibold">ChromaVectorManager:</span> ChromaDB Cosine Collection & HybridEmbedder
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-indigo-400 font-semibold">LRUQueryCache:</span> Thread-safe OrderedDict cache with eviction stats
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-indigo-400 font-semibold">OllamaProvider:</span> Llama 3 client with async generator stream & fallback
                </div>
              </div>
            </GlassCard>

            {/* Presentation Layer */}
            <GlassCard className="border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">4. Presentation Layer</h3>
                  <span className="text-xs font-mono text-purple-400">FastAPI Routers & Pydantic v2 Schemas</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Exposes HTTP and Server-Sent Events (SSE) interfaces. Handles input sanitization, dependency injection containers, and output serialization.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-purple-400 font-semibold">Endpoints:</span> /api/v1/stream-chat, /chat, /status, /reindex, /chunks
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                  <span className="text-purple-400 font-semibold">Dependencies:</span> get_query_use_case(), get_vector_store(), get_cache()
                </div>
              </div>
            </GlassCard>
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
              color: 'text-cyan-400',
              border: 'border-cyan-500/30',
            },
            {
              step: '02',
              title: 'Cache-First Routing Check',
              desc: 'Thread-safe LRU cache checks if the hashed query exists in memory. On hit, tokens are streamed immediately (< 0.8ms).',
              tag: 'O(1) Memory Lookup',
              color: 'text-blue-400',
              border: 'border-blue-500/30',
            },
            {
              step: '03',
              title: 'Cosine Vector Similarity Search',
              desc: 'On cache miss, the query is embedded via nomic-embed-text (or hybrid vectorizer). ChromaDB retrieves top-k (k=3) semantic chunks.',
              tag: 'Cosine Distance Retrieval',
              color: 'text-indigo-400',
              border: 'border-indigo-500/30',
            },
            {
              step: '04',
              title: 'Pandas 2.x Guardrail Injection',
              desc: 'Context is merged with system guardrails strictly prohibiting deprecated APIs (e.g. df.append(), .ix) and enforcing Copy-on-Write.',
              tag: 'Prompt Engineering Invariants',
              color: 'text-amber-400',
              border: 'border-amber-500/30',
            },
            {
              step: '05',
              title: 'Ollama Llama 3 SSE Token Stream',
              desc: 'Tokens stream back in real-time via FastAPI AsyncIterator and are cached in the LRU store for subsequent sub-millisecond retrieval.',
              tag: 'Live SSE Streaming',
              color: 'text-emerald-400',
              border: 'border-emerald-500/30',
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-5 rounded-2xl glass-panel border ${item.border} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black font-mono ${item.color}`}>
                  {item.step}
                </span>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{item.desc}</p>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 shrink-0">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Time Complexity & Big-O Analysis */}
      {activeTab === 'complexity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="border-cyan-500/30">
            <div className="text-cyan-400 font-mono text-xs font-bold mb-2">QUERY CACHE</div>
            <div className="text-3xl font-extrabold text-white font-mono mb-2">O(1)</div>
            <h4 className="text-sm font-bold text-slate-200 mb-2">LRU Memory Lookup & Eviction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hash map lookup combined with doubly-linked list node repositioning guarantees constant-time lookups and deletions regardless of cache size.
            </p>
          </GlassCard>

          <GlassCard className="border-blue-500/30">
            <div className="text-blue-400 font-mono text-xs font-bold mb-2">VECTOR RETRIEVAL</div>
            <div className="text-3xl font-extrabold text-white font-mono mb-2">O(log N)</div>
            <h4 className="text-sm font-bold text-slate-200 mb-2">ChromaDB HNSW Graph Search</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hierarchical Navigable Small World (HNSW) graph index searches logarithmic layers of vector space for fast approximate nearest neighbor retrieval.
            </p>
          </GlassCard>

          <GlassCard className="border-amber-500/30">
            <div className="text-amber-400 font-mono text-xs font-bold mb-2">INDEX INGESTION</div>
            <div className="text-3xl font-extrabold text-white font-mono mb-2">O(N)</div>
            <h4 className="text-sm font-bold text-slate-200 mb-2">SHA-256 Hashing & Chunking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Linear processing of documentation characters with sliding window overlap. Idempotent hash comparison skips unchanged files.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
