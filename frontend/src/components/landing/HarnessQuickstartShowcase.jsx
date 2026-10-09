import React, { useState } from 'react';
import { Terminal, Copy, Check, Github, BookOpen, Layers, ArrowUpRight } from 'lucide-react';

export const HarnessQuickstartShowcase = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('npx');
  const [copied, setCopied] = useState(false);

  const commandOptions = {
    npx: 'npx -y pandapulse-ai@latest',
    pip: 'pip install pandapulse-ai && pandapulse studio',
    source: 'git clone https://github.com/0xSenior/pandapulse-ai.git && cd pandapulse-ai && npm run dev',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(commandOptions[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 py-20 border-t border-white/[0.08]">
      {/* Developer Experience Heading */}
      <div className="flex flex-col gap-3 max-w-[720px] mb-12">
        <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#6799fe]">
          Developer experience
        </span>
        <h2 className="font-display font-medium text-white text-[32px] sm:text-[42px] tracking-tight leading-tight">
          Start with one command
        </h2>
        <p className="text-[15px] sm:text-[16px] text-white/60 font-sans leading-relaxed">
          Launch the Web UI directly from your terminal or install from source to extend the agent harness.
        </p>
      </div>

      {/* Terminal Command Box */}
      <div className="ds-card overflow-hidden max-w-[800px] mb-16">
        {/* Terminal Header Bar */}
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {['npx', 'pip', 'source'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-black font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Command Body */}
        <div className="p-5 font-mono text-[14px] text-white flex items-center gap-3 bg-[#0a0a0a]">
          <span className="text-[#6799fe] select-none">$</span>
          <span className="text-white/90 select-all">{commandOptions[activeTab]}</span>
        </div>
      </div>

      {/* Join the Ecosystem Card */}
      <div className="ds-card p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6799fe]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[700px] flex flex-col gap-5">
          <h3 className="font-display font-medium text-white text-[28px] sm:text-[34px] tracking-tight leading-tight">
            Join the PandaPulse plugin ecosystem
          </h3>
          <p className="text-[15px] sm:text-[16px] text-white/65 font-sans leading-relaxed">
            PandaPulse is in preview, with evolving core plugins and analytical APIs. We invite developers and data scientists worldwide to explore the limits of data intelligence together through open-source, reusable, and composable infrastructure.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/0xSenior/pandapulse-ai"
              target="_blank"
              rel="noreferrer"
              className="ds-btn-primary px-5 py-2.5"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>

            <button
              type="button"
              onClick={() => onNavigate('docs')}
              className="ds-btn-secondary px-5 py-2.5"
            >
              <BookOpen className="w-4 h-4 text-white/70" />
              <span>Developer Docs</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('knowledge')}
              className="ds-btn-secondary px-5 py-2.5"
            >
              <Layers className="w-4 h-4 text-white/70" />
              <span>Knowledge Base</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
