import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { CodeShowcaseSection } from '../components/landing/CodeShowcaseSection';
import { TechnicalSpecsSection } from '../components/landing/TechnicalSpecsSection';
import { InteractivePromptsSection } from '../components/landing/InteractivePromptsSection';

export const HomePage = ({ onNavigate }) => {
  const handleTryPrompt = (promptText) => {
    onNavigate('chat', promptText);
  };

  return (
    <div className="min-h-screen pb-16">
      <HeroSection onNavigate={(tab) => onNavigate(tab)} />
      <CodeShowcaseSection onTryPrompt={handleTryPrompt} />
      <FeatureGrid />
      <TechnicalSpecsSection onTryPrompt={handleTryPrompt} />
      <InteractivePromptsSection onTryPrompt={handleTryPrompt} />
    </div>
  );
};
