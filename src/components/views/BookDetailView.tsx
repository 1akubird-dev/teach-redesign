import { useState, useCallback } from 'react';

interface BookDetailViewProps {
  book: {
    id: string;
    title: string;
    subject: string;
    pages: number;
    color1: string;
    color2: string;
    icon: string;
  };
  onBack: () => void;
}

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

/* ── Source References ── */
const SOURCES = [
  { id: 's1', title: 'Chapter 1: Foundations', type: 'Document', pages: '1–12' },
  { id: 's2', title: 'Lecture Notes — Week 3', type: 'PDF', pages: '24 slides' },
  { id: 's3', title: 'Supplementary Reading', type: 'Article', pages: '8 pages' },
  { id: 's4', title: 'Practice Problem Set #1', type: 'Worksheet', pages: '15 problems' },
];

/* ── Sample page content ── */
const PAGES = [
  {
    id: 'p1',
    title: 'Chapter 1: Foundations',
    content: `Understanding the foundational principles is essential before moving to more advanced topics. This chapter establishes the core framework that will be referenced throughout the rest of the material.

**Core Concepts**

The study of any discipline requires first understanding its fundamental building blocks. These are the axioms and postulates upon which all further knowledge is constructed. Without a firm grasp of these basics, advanced topics become significantly more challenging.

Key areas to focus on:
- **Definitions and Terminology** — Every field has its own language. Mastering the vocabulary is the first step toward fluency.
- **Historical Context** — Understanding how ideas evolved helps explain why current frameworks exist in their present form.
- **Methodological Foundations** — The tools and processes used to generate knowledge in this domain.`,
    sources: ['s1', 's2'],
  },
  {
    id: 'p2',
    title: 'Chapter 2: Theoretical Framework',
    content: `A theoretical framework provides the lens through which we interpret observations and data. In this field, the dominant frameworks include:

**Classical Theory** — Established in the early 20th century, this approach emphasizes structured analysis and deductive reasoning. It remains the foundation of most introductory courses.

**Modern Synthesis** — Emerging in the mid-20th century, this framework integrates findings from multiple sub-disciplines to create a more holistic understanding.

**Contemporary Approaches** — Current research often combines computational methods with traditional analysis, opening new avenues for discovery.

> "The purpose of education is not merely to accumulate knowledge, but to develop the capacity for independent thought." — A. N. Whitehead`,
    sources: ['s1', 's3'],
  },
  {
    id: 'p3',
    title: 'Chapter 3: Practical Applications',
    content: `Theory without application remains abstract. This section explores how foundational concepts translate into real-world problem solving.

**Industry Applications**

The frameworks discussed in previous chapters find direct application in several industries:

1. **Technology** — Algorithmic design and system architecture rely heavily on foundational theory
2. **Healthcare** — Evidence-based practice requires understanding of research methodology
3. **Education** — Curriculum design draws from learning theory and cognitive science

**Research Methodologies**

Modern research in this field employs both quantitative and qualitative methods. The choice of methodology depends on the research question, available data, and intended application of findings.`,
    sources: ['s1', 's3', 's4'],
  },
];

