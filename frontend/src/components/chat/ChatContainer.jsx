import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  Sparkles,
  Columns,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  Code2,
  Layers,
  ShieldCheck,
  Cpu,
  Zap,
  Database,
  Paperclip,
  X,
  Loader2,
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { SourceDrawer } from './SourceDrawer';
import { ModelSelector } from './ModelSelector';
import { DataStudio } from '../studio/DataStudio';
import { useChatStream } from '../../hooks/useChatStream';
import { mountDataset, executePythonCode } from '../../services/pyodideService';

const QUICK_PROMPTS = [
  {
    icon: Code2,
    color: 'text-cyan-400',
    label: 'Functions & Typing',
    prompt: 'Write clean Python functions with type hints and exception handling',
  },
  {
    icon: Layers,
    color: 'text-amber-400',
    label: 'Pandas 2.0 Concat',
    prompt: 'Concatenate DataFrames without deprecated append in Pandas 2.0+',
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    label: 'Copy-on-Write Safe',
    prompt: 'Enable Copy-on-Write to eliminate SettingWithCopyWarning',
  },
  {
    icon: Cpu,
    color: 'text-purple-400',
    label: 'List vs Generator RAM',
    prompt: 'Compare memory overhead: List vs. Generator in Python',
  },
  {
    icon: Zap,
    color: 'text-blue-400',
    label: 'PyArrow SIMD Speed',
    prompt: 'Accelerate Pandas queries with PyArrow and ArrowDtype',
  },
  {
    icon: Database,
    color: 'text-rose-400',
    label: 'GroupBy Named Agg',
    prompt: 'Perform Named Aggregations in GroupBy with custom metric names',
  },
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Dynamic textarea height adjustment
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const processFile = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Mounting dataset...');

    try {
      const mounted = await mountDataset(file, (p) => setUploadStatus(p.message));

      setUploadStatus('Profiling schema...');
      const profileCode = `
import pandas as pd
import json

df = pd.read_csv('/data/${mounted.name}')
schema_summary = {
    "rows": int(len(df)),
    "cols": int(len(df.columns)),
    "columns": list(df.columns),
    "dtypes": {c: str(d) for c, d in df.dtypes.items()},
    "memory_kb": round(df.memory_usage(deep=True).sum() / 1024, 1),
    "sample": json.loads(df.head(3).to_json(orient='records', default_handler=str))
}
import json as _j
_j.dumps(schema_summary)
`;
      const execRes = await executePythonCode(profileCode);
      let profile = {
        rows: '?',
        cols: '?',
        columns: [],
        dtypes: {},
        memory_kb: 0,
      };

      if (execRes.success && execRes.stdout) {
        try {
          profile = JSON.parse(execRes.stdout.trim());
        } catch {
          // fallback schema
        }
      }

      const datasetInfo = {
        name: mounted.name,
        path: `/data/${mounted.name}`,
        sizeKb: Math.round(file.size / 1024),
        rows: profile.rows,
        cols: profile.cols,
        columns: profile.columns,
        dtypes: profile.dtypes,
        memoryKb: profile.memory_kb,
      };

      setActiveDataset(datasetInfo);
    } catch (err) {
      console.error('Dataset loading failed:', err);
      const basicInfo = {
        name: file.name.replace(/\s+/g, '_'),
        path: `/data/${file.name.replace(/\s+/g, '_')}`,
        sizeKb: Math.round(file.size / 1024),
        rows: 'N/A',
        cols: 'N/A',
        columns: [],
        dtypes: {},
      };
      setActiveDataset(basicInfo);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearDataset = () => {
    setActiveDataset(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isStreaming) return;
    const trimmed = input.trim();
    if (!trimmed && !activeDataset) return;

    const messageText = trimmed || (activeDataset
      ? `Analyze dataset '${activeDataset.path}' with ${activeDataset.rows} rows and ${activeDataset.cols} columns. Columns: [${(activeDataset.columns || []).join(', ')}]. Provide an overview and modern Pandas 2.0+ operations.`
      : '');

    if (!messageText) return;
    sendMessage(messageText, 3, selectedModel);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
          <div className="pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-medium font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Shortcuts</span>
            </span>
            {QUICK_PROMPTS.map((item) => {
              const PromptIcon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickPrompt(item.prompt)}
                  disabled={isStreaming}
                  title={item.prompt}
                  className="group flex items-center gap-1.5 text-xs whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <PromptIcon className={`w-3.5 h-3.5 ${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="font-sans text-[12px]">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Unified ChatGPT Input Box */}
          <form
            onSubmit={handleSubmit}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative mt-1 shrink-0 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/10 hover:border-white/15 focus-within:border-cyan-500/40 focus-within:ring-2 focus-within:ring-cyan-500/10 shadow-2xl transition-all p-2.5 sm:p-3 backdrop-blur-xl"
          >
            {/* Embedded Attached Dataset Card */}
            {activeDataset && (
              <div className="mb-2 p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 truncate text-xs">{activeDataset.name}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 font-mono text-[10px] border border-cyan-800/40 shrink-0">
                        {activeDataset.rows} rows × {activeDataset.cols} cols
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      {activeDataset.path} • {activeDataset.sizeKb} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setInput(`Analyze dataset '${activeDataset.path}' with columns: [${(activeDataset.columns || []).slice(0, 8).join(', ')}]. Provide summary statistics, missing values, and modern Pandas 2.0+ operations.`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all cursor-pointer text-xs"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span className="hidden sm:inline">Auto-Analyze</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearDataset}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove dataset"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Seamless Textarea */}
            <textarea
              ref={textareaRef}
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
              className="w-full bg-transparent px-2 py-1 text-sm sm:text-base text-slate-100 placeholder-slate-400/80 focus:outline-none resize-none font-sans min-h-[44px] max-h-40 leading-relaxed"
            />

            {/* Bottom Action Toolbar */}
            <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
              {/* Left: Attach File & Status */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.tsv,.json,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer disabled:opacity-50"
                  title="Attach CSV / Dataset"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="hidden sm:inline">
                    {isUploading ? uploadStatus : 'Attach CSV'}
                  </span>
                </button>
                {isUploading && (
                  <span className="sm:hidden text-[11px] text-cyan-300 animate-pulse font-mono truncate max-w-[150px]">
                    {uploadStatus}
                  </span>
                )}
              </div>

              {/* Right: Send Button */}
              <button
                type="submit"
                disabled={(!input.trim() && !activeDataset) || isStreaming}
                className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Send prompt"
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
