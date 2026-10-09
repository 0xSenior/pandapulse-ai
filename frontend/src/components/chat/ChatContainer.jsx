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
  History,
  Plus,
  FileCode,
  Settings,
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { SourceDrawer } from './SourceDrawer';
import { ModelSelector } from './ModelSelector';
import { ChatHistoryDrawer } from './ChatHistoryDrawer';
import { SettingsModal } from '../settings/SettingsModal';
import { DataStudio } from '../studio/DataStudio';
import { useChatStream } from '../../hooks/useChatStream';
import { useChatSessions } from '../../hooks/useChatSessions';
import { mountDataset, executePythonCode } from '../../services/pyodideService';
import { exportChatAsJupyterNotebook } from '../../services/exportService';

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
    loadMessages,
  } = useChatStream();

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    saveSession,
    createNewSession,
    deleteSession,
    clearAllSessions,
  } = useChatSessions();

  const [input, setInput] = useState('');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  // Persist session automatically on response completion
  useEffect(() => {
    if (!isStreaming && messages.length > 1) {
      saveSession(messages, selectedModel);
    }
  }, [messages, isStreaming, selectedModel, saveSession]);

  const processFile = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Mounting dataset...');

    try {
      const mounted = await mountDataset(file, (p) => setUploadStatus(p.message));

      setUploadStatus('Profiling schema with Pandas...');
      const profileCode = `
import pandas as pd
import json

file_name = '${mounted.name}'.lower()
try:
    if file_name.endswith('.parquet'):
        df = pd.read_parquet('/data/${mounted.name}')
    elif file_name.endswith('.xlsx') or file_name.endswith('.xls'):
        df = pd.read_excel('/data/${mounted.name}')
    elif file_name.endswith('.json'):
        df = pd.read_json('/data/${mounted.name}')
    elif file_name.endswith('.tsv'):
        df = pd.read_csv('/data/${mounted.name}', sep='\\t')
    else:
        df = pd.read_csv('/data/${mounted.name}')
except Exception:
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

  const handleNewChat = () => {
    createNewSession();
    clearChat();
    setActiveDataset(null);
    setInput('');
  };

  const handleSelectSession = (session) => {
    setActiveSessionId(session.id);
    if (loadMessages && session.messages) {
      loadMessages(session.messages);
    }
  };

  const handleExportJupyter = () => {
    exportChatAsJupyterNotebook(messages, 'pandapulse_chat.ipynb');
  };

  return (
    <div className="flex flex-col h-full w-full font-sans flex-1 min-h-0">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-1 mb-2 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <h2 className="text-sm sm:text-base font-display font-medium text-white tracking-tight">
              PandaPulse Chat
            </h2>
          </div>

          {/* Model Selector */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>

        {/* Right Header Toolbar */}
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-[#0a0a0a] hover:bg-white/90 shadow-sm transition-all cursor-pointer"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          {/* History Sessions Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Open Chat History"
          >
            <History className="w-3.5 h-3.5 text-white/60" />
            <span className="hidden sm:inline">History</span>
            {sessions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[10px] font-mono">
                {sessions.length}
              </span>
            )}
          </button>

          {/* Export to Jupyter Notebook */}
          <button
            type="button"
            onClick={handleExportJupyter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Export full session as Jupyter Notebook (.ipynb)"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">.ipynb</span>
          </button>

          {/* Settings & BYOK API Keys */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="API Settings & BYOK"
          >
            <Settings className="w-3.5 h-3.5 text-white/60" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Split-Screen Studio Toggle */}
          <button
            type="button"
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              isStudioOpen
                ? 'bg-white text-[#0a0a0a] border-transparent shadow-sm'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border-white/10'
            }`}
            title="Toggle Split-Screen Canvas Studio"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isStudioOpen ? 'Close Studio' : 'Split Canvas'}</span>
          </button>

          {/* Clear Session */}
          <button
            type="button"
            onClick={clearChat}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Clear Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Workspace: Single Chat or Split-Screen Grid */}
      <div className="flex-1 flex overflow-hidden gap-3 min-h-0">
        {/* Left Column: Chat Assistant */}
        <div
          className={`flex flex-col h-full min-w-0 transition-all duration-300 ${
            isStudioOpen ? 'w-full lg:w-1/2' : 'w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto'
          }`}
        >
          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4 min-h-0">
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
            <span className="flex items-center gap-1 text-[11px] text-white/40 shrink-0 font-medium font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              <Sparkles className="w-3.5 h-3.5 text-[#6799fe]" />
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
                  className="group flex items-center gap-1.5 text-xs whitespace-nowrap px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer disabled:opacity-50"
                >
                  <PromptIcon className="w-3.5 h-3.5 text-[#6799fe] group-hover:scale-105 transition-transform" />
                  <span className="font-sans text-[12px]">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* DeepSeek Harness Style Composer Input Box */}
          <form
            onSubmit={handleSubmit}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative shrink-0 rounded-2xl bg-[#111111]/90 border border-white/[0.1] hover:border-white/20 focus-within:border-white/30 transition-all p-3 backdrop-blur-xl mb-1"
            style={{
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Embedded Attached Dataset Card */}
            {activeDataset && (
              <div className="mb-2 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#6799fe]/15 text-[#6799fe] flex items-center justify-center shrink-0 border border-[#6799fe]/20">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate text-xs">{activeDataset.name}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/70 font-mono text-[10px]">
                        {activeDataset.rows} rows × {activeDataset.cols} cols
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 font-mono mt-0.5 truncate">
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 transition-all cursor-pointer text-xs"
                  >
                    <Sparkles className="w-3 h-3 text-[#6799fe]" />
                    <span className="hidden sm:inline">Auto-Analyze</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearDataset}
                    className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
              className="w-full bg-transparent px-2 py-1 text-sm sm:text-[14.5px] text-white placeholder-white/40 focus:outline-none resize-none font-sans min-h-[44px] max-h-40 leading-relaxed"
            />

            {/* Bottom Action Toolbar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              {/* Left: Attach File & Status */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.tsv,.json,.txt,.parquet,.xlsx,.xls"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer disabled:opacity-50"
                  title="Attach CSV, Parquet, TSV, or Excel dataset"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6799fe]" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
                  )}
                  <span className="hidden sm:inline">
                    {isUploading ? uploadStatus : 'Attach Dataset'}
                  </span>
                </button>
                {isUploading && (
                  <span className="sm:hidden text-[11px] text-[#6799fe] animate-pulse font-mono truncate max-w-[150px]">
                    {uploadStatus}
                  </span>
                )}
                <span
                  title="Zero Data Retention: Datasets execute locally in browser memory via WebAssembly and are never sent to any server"
                  className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Client WASM Safe</span>
                </span>
              </div>

              {/* Right: Send Button (DeepSeek Round White Button) */}
              <button
                type="submit"
                disabled={(!input.trim() && !activeDataset) || isStreaming}
                className="w-8 h-8 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center hover:bg-white/90 active:scale-95 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Send prompt"
              >
                <Send className="w-3.5 h-3.5" />
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

      {/* Chat History Sessions Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        onClearAll={clearAllSessions}
      />

      {/* Settings Modal (BYOK & Privacy) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
