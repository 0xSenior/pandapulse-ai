import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookCheck, 
  Radio, 
  Lock,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Intelligent Code Synthesis',
    subtitle: 'Modern, Production-Grade Pandas 2.x',
    description: 'Generates clean, battle-tested data transformation pipelines tailored to your exact queries, with ready-to-run examples and best practices.',
    badge: 'Instant Code',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Automated Deprecation Shield',
    subtitle: 'Zero Broken Pipelines',
    description: 'Protects your scripts by preventing outdated patterns like .append() and .ix, guaranteeing 100% compatibility with modern Pandas 2.0+ standards.',
    badge: 'Future-Proof',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  {
    icon: Zap,
    title: 'Pipeline Acceleration',
    subtitle: 'Up to 10x Faster Processing',
    description: 'Recommends vectorized operations, Copy-on-Write memory safety, and PyArrow acceleration to slash memory footprint and speed up data pipelines.',
    badge: 'High Performance',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  {
    icon: BookCheck,
    title: 'Documentation Grounding',
    subtitle: 'Verifiable Official Standards',
    description: 'Every answer is strictly verified against indexed official documentation, providing source snippets and references with zero hallucinations.',
    badge: 'Trusted Sources',
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  {
    icon: Radio,
    title: 'Real-time Interactive Streaming',
    subtitle: 'Zero-Wait Developer Workspace',
    description: 'Stream answers token-by-token with formatted Python syntax highlighting, one-click code copying, and smooth responsive interaction.',
    badge: 'Instant Streaming',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  {
    icon: Lock,
    title: 'Enterprise Privacy & Control',
    subtitle: 'Secure Data Engineering',
    description: 'Run sensitive queries with complete confidence. Built for private model orchestration with zero unauthorized data retention or telemetry.',
    badge: 'Enterprise Security',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
  },
];

export const FeatureGrid = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Everything You Need to Master <span className="text-gradient-cyan">Modern Pandas</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-base">
          Built for data engineers, analysts, and scientists who demand clean syntax, blazing performance, and dependable accuracy.
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
