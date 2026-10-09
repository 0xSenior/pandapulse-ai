import React from 'react';
import {
  Terminal,
  Github,
  Linkedin,
  Globe,
  Send,
  ExternalLink,
  CheckCircle2,
  BrainCircuit,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

export const EngineerPage = () => {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto pb-28 font-sans">
      {/* Profile Header Card */}
      <div className="ds-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar with DeepSeek minimal border */}
          <div className="relative shrink-0 group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-[1px] bg-white/20 shadow-xl overflow-hidden">
              <div className="w-full h-full rounded-2xl bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <img
                  alt="Ahmed Harby"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  src="/assets/senior-DXP1HF9y.jpg"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://7arby.me/senior.jpg';
                  }}
                />
              </div>
            </div>
            <span
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0a0a0a] border border-emerald-400/50 shadow-md"
              title="Available for High-Impact Projects"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
            </span>
          </div>

          {/* Bio & Intro */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-white/80 border border-white/10 text-xs font-mono">
                <BrainCircuit className="w-3.5 h-3.5 text-[#6799fe]" />
                <span>Data Scientist & Machine Learning Developer</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-emerald-300 border border-emerald-500/20 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>DEPI Fellow</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-medium text-white tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
              <span>Eng. Ahmed Harby</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white text-[#0a0a0a]">
                0xSenior
              </span>
            </h1>

            <p className="text-sm text-white/65 max-w-2xl leading-relaxed mb-6 font-sans">
              Data Scientist & Machine Learning Developer specializing in architecting end-to-end ML pipelines, predictive modeling, and high-performance production systems.
              Lead Creator & Architect of <strong className="text-white">PandaPulse AI</strong> — bridging enterprise software craftsmanship, clean architecture, and low-latency Neural RAG.
            </p>

            {/* Social & External Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <a
                href="https://7arby.me/"
                target="_blank"
                rel="noreferrer"
                className="ds-btn-primary text-xs px-4 py-2"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Official Portfolio</span>
                <ExternalLink className="w-3 h-3 text-black/60" />
              </a>

              <a
                href="https://github.com/0xSenior"
                target="_blank"
                rel="noreferrer"
                className="ds-btn-secondary text-xs px-4 py-2"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/my-ra3d/"
                target="_blank"
                rel="noreferrer"
                className="ds-btn-secondary text-xs px-4 py-2"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://t.me/my_ra3d"
                target="_blank"
                rel="noreferrer"
                className="ds-btn-secondary text-xs px-4 py-2"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="ds-card p-6">
          <div className="flex items-center gap-2 mb-4 text-[#6799fe]">
            <BrainCircuit className="w-4 h-4" />
            <h3 className="font-display font-medium text-white text-base">Data Science & AI Engineering</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'Python 3.14+',
              'Pandas 2.0+ & PyArrow',
              'Scikit-Learn',
              'Deep Learning',
              'FastAPI (Async)',
              'ChromaDB Vector Store',
              'Ollama & DeepSeek-R1',
              'LangChain RAG Pipelines',
              'Predictive Modeling',
              'Feature Engineering',
              'Cosine Similarity Search',
              'O(1) Memory Caching',
            ].map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/75"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="ds-card p-6">
          <div className="flex items-center gap-2 mb-4 text-white/80">
            <Layers className="w-4 h-4" />
            <h3 className="font-display font-medium text-white text-base">Systems, Frontend & Security</h3>
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
              'Cordis Plugin Engine',
              'Server-Sent Events (SSE)',
            ].map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/75"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Engineering Philosophy Cards */}
      <div className="ds-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5 text-[#6799fe]">
          <Cpu className="w-4 h-4" />
          <h3 className="font-display font-medium text-white text-base">Engineering Principles & Philosophy</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6799fe]" />
              <span>Strict Clean Architecture</span>
            </div>
            <p className="text-white/55 leading-relaxed font-sans">
              Domain business logic is 100% agnostic to external frameworks, databases, or cloud vendors (Uncle Bob's Clean Architecture).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6799fe]" />
              <span>Modern Pandas Invariants</span>
            </div>
            <p className="text-white/55 leading-relaxed font-sans">
              Enforcing zero-deprecation standards (no .append(), no .ix) and Copy-on-Write memory safety with PyArrow speed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6799fe]" />
              <span>Sub-millisecond Latency Bias</span>
            </div>
            <p className="text-white/55 leading-relaxed font-sans">
              Deterministic O(1) SHA-256 caching bypasses heavy neural models whenever validated answers exist.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="font-medium text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6799fe]" />
              <span>Zero-Crash Resilient AI</span>
            </div>
            <p className="text-white/55 leading-relaxed font-sans">
              Graceful hybrid embeddings and offline fallback models guarantee continuous 100% application uptime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
