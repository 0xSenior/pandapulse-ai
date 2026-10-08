import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookCheck, 
  Radio, 
  Lock,
  Code2,
  Database,
  Layers,
  Play,
  Cpu,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const FEATURES = [
  {
    icon: Code2,
    title: 'Python Core & Data Structures',
    subtitle: 'Big-O Optimized Foundations',
    summary: 'Generates clean, idiomatic Python with Big-O optimal collections, lazy evaluation, and strict typing.',
    badge: 'Python 3.12+',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    specs: [
      { icon: Zap, label: 'Big-O Optimal Collections' },
      { icon: Cpu, label: 'Lazy Yield Generators' },
      { icon: ShieldCheck, label: 'Slots Dataclasses' },
    ],
  },
  {
    icon: Database,
    title: 'Modern Pandas 2.0+ & PyArrow',
    subtitle: 'Apache Arrow Accelerated',
    summary: 'Native PyArrow-backed DataFrames with SIMD vector acceleration and native null handling.',
    badge: 'Arrow Engine',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    specs: [
      { icon: Zap, label: '70% Memory Reduction' },
      { icon: Database, label: 'Native pd.NA Support' },
      { icon: Cpu, label: 'SIMD Multi-Core Vector' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Strict Deprecation Shield',
    subtitle: 'Zero Legacy Syntax',
    summary: 'Permanently eliminates removed methods, enforcing modern vector alternatives and copy safety.',
    badge: 'Zero Deprecations',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    specs: [
      { icon: ShieldCheck, label: 'No df.append or .ix' },
      { icon: Layers, label: 'Vectorized pd.concat' },
      { icon: Lock, label: 'Copy-on-Write (CoW)' },
    ],
  },
  {
    icon: BookCheck,
    title: 'Grounded Neural RAG',
    subtitle: 'ChromaDB Vector Retrieval',
    summary: 'Authoritative documentation chunks ground every code snippet with verifiable source citations.',
    badge: 'Verified Citations',
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
    specs: [
      { icon: BookCheck, label: 'ChromaDB Vector Store' },
      { icon: Sparkles, label: 'Zero Hallucinations' },
      { icon: Layers, label: 'Official Doc Sources' },
    ],
  },
  {
    icon: Radio,
    title: 'Real-Time Streaming Engine',
    subtitle: 'Low-Latency SSE Pipeline',
    summary: 'FastAPI Server-Sent Events stream tokens in real time with transparent step-by-step reasoning.',
    badge: 'SSE Streaming',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    specs: [
      { icon: Radio, label: 'FastAPI Event Stream' },
      { icon: Cpu, label: 'Chain-of-Thought Trace' },
      { icon: Zap, label: 'Token by Token Feed' },
    ],
  },
  {
    icon: Layers,
    title: 'Clean Architecture & Cache',
    subtitle: 'SOLID Decoupled Domain',
    summary: 'Pure Python domain isolation paired with deterministic SHA-256 query caching for sub-millisecond lookups.',
    badge: 'Clean SOLID',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    specs: [
      { icon: Layers, label: 'Decoupled Interfaces' },
      { icon: Zap, label: 'SHA-256 LRU Cache' },
      { icon: Cpu, label: '<0.8ms Lookup Speed' },
    ],
  },
  {
    icon: Play,
    title: 'Client-Side WebAssembly Execution',
    subtitle: 'In-Browser Pyodide Runtime',
    summary: 'Run Python 3.12 and Pandas directly in browser sandboxes with live interactive DataFrames and charts.',
    badge: 'Pyodide WASM',
    color: 'text-rose-400',
    border: 'border-rose-500/20',
    specs: [
      { icon: Play, label: 'Zero Server Execution' },
      { icon: Database, label: 'Interactive DataFrames' },
      { icon: Wrench, label: '1-Click Auto-Fix' },
    ],
  },
  {
    icon: Cpu,
    title: 'Hybrid Retrieval & Multi-Model',
    subtitle: 'Lexical + Semantic RRF',
    summary: 'Combines dense embeddings with sparse BM25 lexical matching, switching between local Ollama and Groq Cloud.',
    badge: 'Hybrid RRF',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    specs: [
      { icon: Database, label: 'BM25 + ChromaDB' },
      { icon: Layers, label: 'RRF Rank Fusion' },
      { icon: Cpu, label: 'Multi-Model Switcher' },
    ],
  },
];

export const FeatureGrid = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Verified Engineering Standards</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Core Capabilities for <span className="text-gradient-cyan">Python & Modern Pandas</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          معايير برمجية وهندسية دقيقة: من كتابة خوارزميات بايثون النظيفة إلى خطوط معالجة البيانات الضخمة في Pandas 2.0+ بكفاءة وأمان كامل.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
            >
              <GlassCard className="h-full flex flex-col justify-between p-5 hover:border-cyan-400/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-2.5 rounded-xl bg-white/[0.05] border ${feat.border}`}>
                      <Icon className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/10">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-0.5 font-sans">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-cyan-400/90 font-medium mb-2.5">
                    {feat.subtitle}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {feat.summary}
                  </p>
                </div>

                {/* Technical Specs Tags with SVG Icons */}
                <div className="pt-3 border-t border-white/5 space-y-1.5">
                  {feat.specs.map((spec, sIdx) => {
                    const SpecIcon = spec.icon;
                    return (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] text-slate-300"
                      >
                        <SpecIcon className={`w-3.5 h-3.5 shrink-0 ${feat.color}`} />
                        <span className="font-mono text-[11px] truncate">{spec.label}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
