import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, Terminal, Sparkles, ArrowRight, Zap, Database, ShieldAlert, Cpu } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const CODE_TABS = [
  {
    id: 'python-modern',
    title: 'Python 3.x Idioms',
    subtitle: 'Type Hints, Dataclasses & Generators',
    icon: Code2,
    badge: 'Python Core',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    description: 'Real-world idiomatic Python: low-memory generators, immutable dataclasses with slots, and expressive pattern matching.',
    code: `# 1. Modern Immutable DataClass with Slots (Zero memory overhead)
from dataclasses import dataclass, field
from typing import Generator, List, Optional

@dataclass(frozen=True, slots=True)
class DataMetric:
    metric_id: str
    value: float
    tags: List[str] = field(default_factory=list)
    is_anomaly: bool = False

# 2. Generator Stream (Evaluates lazily without storing full list in RAM)
def parse_stream(raw_records: List[dict]) -> Generator[DataMetric, None, None]:
    for rec in raw_records:
        if (val := rec.get("score")) is not None:  # Walrus operator :=
            yield DataMetric(
                metric_id=rec["id"],
                value=float(val),
                is_anomaly=val > 95.0
            )

# 3. Structural Pattern Matching (Python 3.10+)
def dispatch_action(metric: DataMetric) -> str:
    match metric:
        case DataMetric(is_anomaly=True, value=v) if v > 100:
            return f"CRITICAL ANOMALY: {metric.metric_id}"
        case DataMetric(is_anomaly=False):
            return "NORMAL_TELEMETRY"
        case _:
            return "UNKNOWN"`,
    highlights: [
        'Slots reduces memory per instance by ~40-50% compared to standard classes.',
        'Generators stream massive datasets row-by-row without OOM (Out Of Memory) crashes.',
        'Pattern matching replaces fragile nested if/elif ladders with structured typing.'
    ]
  },
  {
    id: 'pandas-migration',
    title: 'Pandas 2.0+ Migration',
    subtitle: 'Deprecation Kill-List & Modern Replacements',
    icon: ShieldAlert,
    badge: 'Zero Deprecated Syntax',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    description: 'Accurate migration guide: permanently eliminating removed APIs like df.append() and .ix, and mastering Copy-on-Write.',
    code: `import pandas as pd
import numpy as np

# ==============================================================
# ❌ DEPRECATED / REMOVED in Pandas 2.0+    | ✅ MODERN PRODUCTION IDIOM
# ==============================================================

# 1. Row Concatenation (df.append was COMPLETELY REMOVED!)
# ❌ df = df.append(new_row, ignore_index=True)  # Raises AttributeError!
# ✅ Use vectorized pd.concat:
df = pd.concat([df_existing, df_new_batch], ignore_index=True)

# 2. Indexing (.ix was COMPLETELY REMOVED!)
# ❌ df.ix[0:5, 'price']                         # Raises AttributeError!
# ✅ Explicit distinction between label and integer position:
label_subset = df.loc[df['price'] > 100.0, ['ticker', 'volume']]
position_subset = df.iloc[0:5, 0:2]

# 3. Array Extraction (df.values is discouraged!)
# ❌ matrix = df.values                          # Inconsistent dtype conversions
# ✅ Modern clean conversion:
matrix = df.to_numpy()

# 4. Global Copy-on-Write (Eliminates SettingWithCopyWarning entirely)
pd.options.mode.copy_on_write = True
view_slice = df[df['status'] == 'ACTIVE']
# Under CoW, modifying view_slice is 100% safe and will NEVER corrupt df!
view_slice.loc[:, 'status'] = 'PROCESSED'`,
    highlights: [
        'df.append() is permanently removed. pd.concat is vectorized and O(n) linear.',
        '.ix is removed to eliminate ambiguous integer vs label index lookups.',
        'Copy-on-Write (CoW) prevents hidden DataFrame reference mutations.'
    ]
  },
  {
    id: 'arrow-backend',
    title: 'PyArrow Acceleration',
    subtitle: 'Apache Arrow Engine & 70% Less Memory',
    icon: Zap,
    badge: 'PyArrow Backend',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    description: 'Harness native Apache Arrow columnar memory for 5x faster string processing and native nullable data types.',
    code: `import pandas as pd
import pyarrow as pa

# 1. Read large CSV directly into PyArrow Columnar Memory
#    Up to 5x faster parsing + up to 70% lower RAM for string columns!
df = pd.read_csv(
    "production_logs.csv",
    engine="pyarrow",          # Fast C++ multi-threaded parser
    dtype_backend="pyarrow"    # Stores columns as native Arrow arrays
)

# 2. Native Nullable String Types (No more Python object pointers)
# Notice: Arrow strings are contiguous memory buffers, not Python pointers!
df["user_email"] = df["user_email"].astype("string[pyarrow]")

# 3. True Native Nulls (pd.NA instead of float NaN corrupting integers)
df["user_age"] = df["user_age"].astype("int64[pyarrow]")
# Missing ages stay int64 without being coerced to float64!

# 4. SIMD-Accelerated String Filtering
# Arrow executes string lookups using CPU SIMD vector instructions:
active_users = df[df["user_email"].str.endswith("@company.com")]`,
    highlights: [
        'String columns in PyArrow use ~70% less RAM compared to legacy object dtypes.',
        'Arrow supports native nulls (pd.NA) without coercing integers to floats.',
        'SIMD vectorized execution speeds up string filtering and regex operations by 5-10x.'
    ]
  },
  {
    id: 'groupby-pipelines',
    title: 'Modern Aggregations',
    subtitle: 'NamedAgg, Method Chaining & Zero Loops',
    icon: Database,
    badge: 'Vectorized Pipelines',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    description: 'Clean, chainable data pipelines: Named aggregations in GroupBy, conditional numpy logic, and pipe architectures.',
    code: `import pandas as pd
import numpy as np

# 1. Modern GroupBy with Named Aggregations (Clean column names in one pass)
summary = (
    df.groupby('department', observed=False)
    .agg(
        total_payroll=('salary', 'sum'),
        average_salary=('salary', 'mean'),
        headcount=('employee_id', 'count'),
        top_earner=('salary', 'max')
    )
    .reset_index()
)

# 2. Strict Elimination of Slow iterrows() Loops!
# ❌ NEVER DO: for idx, row in df.iterrows(): ... (1000x slower)
# ✅ Vectorized conditional mapping with np.select:
conditions = [
    df['total_payroll'] > 1_000_000,
    df['total_payroll'] > 500_000
]
tiers = ['Tier 1 - High', 'Tier 2 - Medium']
summary['budget_tier'] = np.select(conditions, tiers, default='Tier 3 - Standard')

# 3. Clean Method Chaining with .pipe()
def filter_high_headcount(data: pd.DataFrame, min_count: int = 5) -> pd.DataFrame:
    return data.query("headcount >= @min_count")

final_report = (
    summary
    .pipe(filter_high_headcount, min_count=10)
    .sort_values(by='total_payroll', ascending=False)
)`,
    highlights: [
        'Named Aggregation generates clean output column names without messy MultiIndex flattening.',
        'np.select provides instant C-speed conditional assignment over millions of rows.',
        'Method chaining with .pipe() and .query() creates declarative, readable ETL logic.'
    ]
  }
];

