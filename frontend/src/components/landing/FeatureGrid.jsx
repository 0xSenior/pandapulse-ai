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
  Layers
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const FEATURES = [
  {
    icon: Code2,
    title: 'Python Core & Data Structures',
    subtitle: 'Collections, Generators, OOP & Typing',
    description: 'Generates clean, production-grade Python code: Big-O optimized collections (list, dict, set, deque), lazy generators with yield, immutable dataclasses(slots=True), and strict type hints.',
    arabicSummary: 'هياكل بيانات متقدمة، مولدات كسولة لتوفير الذاكرة، وأنماط كائنية OOP حديثة.',
    badge: 'Python 3.12+ Core',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  {
    icon: Database,
    title: 'Modern Pandas 2.0+ & PyArrow',
    subtitle: 'Apache Arrow Engine & 70% Less Memory',
    description: 'Harness native PyArrow-backed DataFrames: eliminate string memory bloat by up to 70%, utilize native nulls (pd.NA), and benefit from SIMD vector acceleration on multi-core CPUs.',
    arabicSummary: 'محرك Apache Arrow المدمج وتوفير الذاكرة والتعامل مع القيم الفارغة pd.NA.',
    badge: 'Pandas 2.0+ Arrow',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Strict Deprecation Shield',
    subtitle: 'Zero df.append() & Zero .ix Indexing',
    description: 'Enforces modern APIs: replaces removed df.append() with vectorized pd.concat(), eliminates removed .ix with explicit .loc/.iloc, and prevents SettingWithCopyWarning via Copy-on-Write.',
    arabicSummary: 'منع الدوال الملغية نهائياً والاعتماد على pd.concat و .loc وحماية CoW.',
    badge: 'Zero Deprecated APIs',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  {
    icon: BookCheck,
    title: 'Grounded Neural RAG (ChromaDB)',
    subtitle: 'Verified Citations & Semantic Retrieval',
    description: 'Semantic vector retrieval against authoritative Python and Pandas documentation chunks ensures every code pattern is verifiable with zero hallucinated methods or parameters.',
    arabicSummary: 'استرجاع متجهي دقيق عبر ChromaDB واستشهادات رسمية بالوثائق الفنية.',
    badge: 'Verified Citations',
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  {
    icon: Radio,
    title: 'Real-Time Streaming & Deep Reasoning',
    subtitle: 'Low-Latency SSE with Chain-of-Thought',
    description: 'FastAPI Server-Sent Events stream tokens in real-time, displaying intellectual step-by-step thinking (ChatGPT / DeepSeek style) with syntax-highlighted code blocks.',
    arabicSummary: 'بث تدفقي فوري عبر SSE مع إظهار خطوات التفكير والتحليل المنطقي.',
    badge: 'Real-time SSE',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  {
    icon: Layers,
    title: 'Clean Architecture & O(1) Cache',
    subtitle: 'SOLID Decoupling with SHA-256 LRU Cache',
    description: 'Clean Architecture guarantees pure Python domain isolation, while deterministic SHA-256 query caching delivers instantaneous <0.8ms sub-millisecond responses on cache hits.',
    arabicSummary: 'بنية برمجية معمارية نظيفة (SOLID) وذاكرة كاش سريعة دون أجزاء وهمية.',
    badge: 'Clean Architecture',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
  },
];

export const FeatureGrid = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Core Capabilities for <span className="text-gradient-cyan">Python & Modern Pandas</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-base">
          معلومات تقنية حقيقية ومعايير هندسية معتمدة: من كتابة أكواد بايثون النظيفة والخوارزميات إلى بناء خطوط معالجة البيانات الضخمة في Pandas 2.0+ بكفاءة وأمان تام.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <GlassCard className="h-full flex flex-col justify-between hover:border-cyan-400/30">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white/[0.05] border ${feat.border}`}>
                      <Icon className={`w-6 h-6 ${feat.color}`} />
                    </div>
                    <span className="text-[11px] font-sans font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/10">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 font-sans">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-cyan-400/90 font-medium mb-3">
                    {feat.subtitle}
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {feat.description}
                  </p>
                  {feat.arabicSummary && (
                    <div className="pt-2.5 mt-2 border-t border-white/5">
                      <p className="text-xs text-cyan-300/80 font-sans leading-relaxed text-right" dir="rtl">
                        {feat.arabicSummary}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
