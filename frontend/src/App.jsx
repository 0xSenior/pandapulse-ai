import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, Activity, Github, Layers, Settings } from 'lucide-react';
import { FloatingDock } from './components/dock/FloatingDock';
import { SettingsModal } from './components/settings/SettingsModal';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { DocsPage } from './pages/DocsPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { EngineerPage } from './pages/EngineerPage';
import { DataStudio } from './components/studio/DataStudio';
import { useDock } from './hooks/useDock';
import { API_BASE_URL } from './config/api';
import { parseSharedParams } from './services/shareService';

export default function App() {
  const { activeTab, navigateTo } = useDock('home');
  const [systemOnline, setSystemOnline] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [studioCode, setStudioCode] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isChatTab = activeTab === 'chat' || activeTab === 'studio';

  const handleNavigate = (tab, prompt = '') => {
    if (prompt) {
      setPendingPrompt(prompt);
    }
    navigateTo(tab);
  };

  // Inspect shared URL parameters (?code=... or ?prompt=... or ?tab=...)
  useEffect(() => {
    const { code, prompt, tab } = parseSharedParams();
    if (tab === 'studio' && code) {
      setStudioCode(code);
      navigateTo('studio');
    } else if (code) {
      setStudioCode(code);
      handleNavigate('chat', `Please explain and run this code:\n\`\`\`python\n${code}\n\`\`\``);
    } else if (prompt) {
      handleNavigate('chat', prompt);
    }
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/status`);
        if (res.ok) {
          const data = await res.json();
          setSystemOnline(true);
          setChunkCount(data.total_indexed_chunks || 0);
        } else {
          setSystemOnline(false);
        }
      } catch (e) {
        setSystemOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 relative bg-grid-ambient selection:bg-cyan-500/20 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-space-950/75 border-b border-white/10 px-6 py-3.5">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                PandaPulse<span className="text-cyan-400">.ai</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono ml-2 border-l border-white/10 pl-2">
                Python 3.x & Pandas 2.x
              </span>
            </div>
          </button>

          {/* Right Status Badge & Github Link */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs font-sans">
              <span className={`w-2 h-2 rounded-full ${systemOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">{systemOnline ? 'Engine Online' : 'Connecting...'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-medium">Python & Pandas 2.x</span>
            </div>

            <a
              href="https://github.com/0xSenior"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Settings & BYOK API Keys Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors cursor-pointer"
              title="API Key Settings (BYOK)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main className={`relative z-10 transition-all duration-300 ${isChatTab ? 'px-1 sm:px-2 pb-24 md:pb-0 md:pl-24 md:pr-8' : 'px-3 pb-24 md:pb-16'}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <HomePage onNavigate={handleNavigate} />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <ChatPage
                initialPrompt={pendingPrompt}
                onClearInitialPrompt={() => setPendingPrompt('')}
              />
            </motion.div>
          )}

          {activeTab === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[1700px] mx-auto p-3 h-[calc(100vh-85px)]"
            >
              <DataStudio
                initialCode={studioCode}
                onAskAI={(q) => handleNavigate('chat', q)}
              />
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DocsPage />
            </motion.div>
          )}

          {activeTab === 'knowledge' && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <KnowledgePage />
            </motion.div>
          )}

          {activeTab === 'engineer' && (
            <motion.div
              key="engineer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <EngineerPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dynamic Floating Dock (Vertical on Chat page, Horizontal on other pages) */}
      <FloatingDock
        activeTab={activeTab}
        onSelectTab={navigateTo}
        orientation={isChatTab ? 'vertical' : 'horizontal'}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal (BYOK & Privacy) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
