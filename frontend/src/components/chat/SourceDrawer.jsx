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
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-[#141414]/95 border-l border-white/[0.08] shadow-2xl z-50 flex flex-col backdrop-blur-2xl p-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#6799fe]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base font-display">Retrieved Knowledge Citations</h3>
                  <p className="text-xs text-white/50 font-mono">ChromaDB Top-k Retrieval Chunks</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Citations List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
              {citations.length === 0 ? (
                <div className="text-center py-12 text-white/40 text-sm">
                  No citations available for this response.
                </div>
              ) : (
                citations.map((cite, idx) => (
                  <div
                    key={cite.chunk_id || idx}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#6799fe] shrink-0" />
                        <span className="text-xs font-semibold text-white/90 truncate max-w-[220px]">
                          {cite.source}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#6799fe]/15 text-[#88b0ff] border border-[#6799fe]/30">
                        Score: {typeof cite.score === 'number' ? (cite.score * 100).toFixed(1) + '%' : cite.score}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed font-mono bg-black/40 p-3 rounded-lg border border-white/[0.06] whitespace-pre-wrap">
                      {cite.snippet}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-white/40">
              Source grounded with modern Pandas 2.x architectural guidelines
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
