import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  BookOpen, 
  Zap, 
  Clock 
} from 'lucide-react';

export const MessageBubble = ({
  message,
  isStreaming = false,
  isLast = false,
  onViewCitations,
}) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic Markdown-to-HTML parser for code blocks, bold text, and headers
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Split on code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : 'python';
        const codeText = lines[0].match(/^[a-zA-Z0-9_-]+$/)
          ? lines.slice(1).join('\n')
          : lines.join('\n');

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-white/10 bg-slate-950/90 shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-white/10 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400/80" />
                {language}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(codeText)}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy code'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-cyan-200/90 overflow-x-auto leading-relaxed selection:bg-cyan-500/30">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Format text paragraphs, headers, and bullet points
      return (
        <div key={index} className="space-y-2 text-slate-200 leading-relaxed text-sm sm:text-base">
          {part.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h4 key={pIdx} className="text-base sm:text-lg font-bold text-white pt-2 pb-1">
                  {paragraph.replace('### ', '')}
                </h4>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h3 key={pIdx} className="text-lg sm:text-xl font-bold text-white pt-3 pb-1 border-b border-white/10">
                  {paragraph.replace('## ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('> ')) {
              return (
                <div key={pIdx} className="border-l-2 border-amber-400 bg-amber-500/10 px-3 py-2 rounded-r-lg text-amber-200 text-xs sm:text-sm">
                  {paragraph.replace('> ', '')}
                </div>
              );
            }
            return (
              <p key={pIdx} className="leading-relaxed">
                {paragraph.split('`').map((chunk, cIdx) => {
                  if (cIdx % 2 === 1) {
                    return (
                      <code key={cIdx} className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs font-semibold">
                        {chunk}
                      </code>
                    );
                  }
                  // Bold styling
                  const boldParts = chunk.split('**');
                  return boldParts.map((bChunk, bIdx) =>
                    bIdx % 2 === 1 ? <strong key={bIdx} className="text-white font-semibold">{bChunk}</strong> : bChunk
                  );
                })}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className={`flex gap-3.5 my-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 border border-cyan-300/30">
          <Bot className="w-5 h-5 text-slate-950 font-bold" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[94%] sm:max-w-[88%] lg:max-w-[84%] rounded-2xl px-5 py-4 ${
          isAssistant
            ? 'glass-panel border border-white/10 text-slate-100 shadow-xl'
            : 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-600/20 border border-indigo-400/30'
        }`}
      >
        {/* Assistant Header Metadata */}
        {isAssistant && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-white/5 text-[11px] text-slate-400 font-sans">
            <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <span>PandaPulse AI</span>
              {message.cached && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Instant Response
                </span>
              )}
            </span>

            <div className="flex items-center gap-2.5">
              {message.latency_ms !== null && (
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {message.latency_ms < 50 ? 'Sub-second' : `${(message.latency_ms / 1000).toFixed(2)}s`}
                </span>
              )}

              {message.citations && message.citations.length > 0 && (
                <button
                  type="button"
                  onClick={() => onViewCitations(message.citations)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-400/30 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{message.citations.length} Verified Sources</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className="relative">
          {renderFormattedContent(message.content)}
          
          {/* Real-time Streaming Cursor */}
          {isStreaming && isLast && isAssistant && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
  );
};
