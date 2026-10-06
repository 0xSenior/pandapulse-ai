import { useState, useCallback } from 'react';

export const useDock = (initialTab = 'home') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const navigateTo = useCallback((tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    activeTab,
    navigateTo,
  };
};
