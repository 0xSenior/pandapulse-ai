import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquareCode, Sparkles, ArrowRight, Code2, Database, Zap } from 'lucide-react';
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
        question: 'اكتب دالة بايثون معالجة أخطاء و Type Hints',
        detail: 'صياغة دالة إنتاجية نظيفة مع توثيق Docstring، استثناءات مخصصة (Custom Exceptions)، ومحددات أنواع صارمة.',
      },
      {
        question: 'List Comprehensions vs Generators: متى تستخدم كل منهما؟',
        detail: 'مقارنة استهلاك الذاكرة وسرعة المعالجة بين القوائم والمولدات الكسولة (Lazy Evaluation).',
      },
      {
        question: 'شرح استخدام Dataclasses مع ميزة slots=True لتوفير الذاكرة',
        detail: 'كيفية تقليل حجم الكائنات في بايثون بنسبة تصل إلى 50% وتفادي __dict__ الديناميكي.',
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
        question: 'كيفية دمج الجداول بدون دالة append الملغية باستخدام pd.concat؟',
        detail: 'الحل المعماري الصحيح للدمج الرأسي والأفقي مع ضبط ignore_index=True وتجنب أخطاء 2.0+.',
      },
      {
        question: 'تفعيل Copy-on-Write في Pandas 2.0 وتفادي SettingWithCopyWarning',
        detail: 'فهم السلوك الجديد للشرائح (Slices) وحماية البيانات الأصلية من التعديلات الجانبية الخفية.',
      },
      {
        question: 'استخدام Named Aggregation في Groupby لحساب عدة مقاييس بأسماء مخصصة',
        detail: 'كتابة تجميع نظيف في مسار واحد بدون الحاجة لتسطيح MultiIndex المعقد.',
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
        question: 'كيف أقرأ ملف CSV ضخم باستخدام محرك PyArrow وخفض استهلاك الذاكرة؟',
        detail: 'استخدام engine="pyarrow" و dtype_backend="pyarrow" لتوفير 70% من RAM وتسريع الفلترة.',
      },
      {
        question: 'البدائل السريعة لـ iterrows() باستخدام العمليات المتجهة np.select',
        detail: 'تحويل الحلقات البطيئة إلى شروط متجهة (Vectorized SIMD) تعمل بسرعة لغة C.',
      },
      {
        question: 'التعامل الصحيح مع القيم المفقودة في Pandas 2.0 عبر pd.NA',
        detail: 'الاستفادة من الأنواع القابلة للقيم الفارغة (Nullable Types) دون تحويل الأعداد الصحيحة إلى Float.',
      },
    ],
  },
];

export const InteractivePromptsSection = ({ onTryPrompt }) => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Query Sandbox</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Test Real Scenarios in <span className="text-gradient-cyan">PandaPulse AI</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          انقر على أي سؤال حقيقي بالأسفل لتجربته فوراً داخل المساعد الذكي مع استخراج الاستشهادات الموثقة والشرح خطوة بخطوة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {REAL_PROMPT_CATEGORIES.map((cat, catIdx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: catIdx * 0.1 }}
              className="flex flex-col h-full"
            >
              <GlassCard className={`flex-1 flex flex-col justify-between p-6 border ${cat.borderColor}`} hoverEffect={false}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <Icon className={`w-5 h-5 ${cat.color}`} />
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

                  <div className="mt-5 space-y-3">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => onTryPrompt && onTryPrompt(p.question)}
                        className="w-full text-right p-3.5 rounded-xl bg-slate-900/60 hover:bg-white/[0.07] border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                          <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors font-sans line-clamp-2">
                            {p.question}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans text-right line-clamp-2">
                          {p.detail}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Grounded in ChromaDB Documentation Corpus
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
