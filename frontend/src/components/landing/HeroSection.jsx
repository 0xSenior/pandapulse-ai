import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Database,
  Cpu,
  Sparkles,
  CheckCircle2,
  Code2,
  Layers,
  Play,
  Lock,
} from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';

export const HeroSection = ({ onNavigate }) => {
  return (
    <section className="relative pt-10 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Modern Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-medium text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-xl mb-6"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <span className="font-mono">Python 3.12 & Pandas 2.0+ Architecture • PandaPulse Neural Engine</span>
      </motion.div>

      {/* Main Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1] mb-5 font-sans"
      >
        The Intelligent AI Engine for{' '}
        <span className="text-gradient-cyan">Python Programming</span> & Modern{' '}
        <span className="text-gradient-amber">Pandas 2.0+</span>
      </motion.h1>

      {/* Concise Technical Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl leading-relaxed mb-6 font-normal"
      >
        المساعد الهندسي المتخصص في صياغة أكواد بايثون الإنتاجية وتصميم خطوط معالجة البيانات الحديثة مع التحقق المتجهي وتوثيق المصادر الفنية المعتمدة.
      </motion.p>

      {/* Capability Feature Pills with SVG Icons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs text-slate-300 font-mono">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Python 3.12+ Big-O</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs text-slate-300 font-mono">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Pandas 2.0+ Arrow</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs text-slate-300 font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copy-on-Write Safe</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs text-slate-300 font-mono">
          <Play className="w-3.5 h-3.5 text-rose-400" />
          <span>WASM Pyodide Sandboxing</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs text-slate-300 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>ChromaDB Verified Grounding</span>
        </span>
      </motion.div>

      {/* CTA Button Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="flex flex-wrap items-center justify-center gap-4 mb-14"
      >
        <GlowButton
          variant="cyan"
          icon={Zap}
          className="text-base px-7 py-3 cursor-pointer"
          onClick={() => onNavigate('chat')}
        >
          Launch PandaPulse AI
        </GlowButton>

        <GlowButton
          variant="outline"
          icon={Terminal}
          className="text-base px-6 py-3 cursor-pointer"
          onClick={() => onNavigate('docs')}
        >
          Explore System Architecture
        </GlowButton>
      </motion.div>

      {/* Real Technical Capabilities & Architecture Strip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl glass-panel border border-white/10 text-left shadow-2xl"
      >
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">Engine 01</span>
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">Python Core</div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">Generators</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">Dataclasses</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">Big-O</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">Engine 02</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">Pandas 2.0+</div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">PyArrow</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">CoW Safe</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">No append</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">Engine 03</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">ChromaDB RAG</div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">BM25 Hybrid</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">RRF Rank</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">Citations</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">Engine 04</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">Clean Cache</div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">SHA-256</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">&lt;0.8ms</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">SSE Stream</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
