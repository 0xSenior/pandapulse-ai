import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, ArrowRight, Play, Check } from 'lucide-react';

export const HarnessWorkflowShowcase = ({ onTryPrompt }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Weekly data pipeline & model health report',
      schedule: 'Weekly on Fri at 17:00 (UTC+00:00 · Automated ETL)',
      status: 'Scheduled',
      active: true,
    },
    {
      id: 2,
      title: 'Daily financial transaction reconciliation',
      schedule: 'Daily at 08:30 (UTC+00:00 · Pandas 2.0)',
      status: 'Active',
      active: true,
    },
  ]);

  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 py-20 border-t border-white/[0.08]">
      <div className="flex flex-col gap-3 max-w-[720px] mb-12">
        <h2 className="font-display font-medium text-white text-[32px] sm:text-[42px] tracking-tight leading-tight">
          Adapt to your workflow
        </h2>
        <p className="text-[15px] sm:text-[16px] text-white/60 font-sans leading-relaxed">
          Enable the Scheduled tasks plugin to start tasks anytime and run recurring work on schedule. Stay on top of progress and inspect tool call details when needed.
        </p>
      </div>

      <div className="ds-card p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5 text-[14px] text-white/90">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Created “Weekly data pipeline & model health report”, scheduled for Fridays at 17:00 UTC.</span>
        </div>

        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 text-white/70">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-medium text-white">{task.title}</span>
                  <span className="text-[12px] font-mono text-white/45 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{task.schedule}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                  {task.status}
                </span>
                <button
                  type="button"
                  onClick={() => onTryPrompt && onTryPrompt(`Inspect scheduled pipeline status for: ${task.title}`)}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 transition-colors cursor-pointer select-none"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
