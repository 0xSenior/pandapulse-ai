import React, { useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Loader2,
  Table,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { mountDataset, executePythonCode } from '../../services/pyodideService';

export const DatasetUploader = ({ onDatasetLoaded, onInsertPrompt }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [activeDataset, setActiveDataset] = useState(null);

  const processFile = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Mounting dataset to WebAssembly file system...');

    try {
      // Mount into Pyodide virtual filesystem
      const mounted = await mountDataset(file, (p) => setUploadStatus(p.message));

      // Auto-profile dataset using Python
      setUploadStatus('Profiling dataset schema & columns with Pandas...');
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
          // stdout might have output or result
          profile = JSON.parse(execRes.stdout.trim());
        } catch {
          // fallback
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
      if (onDatasetLoaded) {
        onDatasetLoaded(datasetInfo);
      }
    } catch (err) {
      console.error('Dataset loading failed:', err);
      // Fallback: at least register the file
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
      if (onDatasetLoaded) onDatasetLoaded(basicInfo);
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

  return (
    <div className="w-full font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.tsv,.json,.txt"
        className="hidden"
      />

      {/* Active Dataset Pill */}
      {activeDataset ? (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">{activeDataset.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] border border-cyan-800/40">
                  {activeDataset.rows} rows × {activeDataset.cols} cols
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Mounted at: <code className="text-cyan-300">{activeDataset.path}</code> ({activeDataset.sizeKb} KB)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onInsertPrompt && (
              <button
                type="button"
                onClick={() =>
                  onInsertPrompt(
                    `Analyze dataset '/data/${activeDataset.name}' with columns: [${(activeDataset.columns || []).slice(0, 8).join(', ')}]. Provide summary statistics, missing value check, and key insights.`
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/30 transition-colors cursor-pointer text-xs"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Auto-Analyze</span>
              </button>
            )}

            <button
              type="button"
              onClick={clearDataset}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Remove dataset"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Action Bar */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex items-center gap-2 text-xs"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Upload CSV / Dataset to chat"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            )}
            <span>{isUploading ? uploadStatus : 'Attach CSV / Dataset'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