/* ── Book Studio (used in both Overview and Pages) ── */
function BookStudio({ activeToolId, onToolClick }: {
  activeToolId: string | null;
  onToolClick: (id: string) => void;
}) {
  const tools = [
    { id: 'audio', icon: '🎧', label: 'Audio Overview' },
    { id: 'quiz', icon: '📝', label: 'Quiz' },
    { id: 'video', icon: '🎬', label: 'Video' },
    { id: 'flashcards', icon: '🗂️', label: 'Flashcards' },
    { id: 'summary', icon: '📋', label: 'Summary' },
    { id: 'mindmap', icon: '🧠', label: 'Mind Map' },
  ];

  return (
    <div className="studio-toolbar flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-widest mr-1"
        style={{ color: 'var(--color-surface-500)' }}>
        Studio
      </span>
      <div className="w-px h-4 mx-1" style={{ background: 'var(--color-surface-700)' }} />
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`studio-btn ${activeToolId === tool.id ? 'active' : ''}`}
          onClick={() => onToolClick(tool.id)}
        >
          <span>{tool.icon}</span>
          <span className="hidden md:inline text-[12px]">{tool.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Overview Tab ── */
function OverviewTab({ book, activeStudioTool, onStudioToolClick }: {
  book: BookDetailViewProps['book'];
  activeStudioTool: string | null;
  onStudioToolClick: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 view-enter">
      <div className="max-w-4xl mx-auto">
        {/* Hero title area */}
        <div className="glass-card p-6 md:p-8 mb-6">
          <div className="flex items-start gap-5">
            {/* Book icon/cover mini */}
            <div className="w-16 h-20 rounded-lg shrink-0 flex items-center justify-center text-3xl"
              style={{ background: `linear-gradient(145deg, ${book.color1}, ${book.color2})` }}>
              {book.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-serif font-bold mb-1"
                style={{ color: 'var(--color-surface-50)' }}>
                {book.title}
              </h1>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-surface-800)', color: 'var(--color-surface-400)' }}>
                  {book.subject}
                </span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--color-surface-500)' }}>
                  {book.pages} pages • {SOURCES.length} sources
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-surface-300)' }}>
                This book provides a comprehensive exploration of {book.subject.toLowerCase()}, covering foundational
                principles through practical applications. The material is structured to build understanding
                progressively, with each chapter drawing on and expanding previous concepts.
              </p>
            </div>
          </div>
        </div>

        {/* Studio */}
        <div className="mb-6">
          <BookStudio activeToolId={activeStudioTool} onToolClick={onStudioToolClick} />
        </div>

        {/* Studio output placeholder */}
        {activeStudioTool && (
          <div className="glass-card p-5 mb-6 view-enter">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)' }} />
              <span className="text-[12px] font-medium" style={{ color: 'var(--color-accent-primary)' }}>
                Generating {activeStudioTool}...
              </span>
            </div>
            <div className="h-24 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-surface-850)', border: '1px dashed var(--color-surface-700)' }}>
              <span className="text-sm" style={{ color: 'var(--color-surface-500)' }}>
                Studio output will appear here
              </span>
            </div>
          </div>
        )}

        {/* Source References */}
        <div className="mb-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-surface-500)' }}>
            Sources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOURCES.map((source) => (
              <button
                key={source.id}
                className="glass-card p-4 text-left transition-all group"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(108,140,255,0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-[13px] shrink-0"
                    style={{ background: 'var(--color-surface-800)' }}>
                    {source.type === 'PDF' ? '📄' : source.type === 'Article' ? '📰' : source.type === 'Worksheet' ? '📋' : '📖'}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[13px] font-medium truncate"
                      style={{ color: 'var(--color-surface-200)' }}>
                      {source.title}
                    </span>
                    <span className="block text-[11px] font-mono"
                      style={{ color: 'var(--color-surface-500)' }}>
                      {source.type} • {source.pages}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pages', value: book.pages.toString(), icon: '📑' },
            { label: 'Chapters', value: PAGES.length.toString(), icon: '📚' },
            { label: 'Sources', value: SOURCES.length.toString(), icon: '🔗' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <span className="text-xl block mb-1">{stat.icon}</span>
              <span className="text-lg font-bold block" style={{ color: 'var(--color-surface-50)' }}>{stat.value}</span>
              <span className="text-[11px]" style={{ color: 'var(--color-surface-500)' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Pages Tab ── */
function PagesTab({ book, activeStudioTool, onStudioToolClick }: {
  book: BookDetailViewProps['book'];
  activeStudioTool: string | null;
  onStudioToolClick: (id: string) => void;
}) {
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [rightMode, setRightMode] = useState<'notes' | 'chat'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'w', role: 'ai', content: `I'm ready to help you study "${book.title}." Ask me about any page, or highlight text to save as a note.` },
  ]);
  const [chatInput, setChatInput] = useState('');

  const currentPage = PAGES[selectedPageIdx];

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && selectedText.length > 3) {
      setNotes((prev) => [...prev, {
        id: `note-${Date.now()}`,
        text: selectedText,
        timestamp: new Date(),
      }]);
      setRightMode('notes');
      selection?.removeAllRanges();
    }
  }, []);

  const handleChatSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
    setChatInput('');
    setTimeout(() => {
      const sourceCitation = currentPage.sources.map(sId => {
        const src = SOURCES.find(s => s.id === sId);
        return src ? `[${src.title}]` : '';
      }).filter(Boolean).join(', ');
      setChatMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'ai',
        content: `Based on the current page, the key insight is that foundational understanding enables advanced learning. This is supported by your sources: ${sourceCitation}. Would you like me to generate a quiz on this section?`,
      }]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden view-enter">
      {/* Studio toolbar */}
      <div className="shrink-0 px-4 md:px-6 py-2">
        <BookStudio activeToolId={activeStudioTool} onToolClick={onStudioToolClick} />
      </div>

      {/* Studio output placeholder */}
      {activeStudioTool && (
        <div className="shrink-0 mx-4 md:mx-6 mb-2 glass-card p-4 view-enter">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)' }} />
            <span className="text-[12px] font-medium" style={{ color: 'var(--color-accent-primary)' }}>
              Generating {activeStudioTool} from current page...
            </span>
          </div>
          <div className="h-16 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-surface-850)', border: '1px dashed var(--color-surface-700)' }}>
            <span className="text-[12px]" style={{ color: 'var(--color-surface-500)' }}>
              Studio output — citing {currentPage.sources.length} source(s)
            </span>
          </div>
        </div>
      )}

      {/* Main split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Page navigation + Content */}
        <div className="flex-1 flex flex-col overflow-hidden border-r" style={{ borderColor: 'var(--color-glass-border)' }}>
          {/* Page tabs */}
          <div className="shrink-0 flex gap-1 px-4 pt-2 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
            {PAGES.map((page, idx) => (
              <button
                key={page.id}
                className="px-3 py-2 text-[12px] font-medium whitespace-nowrap rounded-t-md transition-colors"
                style={{
                  color: selectedPageIdx === idx ? 'var(--color-accent-primary)' : 'var(--color-surface-400)',
                  background: selectedPageIdx === idx ? 'var(--color-surface-850)' : 'transparent',
                  borderBottom: selectedPageIdx === idx ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                }}
                onClick={() => setSelectedPageIdx(idx)}
              >
                {page.title}
              </button>
            ))}
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6" onMouseUp={handleMouseUp}>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-serif font-bold mb-4" style={{ color: 'var(--color-surface-50)' }}>
                {currentPage.title}
              </h2>

              {/* Source citations for this page */}
              <div className="flex flex-wrap gap-2 mb-5">
                {currentPage.sources.map(sId => {
                  const src = SOURCES.find(s => s.id === sId);
                  return src ? (
                    <span key={sId} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono"
                      style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent-primary)', border: '1px solid rgba(108,140,255,0.15)' }}>
                      🔗 {src.title}
                    </span>
                  ) : null;
                })}
              </div>

              {/* Rendered content */}
              {currentPage.content.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h3 key={i} className="text-sm font-semibold mt-5 mb-2" style={{ color: 'var(--color-surface-100)' }}>
                      {line.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                if (line.startsWith('> ')) {
                  return (
                    <blockquote key={i} className="border-l-2 pl-4 my-4 italic text-sm"
                      style={{ borderColor: 'var(--color-accent-primary)', color: 'var(--color-surface-300)' }}>
                      {line.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={i} className="text-sm leading-relaxed ml-4 mb-1 list-disc font-serif"
                      style={{ color: 'var(--color-surface-200)' }}
                      dangerouslySetInnerHTML={{
                        __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-surface-50)">$1</strong>')
                      }}
                    />
                  );
                }
                if (line.match(/^\d+\./)) {
                  return (
                    <li key={i} className="text-sm leading-relaxed ml-4 mb-2 list-decimal font-serif"
                      style={{ color: 'var(--color-surface-200)' }}
                      dangerouslySetInnerHTML={{
                        __html: line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-surface-50)">$1</strong>')
                      }}
                    />
                  );
                }
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return (
                  <p key={i} className="text-sm leading-relaxed mb-3 font-serif"
                    style={{ color: 'var(--color-surface-200)' }}
                    dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-surface-50)">$1</strong>')
                    }}
                  />
                );
              })}

              <p className="mt-6 text-[11px] italic" style={{ color: 'var(--color-surface-500)' }}>
                💡 Highlight any text to save it as a note on the right panel.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Notes / Chat */}
        <div className="w-[320px] lg:w-[380px] shrink-0 flex flex-col overflow-hidden"
          style={{ background: 'var(--color-surface-900)' }}>
          {/* Toggle */}
          <div className="flex shrink-0 border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
            <button
              className="flex-1 py-3 text-[12px] font-medium text-center transition-colors"
              style={{
                color: rightMode === 'notes' ? 'var(--color-accent-primary)' : 'var(--color-surface-400)',
                borderBottom: rightMode === 'notes' ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
              }}
              onClick={() => setRightMode('notes')}
            >
              Notes ({notes.length})
            </button>
            <button
              className="flex-1 py-3 text-[12px] font-medium text-center transition-colors"
              style={{
                color: rightMode === 'chat' ? 'var(--color-accent-primary)' : 'var(--color-surface-400)',
                borderBottom: rightMode === 'chat' ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
              }}
              onClick={() => setRightMode('chat')}
            >
              Chat
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightMode === 'notes' ? (
              notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-3xl mb-3">📌</div>
                  <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>No notes yet.</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--color-surface-500)' }}>
                    Highlight text on the left to pin it here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {notes.map((note) => (
                    <div key={note.id} className="highlight-note">
                      "{note.text}"
                      <div className="mt-1 text-[10px] font-mono" style={{ color: 'var(--color-surface-500)' }}>
                        {note.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={msg.role === 'user' ? 'chat-bubble-user text-[13px]' : 'chat-bubble-ai text-[13px]'}>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat input */}
          {rightMode === 'chat' && (
            <div className="shrink-0 p-3 border-t" style={{ borderColor: 'var(--color-glass-border)' }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
                  placeholder="Ask about this page..."
                  className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={{ borderColor: 'var(--color-surface-700)', color: 'var(--color-surface-100)' }}
                />
                <button
                  onClick={handleChatSend}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-accent-primary)', color: 'white' }}
                  aria-label="Send"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Book Detail View ── */
export function BookDetailView({ book, onBack }: BookDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pages'>('overview');
  const [activeStudioTool, setActiveStudioTool] = useState<string | null>(null);

  const handleStudioToolClick = (id: string) => {
    setActiveStudioTool(activeStudioTool === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 md:px-6 py-3 border-b"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
          style={{ color: 'var(--color-surface-300)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-800)';
            e.currentTarget.style.color = 'var(--color-surface-100)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-surface-300)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Library
        </button>

        <div className="w-px h-5" style={{ background: 'var(--color-surface-700)' }} />

        {/* Book title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-base">{book.icon}</span>
          <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--color-surface-100)' }}>
            {book.title}
          </h2>
        </div>

        {/* Overview / Pages tabs */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--color-surface-850)' }}>
          {(['overview', 'pages'] as const).map((tab) => (
            <button
              key={tab}
              className="px-4 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all"
              style={{
                background: activeTab === tab ? 'var(--color-surface-700)' : 'transparent',
                color: activeTab === tab ? 'var(--color-surface-50)' : 'var(--color-surface-400)',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' ? (
        <OverviewTab
          book={book}
          activeStudioTool={activeStudioTool}
          onStudioToolClick={handleStudioToolClick}
        />
      ) : (
        <PagesTab
          book={book}
          activeStudioTool={activeStudioTool}
          onStudioToolClick={handleStudioToolClick}
        />
      )}
    </div>
  );
}
