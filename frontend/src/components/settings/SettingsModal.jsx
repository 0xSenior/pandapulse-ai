import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Check,
  Trash2,
  Lock,
  Cpu,
  Sparkles,
  AlertCircle,
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-3xl bg-slate-950/95 border border-white/10 shadow-2xl backdrop-blur-2xl p-6 text-slate-100 font-sans z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">API Settings & BYOK</h3>
                  <p className="text-xs text-slate-400">Bring Your Own Key for unlimited quota</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Groq Key Input */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Groq Cloud API Key</span>
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-mono hover:underline"
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
                    className="w-full bg-slate-900/90 border border-white/10 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none"
                  />
                  {groqKey && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Clear key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Optional. If left blank, requests use the default PandaPulse community pool.
                </p>
              </div>

              {/* Zero Data Retention Security Banner */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-cyan-300">Zero Data Retention Guarantee</h4>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Keys are stored exclusively in your local browser storage. Datasets (CSV, Parquet, Excel) are processed 100% client-side via WebAssembly and are never transmitted to external servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Saved</span>
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
