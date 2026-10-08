import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { exportChatAsJupyterNotebook } from '../../services/exportService';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

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
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-slate-950/95 border-l border-white/10 shadow-2xl z-50 flex flex-col backdrop-blur-2xl p-6 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Chat History</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {sessions.length} saved session{sessions.length === 1 ? '' : 's'}
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/40 transition-all cursor-pointer"
                  title="Start a new chat session"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 font-sans"
              />
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                  <p className="font-medium text-slate-300">No chat sessions found</p>
                  <p className="text-slate-500 mt-1">Start a conversation to see your history here.</p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-white/5 hover:border-white/15'
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
                              isActive ? 'text-cyan-400' : 'text-slate-500'
                            }`}
                          />
                          <span className="font-medium text-xs text-slate-200 truncate group-hover:text-white">
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
                            className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
                            title="Export session as Jupyter Notebook (.ipynb)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(session.updatedAt)}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                            {session.modelName}
                          </span>
                          <span>{session.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Clear All */}
            {sessions.length > 0 && (
              <div className="pt-3 border-t border-white/10 mt-2 shrink-0 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Stored locally in browser
                </span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All History</span>
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
