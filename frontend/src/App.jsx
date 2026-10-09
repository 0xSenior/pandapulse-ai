import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Settings,
  Sparkles,
  Terminal,
  Activity,
  ArrowUpRight,
  Download,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { BrandLogo } from './components/ui/BrandLogo';
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
  const [locale, setLocale] = useState('EN');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isChatTab = activeTab === 'chat' || activeTab === 'studio';

  const handleNavigate = (tab, prompt = '') => {
    if (prompt) {
      setPendingPrompt(prompt);
    }
    navigateTo(tab);
    setIsMobileMenuOpen(false);
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

  const navItems = [
    { id: 'home', label: 'Overview' },
    { id: 'chat', label: 'Chat' },
    { id: 'studio', label: 'Data Studio' },
    { id: 'docs', label: 'Architecture' },
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'engineer', label: 'Engineer' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#6799fe] selection:text-white font-sans antialiased relative">
      {/* DeepSeek Harness Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0a0a]/85 border-b border-white/[0.08] transition-all">
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Brand Logo with Whale mascot + inverted HARNESS chip */}
          <div className="shrink-0 flex items-center">
            <BrandLogo onClick={() => handleNavigate('home')} />
          </div>

          {/* Desktop Navigation Links (Spacious, No Wrap, No Collision) */}
          <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Ordered, Gap-spaced, Shrink-0 */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* System Status Pill (Shown on wider desktop to prevent crowding) */}
            <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11.5px] text-white/70 shrink-0 font-mono">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  systemOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
                }`}
              />
              <span>{systemOnline ? 'Python 3.14 · Ready' : 'Connecting...'}</span>
            </div>

            {/* DeepSeek Signature Locale Toggle */}
            <div className="hidden sm:inline-flex items-center p-0.5 rounded-full bg-white/[0.06] border border-white/10 select-none shrink-0">
              <button
                type="button"
                onClick={() => setLocale('CN')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  locale === 'CN'
                    ? 'bg-white text-[#0a0a0a] shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => setLocale('EN')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  locale === 'EN'
                    ? 'bg-white text-[#0a0a0a] shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com/0xSenior/pandapulse-ai"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              title="API Key Settings (BYOK)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* DeepSeek Style Primary CTA */}
            <button
              type="button"
              onClick={() => handleNavigate(activeTab === 'chat' ? 'studio' : 'chat')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium bg-white text-[#0a0a0a] hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer shadow-sm select-none shrink-0 whitespace-nowrap"
            >
              <span>{activeTab === 'chat' ? 'Open Studio' : 'Launch Studio'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile & Tablet Hamburger Menu */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-white/70 hover:text-white cursor-pointer shrink-0"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden border-t border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-2xl px-6 py-4 flex flex-col gap-2"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-white/50">Language</span>
                <div className="inline-flex items-center p-0.5 rounded-full bg-white/[0.06] border border-white/10">
                  <button
                    type="button"
                    onClick={() => setLocale('CN')}
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      locale === 'CN' ? 'bg-white text-black' : 'text-white/60'
                    }`}
                  >
                    中文
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale('EN')}
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      locale === 'EN' ? 'bg-white text-black' : 'text-white/60'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main View Router */}
      <main
        className={`relative z-10 transition-all duration-300 ${
          isChatTab
            ? 'w-full px-3 sm:px-6 md:pl-24 md:pr-6 h-[calc(100vh-58px)] overflow-hidden flex flex-col'
            : 'pb-24 md:pb-16'
        }`}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
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
              className="w-full max-w-[1700px] mx-auto p-2 h-[calc(100vh-80px)]"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DocsPage />
            </motion.div>
          )}

          {activeTab === 'knowledge' && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <KnowledgePage />
            </motion.div>
          )}

          {activeTab === 'engineer' && (
            <motion.div
              key="engineer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <EngineerPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Navigation Dock (DeepSeek Dark Glass Language) */}
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
