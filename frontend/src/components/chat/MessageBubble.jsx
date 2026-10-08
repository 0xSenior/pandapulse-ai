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
} from 'lucide-react';
import { CodeRunner } from './CodeRunner';

/**
 * Minimalist ChatGPT / DeepSeek-style visual thinking component.
 * Displays clean gray internal monologue with subtle timer and collapses seamlessly without boxy containers.
 */
const ThinkingProcess = ({
  isThinking,
  thoughtDurationMs,
  statusMessage,
  thoughts = [],
  isStreaming,
  hasContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(isThinking);
  const [elapsedSec, setElapsedSec] = useState('0.0');

  // Live timer while actively thinking
  useEffect(() => {
    if (!isThinking) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedSec(((Date.now() - start) / 1000).toFixed(1));
    }, 100);
    return () => clearInterval(interval);
  }, [isThinking]);

  // When real answer starts streaming and thinking finishes, auto-collapse
  useEffect(() => {
    if (hasContent && !isThinking) {
      setIsExpanded(false);
    }
  }, [hasContent, isThinking]);

  // Keep expanded while actively thinking
  useEffect(() => {
    if (isThinking) {
      setIsExpanded(true);
    }
  }, [isThinking]);

  const durationText = thoughtDurationMs
    ? `${(thoughtDurationMs / 1000).toFixed(1)} ثانية`
    : `${elapsedSec} ثانية`;

  return (
    <div className="mb-3 select-none font-sans">
      {/* Minimalist ChatGPT-style Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="group inline-flex items-center gap-2 py-1 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none"
      >
        {isThinking ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
        ) : (
          <Brain className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-400 transition-colors shrink-0" />
        )}

        <span className="font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
          {isThinking ? 'يفكر الموديل...' : `تم التفكير (${durationText})`}
        </span>

        {isThinking && (
          <span className="text-[11px] text-zinc-500 font-mono">
            {elapsedSec} ثانية
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Pure Gray Internal Monologue (ChatGPT Style: No card, No box, No borders) */}
      {isExpanded && (
        <div className="mt-2 pr-3.5 border-r-2 border-zinc-700/60 space-y-2 text-xs sm:text-[13px] text-zinc-400 leading-relaxed font-sans transition-all">
          {thoughts && thoughts.length > 0 ? (
            thoughts.map((thought, tIdx) => (
              <p key={tIdx} className="text-zinc-400/90 leading-relaxed font-sans">
                {thought}
              </p>
            ))
          ) : (
            <p className="text-zinc-500 italic">
              {statusMessage || 'جاري استحضار المعطيات وتحليل بنية البيانات...'}
            </p>
          )}

          {isThinking && (
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs italic pt-1">
              <span className="inline-block w-1.5 h-3 bg-zinc-400 animate-pulse" />
              <span>جاري بلورة الأفكار وبناء الحل...</span>
            </div>
          )}
        </div>
      )}
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

  const showThinkingWidget =
    isAssistant &&
    (message.isThinking ||
      Boolean(message.thoughtDurationMs) ||
      (isStreaming && isLast && !message.content));

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

        {/* ChatGPT / DeepSeek Visual Thinking Accordion */}
        {showThinkingWidget && (
          <ThinkingProcess
            isThinking={message.isThinking || (isStreaming && isLast && !message.content)}
            thoughtDurationMs={message.thoughtDurationMs}
            statusMessage={message.statusMessage}
            thoughts={message.thoughts || []}
            steps={message.steps}
            isStreaming={isStreaming}
            hasContent={Boolean(message.content)}
          />
        )}

        {/* Message Content */}
        <div className="relative">
          {renderFormattedContent(message.content)}

          {/* Real-time Streaming Cursor */}
          {isStreaming && isLast && isAssistant && Boolean(message.content) && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Dynamic Contextual Suggestions (ChatGPT-style) */}
        {isAssistant && message.suggestions && message.suggestions.length > 0 && !message.isThinking && (
          <div className="mt-3.5 pt-3 border-t border-white/10 select-none" dir="ltr">
            <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-400 font-medium font-sans">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
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
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/85 hover:bg-slate-700/85 border border-white/10 hover:border-cyan-500/40 text-xs sm:text-[13px] text-slate-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-left font-sans"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
