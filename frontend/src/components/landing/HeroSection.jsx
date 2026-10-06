import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Terminal, ShieldCheck, ArrowRight, Database, Cpu, Activity } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';

export const HeroSection = ({ onNavigate }) => {
  return (
    <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Modern Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-medium text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-xl mb-8"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <span>Clean Architecture • PyArrow 2.0+ Native • O(1) LRU Neural Cache</span>
      </motion.div>

      {/* Main Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1] mb-6"
      >
        The <span className="text-gradient-cyan">Sub-millisecond</span> Neural Engine for Modern{' '}
        <span className="text-gradient-amber">Pandas</span> Data Engineering
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed mb-10 font-normal"
      >
        Strictly guardrailed against deprecated APIs (<code className="text-amber-300 font-mono text-sm px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">.append()</code>, <code className="text-amber-300 font-mono text-sm px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">.ix</code>). 
        Powered by ChromaDB cosine retrieval, thread-safe LRU caching, and live SSE token streaming.
      </motion.p>

      {/* CTA Button Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-4 mb-16"
      >
        <GlowButton
          variant="cyan"
          icon={Zap}
          className="text-base px-7 py-3"
          onClick={() => onNavigate('chat')}
        >
          Launch Neural Assistant
        </GlowButton>

        <GlowButton
          variant="outline"
          icon={Terminal}
          className="text-base px-6 py-3"
          onClick={() => onNavigate('docs')}
        >
          System Blueprint & Blueprint
        </GlowButton>
      </motion.div>

      {/* Real-time Telemetry & Benchmark Strip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl glass-panel border border-white/10 text-left shadow-2xl"
      >
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cache Lookup</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">&lt; 0.8 ms</div>
          <p className="text-[11px] text-cyan-400/80 mt-1">O(1) SHA-256 Memory</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Vector Search</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">~ 4.2 ms</div>
          <p className="text-[11px] text-blue-400/80 mt-1">ChromaDB Cosine Space</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>LLM Streaming</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">~ 65 tok/s</div>
          <p className="text-[11px] text-indigo-400/80 mt-1">FastAPI SSE Pipeline</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Modern Invariant</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">100%</div>
          <p className="text-[11px] text-amber-400/80 mt-1">Pandas 2.x Invariant Rules</p>
        </div>
      </motion.div>
    </section>
  );
};
