import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pandapulse_chat_sessions_v1';

export function useChatSessions() {
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return `session-${Date.now()}`;
  });

  // Sync sessions to localStorage
  const persistSessions = useCallback((updatedSessions) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn('Failed to persist chat sessions to localStorage:', e);
    }
  }, []);

  // Save or update session when messages change
  const saveSession = useCallback((messages, model = null) => {
    if (!messages || messages.length <= 1) return;

    // Derive a clean title from the first user prompt
    const firstUserMsg = messages.find((m) => m.role === 'user');
    if (!firstUserMsg) return;

    const rawTitle = firstUserMsg.content.trim().replace(/\n+/g, ' ');
    const title = rawTitle.length > 40 ? `${rawTitle.slice(0, 40)}...` : rawTitle;

    setSessions((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === activeSessionId);
      const sessionData = {
        id: activeSessionId,
        title,
        updatedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages,
        modelName: model?.name || 'Neural Engine',
      };

      let next;
      if (existingIndex >= 0) {
        next = [...prev];
        next[existingIndex] = sessionData;
      } else {
        next = [sessionData, ...prev];
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save session to storage:', e);
      }
      return next;
    });
  }, [activeSessionId]);

  const createNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    setActiveSessionId(newId);
    return newId;
  }, []);

  const deleteSession = useCallback((idToDelete) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== idToDelete);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to delete session from storage:', e);
      }
      return next;
    });
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear sessions:', e);
    }
  }, []);

  const getSession = useCallback((id) => {
    return sessions.find((s) => s.id === id) || null;
  }, [sessions]);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    saveSession,
    createNewSession,
    deleteSession,
    clearAllSessions,
    getSession,
  };
}
