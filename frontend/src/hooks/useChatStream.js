import { useState, useCallback, useRef } from 'react';

export const useChatStream = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "أهلاً بك! أنا **PandaPulse AI**، المساعد الهندسي والبرمجي المتخصص في لغة **Python 3.x** ومكتبة **Pandas 2.0+** الحديثة. 🚀\n\n" +
        "أنا جاهز لمساعدتك بحلول برمجية حقيقية وموثقة بعيداً عن التخمينات أو الدوال الملغية:\n" +
        "- 🐍 **لغة Python البرمجية**: دوال نظيفة، هياكل البيانات والتعقيد الزمني Big-O، المولدات (Generators) لتوفير RAM، والبرمجة الكائنية OOP مع `@dataclass`.\n" +
        "- 🐼 **مكتبة Pandas 2.0+**: الدمج المعياري عبر `pd.concat` (بديل `.append` الملغية)، الفهرسة الصارمة عبر `.loc` و `.iloc`، أمان الذاكرة عبر **Copy-on-Write**، ومحرك **Apache Arrow**.\n" +
        "- ⚡ **دقة هندسية**: استشهادات موثقة من ChromaDB وشرح منطقي خطوة بخطوة.",
      citations: [],
      latency_ms: 0.4,
      cached: true,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitations, setActiveCitations] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (queryText, topK = 3) => {
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
      content: '',
      citations: [],
      latency_ms: null,
      cached: false,
      timestamp: new Date().toISOString(),
      isThinking: true,
      thinkingStartTime: startTime,
      thoughtDurationMs: null,
      statusMessage: 'تحليل الاستفسار ومعايير Python & Pandas 2.0+...',
      thoughts: [],
      steps: [
        { id: 'init', label: 'تحليل السؤال والتحقق من معايير Python & Pandas في الكاش', time: '0.0s' }
      ],
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMsg]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/v1/stream-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText.trim(), top_k: topK }),
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
                  return {
                    ...msg,
                    isThinking: false,
                    thoughtDurationMs: duration,
                    content: msg.content + (parsed.token || ''),
                  };
                })
              );
            } else if (eventType === 'done') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        isThinking: false,
                        thoughtDurationMs:
                          msg.thoughtDurationMs || (Date.now() - (msg.thinkingStartTime || startTime)),
                        latency_ms: parsed.latency_ms ?? msg.latency_ms,
                      }
                    : msg
                )
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
                  content: msg.content || 'Error: Could not reach the PandaPulse backend service.',
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming]);

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
        content: "Chat cleared. Ready for your next modern Pandas inquiry!",
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
