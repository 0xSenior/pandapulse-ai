import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Code2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Table, Cpu, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const TechnicalSpecsSection = ({ onTryPrompt }) => {
  const [activeSpec, setActiveSpec] = useState('pandas-matrix'); // 'pandas-matrix' | 'python-matrix'

  const handleLaunchChat = (query) => {
    if (onTryPrompt) {
      onTryPrompt(query);
    }
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300 mb-3">
          <Table className="w-3.5 h-3.5 text-blue-400" />
          <span>Factual Engineering Matrices & Specifications</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Real Technical Matrix: <span className="text-gradient-cyan">Python & Pandas 2.0+</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          مرجع تقني دقيق يشرح التعقيد الزمني (Time Complexity) لهياكل بيانات بايثون، وخريطة التحديثات الإلزامية في مكتبة Pandas 2.0+ الحديثة.
        </p>

        {/* Tab switch */}
        <div className="inline-flex p-1 mt-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveSpec('pandas-matrix')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSpec === 'pandas-matrix'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Pandas 2.0+ Migration Checklist</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSpec('python-matrix')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSpec === 'python-matrix'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Python Collections & Time Complexity</span>
          </button>
        </div>
      </div>

      {/* Spec 1: Pandas 2.0+ Migration Checklist */}
      {activeSpec === 'pandas-matrix' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-200 border-b border-white/10 font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Feature / API</th>
                  <th className="py-4 px-4">Status in 2.0+</th>
                  <th className="py-4 px-6">Modern Idiomatic Replacement</th>
                  <th className="py-4 px-6">Architectural Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>df.append()</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs">
                      REMOVED
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-cyan-300">
                    pd.concat([df1, df2], ignore_index=True)
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Vectorized linear memory allocation; avoids catastrophic $O(n^2)$ re-allocations in loops.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>df.ix[]</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs">
                      REMOVED
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-cyan-300">
                    df.loc[] (Label) or df.iloc[] (Integer)
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Completely eliminates dangerous ambiguities when Index contains numeric labels.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>df.values</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">
                      DISCOURAGED
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-cyan-300">
                    df.to_numpy()
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Explicit method with support for <code className="text-cyan-400">dtype</code>, <code className="text-cyan-400">copy</code> parameters, and predictable array returns.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Copy-on-Write (CoW)</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                      STANDARD 2.x
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-cyan-300">
                    pd.options.mode.copy_on_write = True
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Subsetting a DataFrame returns a zero-copy lazy view; mutations trigger localized defensive copy without mutating source.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>PyArrow Backend</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                      FIRST-CLASS
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-cyan-300">
                    engine="pyarrow", dtype_backend="pyarrow"
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Up to 70% lower RAM footprint on strings; native <code className="text-cyan-400">pd.NA</code> nulls; multi-threaded C++ Parquet/CSV IO.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>df.iterrows()</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs">
                      ANTI-PATTERN
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-cyan-300">
                    Vectorized operations, np.select, or .pipe()
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Avoids packaging individual Series objects per row; yields 100x to 1000x faster execution.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-900/60 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>Verified against Pandas 2.0, 2.1, and 2.2 release specifications.</span>
            <button
              type="button"
              onClick={() => handleLaunchChat('ما هي أهم التغييرات والدوال الملغية في Pandas 2.0+ مقارنة بالإصدارات السابقة؟')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Migration in Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Spec 2: Python Collections & Big-O Time Complexity */}
      {activeSpec === 'python-matrix' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-200 border-b border-white/10 font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Data Structure</th>
                  <th className="py-4 px-4">Index Access</th>
                  <th className="py-4 px-4">Search (<code className="text-cyan-300">in</code>)</th>
                  <th className="py-4 px-4">Append / Push</th>
                  <th className="py-4 px-4">Insert / Delete Middle</th>
                  <th className="py-4 px-6">Ideal Engineering Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-cyan-300">
                    list
                  </td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$</td>
                  <td className="py-4 px-4 font-mono text-amber-400">$O(n)$</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ amortized</td>
                  <td className="py-4 px-4 font-mono text-rose-400">$O(n)$</td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Sequential access, ordered collections where index position matters.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-cyan-300">
                    dict (Hash Table)
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-400">N/A (Key $O(1)$)</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ average</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ average</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ average</td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    High-frequency key lookups, hash mapping, caching, fast entity retrieval.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-cyan-300">
                    set (Hash Set)
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-400">N/A</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ average</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ average</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ average</td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Deduplication, membership verification, mathematical union/intersection.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-cyan-300">
                    collections.deque
                  </td>
                  <td className="py-4 px-4 font-mono text-amber-400">$O(n)$</td>
                  <td className="py-4 px-4 font-mono text-amber-400">$O(n)$</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$ (Both ends)</td>
                  <td className="py-4 px-4 font-mono text-rose-400">$O(n)$</td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Sliding window buffers (<code className="text-cyan-400">maxlen</code>), FIFO queues, double-ended stacks.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-cyan-300">
                    tuple
                  </td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-bold">$O(1)$</td>
                  <td className="py-4 px-4 font-mono text-amber-400">$O(n)$</td>
                  <td className="py-4 px-4 font-mono text-slate-400">Immutable</td>
                  <td className="py-4 px-4 font-mono text-slate-400">Immutable</td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    Immutable records, dictionary keys, defensive data passing across threads.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-900/60 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>Based on official CPython internal implementation specifications.</span>
            <button
              type="button"
              onClick={() => handleLaunchChat('ما هو الفرق بين list و deque و set في بايثون من حيث التعقيد الزمني واستهلاك الذاكرة؟')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Ask About Big-O in Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
};
