import React, { useState } from 'react';
import { Terminal, Clock, Cpu, Search, Check, FileText } from 'lucide-react';

export const HarnessDevToolsShowcase = () => {
  const [activeTab, setActiveTab] = useState('Result');
  const [selectedStep, setSelectedStep] = useState(1);

  const traces = [
    {
      id: 0,
      role: 'SYSTEM',
      badge: 'System Prompt',
      content: 'Current runtime context: Python 3.14, Pandas 2.2+, Copy-on-Write enabled, PyArrow backend.',
    },
    {
      id: 1,
      role: 'TOOL · bash',
      badge: 'Step 1',
      command: 'echo PANDAPULSE_OK',
      payload: '{"command": "echo PANDAPULSE_OK", "description": "Verify environment runtime"}',
      result: 'PANDAPULSE_OK',
      duration: '34 ms',
      started: '2026-10-09 21:00:00.637',
    },
    {
      id: 2,
      role: 'TOOL · read',
      badge: 'Step 2',
      command: 'read(data/telemetry.parquet)',
      payload: '{"file_path": "data/telemetry.parquet", "schema": "pyarrow"}',
      result: 'DataFrame loaded: 50,000 rows × 8 columns. Zero memory copy.',
      duration: '18 ms',
      started: '2026-10-09 21:00:00.672',
    },
    {
      id: 3,
      role: 'ASSISTANT',
      badge: 'Completed',
      content: 'Telemetry dataset verified and indexed. All 50,000 rows transformed without memory overhead.',
    },
  ];

  const currentTool = traces[selectedStep] || traces[1];

  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 py-20 border-t border-white/[0.08]">
      <div className="flex flex-col gap-3 max-w-[720px] mb-12">
        <h2 className="font-display font-medium text-white text-[32px] sm:text-[42px] tracking-tight leading-tight">
          Developer tools
        </h2>
        <p className="text-[15px] sm:text-[16px] text-white/60 font-sans leading-relaxed">
          Inspect execution traces and detailed runtime information to troubleshoot issues with tool calls and task execution.
        </p>
      </div>

      <div className="ds-card overflow-hidden">
        {/* Top Metric Bar */}
        <div className="px-5 py-3 border-b border-white/[0.08] bg-white/[0.02] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 text-white/60">
            <span>Duration: <strong className="text-white">52 ms</strong></span>
            <span>Turns: <strong className="text-white">2</strong></span>
            <span>Calls: <strong className="text-white">4</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white/70">Input</span>
            <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white/70">Model</span>
            <span className="px-2 py-0.5 rounded bg-[#6799fe]/15 text-[#6799fe]">Tools</span>
          </div>
        </div>

        {/* Trace Inspector Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] min-h-[380px]">
          {/* Left Column: Trace Stream */}
          <div className="p-4 sm:p-5 border-r border-white/[0.08] flex flex-col gap-3 overflow-y-auto max-h-[460px]">
            {traces.map((trace) => {
              const isSelected = selectedStep === trace.id;
              return (
                <div
                  key={trace.id}
                  onClick={() => setSelectedStep(trace.id)}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.08] border-white/20 shadow-sm'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#6799fe]">{trace.role}</span>
                    <span className="text-[10.5px] text-white/40">{trace.badge}</span>
                  </div>
                  <div className="text-white/70 text-[11.5px] truncate">
                    {trace.command || trace.content || trace.result}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detail Payload & Timing Inspector */}
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-[#0a0a0a]">
            <div>
              {/* Tabs */}
              <div className="flex items-center gap-1 pb-3 border-b border-white/[0.08] text-xs font-medium">
                {['Summary', 'Payload', 'Result', 'Timing'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === tab
                        ? 'bg-white text-black font-medium'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Display */}
              <div className="mt-4 font-mono text-[12px] text-white/80 leading-relaxed">
                {activeTab === 'Summary' && (
                  <div className="flex flex-col gap-2">
                    <span className="text-white font-medium">{currentTool.role}</span>
                    <p className="text-white/60">{currentTool.content || currentTool.result}</p>
                  </div>
                )}

                {activeTab === 'Payload' && (
                  <pre className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-x-auto text-white/90">
                    <code>{currentTool.payload || JSON.stringify(currentTool, null, 2)}</code>
                  </pre>
                )}

                {activeTab === 'Result' && (
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-emerald-300 font-mono">
                    {currentTool.result || currentTool.content}
                  </div>
                )}

                {activeTab === 'Timing' && (
                  <div className="flex flex-col gap-2 text-white/60 text-[11.5px]">
                    <div>Started: <span className="text-white">{currentTool.started || '2026-10-09 21:00:00'}</span></div>
                    <div>Duration: <span className="text-emerald-400 font-bold">{currentTool.duration || '34 ms'}</span></div>
                    <div>Hierarchy: <span className="text-white">Assistant Tool Call</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] text-[11px] font-mono text-white/40 flex items-center justify-between">
              <span>Timing source: Session timestamps</span>
              <span className="text-[#6799fe]">Trace 100% OK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
