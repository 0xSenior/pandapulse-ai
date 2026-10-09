import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Check,
  Trash2,
  Cpu,
} from 'lucide-react';
import { getCustomApiKey, setCustomApiKey, removeCustomApiKey } from '../../services/keyStore';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [groqKey, setGroqKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroqKey(getCustomApiKey('groq'));
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setCustomApiKey('groq', groqKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    removeCustomApiKey('groq');
    setGroqKey('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-[22px] bg-[#141414]/95 border border-white/[0.08] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-2xl p-6 text-white font-sans z-10 overflow-hidden"
          >
            {/* Top subtle sheen */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-[#6799fe]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#6799fe] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-[15px] tracking-tight font-display">API Settings & BYOK</h3>
                  <p className="text-xs text-white/50">Bring Your Own Key for unlimited quota</p>
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

            {/* Groq Key Input */}
            <div className="relative space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/80 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#6799fe]" />
                    <span>Groq Cloud API Key</span>
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#6799fe] hover:text-[#8cb0ff] inline-flex items-center gap-1 font-mono transition-colors"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/[0.1] focus:border-[#6799fe]/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 font-mono focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                  />
                  {groqKey && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Clear key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-white/45 mt-1.5">
                  Optional. If left blank, requests use the default PandaPulse community pool.
                </p>
              </div>

              {/* Zero Data Retention Security Banner */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3 text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <div className="p-1 rounded-lg bg-[#6799fe]/10 text-[#6799fe] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-white/90 text-xs">Zero Data Retention Guarantee</h4>
                  <p className="text-white/50 text-[11px] mt-0.5 leading-relaxed">
                    Keys are stored exclusively in your local browser storage. Datasets (CSV, Parquet, Excel) are processed 100% client-side via WebAssembly and are never transmitted to external servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-white text-[#0a0a0a] hover:bg-white/90 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Saved</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

