import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Zap, 
  Database, 
  ShieldAlert, 
  Radio, 
  FileCode2, 
  Sparkles,
  GitBranch
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const FEATURES = [
  {
    icon: Layers,
    title: 'Clean Architecture & SOLID',
    subtitle: 'Domain, Application, Infrastructure, Presentation',
    description: 'Decoupled domain rules and abstract interfaces guarantee testability, maintainability, and zero vendor lock-in.',
    badge: 'Enterprise Architecture',
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  {
    icon: Zap,
    title: 'O(1) SHA-256 LRU Cache',
    subtitle: 'Sub-millisecond query resolution',
    description: 'In-memory thread-safe LRU cache with deterministic query normalization bypasses vector retrieval on repeated queries.',
    badge: '< 0.8ms Latency',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  {
    icon: ShieldAlert,
    title: 'Deprecation Guardrails',
    subtitle: 'Strict Pandas 2.x enforcement',
    description: 'System guardrails strictly forbid DataFrame.append() and .ix indexers, enforcing pd.concat() and Copy-on-Write safety.',
    badge: '100% Invariant',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  {
    icon: Database,
    title: 'ChromaDB Vector Store',
    subtitle: 'Cosine distance semantic retrieval',
    description: 'Persistent vector indexing with recursive code-conscious chunking (700 chars, 100 overlap) and SHA-256 idempotency.',
    badge: 'Persistent Storage',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  {
    icon: Radio,
    title: 'SSE Live Token Streaming',
    subtitle: 'FastAPI AsyncIterator pipeline',
    description: 'High-throughput Server-Sent Events stream tokens in real-time with smooth cursor animation and instant response start.',
    badge: 'Real-time Streaming',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  {
    icon: FileCode2,
    title: 'PyArrow 2.0+ Native Backend',
    subtitle: 'Zero-copy memory optimization',
    description: 'First-class support for Arrow-backed strings, nullable dtypes, and vectorized high-frequency resampling pipelines.',
    badge: '70% Lower RAM',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
  },
];

export const FeatureGrid = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Engineered for <span className="text-gradient-cyan">Maximum Velocity</span> & Production Integrity
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-base">
          Every layer of PandaPulse AI has been purpose-built for clean maintainability, sub-millisecond retrieval, and modern data engineering.
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
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/10">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-cyan-400/90 font-mono mb-3">
                    {feat.subtitle}
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
