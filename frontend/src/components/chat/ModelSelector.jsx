import React, { useState, useEffect } from 'react';
import { Cpu, Check, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_MODELS = [
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek-V4-Flash',
    provider: 'deepseek',
    type: 'cloud',
    badge: 'High Speed',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill',
    provider: 'groq',
    type: 'cloud',
    badge: 'Deep Reasoning',
  },
  {
    id: 'qwen2.5-coder:1.5b',
    name: 'Qwen 2.5 Coder',
    provider: 'ollama',
    type: 'local',
    badge: 'Local WASM',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    type: 'cloud',
    badge: 'Versatile',
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
        // fallback
      }
    };
    fetchModels();
  }, []);

  const current = models.find((m) => m.id === selectedModel?.id) || selectedModel || models[0];

  return (
    <div className="relative font-sans select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs text-white transition-all cursor-pointer shadow-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#6799fe]" />
        <span className="font-medium text-white">{current.name}</span>
        <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/60 font-mono">
          {current.badge || current.type}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#141414]/95 border border-white/10 shadow-2xl backdrop-blur-2xl p-1.5 z-50">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-white/40 border-b border-white/[0.06]">
              Select Model Engine
            </div>

            <div className="py-1 space-y-0.5">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#0a0a0a] font-medium'
                        : 'hover:bg-white/[0.06] text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs truncate">{model.name}</span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                          isSelected ? 'bg-black/10 text-black' : 'bg-white/[0.06] text-white/50'
                        }`}
                      >
                        {model.badge || model.type}
                      </span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
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
