import React, { useState } from 'react';
import {
  Play,
  Download,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  Table as TableIcon,
  Image as ImageIcon,
  Sparkles,
  Layers,
  FileCode,
  BookOpen,
  Wrench,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { executePythonCode } from '../../services/pyodideService';
import {
  exportAsJupyterNotebook,
  exportAsPythonScript,
} from '../../services/exportService';

const STARTER_SNIPPETS = {
  modern_pandas: `# Modern Pandas 2.0+ Concat & Arrow Types
import pandas as pd
import numpy as np

# Sample transactional data
df1 = pd.DataFrame({
    'item_id': ['A101', 'A102', 'B201'],
    'category': ['Electronics', 'Electronics', 'Home'],
    'sales': [450.0, 890.5, 120.0]
})

df2 = pd.DataFrame({
    'item_id': ['B202', 'C301'],
    'category': ['Home', 'Books'],
    'sales': [310.0, 45.0]
})

# Modern concat without deprecated .append()
combined_df = pd.concat([df1, df2], ignore_index=True)
print("Total rows:", len(combined_df))
print(combined_df.groupby('category')['sales'].agg(['count', 'sum', 'mean']))
combined_df
`,
  pyarrow_perf: `# High Performance IO with PyArrow Backend
import pandas as pd
import numpy as np

# Create synthetic dataset with 50,000 rows
n = 50000
dates = pd.date_range('2025-01-01', periods=n, freq='min')
values = np.random.randn(n).cumsum()

timeseries_df = pd.DataFrame({
    'timestamp': dates,
    'signal_value': values,
    'status': np.random.choice(['OK', 'WARNING', 'ALERT'], size=n)
})

# Calculate rolling statistics
timeseries_df['rolling_mean'] = timeseries_df['signal_value'].rolling(window=100).mean()
print("Memory Footprint (KB):", round(timeseries_df.memory_usage(deep=True).sum() / 1024, 2))
timeseries_df.tail(20)
`,
  visualization: `# Live Data Visualization with Matplotlib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

categories = ['Engineering', 'Data Science', 'DevOps', 'Product', 'Design']
q1_metrics = [85, 92, 78, 65, 88]
q2_metrics = [94, 98, 86, 74, 91]

x = np.arange(len(categories))
width = 0.35

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.bar(x - width/2, q1_metrics, width, label='Q1 Performance', color='#06b6d4')
ax.bar(x + width/2, q2_metrics, width, label='Q2 Performance', color='#3b82f6')

ax.set_title('Engineering Velocity & Output by Team (2025-2026)', color='white', fontsize=13, pad=12)
ax.set_xticks(x)
ax.set_xticklabels(categories, color='#cbd5e1')
ax.tick_params(colors='#94a3b8')
ax.legend(facecolor='#0f172a', edgecolor='#334155', labelcolor='#e2e8f0')
ax.grid(axis='y', linestyle='--', alpha=0.2)

plt.tight_layout()
plt.show()
`,
};

export const DataStudio = ({
  initialCode = '',
  onAskAI,
  onClose,
}) => {
  const [code, setCode] = useState(initialCode || STARTER_SNIPPETS.modern_pandas);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'table' | 'visualizer'
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatusMessage('Executing in Pyodide WebAssembly...');

    try {
      const res = await executePythonCode(code, (p) => setStatusMessage(p.message));
      setResult(res);
      if (res.dataframe) {
        setActiveTab('table');
      } else if (res.plot) {
        setActiveTab('visualizer');
      }
    } catch (err) {
      setResult({
        success: false,
        error: { type: 'ExecutionError', message: String(err) },
      });
    } finally {
      setIsRunning(false);
      setStatusMessage('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportNotebook = () => {
    exportAsJupyterNotebook(code, 'pandapulse_studio_notebook.ipynb');
  };

  const handleExportScript = () => {
    exportAsPythonScript(code, 'pandapulse_pipeline.py');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden font-sans">
      {/* Studio Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-900/90 border-b border-white/10 select-none min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
            Studio Canvas
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono border border-cyan-800/40 whitespace-nowrap">
            Python 3.12
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Quick Snippets Dropdown */}
          <select
            onChange={(e) => {
              if (STARTER_SNIPPETS[e.target.value]) {
                setCode(STARTER_SNIPPETS[e.target.value]);
              }
            }}
            className="text-xs bg-slate-800 text-slate-300 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50 cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
          >
            <option value="modern_pandas">Pandas 2.0 Concat</option>
            <option value="pyarrow_perf">PyArrow Speed</option>
            <option value="visualization">Matplotlib Chart</option>
          </select>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export Jupyter */}
          <button
            type="button"
            onClick={handleExportNotebook}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 text-xs transition-colors cursor-pointer"
            title="Export as Jupyter Notebook (.ipynb)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">.ipynb</span>
          </button>

          {/* Export Python */}
          <button
            type="button"
            onClick={handleExportScript}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-blue-400 text-xs transition-colors cursor-pointer"
            title="Export as Python Script (.py)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">.py</span>
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/40 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
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
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 bg-slate-900/60 border-b border-white/5 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer font-sans ${
              activeTab === 'editor'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Code Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer font-sans ${
              activeTab === 'table'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Data Viewer</span>
            {result?.dataframe && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer font-sans ${
              activeTab === 'visualizer'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Visualizer</span>
            {result?.plot && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Runtime Status */}
        {result?.durationMs !== undefined && (
          <span className="text-[11px] text-slate-400 font-mono">
            Last run: {result.durationMs}ms
          </span>
        )}
      </div>


      {/* Main Workspace Area */}
      <div className="flex-1 overflow-auto p-3">
        {/* TAB 1: Code Editor */}
        {activeTab === 'editor' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex-1 relative rounded-xl border border-white/10 bg-slate-950 overflow-hidden shadow-inner">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 bg-transparent font-mono text-xs sm:text-sm text-cyan-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/30"
              />
            </div>

            {/* Terminal Console Output at bottom of editor */}
            {result && (
              <div className="rounded-xl border border-white/10 bg-slate-900/90 p-3 text-xs font-mono max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1.5 mb-2 font-sans text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>Console Output</span>
                  </span>
                  <span>{result.durationMs}ms</span>
                </div>

                {result.stdout && (
                  <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {result.stdout}
                  </pre>
                )}

                {result.stderr && (
                  <pre className="text-amber-300 whitespace-pre-wrap">
                    {result.stderr}
                  </pre>
                )}

                {result.error && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300">
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>{result.error.type}: {result.error.message}</span>
                      {onAskAI && (
                        <button
                          type="button"
                          onClick={() =>
                            onAskAI(
                              `Please fix this code error:\n\`\`\`python\n${code}\n\`\`\`\nError Traceback:\n${result.error.traceback}`
                            )
                          }
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs transition-colors cursor-pointer"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Fix with AI</span>
                        </button>
                      )}
                    </div>
                    <pre className="text-[10px] text-rose-400/80 whitespace-pre-wrap">
                      {result.error.traceback}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DataFrame Table Viewer */}
        {activeTab === 'table' && (
          <div className="h-full flex flex-col space-y-3">
            {result?.dataframe ? (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-white/5">
                  <span className="font-semibold text-cyan-300">
                    Active DataFrame: <code className="text-cyan-400">{result.dataframe.var_name}</code> ({result.dataframe.shape[0]} rows × {result.dataframe.shape[1]} columns)
                  </span>
                  <span className="text-slate-400 font-mono">
                    Memory: ~{result.dataframe.memory_usage_kb} KB
                  </span>
                </div>

                <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-slate-950">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-slate-200">
                      <tr>
                        <th className="px-3 py-2 border-r border-white/5 text-slate-500">#</th>
                        {result.dataframe.columns.map((col, idx) => (
                          <th key={idx} className="px-3 py-2 border-r border-white/5 font-semibold whitespace-nowrap">
                            {col}
                            <span className="block text-[10px] font-normal text-slate-500 font-mono">
                              {result.dataframe.dtypes[col] || 'object'}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-950/60 font-mono">
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
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>
                    Showing {page * pageSize + 1} to{' '}
                    {Math.min((page + 1) * pageSize, result.dataframe.records.length)} of{' '}
                    {result.dataframe.records.length} rows
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={(page + 1) * pageSize >= result.dataframe.records.length}
                      onClick={() => setPage(p => p + 1)}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm text-center p-8 space-y-3">
                <TableIcon className="w-10 h-10 text-slate-600" />
                <p>No DataFrame detected yet.</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Run a Python script in the Editor that creates or modifies a Pandas DataFrame to inspect its contents here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Visualizer */}
        {activeTab === 'visualizer' && (
          <div className="h-full flex flex-col items-center justify-center p-4">
            {result?.plot ? (
              <div className="space-y-4 max-w-2xl w-full">
                <div className="rounded-xl border border-white/10 bg-slate-950 p-3 shadow-2xl flex items-center justify-center">
                  <img
                    src={result.plot}
                    alt="Studio Rendered Chart"
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="flex justify-end">
                  <a
                    href={result.plot}
                    download="pandapulse_studio_chart.png"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 text-sm text-center p-8 space-y-3">
                <ImageIcon className="w-10 h-10 text-slate-600" />
                <p>No Matplotlib plot rendered yet.</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Use the 'Template: Matplotlib Chart' snippet in the Editor and click Run to see high-res plots rendered here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
