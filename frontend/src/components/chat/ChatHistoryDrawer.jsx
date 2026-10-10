import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  History,
  Plus,
  Trash2,
  Download,
  Search,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { exportChatAsJupyterNotebook } from '../../services/exportService';
import { useLanguage } from '../../context/LanguageContext';

export const ChatHistoryDrawer = ({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
}) => {
  const { t, locale, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Lock body scroll and listen for Escape key when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'AR' ? 'ar-EG' : undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return locale === 'AR' ? 'مؤخراً' : 'Recently';
    }
  };

  const getSessionsCountText = () => {
    const count = sessions.length;
    if (locale === 'AR') {
      if (count === 0) return t('noHistory');
      if (count === 1) return `1 ${t('savedSession')}`;
      return `${count} ${t('savedSessions')}`;
    }
    return `${count} ${count === 1 ? t('savedSession') : t('savedSessions')}`;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] isolate pointer-events-auto"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Backdrop */}
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] cursor-pointer"
            aria-hidden="true"
          />

          {/* Side Drawer */}
          <motion.aside
            key="history-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-[#141414]/98 border-l border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.85)] z-[101] flex flex-col backdrop-blur-2xl p-6 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#6799fe]">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base font-display">
                    {t('chatHistoryTitle')}
                  </h3>
                  <p className="text-xs text-white/50 font-mono">
                    {getSessionsCountText()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-white/90 text-[#0a0a0a] text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
                  title={t('newChat')}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('newChat')}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-white/[0.06]"
                  title={t('closeDrawer')}
                  aria-label={t('closeDrawer')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3 shrink-0">
              <Search
                className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-white/40 ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchSessionsPlaceholder')}
                className={`w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/[0.08] focus:border-[#6799fe]/50 rounded-xl py-2 text-xs text-white placeholder-white/30 focus:outline-none font-sans transition-all ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-0">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-16 text-white/40 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-white/20" />
                  <p className="font-medium text-white/70">{t('noSessionsFound')}</p>
                  <p className="text-white/40 mt-1">{t('startConversationPrompt')}</p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isActive
                          ? 'bg-[#6799fe]/10 border-[#6799fe]/30 shadow-sm'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                      onClick={() => {
                        onSelectSession(session);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-[#6799fe]' : 'text-white/40'
                            }`}
                          />
                          <span className="font-medium text-xs text-white/90 truncate group-hover:text-white">
                            {session.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportChatAsJupyterNotebook(
                                session.messages,
                                `${session.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25)}.ipynb`
                              );
                            }}
                            className="p-1 rounded-md text-white/50 hover:text-[#6799fe] hover:bg-white/5 transition-colors cursor-pointer"
                            title={t('exportNotebookTooltip')}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 rounded-md text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title={t('deleteSessionTooltip')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(session.updatedAt)}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-white/60 text-[10px] border border-white/[0.05]">
                            {session.modelName}
                          </span>
                          <span>
                            {session.messageCount}{' '}
                            {session.messageCount === 1 ? t('messageUnit') : t('messagesUnit')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Clear All */}
            {sessions.length > 0 && (
              <div className="pt-3 border-t border-white/[0.08] mt-2 shrink-0 flex items-center justify-between text-xs">
                <span className="text-white/40 font-mono text-[11px]">
                  {t('storedLocally')}
                </span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="flex items-center gap-1 px-2.5 py-1 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('clearAllHistory')}</span>
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
