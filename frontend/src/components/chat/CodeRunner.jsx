import React, { useState } from 'react';
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
} from 'lucide-react';
import { executePythonCode } from '../../services/pyodideService';
import { exportAsPythonScript } from '../../services/exportService';
import { PythonHighlighter } from '../ui/PythonHighlighter';

export const CodeRunner = ({
  code,
  language = 'python',
  onAutoFix,
  onOpenInStudio,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'table' | 'plot'
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const isPython = language.toLowerCase() === 'python' || language.toLowerCase() === 'py';

  return (
    <div
      dir="ltr"
      className="my-3.5 rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-950/95 shadow-xl text-left font-sans transition-all"
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-white/10 text-xs text-slate-300 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300 font-semibold uppercase">{language}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Open in Studio Button */}
          {onOpenInStudio && isPython && (
            <button
              type="button"
              onClick={() => onOpenInStudio(code)}
              title="Open code in Split-Screen Studio"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Studio</span>
            </button>
          )}

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
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

          {/* Run in Browser Button */}
          {isPython && (
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-medium shadow-md shadow-cyan-900/40 hover:shadow-cyan-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="px-4 py-2.5 bg-cyan-950/40 border-t border-cyan-800/40 flex items-center justify-between text-xs text-cyan-300">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{statusMessage || 'Executing in WebAssembly sandbox...'}</span>
          </div>
          <span className="text-[11px] text-cyan-500 font-mono">Python 3.12 (Client-Side)</span>
        </div>
      )}

      {/* Execution Results Panel */}
      {result && (
        <div className="border-t border-white/10 bg-slate-950/80">
          {/* Result Header & Tabs */}
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/60 border-b border-white/5 text-xs">
            <div className="flex items-center gap-1">
              {/* Console Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  activeTab === 'console'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Console</span>
              </button>

              {/* DataFrame Tab */}
              {result.dataframe && (
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    activeTab === 'table'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TableIcon className="w-3 h-3" />
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
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
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
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-cyan-300">
                      Variable: <code className="text-cyan-400">{result.dataframe.var_name}</code> ({result.dataframe.shape[0]} rows × {result.dataframe.shape[1]} cols)
                    </span>
                    <span>Memory: ~{result.dataframe.memory_usage_kb} KB</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-white/10 max-h-64">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-white/10 text-slate-300">
                          <th className="px-3 py-1.5 border-r border-white/5 text-slate-500">#</th>
                          {result.dataframe.columns.map((col, idx) => (
                            <th key={idx} className="px-3 py-1.5 border-r border-white/5 font-semibold text-slate-200 whitespace-nowrap">
                              {col}
                              <span className="block text-[10px] font-normal text-slate-500">
                                {result.dataframe.dtypes[col] || 'object'}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-slate-950/60">
                        {result.dataframe.records
                          .slice(page * pageSize, (page + 1) * pageSize)
                          .map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-3 py-1.5 border-r border-white/5 text-slate-500 text-[11px]">
                                {page * pageSize + rIdx}
                              </td>
                              {result.dataframe.columns.map((col, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5 border-r border-white/5 text-slate-300 whitespace-nowrap">
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
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
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
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={(page + 1) * pageSize >= result.dataframe.records.length}
                          onClick={() => setPage(p => p + 1)}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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
                  <div className="rounded-lg overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center p-2">
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
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