export const CodeShowcaseSection = ({ onTryPrompt }) => {
  const [activeTabId, setActiveTabId] = useState('pandas-migration');
  const [copied, setCopied] = useState(false);

  const activeTab = CODE_TABS.find((t) => t.id === activeTabId) || CODE_TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchChat = () => {
    if (onTryPrompt) {
      const promptMap = {
        'python-modern': 'اشرح لي كيفية استخدام Dataclasses و Generators في بايثون لتوفير الذاكرة مع كود تطبيقي',
        'pandas-migration': 'كيف أستبدل دالة append الملغية في Pandas بـ pd.concat وما هي مزايا Copy-on-Write؟',
        'arrow-backend': 'كيفية تفعيل محرك PyArrow في Pandas 2.0+ ومقارنة استهلاك الذاكرة مع NumPy',
        'groupby-pipelines': 'كيفية كتابة Groupby مع Named Aggregation في Pandas وتفادي استخدام iterrows',
      };
      onTryPrompt(promptMap[activeTab.id] || activeTab.title);
    }
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-3">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real Python & Pandas 2.0+ Architecture Standards</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Verified <span className="text-gradient-cyan">Code Standards</span> & Deep Dive
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          معلومات برمجية حقيقية 100% مدعومة بالتوثيق الرسمي لمعايير Python 3.12+ ومكتبة Pandas 2.0+ الحديثة، خالية تماماً من الدوال المهملة.
        </p>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl max-w-3xl mx-auto">
          {CODE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : tab.color}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <motion.div
        key={activeTab.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left Column: Code Block */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/90 shadow-2xl">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-white/10 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeTab.title} • Verified Syntax</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">Python 3.x / Pandas 2.0+</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 border border-white/10 transition-colors cursor-pointer text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Body */}
          <pre className="p-5 text-xs sm:text-sm font-mono text-cyan-200/90 overflow-x-auto leading-relaxed selection:bg-cyan-500/30 whitespace-pre text-left max-h-[520px] overflow-y-auto">
            <code>{activeTab.code}</code>
          </pre>
        </div>

        {/* Right Column: Key Technical Takeaways & Copilot Action */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard className={`p-6 border ${activeTab.borderColor}`} hoverEffect={false}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                {activeTab.badge}
              </span>
              <span className="text-xs text-cyan-400 font-mono">Production Guardrail</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 font-sans">
              {activeTab.subtitle}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {activeTab.description}
            </p>

            <div className="border-t border-white/10 pt-4 mb-5">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
                Key Technical Invariants:
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {activeTab.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleLaunchChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Copilot About This</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </GlassCard>
        </div>
      </motion.div>
    </section>
  );
};
