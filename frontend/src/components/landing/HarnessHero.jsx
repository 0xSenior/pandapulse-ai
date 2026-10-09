import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Download,
  ArrowUpRight,
  ChevronDown,
  Copy,
  Check,
  Send,
  Plus,
  Clock,
  Layers,
  Terminal,
  FileCode,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HarnessHero = ({ onNavigate }) => {
  const { isRTL, t } = useLanguage();
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [composerText, setComposerText] = useState('');

  const samplePythonCode = `# PandaPulse - Copy-on-Write enabled
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'symbol': ['BTC', 'ETH', 'SOL'],
    'price': [64200, 3450, 155],
    'volume_24h': [28400000, 14200000, 5600000]
})

# Zero-copy categorical binning
df['tier'] = pd.cut(df['price'], bins=[0, 1000, 50000, np.inf], labels=['mid', 'large', 'mega'])
print(df)`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(samplePythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleComposerSubmit = (e) => {
    e.preventDefault();
    if (!composerText.trim()) {
      onNavigate('chat', 'Analyze my DataFrame and optimize performance with Pandas 2.0');
    } else {
      onNavigate('chat', composerText);
    }
  };

  return (
    <section className="relative w-full pt-12 md:pt-20 pb-16 flex flex-col items-center">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#6799fe]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Header Content */}
      <div className="max-w-[800px] w-full mx-auto px-6 flex flex-col items-center text-center gap-6">
        {/* DeepSeek Style Sparkle Preview Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/50 text-[11.5px] font-mono tracking-[0.22em] uppercase select-none">
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 text-[#6799fe]" fill="currentColor">
            <path d="M9 6C10.53 9.82 13.68 12.97 17.5 14.5C13.68 16.03 10.53 19.18 9 23C7.47 19.18 4.32 16.03 0.5 14.5C4.32 12.97 7.47 9.82 9 6Z" />
            <path d="M19.5 1C20.22 2.8 21.7 4.28 23.5 5C21.7 5.72 20.22 7.2 19.5 9C18.78 7.2 17.3 5.72 15.5 5C17.3 4.28 18.78 2.8 19.5 1Z" />
          </svg>
          <span>{t('previewBadge')}</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-medium text-white text-[38px] sm:text-[54px] md:text-[66px] tracking-tight leading-[1.08]">
          <span>{t('heroTitle1')}</span>
          <br />
          <span className="text-white/90">{t('heroTitle2')}</span>
        </h1>

        {/* Subtitle */}
        <div className="max-w-[620px] mx-auto flex flex-col gap-1 text-[15px] sm:text-[16.5px] text-white/60 font-sans leading-relaxed">
          <p>{t('heroSubtitle')}</p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="ds-btn-primary px-6 py-3 text-[14.5px]"
          >
            <Download className="w-4 h-4" />
            <span>{t('launchStudio')}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className="ds-btn-secondary px-6 py-3 text-[14.5px]"
          >
            <span>{isRTL ? 'فتح مساحة المحادثة' : 'Open Chat Workspace'}</span>
            <ArrowUpRight className={`w-4 h-4 text-white/60 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* DeepSeek Interactive Desktop App Preview Window */}
      <div className="w-full max-w-[1060px] mx-auto px-4 mt-12 sm:mt-16">
        <div
          className="rounded-[22px] border border-white/[0.12] bg-[#111111]/90 shadow-2xl overflow-hidden backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Mac/Windows Title Bar */}
          <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]/80 inline-block border border-black/20" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]/80 inline-block border border-black/20" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]/80 inline-block border border-black/20" />
            </div>

            <span className="text-[12px] font-mono text-white/50 tracking-wide">
              PandaPulse · Session #1
            </span>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Ready</span>
            </div>
          </div>

          {/* Window Body Split */}
          <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] min-h-[500px]">
            {/* Left Frosted Sidebar */}
            <div className="hidden md:flex flex-col border-r border-white/[0.08] bg-white/[0.015] p-3 gap-4 text-xs font-sans">
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08] transition-colors cursor-pointer"
              >
                <span className="font-medium">New Session</span>
                <Plus className="w-3.5 h-3.5 text-white/70" />
              </button>

              <div className="flex flex-col gap-1">
                <span className="px-2 text-[10px] uppercase font-mono tracking-wider text-white/40">
                  Workspace
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="px-2.5 py-1.5 rounded-md bg-white/[0.08] text-white font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6799fe]" />
                    <span className="truncate">Default workspace</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer truncate">
                    Meet PandaPulse
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer truncate">
                    Q3 financial review
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer truncate">
                    Data analysis ETL
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer truncate">
                    DSH plugin dev
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="px-2 text-[10px] uppercase font-mono tracking-wider text-white/40">
                  Plugins
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="px-2.5 py-1 rounded-md text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-white/50" />
                    <span>Data Studio</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-md text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-white/50" />
                    <span>Pyodide Sandbox</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-md text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-white/50" />
                    <span>BM25 Vector Index</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-white/[0.08] flex items-center justify-between px-2 text-white/40 text-[11px]">
                <span>Cordis Engine</span>
                <span className="text-[#6799fe]">Ready</span>
              </div>
            </div>

            {/* Right Main Chat & Execution Pane */}
            <div className="flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-transparent to-white/[0.01]">
              <div className="flex flex-col gap-5">
                {/* Session Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-medium text-white text-[15px]">
                      Meet PandaPulse
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-white/60">
                      RAG Verified
                    </span>
                  </div>
                  <span className="text-[11px] text-white/40 font-mono">Cordis Architecture</span>
                </div>

                {/* User Prompt */}
                <div className="self-end max-w-[85%] rounded-2xl bg-white/[0.08] border border-white/10 px-4 py-2.5 text-[14px] text-white">
                  Could you introduce yourself and analyze my DataFrame?
                </div>

                {/* DeepSeek Signature Thought Accordion */}
                <div className="flex flex-col gap-1 max-w-[92%]">
                  <button
                    type="button"
                    onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
                    className="inline-flex items-center gap-2 text-[12px] text-white/50 hover:text-white/80 transition-colors cursor-pointer select-none py-0.5 self-start"
                  >
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span className="font-medium">Thought for a while</span>
                    <span className="font-mono text-[11px] text-white/40">1.4s</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isThoughtExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isThoughtExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-5 border-l-2 border-white/15 text-[12px] text-white/50 leading-relaxed font-mono py-1"
                      >
                        Analyzing workspace runtime: Python 3.14 + Pandas 2.2. Checking DataFrame schema, verifying Copy-on-Write semantics, optimizing memory usage with PyArrow backend. Composing analytical response.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Assistant Response */}
                <div className="flex flex-col gap-3 text-[14px] text-white/85 leading-relaxed">
                  <p>
                    I'm <strong className="text-white font-medium">PandaPulse</strong>, an open-source data agent built on a composable “everything is a plugin” architecture. Run me as a desktop app or launch the live studio in your browser.
                  </p>

                  <div className="flex flex-col gap-1.5 text-[13px] text-white/70">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6799fe]" />
                      <span>Zero-copy data transformations & memory footprint reduction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6799fe]" />
                      <span>Real-time in-browser WebAssembly execution via Pyodide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6799fe]" />
                      <span>Composable plugins for scheduled jobs, feature stores, and diff reviews</span>
                    </div>
                  </div>

                  {/* Code Snippet Box */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0c] overflow-hidden mt-1">
                    <div className="px-3.5 py-1.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/50">
                      <span>analysis_pipeline.py</span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 text-[12px] font-mono text-white/80 overflow-x-auto leading-relaxed">
                      <code>{samplePythonCode}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Composer Frame */}
              <form onSubmit={handleComposerSubmit} className="mt-6 pt-3 border-t border-white/[0.08]">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 flex flex-col gap-2 focus-within:border-white/25 transition-all">
                  <input
                    type="text"
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder={t('heroInputPlaceholder')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="w-full bg-transparent px-2 py-1 text-[13.5px] text-white placeholder-white/35 focus:outline-none"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-white/60">
                        Workspace: Write
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#6799fe]/15 text-[#6799fe]">
                        PandaPulse
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-7 h-7 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center hover:bg-white/90 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
