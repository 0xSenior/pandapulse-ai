import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  Sparkles,
  Columns,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { SourceDrawer } from './SourceDrawer';
import { ModelSelector } from './ModelSelector';
import { DatasetUploader } from './DatasetUploader';
import { DataStudio } from '../studio/DataStudio';
import { useChatStream } from '../../hooks/useChatStream';

const QUICK_PROMPTS = [
  'Write clean Python functions with type hints and exception handling',
  'Concatenate DataFrames without deprecated append in Pandas 2.0+',
  'Enable Copy-on-Write to eliminate SettingWithCopyWarning',
  'Compare memory overhead: List vs. Generator in Python',
  'Accelerate Pandas queries with PyArrow and ArrowDtype',
  'Perform Named Aggregations in GroupBy with custom metric names',
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
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioCode, setStudioCode] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [activeDataset, setActiveDataset] = useState(null);
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
    sendMessage(input, 3, selectedModel);
    setInput('');
  };

  const handleQuickPrompt = (promptText) => {
    if (isStreaming) return;
    sendMessage(promptText, 3, selectedModel);
  };

  const handleAutoFix = (code, error) => {
    if (isStreaming) return;
    const fixPrompt = `Please diagnose and fix this Python error:\n\`\`\`python\n${code}\n\`\`\`\nError details:\n${error}\nProvide the root cause explanation and the corrected, runnable code.`;
    sendMessage(fixPrompt, 3, selectedModel);
  };

  const handleOpenInStudio = (code) => {
    setStudioCode(code);
    setIsStudioOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] w-full max-w-[1850px] mx-auto px-2 sm:px-4 pb-2 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 mb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              PandaPulse AI Studio
            </h2>
          </div>

          {/* Model Selector */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>

        {/* Right Header Toolbar: Studio Split Toggle & Clear */}
        <div className="flex items-center gap-2">
          {/* Split-Screen Studio Toggle */}
          <button
            type="button"
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
              isStudioOpen
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 shadow-cyan-500/20'
                : 'bg-slate-900/90 text-slate-300 hover:text-white border-white/10 hover:border-cyan-500/30'
            }`}
            title="Toggle Split-Screen Canvas Studio"
          >
            <Columns className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isStudioOpen ? 'Close Studio' : 'Split Studio Canvas'}</span>
          </button>

          {/* Clear Session */}
          <button
            type="button"
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            title="Clear Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Single Chat or Split-Screen Grid */}
      <div className="flex-1 flex overflow-hidden gap-3">
        {/* Left Column: Chat Assistant */}
        <div
          className={`flex flex-col h-full min-w-0 transition-all duration-300 ${
            isStudioOpen ? 'w-full lg:w-1/2' : 'w-full max-w-4xl mx-auto'
          }`}
        >
          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={isStreaming}
                isLast={index === messages.length - 1}
                onViewCitations={viewCitations}
                onSelectSuggestion={handleQuickPrompt}
                onAutoFix={handleAutoFix}
                onOpenInStudio={handleOpenInStudio}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="pt-2 pb-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
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

          {/* Dataset Drag & Drop Bar */}
          <div className="pb-1.5 shrink-0">
            <DatasetUploader
              onDatasetLoaded={(ds) => {
                setActiveDataset(ds);
                const dsPrompt = `I loaded dataset '/data/${ds.name}' (${ds.rows} rows, ${ds.cols} columns). Columns: [${(ds.columns || []).join(', ')}]. Provide an overview of this dataset and suggest the best modern Pandas 2.0+ operations for it.`;
                handleQuickPrompt(dsPrompt);
              }}
              onInsertPrompt={(prompt) => setInput(prompt)}
            />
          </div>

          {/* User Input Form */}
          <form onSubmit={handleSubmit} className="relative mt-1 shrink-0">
            <div className="relative flex items-center rounded-2xl glass-panel border border-white/15 focus-within:border-cyan-400/60 transition-all shadow-2xl bg-slate-900/85">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask anything about Python 3.x, modern Pandas 2.0+, or data engineering..."
                rows={1}
                disabled={isStreaming}
                className="w-full bg-transparent px-5 py-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none font-sans"
              />

              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="m-2 p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Split-Screen Data Studio Canvas */}
        {isStudioOpen && (
          <div className="hidden lg:block w-1/2 h-full min-w-0">
            <DataStudio
              initialCode={studioCode}
              onAskAI={(q) => sendMessage(q, 3, selectedModel)}
              onClose={() => setIsStudioOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Source Citations Drawer */}
      <SourceDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        citations={activeCitations}
      />
    </div>
  );
};
