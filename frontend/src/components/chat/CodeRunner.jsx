import React, { useState, useMemo } from 'react';
import {
  Play,
  Check,
  Copy,
  Terminal,
  Table as TableIcon,
  Image as ImageIcon,
  AlertTriangle,
  Wrench,
  Download,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { executePythonCode } from '../../services/pyodideService';
import { exportAsPythonScript } from '../../services/exportService';
import { copyShareUrlToClipboard } from '../../services/shareService';
import { PythonHighlighter } from '../ui/PythonHighlighter';

export const CodeRunner = ({
  code,
  language = 'python',
  onAutoFix,
  onOpenInStudio,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'table' | 'plot'
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const isPython = language.toLowerCase() === 'python' || language.toLowerCase() === 'py';

  const syntaxCheck = useMemo(() => {
    if (!isPython || !code) return null;
    const hasDeprecatedAppend = /\.append\s*\(/.test(code);
    const hasDeprecatedIx = /\.ix\[/.test(code);
    const hasSettingWithCopy = /inplace\s*=\s*True/.test(code);
    const hasModernConcat = /pd\.concat/.test(code);
    const hasModernLoc = /\.loc\[|\.iloc\[/.test(code);
    const hasCopyOnWrite = /copy_on_write|mode\.copy_on_write/.test(code);
    const hasPyArrow = /pyarrow|ArrowDtype/i.test(code);

    if (hasDeprecatedAppend || hasDeprecatedIx) {
      return {
        isModern: false,
        label: 'Deprecated API Found',
        color: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
      };
    }
    if (hasModernConcat || hasModernLoc || hasCopyOnWrite || hasPyArrow || /pd\.|pandas/i.test(code)) {
      return {
        isModern: true,
        label: 'Pandas 2.0+ Compliant',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      };
    }
    return null;
  }, [code, isPython]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    copyShareUrlToClipboard({ code, title: 'PandaPulse 2.0 Solution' }).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    setStatusMessage('Preparing WebAssembly runtime...');

    try {
      const execResult = await executePythonCode(code, (prog) => {
        setStatusMessage(prog.message);
      });
      setResult(execResult);
      setIsOutputCollapsed(false);

      // Auto-switch to DataFrame or Plot tab if available
      if (execResult.dataframe) {
        setActiveTab('table');
      } else if (execResult.plot) {
        setActiveTab('plot');
      } else {
        setActiveTab('console');
      }
    } catch (err) {
      setResult({
        success: false,
        error: { type: 'Error', message: String(err) },
      });
      setActiveTab('console');
    } finally {
      setIsRunning(false);
      setStatusMessage('');
    }
  };

  const handleFixWithAI = () => {
    if (!result?.error || !onAutoFix) return;
    const errorDetails = result.error.traceback || `${result.error.type}: ${result.error.message}`;
    onAutoFix(code, errorDetails);
  };

  return (
    <div
      dir="ltr"
      className="my-3.5 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0e14] shadow-2xl text-left font-sans transition-all"
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.06] text-xs text-white/70 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#6799fe]" />
          <span className="text-white/90 font-semibold uppercase">{language}</span>
          {syntaxCheck && (
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-mono ${syntaxCheck.color}`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{syntaxCheck.label}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Open in Studio Button */}
          {onOpenInStudio && isPython && (
            <button
              type="button"
              onClick={() => onOpenInStudio(code)}
              title="Open code in Split-Screen Studio"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] hover:border-white/10 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-[#6799fe]" />
              <span className="hidden sm:inline">Studio</span>
            </button>
          )}

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] hover:border-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Share Solution Link */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] hover:border-white/10 transition-colors cursor-pointer"
            title="Share runnable code solution link"
          >
            {shared ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#6799fe]" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Run in Browser Button (PandaPulse Signature Brand Button) */}
          {isPython && (
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-[#6799fe] hover:bg-[#5287f5] text-white font-medium shadow-md shadow-[#6799fe]/20 hover:shadow-[#6799fe]/35 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code Body with VS Code Syntax Highlighting */}
      <PythonHighlighter
        code={code}
        showLineNumbers={true}
        maxHeight="max-h-[450px]"
      />

      {/* Live Loading Indicator */}
      {isRunning && (
        <div className="px-4 py-2.5 bg-[#6799fe]/10 border-t border-[#6799fe]/20 flex items-center justify-between text-xs text-[#88b0ff]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#6799fe]" />
            <span>{statusMessage || 'Executing in WebAssembly sandbox...'}</span>
          </div>
          <span className="text-[11px] text-[#6799fe] font-mono">Python 3.14 (Client-Side WASM)</span>
        </div>
      )}

      {/* Execution Results Panel */}
      {result && (
        <div className="border-t border-white/[0.08] bg-[#090b10]">
          {/* Result Header & Tabs */}
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.02] border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-1">
              {/* Console Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  activeTab === 'console'
                    ? 'bg-[#6799fe]/15 text-[#88b0ff] border border-[#6799fe]/25'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3 text-[#6799fe]" />
                <span>Console</span>
              </button>

              {/* DataFrame Tab */}
              {result.dataframe && (
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    activeTab === 'table'
                      ? 'bg-[#6799fe]/15 text-[#88b0ff] border border-[#6799fe]/25'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3 h-3 text-[#6799fe]" />
                  <span>DataFrame ({result.dataframe.shape[0]}×{result.dataframe.shape[1]})</span>
                </button>
              )}

              {/* Plot Tab */}
              {result.plot && (
                <button
                  type="button"
                  onClick={() => setActiveTab('plot')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    activeTab === 'plot'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3 text-emerald-400" />
                  <span>Plot</span>
                </button>
              )}
            </div>

            {/* Timing & Collapse */}
            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
              {result.durationMs !== undefined && (
                <span className="text-slate-400">{result.durationMs}ms</span>
              )}
              <button
                type="button"
                onClick={() => setIsOutputCollapsed(!isOutputCollapsed)}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                {isOutputCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Result Content */}
          {!isOutputCollapsed && (
            <div className="p-3 text-xs font-mono">
              {/* Tab 1: Console (stdout / stderr / error) */}
              {activeTab === 'console' && (
                <div>
                  {result.stdout && (
                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {result.stdout}
                    </div>
                  )}

                  {result.stderr && (
                    <div className="mt-2 text-amber-300 whitespace-pre-wrap">
                      {result.stderr}
                    </div>
                  )}

                  {!result.stdout && !result.stderr && !result.error && (
                    <div className="text-slate-500 italic">
                      Code executed successfully with no console stdout.
                    </div>
                  )}

                  {/* Error & Auto-Fix with AI */}
                  {result.error && (
                    <div className="mt-2 p-3 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-semibold text-rose-400">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{result.error.type}: {result.error.message}</span>
                        </div>

                        {onAutoFix && (
                          <button
                            type="button"
                            onClick={handleFixWithAI}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-sans text-xs font-semibold shadow-md transition-all cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Auto-Fix with AI</span>
                          </button>
                        )}
                      </div>
                      <pre className="text-[11px] text-rose-300/80 whitespace-pre-wrap overflow-x-auto max-h-40 font-mono">
                        {result.error.traceback}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Interactive DataFrame Table */}
              {activeTab === 'table' && result.dataframe && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white/50 text-[11px]">
                    <span className="font-semibold text-white/90">
                      Variable: <code className="text-[#88b0ff]">{result.dataframe.var_name}</code> ({result.dataframe.shape[0]} rows × {result.dataframe.shape[1]} cols)
                    </span>
                    <span>Memory: ~{result.dataframe.memory_usage_kb} KB</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-white/[0.08] max-h-64 no-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/[0.03] border-b border-white/[0.08] text-white/80">
                          <th className="px-3 py-1.5 border-r border-white/5 text-white/40">#</th>
                          {result.dataframe.columns.map((col, idx) => (
                            <th key={idx} className="px-3 py-1.5 border-r border-white/5 font-semibold text-white/90 whitespace-nowrap">
                              {col}
                              <span className="block text-[10px] font-normal text-white/40">
                                {result.dataframe.dtypes[col] || 'object'}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] bg-[#0c0e14]">
                        {result.dataframe.records
                          .slice(page * pageSize, (page + 1) * pageSize)
                          .map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-3 py-1.5 border-r border-white/5 text-white/40 text-[11px]">
                                {page * pageSize + rIdx}
                              </td>
                              {result.dataframe.columns.map((col, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5 border-r border-white/5 text-white/80 whitespace-nowrap">
                                  {String(row[col] ?? 'NaN')}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {result.dataframe.records.length > pageSize && (
                    <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
                      <span>
                        Showing {page * pageSize + 1} to{' '}
                        {Math.min((page + 1) * pageSize, result.dataframe.records.length)} of{' '}
                        {result.dataframe.records.length} rows
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={page === 0}
                          onClick={() => setPage(p => p - 1)}
                          className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={(page + 1) * pageSize >= result.dataframe.records.length}
                          onClick={() => setPage(p => p + 1)}
                          className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Matplotlib Plot Viewer */}
              {activeTab === 'plot' && result.plot && (
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-white/[0.08] bg-[#0c0e14] flex items-center justify-center p-2">
                    <img
                      src={result.plot}
                      alt="Rendered Matplotlib Chart"
                      className="max-w-full h-auto rounded shadow-lg"
                    />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={result.plot}
                      download="pandapulse_chart.png"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-[#88b0ff] border border-white/[0.06] text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#6799fe]" />
                      <span>Download Chart PNG</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
