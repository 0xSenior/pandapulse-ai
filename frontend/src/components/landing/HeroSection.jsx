import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Terminal, ShieldCheck, ArrowRight, Database, Cpu, Sparkles, CheckCircle2, Code2, Layers } from 'lucide-react';
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
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-medium text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-xl mb-6"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <span>Python 3.12+ & Pandas 2.0+ Architecture • PandaPulse Neural Engine</span>
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

      {/* Arabic Subtitle Banner */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-base sm:text-lg text-cyan-300/90 font-medium max-w-3xl mb-4 font-sans"
        dir="rtl"
      >
        المساعد البرمجي والهندسي المتخصص في لغة بايثون ومكتبة بانداس الحديثة — توثيق رسمي، أكواد حقيقية، ومعالجة بيانات فائقة السرعة بدون دوال ملغية.
      </motion.p>

      {/* English Technical Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed mb-10 font-normal"
      >
        From writing clean Python functions, algorithms, OOP patterns, and data structures to architecting high-performance Pandas 2.0+ pipelines with PyArrow, Copy-on-Write, and verified RAG documentation grounding.
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
          Launch PandaPulse AI
        </GlowButton>

        <GlowButton
          variant="outline"
          icon={Terminal}
          className="text-base px-6 py-3"
          onClick={() => onNavigate('docs')}
        >
          Explore System Architecture
        </GlowButton>
      </motion.div>

      {/* Real Technical Capabilities & Architecture Strip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl glass-panel border border-white/10 text-left shadow-2xl"
      >
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/20 transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scope & Language</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">Python Core</div>
          <p className="text-[11px] text-cyan-300/80 mt-1 font-sans">
            Lists, Dicts, Generators, OOP, Dataclasses, and Typing
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-amber-500/20 transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Data Engine</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">Pandas 2.0+</div>
          <p className="text-[11px] text-amber-300/80 mt-1 font-sans">
            PyArrow backend, Copy-on-Write, and vectorized transforms
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-blue-500/20 transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Grounding & RAG</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">ChromaDB RAG</div>
          <p className="text-[11px] text-blue-300/80 mt-1 font-sans">
            Semantic vector retrieval with verified source doc citations
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-indigo-500/20 transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Clean Architecture</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">O(1) SHA-256 Cache</div>
          <p className="text-[11px] text-indigo-300/80 mt-1 font-sans">
            Sub-millisecond latency with Server-Sent Events streaming
          </p>
        </div>
      </motion.div>
    </section>
  );
};
