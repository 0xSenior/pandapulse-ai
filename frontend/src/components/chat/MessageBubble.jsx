import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  BookOpen,
  Zap,
  Clock,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Terminal,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { CodeRunner } from './CodeRunner';

/**
 * Elegant neural thinking & loading visual effect.
 * Purely visual pulse and subtle glowing shimmer, without text logs.
 */
const VisualThinkingLoader = () => {
  return (
    <div className="flex items-center gap-2.5 py-2 px-1 select-none">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6799fe] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6799fe]"></span>
        </span>
        <div className="flex items-center gap-1.5 px-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6799fe] animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6799fe]/80 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6799fe]/60 animate-bounce"></span>
        </div>
      </div>
      <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-[#6799fe]/30 via-white/20 to-transparent animate-pulse" />
    </div>
  );
};

export const MessageBubble = ({
  message,
  isStreaming = false,
  isLast = false,
  onViewCitations,
  onSelectSuggestion,
  onAutoFix,
  onOpenInStudio,
}) => {
  const isAssistant = message.role === 'assistant';
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCopyMessage = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  /**
   * Resilient Streaming Markdown-to-HTML parser.
   * Seamlessly formats code blocks even while actively streaming and unclosed,
   * isolating code blocks with strict LTR and monospaced typography.
   */
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Auto-close open streaming code block for immediate beautiful rendering
    const backtickCount = (content.match(/```/g) || []).length;
    const safeContent = backtickCount % 2 !== 0 ? `${content}\n\`\`\`` : content;

    // Split safely on code blocks
    const parts = safeContent.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const rawInside = part.slice(3, -3);
        const newlineIdx = rawInside.indexOf('\n');

        let language = 'python';
        let codeText = rawInside.trim();

        if (newlineIdx !== -1) {
          const firstLine = rawInside.slice(0, newlineIdx).trim();
          if (/^[a-zA-Z0-9_#-]+$/.test(firstLine)) {
            language = firstLine;
            codeText = rawInside.slice(newlineIdx + 1).trim();
          } else if (/^(python|py)\s+/i.test(firstLine)) {
            language = 'python';
            const remainder = firstLine.replace(/^(python|py)\s+/i, '');
            codeText = `${remainder}\n${rawInside.slice(newlineIdx + 1)}`.trim();
          }
        }

        return (
          <CodeRunner
            key={index}
            code={codeText}
            language={language}
            onAutoFix={onAutoFix}
            onOpenInStudio={onOpenInStudio}
          />
        );
      }

      // Format text paragraphs, headers, and bullet points
      return (
        <div
          key={index}
          dir="auto"
          className="space-y-2.5 text-slate-200 leading-relaxed text-sm sm:text-base text-right"
        >
          {part.split('\n\n').map((paragraph, pIdx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={pIdx} className="text-base sm:text-lg font-bold text-white pt-2 pb-1 border-b border-white/5">
                  {trimmed.replace('### ', '')}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={pIdx} className="text-lg sm:text-xl font-bold text-cyan-300 pt-3 pb-1 border-b border-white/10">
                  {trimmed.replace('## ', '')}
                </h3>
              );
            }
            if (trimmed === '---') {
              return <hr key={pIdx} className="border-t border-white/10 my-3.5" />;
            }
            if (trimmed.startsWith('> ')) {
              return (
                <div
                  key={pIdx}
                  className="border-r-4 border-amber-400 bg-amber-500/10 px-3.5 py-2 rounded-l-lg text-amber-200 text-xs sm:text-sm my-2"
                >
                  {trimmed.replace('> ', '')}
                </div>
              );
            }

            return (
              <p key={pIdx} className="leading-relaxed whitespace-pre-wrap">
                {trimmed.split('`').map((chunk, cIdx) => {
                  if (cIdx % 2 === 1) {
                    return (
                      <code
                        key={cIdx}
                        dir="ltr"
                        className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs font-semibold"
                      >
                        {chunk}
                      </code>
                    );
                  }
                  // Bold styling
                  const boldParts = chunk.split('**');
                  return boldParts.map((bChunk, bIdx) =>
                    bIdx % 2 === 1 ? (
                      <strong key={bIdx} className="text-white font-semibold">
                        {bChunk}
                      </strong>
                    ) : (
                      bChunk
                    )
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
    <div className={`flex gap-3.5 my-3 ${isAssistant ? 'justify-start w-full' : 'justify-end'}`}>
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] text-[#6799fe]">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`${
          isAssistant
            ? 'w-full ds-card px-5 py-4 text-white/90 shadow-md'
            : 'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 bg-white text-[#0a0a0a] font-medium shadow-sm text-sm'
        }`}
      >
        {/* Assistant Header Metadata */}
        {isAssistant && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-white/[0.06] text-[11px] text-white/50 font-sans">
            <span className="font-semibold text-white/90 flex items-center gap-1.5">
              <span>PandaPulse AI</span>
              {message.cached && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6799fe]/15 text-[#88b0ff] border border-[#6799fe]/25 text-[10px]">
                  <Zap className="w-3 h-3 text-[#6799fe]" />
                  Instant Response
                </span>
              )}
            </span>

            <div className="flex items-center gap-2.5">
              {message.latency_ms !== null && (
                <span className="flex items-center gap-1 text-white/40 text-[11px]">
                  <Clock className="w-3 h-3 text-white/40" />
                  {message.latency_ms < 50 ? 'Sub-second' : `${(message.latency_ms / 1000).toFixed(2)}s`}
                </span>
              )}

              {message.citations && message.citations.length > 0 && (
                <button
                  type="button"
                  onClick={() => onViewCitations(message.citations)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#6799fe]/15 text-[#88b0ff] hover:bg-[#6799fe]/25 border border-[#6799fe]/30 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{message.citations.length} Verified Sources</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Visual Thinking Loading State (Pure Visual, No Text Logs) */}
        {isAssistant && (message.isThinking || (isStreaming && isLast && !message.content)) && !message.content && (
          <VisualThinkingLoader />
        )}

        {/* Message Content */}
        {Boolean(message.content) && (
          <div className="relative">
            {renderFormattedContent(message.content)}

            {/* Real-time Streaming Cursor */}
            {isStreaming && isLast && isAssistant && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#6799fe] animate-pulse align-middle" />
            )}
          </div>
        )}

        {/* Assistant Bottom Utility Bar */}
        {isAssistant && Boolean(message.content) && !isStreaming && (
          <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] text-white/40 select-none border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/5 hover:text-[#6799fe] transition-colors cursor-pointer"
                title="Copy response"
              >
                {copiedMessage ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                className={`p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer ${
                  feedback === 'like' ? 'text-emerald-400' : 'hover:text-white/80'
                }`}
                title="Helpful response"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                className={`p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer ${
                  feedback === 'dislike' ? 'text-rose-400' : 'hover:text-white/80'
                }`}
                title="Report issue"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>

            {message.model && (
              <span className="font-mono text-[10px] text-white/40">
                {message.model}
              </span>
            )}
          </div>
        )}

        {/* Dynamic Contextual Suggestions */}
        {isAssistant && message.suggestions && message.suggestions.length > 0 && !message.isThinking && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.08] select-none" dir="ltr">
            <div className="flex items-center gap-1.5 mb-2 text-xs text-white/50 font-medium font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#6799fe]" />
              <span>Suggested Follow-ups:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  dir="ltr"
                  disabled={isStreaming}
                  onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion)}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-[13px] text-white/80 hover:text-white transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-left font-sans"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6799fe] group-hover:scale-125 transition-transform shrink-0" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 text-white/70">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

