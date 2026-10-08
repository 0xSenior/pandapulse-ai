import React, { useState, useEffect } from 'react';
import { Cpu, Check, ChevronDown, Sparkles, Zap, Shield, Brain } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_MODELS = [
  {
    id: 'qwen2.5-coder:1.5b',
    name: 'Qwen 2.5 Coder',
    provider: 'ollama',
    type: 'local',
    badge: 'Local & Private',
    description: 'Runs offline on local hardware via Ollama',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    type: 'cloud',
    badge: 'High Speed',
    description: 'Ultra-fast token streaming (300+ tok/s)',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill',
    provider: 'groq',
    type: 'cloud',
    badge: 'Deep Reasoning',
    description: 'Chain-of-thought mathematical and algorithmic reasoning',
  },
];

export const ModelSelector = ({ selectedModel, onSelectModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState(DEFAULT_MODELS);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/models`);
        if (res.ok) {
          const data = await res.json();
          if (data.available_models && data.available_models.length > 0) {
            setModels(data.available_models);
          }
        }
      } catch (e) {
        // use fallback models
      }
    };
    fetchModels();
  }, []);

  const current = models.find((m) => m.id === selectedModel?.id) || selectedModel || models[0];

  return (
    <div className="relative font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-200 transition-all cursor-pointer shadow-sm"
      >
        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold text-white">{current.name}</span>
        <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono">
          {current.badge || current.type}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-2xl p-2 z-50 divide-y divide-white/5">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select Neural Engine
            </div>

            <div className="py-1 space-y-1">
              {models.map((model) => {
                const isSelected = model.id === current.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-500/15 text-cyan-200' : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{model.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono border border-white/10">
                          {model.badge || model.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {model.description}
                      </p>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
