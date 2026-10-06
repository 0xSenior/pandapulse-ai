import React from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Github,
  Linkedin,
  Mail,
  Code2,
  Cpu,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  Globe,
  Send,
  Binary,
  BrainCircuit,
  ShieldCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export const EngineerPage = () => {
  return (
    <div className="py-12 px-4 max-w-5xl mx-auto pb-28">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Profile Header Card */}
      <GlassCard className="border-cyan-500/30 mb-8 p-8" hoverEffect={false}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar with Animated Pulse Border */}
          <div className="relative shrink-0 group">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[2px] shadow-2xl shadow-cyan-500/25">
              <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  alt="Ahmed Harby"
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  src="/assets/senior-DXP1HF9y.jpg"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://7arby.me/senior.jpg";
                  }}
                />
              </div>
            </div>
            <span
              className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-900 border border-emerald-400/50 shadow-lg"
              title="Available for High-Impact Projects"
            >
              <span className="w-3 h-3 rounded-full bg-emerald-400 block animate-pulse" />
            </span>
          </div>

          {/* Bio & Intro */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-medium">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Data Scientist & Machine Learning Developer</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DEPI Fellow</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1 flex items-center justify-center md:justify-start gap-3">
              <span>Eng.Ahmed Harby</span>
              <span className="text-sm font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-white/10 text-cyan-300 border border-white/10">
                0xSenior
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed mb-6 font-normal">
              Data Scientist & Machine Learning Developer specializing in architecting end-to-end ML pipelines, predictive modeling, and intelligent production systems.
              Lead Creator & Architect of <strong>PandaPulse AI</strong> — bridging enterprise software craftsmanship, clean architecture, and low-latency Neural RAG.
            </p>

            {/* Social & External Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="https://7arby.me/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all text-xs font-medium cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Official Portfolio</span>
                <ExternalLink className="w-3 h-3 text-cyan-400/70" />
              </a>

              <a
                href="https://github.com/0xSenior"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <Github className="w-4 h-4 text-cyan-400" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://www.linkedin.com/in/my-ra3d/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://t.me/my_ra3d"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>Telegram</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://www.youtube.com/@Senior_KLash"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <span className="font-bold text-xs text-slate-300">𝕏</span>
                <span>Youtube</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-4 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Data Science & AI Engineering</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'Python 3.14+',
              'Pandas 2.0+ & PyArrow',
              'Scikit-Learn',
              'Deep Learning',
              'FastAPI (Async)',
              'ChromaDB Vector Store',
              'Ollama (Qwen2.5-Coder)',
              'LangChain RAG Pipelines',
              'Predictive Modeling',
              'Feature Engineering',
              'Cosine Similarity Search',
              'O(1) Memory Caching',
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-xs font-mono text-cyan-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2.5 mb-4 text-blue-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Systems, Frontend & Security</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'React 18 & Vite',
              'Three.js 3D Visuals',
              'Tailwind CSS v3.4',
              'Clean Architecture (DIP)',
              'C++ Systems Programming',
              'Reverse Engineering',
              'Cybersecurity Core',
              'Docker & Compose v2',
              'macOS Dock Motion',
              'Server-Sent Events (SSE)',
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-lg bg-slate-900/80 border border-blue-500/20 text-xs font-mono text-blue-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Engineering Philosophy Cards */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2.5 mb-4 text-amber-400">
          <Cpu className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">Engineering Principles & Philosophy</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Strict Clean Architecture</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Domain business logic is 100% agnostic to external frameworks, databases, or cloud vendors (Uncle Bob's Clean Architecture).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Modern Pandas Invariants</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enforcing zero-deprecation standards (no .append(), no .ix) and Copy-on-Write memory safety with PyArrow speed.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Sub-millisecond Latency Bias</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Deterministic O(1) SHA-256 caching bypasses heavy neural models whenever validated answers exist.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Zero-Crash Resilient AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Graceful hybrid embeddings and offline fallback models guarantee continuous 100% application uptime.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
