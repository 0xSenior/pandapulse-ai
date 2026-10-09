import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { Github, ArrowUpRight } from 'lucide-react';

export const HarnessFooter = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#0a0a0a] pt-12 pb-28 px-6">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <BrandLogo size="small" />
          <p className="text-xs text-white/40 font-sans">
            © PandaPulse
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-white/60">
          <a
            href="https://github.com/0xSenior/pandapulse-ai"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-white/40" />
          </a>

          <button
            type="button"
            onClick={() => onNavigate('docs')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Developer docs
          </button>

          <button
            type="button"
            onClick={() => onNavigate('knowledge')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Knowledge Base
          </button>

          <button
            type="button"
            onClick={() => onNavigate('engineer')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Author & Research
          </button>
        </div>
      </div>
    </footer>
  );
};
