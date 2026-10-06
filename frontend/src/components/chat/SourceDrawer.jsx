import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

export const SourceDrawer = ({
  isOpen,
  onClose,
  citations = [],
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Side Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-slate-950/95 border-l border-white/10 shadow-2xl z-50 flex flex-col backdrop-blur-2xl p-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Retrieved Knowledge Citations</h3>
                  <p className="text-xs text-slate-400 font-mono">ChromaDB Top-k Retrieval Chunks</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Citations List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {citations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No citations available for this response.
                </div>
              ) : (
                citations.map((cite, idx) => (
                  <div
                    key={cite.chunk_id || idx}
                    className="p-4 rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/30 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[220px]">
                          {cite.source}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Score: {typeof cite.score === 'number' ? (cite.score * 100).toFixed(1) + '%' : cite.score}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                      {cite.snippet}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-500">
              Source grounded with modern Pandas 2.x architectural guidelines
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
