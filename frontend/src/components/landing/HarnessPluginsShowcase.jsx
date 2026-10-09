import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  Terminal,
  FileCode,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const HarnessPluginsShowcase = () => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTimerTab, setActiveTimerTab] = useState('focus');

  useEffect(() => {
    let interval = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(activeTimerTab === 'focus' ? 25 * 60 : 5 * 60);
  };

  const handleTabChange = (tab) => {
    setActiveTimerTab(tab);
    setIsRunning(false);
    setTimerSeconds(tab === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const creatorSteps = [
    { type: 'Load skill', label: 'pandas-data-engineering', color: 'text-indigo-400' },
    { type: 'Read', label: 'skills/pandas-data-engineering/SKILL.md', color: 'text-white/60' },
    {
      type: 'Thinking',
      label: 'Vectorized numpy operations will eliminate memory overhead by 85% compared to apply()',
      color: 'text-white/40 italic',
    },
    { type: 'Inspect providers', label: '9 inspect providers in Pyodide WASM', color: 'text-white/60' },
    { type: 'Write', label: 'pandapulse-pipeline/package.json (+35 −0)', color: 'text-emerald-400' },
    { type: 'Write', label: 'pandapulse-pipeline/engine.py (+638 −0)', color: 'text-emerald-400' },
    { type: 'Tool call', label: 'plugin_manager · install_bundle', color: 'text-[#6799fe]' },
    { type: 'Bash', label: 'Verify live plugin state (Took 1.2s)', color: 'text-amber-400' },
  ];

  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 py-20 border-t border-white/[0.08]">
      {/* Section Headings */}
      <div className="flex flex-col gap-3 max-w-[720px] mb-12">
        <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#6799fe]">
          Expanding capabilities. Work on your terms.
        </span>
        <h2 className="font-display font-medium text-white text-[32px] sm:text-[42px] tracking-tight leading-tight">
          Everything is a plugin
        </h2>
        <p className="text-[15px] sm:text-[16px] text-white/60 font-sans leading-relaxed">
          Install plugins, or create them through chat in “Creator mode”, to extend tools, skills, and the interface.
        </p>
      </div>

      {/* Grid: Creator Mode Trace on Left + Focus / Timer Plugin on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* Creator Mode Stack Card */}
        <div className="ds-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6799fe]" />
                <span className="text-[13px] font-mono font-medium text-white">Creator mode</span>
              </div>
              <span className="text-[12px] font-mono text-white/40">Deep diving...</span>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13.5px] text-white/90">
              Write a high-performance data pipeline plugin for me.
            </div>

            {/* Step Trace Cards */}
            <div className="mt-4 flex flex-col gap-2 font-mono text-[11.5px]">
              {creatorSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/70 text-[10px] shrink-0 font-medium">
                    {step.type}
                  </span>
                  <span className={`truncate ${step.color}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Plugin built, installed, and verified</span>
            </span>
            <span className="text-white/40">Took 1.2s</span>
          </div>
        </div>

        {/* Plugin Showcase & Live Focus / Pomodoro Widget */}
        <div className="flex flex-col gap-6">
          {/* Working Focus / Timer Plugin Widget */}
          <div className="ds-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6799fe]" />
                  <span className="text-[13px] font-medium text-white">Pomodoro Focus Timer</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                  Installed
                </span>
              </div>

              {/* Focus / Short Break Tab Switch */}
              <div className="mt-4 flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleTabChange('focus')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                    activeTimerTab === 'focus' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Focus
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('break')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                    activeTimerTab === 'break' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Short break
                </button>
              </div>

              {/* Large Digital Clock Display */}
              <div className="my-8 flex flex-col items-center">
                <span className="font-mono text-[56px] font-light tracking-tight text-white select-none">
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {isRunning ? 'Session in progress' : 'Ready to start'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTimer}
                className="flex-1 ds-btn-primary py-2.5 text-xs font-medium"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start focus</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Plugin Ecosystem Pills */}
          <div className="ds-card p-5 flex flex-col gap-3">
            <span className="text-[12px] font-mono text-white/40 uppercase tracking-wider">
              Experimental Plugins
            </span>
            <div className="flex flex-wrap gap-2 text-[12px]">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 flex items-center gap-1.5">
                <span>Agent teams</span>
                <span className="text-[10px] font-mono text-[#6799fe]">Exp</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 flex items-center gap-1.5">
                <span>Auto approval</span>
                <span className="text-[10px] font-mono text-[#6799fe]">Exp</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 flex items-center gap-1.5">
                <span>Scheduled tasks</span>
                <span className="text-[10px] font-mono text-[#6799fe]">Exp</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 flex items-center gap-1.5">
                <span>Voice input</span>
                <span className="text-[10px] font-mono text-[#6799fe]">Exp</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
