import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareCode,
  Sparkles,
  ArrowRight,
  Code2,
  Database,
  Zap,
  Cpu,
  Layers,
  Lock,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

const REAL_PROMPT_CATEGORIES = [
  {
    title: 'Python Core & Architecture',
    arabicTitle: 'بايثون البرمجية والخوارزميات',
    icon: Code2,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    prompts: [
      {
        icon: Code2,
        tag: 'Type Hints & Exceptions',
        question: 'اكتب دالة بايثون معالجة أخطاء و Type Hints',
        detail: 'دالة إنتاجية مع توثيق Docstring واستثناءات مخصصة وأنواع صارمة.',
      },
      {
        icon: Cpu,
        tag: 'Memory Benchmarking',
        question: 'List Comprehensions vs Generators: متى تستخدم كل منهما؟',
        detail: 'مقارنة استهلاك الذاكرة وسرعة المعالجة بين القوائم والمولدات الكسولة.',
      },
      {
        icon: ShieldCheck,
        tag: 'Slots Optimization',
        question: 'شرح استخدام Dataclasses مع ميزة slots=True لتوفير الذاكرة',
        detail: 'تقليل حجم الكائنات بنسبة 50% وتفادي __dict__ الديناميكي.',
      },
    ],
  },
  {
    title: 'Modern Pandas 2.0+ Pipelines',
    arabicTitle: 'معالجة وهندسة البيانات في Pandas',
    icon: Database,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    prompts: [
      {
        icon: Layers,
        tag: 'Vectorized Concat',
        question: 'كيفية دمج الجداول بدون دالة append الملغية باستخدام pd.concat؟',
        detail: 'الدمج الرأسي والأفقي مع ignore_index=True وتجنب أخطاء 2.0+.',
      },
      {
        icon: Lock,
        tag: 'Copy-on-Write Guard',
        question: 'تفعيل Copy-on-Write في Pandas 2.0 وتفادي SettingWithCopyWarning',
        detail: 'فهم سلوك الشرائح الجديد وحماية البيانات الأصلية من التعديلات الخفية.',
      },
      {
        icon: Database,
        tag: 'Named Aggregations',
        question: 'استخدام Named Aggregation في Groupby لحساب عدة مقاييس بأسماء مخصصة',
        detail: 'تجميع نظيف في مسار واحد دون الحاجة لتسطيح MultiIndex المعقد.',
      },
    ],
  },
  {
    title: 'Performance & PyArrow Acceleration',
    arabicTitle: 'تسريع الأداء ومحرك Apache Arrow',
    icon: Zap,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/20',
    prompts: [
      {
        icon: Zap,
        tag: 'PyArrow Engine',
        question: 'كيف أقرأ ملف CSV ضخم باستخدام محرك PyArrow وخفض استهلاك الذاكرة؟',
        detail: 'استخدام engine="pyarrow" لتوفير 70% من RAM وتسريع الفلترة.',
      },
      {
        icon: Cpu,
        tag: 'SIMD Vectorization',
        question: 'البدائل السريعة لـ iterrows() باستخدام العمليات المتجهة np.select',
        detail: 'تحويل الحلقات البطيئة إلى شروط متجهة تعمل بسرعة لغة C.',
      },
      {
        icon: FileSpreadsheet,
        tag: 'Nullable pd.NA',
        question: 'التعامل الصحيح مع القيم المفقودة في Pandas 2.0 عبر pd.NA',
        detail: 'الأنواع القابلة للقيم الفارغة دون تحويل الأعداد الصحيحة إلى Float.',
      },
    ],
  },
];

export const InteractivePromptsSection = ({ onTryPrompt }) => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto font-sans">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Query Sandbox</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Test Real Scenarios in <span className="text-gradient-cyan">PandaPulse AI</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          انقر على أي استفسار بالأسفل لتجربته فوراً داخل بيئة العمل مع استخراج الاستشهادات المعتمدة من التوثيق الرسمي.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {REAL_PROMPT_CATEGORIES.map((cat, catIdx) => {
          const CategoryIcon = cat.icon;
          return (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: catIdx * 0.1 }}
              className="flex flex-col h-full"
            >
              <GlassCard className={`flex-1 flex flex-col justify-between p-5 border ${cat.borderColor}`} hoverEffect={false}>
                <div>
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <CategoryIcon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-sans">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium font-sans">
                        {cat.arabicTitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {cat.prompts.map((p, pIdx) => {
                      const PromptIcon = p.icon;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => onTryPrompt && onTryPrompt(p.question)}
                          className="w-full text-right p-3 rounded-xl bg-slate-900/60 hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/40 transition-all cursor-pointer group flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                              <PromptIcon className="w-3 h-3 text-cyan-400" />
                              <span>{p.tag}</span>
                            </span>
                            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors font-sans text-right line-clamp-1 mb-1" dir="rtl">
                            {p.question}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans text-right line-clamp-1" dir="rtl">
                            {p.detail}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>ChromaDB Corpus</span>
                  <span className="flex items-center gap-1 text-cyan-400/80">
                    <Sparkles className="w-3 h-3" />
                    <span>Instant Launch</span>
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
