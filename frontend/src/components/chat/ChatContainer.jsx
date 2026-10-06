import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { SourceDrawer } from './SourceDrawer';
import { useChatStream } from '../../hooks/useChatStream';

const QUICK_PROMPTS = [
  'اكتب دالة بايثون نظيفة مع Type Hints ومعالجة استثناءات',
  'كيفية دمج الجداول بدون دالة append الملغية في Pandas 2.0+',
  'تفعيل Copy-on-Write وتفادي SettingWithCopyWarning',
  'مقارنة استهلاك الذاكرة بين List و Generator في بايثون',
  'تسريع استعلامات Pandas عبر محرك PyArrow و ArrowDtype',
  'Named Aggregation في Groupby لحساب عدة مقاييس بأسماء مخصصة',
];

export const ChatContainer = ({ initialPrompt = '', onClearInitialPrompt }) => {
  const {
    messages,
    isStreaming,
    sendMessage,
    activeCitations,
    isDrawerOpen,
    viewCitations,
    closeDrawer,
    clearChat,
  } = useChatStream();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // If initialPrompt was provided from Landing Page
  useEffect(() => {
    if (initialPrompt && !isStreaming) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, isStreaming, onClearInitialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleQuickPrompt = (promptText) => {
    if (isStreaming) return;
    sendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-95px)] w-full max-w-[1600px] mx-auto px-2 sm:px-6 pb-2">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between py-2.5 mb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <h2 className="text-base font-semibold text-white tracking-wide">
            Python & Pandas AI Engineering Workspace
          </h2>
          <span className="text-xs font-sans text-cyan-300 bg-cyan-500/10 px-3 py-0.5 rounded-full border border-cyan-500/20 font-medium">
            Python 3.x & Pandas 2.x
          </span>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Session</span>
        </button>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming}
            isLast={index === messages.length - 1}
            onViewCitations={viewCitations}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="pt-2 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-xs text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isStreaming}
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* User Input Form */}
      <form onSubmit={handleSubmit} className="relative mt-1 shrink-0">
        <div className="relative flex items-center rounded-2xl glass-panel border border-white/15 focus-within:border-cyan-400/60 transition-all shadow-2xl bg-slate-900/80">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="اسأل عن أي شيء يخص بايثون أو مكتبة Pandas 2.0+ أو معالجة البيانات..."
            rows={1}
            disabled={isStreaming}
            className="w-full bg-transparent px-5 py-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none font-sans"
          />

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="m-2 p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Source Citations Drawer */}
      <SourceDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        citations={activeCitations}
      />
    </div>
  );
};
