import { useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/api';

/**
 * Extracts contextual follow-up suggestions from model responses,
 * cleaning the visible text and preventing exclamation marks.
 */
export const parseContentAndSuggestions = (rawText) => {
  if (!rawText) return { cleanText: '', suggestions: [] };

  const match = rawText.match(/<<<SUGGESTIONS>>>([\s\S]*?)(?:<<<END_SUGGESTIONS>>>|$)/);
  if (!match) {
    return { cleanText: rawText.replace(/!+/g, ''), suggestions: [] };
  }

  const suggestionsBlock = match[1];
  const suggestions = suggestionsBlock
    .split('\n')
    .map((s) => s.replace(/^[-*•\d.]+\s*/, '').replace(/!+/g, '').trim())
    .filter((s) => s.length > 0 && !s.includes('<<<'));

  const cleanText = rawText
    .replace(/<<<SUGGESTIONS>>>[\s\S]*?(?:<<<END_SUGGESTIONS>>>|$)/, '')
    .replace(/!+/g, '')
    .trim();

  return { cleanText, suggestions };
};

export const useChatStream = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to **PandaPulse AI** — your specialized engineering workspace for **Python 3.x** and modern **Pandas 2.0+** data pipelines.\n\n' +
        'What code, pipeline, or data challenge are you working on today?',
      suggestions: [
        'How to concatenate DataFrames in Pandas 2.0 without deprecated append?',
        'How to accelerate reading large datasets using Apache Arrow?',
        'What is Copy-on-Write and how does it optimize memory in Pandas 2.x?',
      ],
      citations: [],
      latency_ms: 0.2,
      cached: true,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitations, setActiveCitations] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (queryText, topK = 3, modelOverride = null) => {
    if (!queryText.trim() || isStreaming) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toISOString(),
    };

    const startTime = Date.now();
    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      rawContent: '',
      content: '',
      suggestions: [],
      citations: [],
      latency_ms: null,
      cached: false,
      timestamp: new Date().toISOString(),
      isThinking: true,
      thinkingStartTime: startTime,
      thoughtDurationMs: null,
      statusMessage: 'تحليل الاستفسار واستدعاء المعايير البرمجية...',
      thoughts: [],
      steps: [
        { id: 'init', label: 'تحليل السؤال وتحديد متطلبات الحل البرمجي', time: '0.0s' }
      ],
    };

    // Extract recent conversation history for multi-turn context (last 6 turns)
    const recentHistory = messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content.replace(/<<<SUGGESTIONS>>>[\s\S]*?(?:<<<END_SUGGESTIONS>>>|$)/, '').trim(),
      }))
      .filter((m) => m.content.length > 0);

    setMessages((prev) => [...prev, userMessage, initialAssistantMsg]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const payload = {
        query: queryText.trim(),
        top_k: topK,
        history: recentHistory,
      };
      if (modelOverride?.id) payload.model = modelOverride.id;
      if (modelOverride?.provider) payload.provider = modelOverride.provider;

      const response = await fetch(`${API_BASE_URL}/api/v1/stream-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const rawEvent of events) {
          const lines = rawEvent.split('\n');
          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              eventData = line.replace('data:', '').trim();
            }
          }

          if (!eventData) continue;

          try {
            const parsed = JSON.parse(eventData);

            if (eventType === 'thought') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        thoughts: [...(msg.thoughts || []), parsed.thought],
                      }
                    : msg
                )
              );
            } else if (eventType === 'status') {
              const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        statusMessage: parsed.message || msg.statusMessage,
                        steps: [
                          ...(msg.steps || []),
                          {
                            id: parsed.step || Date.now(),
                            label: parsed.message || 'خطوة معالجة',
                            time: `${elapsedSec}s`,
                          },
                        ],
                      }
                    : msg
                )
              );
            } else if (eventType === 'meta') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        cached: parsed.cached ?? false,
                        citations: parsed.citations || [],
                        latency_ms: parsed.latency_ms ?? null,
                      }
                    : msg
                )
              );
            } else if (eventType === 'token') {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== assistantMsgId) return msg;
                  const isFirstToken = msg.isThinking;
                  const duration = isFirstToken
                    ? Date.now() - (msg.thinkingStartTime || startTime)
                    : msg.thoughtDurationMs;

                  const rawUpdated = (msg.rawContent || '') + (parsed.token || '');
                  const { cleanText, suggestions } = parseContentAndSuggestions(rawUpdated);

                  return {
                    ...msg,
                    isThinking: false,
                    thoughtDurationMs: duration,
                    rawContent: rawUpdated,
                    content: cleanText,
                    suggestions: suggestions.length > 0 ? suggestions : msg.suggestions,
                  };
                })
              );
            } else if (eventType === 'done') {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== assistantMsgId) return msg;
                  const { cleanText, suggestions } = parseContentAndSuggestions(msg.rawContent || msg.content);
                  return {
                    ...msg,
                    isThinking: false,
                    content: cleanText,
                    suggestions: suggestions.length > 0 ? suggestions : (msg.suggestions || []),
                    thoughtDurationMs:
                      msg.thoughtDurationMs || (Date.now() - (msg.thinkingStartTime || startTime)),
                    latency_ms: parsed.latency_ms ?? msg.latency_ms,
                  };
                })
              );
            }
          } catch (e) {
            console.error('Failed to parse SSE payload:', e);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Streaming request failed:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: msg.content || 'عذراً، حدث انقطاع في الاتصال بخدمة PandaPulse الخلفية.',
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, messages]);

  const viewCitations = useCallback((citations) => {
    setActiveCitations(citations);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Session cleared. I am PandaPulse AI, ready for your next Python or Pandas engineering challenge.',
        suggestions: [
          'How to concatenate DataFrames in Pandas 2.0 without deprecated append?',
          'How to accelerate reading large datasets using Apache Arrow?',
          'What is Copy-on-Write and how does it optimize memory in Pandas 2.x?',
        ],
        citations: [],
        latency_ms: 0.1,
        cached: true,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    activeCitations,
    isDrawerOpen,
    viewCitations,
    closeDrawer,
    clearChat,
  };
};
