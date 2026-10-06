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
  ExternalLink 
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const EngineerPage = () => {
  return (
    <div className="py-12 px-4 max-w-5xl mx-auto pb-28">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Profile Header Card */}
      <GlassCard className="border-cyan-500/30 mb-8 p-8" hoverEffect={false}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar with Animated Pulse Border */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[2px] shadow-2xl shadow-cyan-500/20">
              <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center overflow-hidden">
                <Terminal className="w-12 h-12 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-900 border border-emerald-400/50 shadow-lg">
              <span className="w-3 h-3 rounded-full bg-emerald-400 block animate-pulse" />
            </span>
          </div>

          {/* Bio & Intro */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Principal Software Architect & AI Engineer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              The Lead Engineer
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed mb-6 font-normal">
              Specialized in high-throughput AI orchestration, Clean Architecture, and low-latency vector databases. 
              Architect of <strong>PandaPulse AI</strong> — bridging enterprise software craftsmanship with cutting-edge Retrieval-Augmented Generation.
            </p>

            {/* Social & External Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <Github className="w-4 h-4 text-cyan-400" />
                <span>GitHub Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="mailto:lead@pandapulse.ai"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Contact Engineering</span>
              </a>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-4 text-cyan-400">
            <Code2 className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Backend & AI Core Stack</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'Python 3.14+',
              'FastAPI (Async)',
              'ChromaDB (Cosine)',
              'Ollama (Llama 3 / Qwen)',
              'LangChain Text Splitters',
              'Pydantic v2 & orjson',
              'Server-Sent Events (SSE)',
              'PyArrow Native Types',
              'O(1) LRU Caching',
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2.5 mb-4 text-blue-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Frontend & Interface Stack</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'React 18 & Vite',
              'Framer Motion (Springs)',
              'Tailwind CSS v3.4',
              'macOS Dock Physics',
              'Lucide React SVG Icons',
              'Glassmorphic Design',
              'Dark Mode Spatial Theme',
              'Docker & Compose v2',
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-200"
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
              Domain business logic is 100% agnostic to frameworks, databases, or cloud vendors.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Zero-Deprecation Invariants</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enforcing modern Pandas 2.x patterns (no .append(), no .ix) and Copy-on-Write memory safety.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Sub-millisecond Latency Bias</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              O(1) SHA-256 caching bypasses heavy neural models whenever deterministic results exist.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Resilient Fallback Design</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Zero crash policy: graceful hybrid vectorizers and offline models ensure 100% system availability.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
