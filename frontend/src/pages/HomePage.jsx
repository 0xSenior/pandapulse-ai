import React from 'react';
import { HarnessHero } from '../components/landing/HarnessHero';
import { HarnessPluginsShowcase } from '../components/landing/HarnessPluginsShowcase';
import { HarnessTaskDiffShowcase } from '../components/landing/HarnessTaskDiffShowcase';
import { HarnessWorkflowShowcase } from '../components/landing/HarnessWorkflowShowcase';
import { HarnessDevToolsShowcase } from '../components/landing/HarnessDevToolsShowcase';
import { HarnessQuickstartShowcase } from '../components/landing/HarnessQuickstartShowcase';
import { HarnessFooter } from '../components/landing/HarnessFooter';

export const HomePage = ({ onNavigate }) => {
  const handleTryPrompt = (promptText) => {
    onNavigate('chat', promptText);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* 1. Hero Section with Interactive Desktop App Window */}
      <HarnessHero onNavigate={onNavigate} />

      {/* 2. Expanding capabilities / Everything is a plugin (Creator Mode & Live Focus Widget) */}
      <HarnessPluginsShowcase />

      {/* 3. Complete a range of tasks (Documents & Code Diff Reviewer) */}
      <HarnessTaskDiffShowcase />

      {/* 4. Adapt to your workflow (Scheduled tasks plugin) */}
      <HarnessWorkflowShowcase onTryPrompt={handleTryPrompt} />

      {/* 5. Developer tools (Interactive execution trace inspector) */}
      <HarnessDevToolsShowcase />

      {/* 6. Start with one command (Terminal Quickstart & Plugin Ecosystem) */}
      <HarnessQuickstartShowcase onNavigate={onNavigate} />

      {/* 7. DeepSeek Minimalist Footer */}
      <HarnessFooter onNavigate={onNavigate} />
    </div>
  );
};
