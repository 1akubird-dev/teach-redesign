import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'ai',
  content: 'How may I assist your studies today? I can help explain complex topics, create quizzes, generate study materials, or walk through problems step by step.',
  timestamp: new Date(),
};

const SAMPLE_RESPONSES: string[] = [
  "That's a great question. Let me break this down into the key concepts you'll need to understand.\n\nFirst, it's important to recognize the underlying principles at work here. The fundamental idea is that complex systems can often be understood by examining their component parts.\n\nWould you like me to create a quiz on this topic, or shall we dive deeper into any specific area?",
  "I'd be happy to help you explore that further. Here are the three main frameworks scholars use to approach this subject:\n\n1. **The Classical Approach** — focuses on foundational theory\n2. **The Modern Synthesis** — integrates recent research findings\n3. **The Applied Model** — emphasizes practical applications\n\nWhich framework would you like to start with?",
  "Excellent thinking! Let me generate a brief summary and then we can work through some practice problems together.\n\nThe core insight here is that **understanding precedes memorization**. Once you grasp the 'why,' the 'what' becomes much easier to retain.\n\nI've also prepared a short audio overview in the Studio if you'd like to listen while you review.",
];

/* ── Studio Panel (Right Side) ── */
function StudioPanel() {
  const [activeStudio, setActiveStudio] = useState<string | null>(null);

  const studioTools = [
    { id: 'audio', icon: '🎧', label: 'Audio Overview', desc: 'Generate a podcast-style summary of any topic' },
    { id: 'quiz', icon: '📝', label: 'Quiz', desc: 'Create practice questions with instant feedback' },
    { id: 'video', icon: '🎬', label: 'Video', desc: 'Produce an explainer video with visuals' },
    { id: 'flashcards', icon: '🗂️', label: 'Flashcards', desc: 'Build spaced-repetition flash cards' },
    { id: 'summary', icon: '📋', label: 'Summary', desc: 'Condense topics into concise study notes' },
    { id: 'mindmap', icon: '🧠', label: 'Mind Map', desc: 'Visualize concept relationships' },
    { id: 'timeline', icon: '📅', label: 'Timeline', desc: 'Arrange events or steps chronologically' },
    { id: 'debate', icon: '⚖️', label: 'Debate', desc: 'Explore both sides of an argument' },
  ];

  return (
    <div className="w-[280px] xl:w-[320px] shrink-0 flex flex-col h-full border-l overflow-hidden"
      style={{ borderColor: 'var(--color-glass-border)', background: 'var(--color-surface-900)' }}>
      
      {/* Header */}
      <div className="shrink-0 px-4 py-4 border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }}>
            ✦
          </div>
          <h3 className="text-[13px] font-semibold" style={{ color: 'var(--color-surface-100)' }}>
            Studio
          </h3>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--color-surface-500)' }}>
          Create learning materials from your conversation
        </p>
      </div>

      {/* Tools Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <span className="block px-1 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-surface-500)' }}>
          Create
        </span>
        <div className="flex flex-col gap-1.5">
          {studioTools.map((tool) => (
            <button
              key={tool.id}
              className="flex items-start gap-3 p-3 rounded-lg text-left transition-all"
              style={{
                background: activeStudio === tool.id ? 'var(--color-accent-glow)' : 'transparent',
                border: activeStudio === tool.id ? '1px solid rgba(108,140,255,0.2)' : '1px solid transparent',
              }}
              onClick={() => setActiveStudio(activeStudio === tool.id ? null : tool.id)}
              onMouseEnter={(e) => {
                if (activeStudio !== tool.id) e.currentTarget.style.background = 'var(--color-glass-hover)';
              }}
              onMouseLeave={(e) => {
                if (activeStudio !== tool.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="text-lg mt-0.5 shrink-0">{tool.icon}</span>
              <div className="min-w-0">
                <span className="block text-[13px] font-medium"
                  style={{ color: activeStudio === tool.id ? 'var(--color-accent-primary)' : 'var(--color-surface-200)' }}>
                  {tool.label}
                </span>
                <span className="block text-[11px] mt-0.5 leading-snug"
                  style={{ color: 'var(--color-surface-500)' }}>
                  {tool.desc}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Creations */}
        <span className="block px-1 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-surface-500)' }}>
          Recent Creations
        </span>
        <div className="flex flex-col gap-1">
          {[
            { icon: '📝', title: 'Quantum Mechanics Quiz', time: '5 min ago' },
            { icon: '🎧', title: 'Essay Structure Audio', time: '1 hour ago' },
          ].map((item, i) => (
            <button key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-glass-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="text-sm">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="block text-[12px] truncate" style={{ color: 'var(--color-surface-300)' }}>
                  {item.title}
                </span>
                <span className="block text-[10px] font-mono" style={{ color: 'var(--color-surface-600)' }}>
                  {item.time}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Teacher View ── */
export function TeacherView() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat area (left / center) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} view-enter`}
              >
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }}>
                        T
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--color-surface-400)' }}>
                        TEACH
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-[14px] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai flex items-center gap-1.5 py-4 px-5">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)', animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)', animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 md:px-8 pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card-strong flex items-end gap-3 p-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-[14px] leading-relaxed py-2 px-2"
                style={{ color: 'var(--color-surface-100)', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: inputValue.trim() ? 'var(--color-accent-primary)' : 'var(--color-surface-700)',
                  color: inputValue.trim() ? 'white' : 'var(--color-surface-500)',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                }}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-center mt-2 text-[11px]" style={{ color: 'var(--color-surface-500)' }}>
              TEACH may produce inaccurate information. Verify important facts.
            </p>
          </div>
        </div>
      </div>

      {/* Studio panel (right) — hidden on small screens */}
      <div className="hidden lg:flex">
        <StudioPanel />
      </div>
    </div>
  );
}
