import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileDigit,
  FileCheck,
  ChevronRight,
  GitCommit,
} from 'lucide-react';

export const HarnessTaskDiffShowcase = () => {
  const [selectedFile, setSelectedFile] = useState('pipeline.py');

  const filePills = [
    { name: 'Brief.docx', type: 'Word document', icon: FileText, color: 'text-blue-400' },
    { name: 'Data.xlsx', type: 'Excel spreadsheet', icon: FileSpreadsheet, color: 'text-emerald-400' },
    { name: 'index.html', type: 'HTML page', icon: FileCode, color: 'text-amber-400' },
    { name: 'pipeline.ts', type: 'TypeScript code', icon: FileCode, color: 'text-[#6799fe]' },
    { name: 'pipeline.py', type: 'Python script', icon: FileCode, color: 'text-indigo-400' },
    { name: 'Report.pdf', type: 'PDF document', icon: FileDigit, color: 'text-rose-400' },
    { name: 'README.md', type: 'Markdown document', icon: FileCheck, color: 'text-purple-400' },
  ];

  const diffFiles = {
    'pipeline.py': {
      path: 'src/pipeline.py',
      stats: '+3 −1',
      turn: 'Review · turn 1',
      chunkHeader: '@@ -12,4 +12,6 @@',
      lines: [
        { type: 'context', oldNo: 12, newNo: 12, text: 'def process_telemetry(df: pd.DataFrame) -> pd.DataFrame:' },
        { type: 'delete', oldNo: 13, newNo: '', text: '    return df.apply(lambda row: transform(row), axis=1)' },
        { type: 'insert', oldNo: '', newNo: 13, text: '    # Zero-copy vectorization via PandaPulse Engine' },
        { type: 'insert', oldNo: '', newNo: 14, text: '    fast_vec = np.vectorize(transform)' },
        { type: 'insert', oldNo: '', newNo: 15, text: '    return pd.Series(fast_vec(df.values), index=df.index)' },
        { type: 'context', oldNo: 14, newNo: 16, text: '}' },
      ],
    },
    'pipeline.ts': {
      path: 'src/label.ts',
      stats: '+2 −1',
      turn: 'Review · turn 1',
      chunkHeader: '@@ -8,3 +8,4 @@',
      lines: [
        { type: 'context', oldNo: 8, newNo: 8, text: 'function label(name: string) {' },
        { type: 'delete', oldNo: 9, newNo: '', text: '  return name;' },
        { type: 'insert', oldNo: '', newNo: 9, text: '  const text = name.trim();' },
        { type: 'insert', oldNo: '', newNo: 10, text: "  return text || 'Untitled';" },
        { type: 'context', oldNo: 10, newNo: 11, text: '}' },
      ],
    },
  };

  const currentDiff = diffFiles[selectedFile] || diffFiles['pipeline.py'];

  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 py-20 border-t border-white/[0.08]">
      {/* Headings */}
      <div className="flex flex-col gap-3 max-w-[720px] mb-12">
        <h2 className="font-display font-medium text-white text-[32px] sm:text-[42px] tracking-tight leading-tight">
          Complete a range of tasks
        </h2>
        <p className="text-[15px] sm:text-[16px] text-white/60 font-sans leading-relaxed">
          Organize documents, analyze spreadsheets, and write code. Preview the results directly and refine them through conversation.
        </p>
      </div>

      {/* File Types Pill Carousel */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {filePills.map((file) => {
          const Icon = file.icon;
          const isSelected = selectedFile === file.name;
          return (
            <button
              key={file.name}
              type="button"
              onClick={() => {
                if (diffFiles[file.name]) setSelectedFile(file.name);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-150 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.12] border border-white/20 text-white shadow-sm'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-white/60 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${file.color}`} />
              <span className="font-medium">{file.name}</span>
              <span className="text-white/40 text-[10.5px]">· {file.type}</span>
            </button>
          );
        })}
      </div>

      {/* Code Diff Review Card */}
      <div className="ds-card overflow-hidden">
        {/* Diff Card Top Bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-mono font-medium text-white/80">
              {currentDiff.turn}
            </span>
            <span className="text-white/30">/</span>
            <span className="text-[12.5px] font-mono text-[#6799fe]">{currentDiff.path}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[12px]">
            <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white/70">
              {currentDiff.stats}
            </span>
          </div>
        </div>

        {/* Diff Line Viewer */}
        <div className="p-4 sm:p-6 font-mono text-[12.5px] leading-relaxed overflow-x-auto bg-[#0a0a0a]">
          {/* Chunk Header */}
          <div className="text-white/30 text-[11px] mb-2">{currentDiff.chunkHeader}</div>

          <div className="flex flex-col gap-0.5">
            {currentDiff.lines.map((line, idx) => {
              const isInsert = line.type === 'insert';
              const isDelete = line.type === 'delete';

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 py-0.5 px-2 rounded font-mono ${
                    isInsert
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : isDelete
                      ? 'bg-rose-500/10 text-rose-300'
                      : 'text-white/75'
                  }`}
                >
                  {/* Line Numbers */}
                  <div className="w-12 shrink-0 flex items-center justify-between text-white/30 text-[11px] select-none">
                    <span className="w-5 text-right">{line.oldNo}</span>
                    <span className="w-5 text-right">{line.newNo}</span>
                  </div>

                  {/* Prefix +/- */}
                  <span className="w-3 select-none text-center font-bold">
                    {isInsert ? '+' : isDelete ? '−' : ' '}
                  </span>

                  {/* Line Code */}
                  <span className="whitespace-pre">{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
