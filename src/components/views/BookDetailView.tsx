import { useState, useCallback } from 'react';

/* ════════════════════════════════════════════════
   TYPES & DATA
   ════════════════════════════════════════════════ */

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
  pageId: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface StudioOutput {
  id: string;
  type: 'video' | 'audio' | 'flashcards' | 'quiz' | 'pages' | 'sources';
  title: string;
  createdAt: Date;
  status: 'complete' | 'generating';
}

interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon: string;
  snippet: string;
  addedAt: Date;
}

/* ── Sample Data ── */

const SAMPLE_SOURCES: Source[] = [
  { id: 's1', title: 'Introduction to Machine Learning — Wikipedia', url: 'https://en.wikipedia.org/wiki/Machine_learning', domain: 'wikipedia.org', favicon: '🌐', snippet: 'Machine learning is a subset of artificial intelligence that provides systems the ability to learn...', addedAt: new Date() },
  { id: 's2', title: 'Supervised Learning — Wikipedia', url: 'https://en.wikipedia.org/wiki/Supervised_learning', domain: 'wikipedia.org', favicon: '🌐', snippet: 'Supervised learning is the machine learning task of learning a function that maps an input...', addedAt: new Date() },
  { id: 's3', title: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning', domain: 'coursera.org', favicon: '🎓', snippet: 'Master Deep Learning and break into AI. Learn the foundations of Deep Learning...', addedAt: new Date() },
  { id: 's4', title: 'Neural Networks and Deep Learning', url: 'https://www.coursera.org/learn/neural-networks-deep-learning', domain: 'coursera.org', favicon: '🎓', snippet: 'In the first course of the Deep Learning Specialization, you will study the foundational concept...', addedAt: new Date() },
  { id: 's5', title: 'An Introduction to Statistical Learning', url: 'https://www.statlearning.com/', domain: 'statlearning.com', favicon: '📊', snippet: 'This book provides an introduction to statistical learning methods, with applications in R...', addedAt: new Date() },
  { id: 's6', title: 'MIT OpenCourseWare — Linear Algebra', url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra', domain: 'ocw.mit.edu', favicon: '🏛️', snippet: 'This is a basic subject on matrix theory and linear algebra. Emphasis is given to topics...', addedAt: new Date() },
  { id: 's7', title: 'MIT OpenCourseWare — Intro to ML', url: 'https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning', domain: 'ocw.mit.edu', favicon: '🏛️', snippet: 'An introduction to the principles, algorithms, and applications of machine learning...', addedAt: new Date() },
];

const SAMPLE_PAGES = [
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
    sourceIds: ['s1', 's5'],
  },
  {
    id: 'p2',
    title: 'Chapter 2: Theoretical Framework',
    content: `A theoretical framework provides the lens through which we interpret observations and data. In this field, the dominant frameworks include:

**Classical Theory** — Established in the early 20th century, this approach emphasizes structured analysis and deductive reasoning. It remains the foundation of most introductory courses.

**Modern Synthesis** — Emerging in the mid-20th century, this framework integrates findings from multiple sub-disciplines to create a more holistic understanding.

**Contemporary Approaches** — Current research often combines computational methods with traditional analysis, opening new avenues for discovery.

> "The purpose of education is not merely to accumulate knowledge, but to develop the capacity for independent thought." — A. N. Whitehead`,
    sourceIds: ['s1', 's3', 's6'],
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
    sourceIds: ['s3', 's4', 's7'],
  },
];

const INITIAL_STUDIO_OUTPUTS: StudioOutput[] = [
  { id: 'so1', type: 'audio', title: 'Audio Overview — Chapter 1', createdAt: new Date(Date.now() - 3600000), status: 'complete' },
  { id: 'so2', type: 'quiz', title: 'Foundations Quiz (12 questions)', createdAt: new Date(Date.now() - 7200000), status: 'complete' },
  { id: 'so3', type: 'flashcards', title: 'Key Terms — Chapters 1-2', createdAt: new Date(Date.now() - 86400000), status: 'complete' },
];

/* ════════════════════════════════════════════════
   HELPER: Render markdown-ish content
   ════════════════════════════════════════════════ */

function RenderContent({ content }: { content: string }) {
  return (
    <>
      {content.split('\n').map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h3 key={i} className="text-sm font-semibold mt-5 mb-2" style={{ color: 'var(--color-surface-100)' }}>{line.replace(/\*\*/g, '')}</h3>;
        }
        if (line.startsWith('> ')) {
          return <blockquote key={i} className="border-l-2 pl-4 my-4 italic text-sm" style={{ borderColor: 'var(--color-accent-primary)', color: 'var(--color-surface-300)' }}>{line.replace('> ', '')}</blockquote>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="text-sm leading-relaxed ml-4 mb-1 list-disc font-serif" style={{ color: 'var(--color-surface-200)' }} dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-surface-50)">$1</strong>') }} />;
        }
        if (line.match(/^\d+\./)) {
          return <li key={i} className="text-sm leading-relaxed ml-4 mb-2 list-decimal font-serif" style={{ color: 'var(--color-surface-200)' }} dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-surface-50)">$1</strong>') }} />;
        }
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm leading-relaxed mb-3 font-serif" style={{ color: 'var(--color-surface-200)' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-surface-50)">$1</strong>') }} />;
      })}
    </>
  );
}

/* ════════════════════════════════════════════════
   HELPER: Studio Output Icon
   ════════════════════════════════════════════════ */

function studioTypeIcon(type: StudioOutput['type']): string {
  const map: Record<StudioOutput['type'], string> = {
    video: '🎬', audio: '🎧', flashcards: '🗂️', quiz: '📝', pages: '📄', sources: '🔍',
  };
  return map[type] || '✦';
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

/* ════════════════════════════════════════════════
   STUDIO OUTPUTS LIST (shared component)
   ════════════════════════════════════════════════ */

function StudioOutputsList({ outputs, compact = false }: { outputs: StudioOutput[]; compact?: boolean }) {
  if (outputs.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-2xl block mb-2">✦</span>
        <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>No studio outputs yet.</p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-surface-500)' }}>Create something in the Studio tab.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {outputs.map((output) => (
        <button
          key={output.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors w-full"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-glass-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className={compact ? 'text-sm' : 'text-lg'}>{studioTypeIcon(output.type)}</span>
          <div className="flex-1 min-w-0">
            <span className={`block truncate font-medium ${compact ? 'text-[12px]' : 'text-[13px]'}`}
              style={{ color: 'var(--color-surface-200)' }}>
              {output.title}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono capitalize" style={{ color: 'var(--color-surface-500)' }}>
                {output.type}
              </span>
              <span style={{ color: 'var(--color-surface-600)' }}>·</span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-surface-500)' }}>
                {timeAgo(output.createdAt)}
              </span>
            </div>
          </div>
          {output.status === 'generating' && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)' }} />
          )}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════
   TAB: OVERVIEW
   ════════════════════════════════════════════════ */

function OverviewTab({ book, studioOutputs }: {
  book: BookDetailViewProps['book'];
  studioOutputs: StudioOutput[];
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 view-enter">
      <div className="max-w-4xl mx-auto">
        {/* Book hero */}
        <div className="glass-card p-6 md:p-8 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-20 rounded-lg shrink-0 flex items-center justify-center text-3xl"
              style={{ background: `linear-gradient(145deg, ${book.color1}, ${book.color2})` }}>
              {book.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-serif font-bold mb-1" style={{ color: 'var(--color-surface-50)' }}>
                {book.title}
              </h1>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-surface-800)', color: 'var(--color-surface-400)' }}>
                  {book.subject}
                </span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--color-surface-500)' }}>
                  {book.pages} pages • {SAMPLE_SOURCES.length} sources • {SAMPLE_PAGES.length} chapters
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

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Pages', value: book.pages.toString(), icon: '📑' },
            { label: 'Chapters', value: SAMPLE_PAGES.length.toString(), icon: '📚' },
            { label: 'Sources', value: SAMPLE_SOURCES.length.toString(), icon: '🔗' },
            { label: 'Creations', value: studioOutputs.length.toString(), icon: '✦' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <span className="text-lg block mb-1">{stat.icon}</span>
              <span className="text-lg font-bold block" style={{ color: 'var(--color-surface-50)' }}>{stat.value}</span>
              <span className="text-[11px]" style={{ color: 'var(--color-surface-500)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Recent Studio outputs */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-surface-100)' }}>
              Recent Studio Outputs
            </h3>
            <span className="text-[11px] font-mono" style={{ color: 'var(--color-surface-500)' }}>
              {studioOutputs.length} items
            </span>
          </div>
          <StudioOutputsList outputs={studioOutputs} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TAB: PAGES (3-column layout)
   ════════════════════════════════════════════════ */

function PagesTab({ notes, setNotes }: {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}) {
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const currentPage = SAMPLE_PAGES[selectedPageIdx];
  const pageSources = SAMPLE_SOURCES.filter(s => currentPage.sourceIds.includes(s.id));
  const pageNotes = notes.filter(n => n.pageId === currentPage.id);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && selectedText.length > 3) {
      setNotes((prev) => [...prev, {
        id: `note-${Date.now()}`,
        text: selectedText,
        timestamp: new Date(),
        pageId: currentPage.id,
      }]);
      selection?.removeAllRanges();
    }
  }, [currentPage.id, setNotes]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden view-enter">
      {/* Page selector tabs */}
      <div className="shrink-0 flex gap-1 px-4 pt-2 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
        {SAMPLE_PAGES.map((page, idx) => (
          <button
            key={page.id}
            className="px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors"
            style={{
              color: selectedPageIdx === idx ? 'var(--color-accent-primary)' : 'var(--color-surface-400)',
              borderBottom: selectedPageIdx === idx ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
            }}
            onClick={() => setSelectedPageIdx(idx)}
          >
            {page.title}
          </button>
        ))}
      </div>

      {/* 3-column layout: Sources | Content | Notes */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Sources for this page */}
        <div className="w-[240px] xl:w-[280px] shrink-0 overflow-y-auto border-r p-4"
          style={{ borderColor: 'var(--color-glass-border)', background: 'var(--color-surface-900)' }}>
          <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-surface-500)' }}>
            Sources ({pageSources.length})
          </h4>
          {pageSources.length === 0 ? (
            <p className="text-[12px]" style={{ color: 'var(--color-surface-500)' }}>No sources for this page.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pageSources.map((source) => (
                <div key={source.id} className="p-3 rounded-lg transition-colors"
                  style={{ background: 'var(--color-surface-850)', border: '1px solid var(--color-glass-border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{source.favicon}</span>
                    <span className="text-[10px] font-mono truncate" style={{ color: 'var(--color-accent-primary)' }}>
                      {source.domain}
                    </span>
                  </div>
                  <span className="block text-[12px] font-medium leading-snug mb-1"
                    style={{ color: 'var(--color-surface-200)' }}>
                    {source.title}
                  </span>
                  <p className="text-[11px] leading-snug line-clamp-2"
                    style={{ color: 'var(--color-surface-500)' }}>
                    {source.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE: Page content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6" onMouseUp={handleMouseUp}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-serif font-bold mb-4" style={{ color: 'var(--color-surface-50)' }}>
              {currentPage.title}
            </h2>
            <RenderContent content={currentPage.content} />
            <p className="mt-8 text-[11px] italic" style={{ color: 'var(--color-surface-500)' }}>
              💡 Highlight any text to save it as a note on the right.
            </p>
          </div>
        </div>

        {/* RIGHT: Notes */}
        <div className="w-[240px] xl:w-[280px] shrink-0 overflow-y-auto border-l p-4"
          style={{ borderColor: 'var(--color-glass-border)', background: 'var(--color-surface-900)' }}>
          <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-surface-500)' }}>
            Notes ({pageNotes.length})
          </h4>
          {pageNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">📌</div>
              <p className="text-[12px]" style={{ color: 'var(--color-surface-500)' }}>
                Highlight text to pin notes here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pageNotes.map((note) => (
                <div key={note.id} className="highlight-note">
                  <span className="text-[12px]">"{note.text}"</span>
                  <div className="mt-1 text-[10px] font-mono" style={{ color: 'var(--color-surface-500)' }}>
                    {note.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TAB: TEACHER (Book-scoped chat)
   ════════════════════════════════════════════════ */

function BookTeacherTab({ book }: { book: BookDetailViewProps['book'] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'w', role: 'ai', content: `I'm your dedicated tutor for "${book.title}." Ask me anything about the material — I can explain concepts, quiz you, or help you work through problems.` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'ai',
        content: `Great question! Based on the material in "${book.title}," the key insight here is that foundational concepts serve as building blocks for more advanced understanding.\n\nSpecifically, this connects to **Chapter 1** where we discussed the core frameworks. The Classical Theory approach would suggest analyzing this through structured deduction.\n\nWould you like me to create flashcards on this topic, or shall we dig deeper?`,
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden view-enter">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `linear-gradient(135deg, ${book.color1}, ${book.color2})` }}>
                      T
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-surface-400)' }}>
                      TEACH — {book.title}
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-[14px] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
                  }} />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai flex items-center gap-1.5 py-4 px-5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)' }} />
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)', animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 md:px-8 pb-5 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card-strong flex items-end gap-3 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Ask about ${book.title}...`}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[14px] leading-relaxed py-2 px-2"
              style={{ color: 'var(--color-surface-100)', maxHeight: '120px' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: input.trim() ? 'var(--color-accent-primary)' : 'var(--color-surface-700)',
                color: input.trim() ? 'white' : 'var(--color-surface-500)',
              }}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TAB: SOURCES (grouped by domain)
   ════════════════════════════════════════════════ */

function SourcesTab() {
  const [groupByDomain, setGroupByDomain] = useState(true);

  // Group sources by domain
  const grouped = SAMPLE_SOURCES.reduce<Record<string, Source[]>>((acc, src) => {
    if (!acc[src.domain]) acc[src.domain] = [];
    acc[src.domain].push(src);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 view-enter">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-serif font-bold" style={{ color: 'var(--color-surface-50)' }}>Sources</h2>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-surface-500)' }}>
              {SAMPLE_SOURCES.length} sources from {Object.keys(grouped).length} websites
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: groupByDomain ? 'var(--color-accent-glow)' : 'var(--color-surface-800)',
              color: groupByDomain ? 'var(--color-accent-primary)' : 'var(--color-surface-400)',
              border: `1px solid ${groupByDomain ? 'rgba(108,140,255,0.2)' : 'var(--color-glass-border)'}`,
            }}
            onClick={() => setGroupByDomain(!groupByDomain)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Group by website
          </button>
        </div>

        {groupByDomain ? (
          /* Grouped view */
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([domain, sources]) => (
              <div key={domain}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">{sources[0].favicon}</span>
                  <h3 className="text-[13px] font-semibold" style={{ color: 'var(--color-surface-200)' }}>
                    {domain}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--color-surface-800)', color: 'var(--color-surface-500)' }}>
                    {sources.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  {sources.map((source) => (
                    <div key={source.id} className="glass-card p-4 transition-all"
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(108,140,255,0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                      <span className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-surface-200)' }}>
                        {source.title}
                      </span>
                      <p className="text-[12px] leading-snug mb-2" style={{ color: 'var(--color-surface-500)' }}>
                        {source.snippet}
                      </p>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--color-accent-primary)' }}>
                        {source.url}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Flat list */
          <div className="flex flex-col gap-2">
            {SAMPLE_SOURCES.map((source) => (
              <div key={source.id} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{source.favicon}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--color-accent-primary)' }}>{source.domain}</span>
                </div>
                <span className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-surface-200)' }}>{source.title}</span>
                <p className="text-[12px]" style={{ color: 'var(--color-surface-500)' }}>{source.snippet}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TAB: STUDIO
   ════════════════════════════════════════════════ */

function StudioTab({ studioOutputs, setStudioOutputs }: {
  studioOutputs: StudioOutput[];
  setStudioOutputs: React.Dispatch<React.SetStateAction<StudioOutput[]>>;
}) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    { id: 'video', icon: '🎬', label: 'Video', desc: 'Generate an explainer video with visuals and narration' },
    { id: 'audio', icon: '🎧', label: 'Audio', desc: 'Create a podcast-style audio overview' },
    { id: 'flashcards', icon: '🗂️', label: 'Flash Cards', desc: 'Build spaced-repetition flash cards for key concepts' },
    { id: 'quiz', icon: '📝', label: 'Quiz', desc: 'Create practice questions with instant feedback' },
    { id: 'pages', icon: '📄', label: 'Pages', desc: 'Generate new study pages from your sources' },
    { id: 'sources', icon: '🔍', label: 'Source Gatherer', desc: 'Find and collect new sources from the web' },
  ];

  const handleCreate = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;
    const newOutput: StudioOutput = {
      id: `so-${Date.now()}`,
      type: toolId as StudioOutput['type'],
      title: `${tool.label} — Generated ${new Date().toLocaleTimeString()}`,
      createdAt: new Date(),
      status: 'generating',
    };
    setStudioOutputs((prev) => [newOutput, ...prev]);
    setSelectedTool(null);

    // Simulate completion
    setTimeout(() => {
      setStudioOutputs((prev) =>
        prev.map(o => o.id === newOutput.id ? { ...o, status: 'complete' as const } : o)
      );
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 view-enter">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-serif font-bold" style={{ color: 'var(--color-surface-50)' }}>Studio</h2>
          <p className="text-[12px] mt-1" style={{ color: 'var(--color-surface-500)' }}>
            Choose what you want to create from your book's content and sources.
          </p>
        </div>

        {/* Creation tools grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className="glass-card p-5 text-left transition-all group"
              style={{
                borderColor: selectedTool === tool.id ? 'rgba(108,140,255,0.3)' : undefined,
                background: selectedTool === tool.id ? 'var(--color-accent-glow)' : undefined,
              }}
              onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
              onMouseEnter={(e) => {
                if (selectedTool !== tool.id) e.currentTarget.style.borderColor = 'rgba(108,140,255,0.15)';
              }}
              onMouseLeave={(e) => {
                if (selectedTool !== tool.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <span className="text-2xl block mb-3">{tool.icon}</span>
              <span className="block text-sm font-medium mb-1"
                style={{ color: selectedTool === tool.id ? 'var(--color-accent-primary)' : 'var(--color-surface-100)' }}>
                {tool.label}
              </span>
              <span className="block text-[11px] leading-snug" style={{ color: 'var(--color-surface-500)' }}>
                {tool.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Create button */}
        {selectedTool && (
          <div className="glass-card p-5 mb-8 view-enter">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{tools.find(t => t.id === selectedTool)?.icon}</span>
                <div>
                  <span className="block text-sm font-medium" style={{ color: 'var(--color-surface-100)' }}>
                    Create {tools.find(t => t.id === selectedTool)?.label}
                  </span>
                  <span className="block text-[11px]" style={{ color: 'var(--color-surface-500)' }}>
                    Using all sources and pages from this book
                  </span>
                </div>
              </div>
              <button
                className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                style={{ background: 'var(--color-accent-primary)', color: 'white' }}
                onClick={() => handleCreate(selectedTool)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-primary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent-primary)')}
              >
                Generate
              </button>
            </div>
          </div>
        )}

        {/* All Studio Outputs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-surface-100)' }}>
              All Studio Outputs
            </h3>
            <span className="text-[11px] font-mono" style={{ color: 'var(--color-surface-500)' }}>
              {studioOutputs.length} items
            </span>
          </div>
          <div className="glass-card p-4">
            <StudioOutputsList outputs={studioOutputs} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN: BOOK DETAIL VIEW
   ════════════════════════════════════════════════ */

type BookTab = 'overview' | 'pages' | 'teacher' | 'sources' | 'studio';

export function BookDetailView({ book, onBack }: BookDetailViewProps) {
  const [activeTab, setActiveTab] = useState<BookTab>('overview');
  const [notes, setNotes] = useState<Note[]>([]);
  const [studioOutputs, setStudioOutputs] = useState<StudioOutput[]>(INITIAL_STUDIO_OUTPUTS);

  const tabs: { id: BookTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'pages', label: 'Pages', icon: '📑' },
    { id: 'teacher', label: 'Teacher', icon: '💬' },
    { id: 'sources', label: 'Sources', icon: '🔗' },
    { id: 'studio', label: 'Studio', icon: '✦' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 md:px-6 py-3 border-b"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors shrink-0"
          style={{ color: 'var(--color-surface-300)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-800)'; e.currentTarget.style.color = 'var(--color-surface-100)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-surface-300)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Library
        </button>

        <div className="w-px h-5 shrink-0" style={{ background: 'var(--color-surface-700)' }} />

        {/* Book title */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <span className="text-base shrink-0">{book.icon}</span>
          <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--color-surface-100)' }}>
            {book.title}
          </h2>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Tab selector */}
        <div className="flex items-center gap-0.5 rounded-lg p-1 shrink-0" style={{ background: 'var(--color-surface-850)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--color-surface-700)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-surface-50)' : 'var(--color-surface-400)',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-[11px]">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab book={book} studioOutputs={studioOutputs} />}
      {activeTab === 'pages' && <PagesTab notes={notes} setNotes={setNotes} />}
      {activeTab === 'teacher' && <BookTeacherTab book={book} />}
      {activeTab === 'sources' && <SourcesTab />}
      {activeTab === 'studio' && <StudioTab studioOutputs={studioOutputs} setStudioOutputs={setStudioOutputs} />}
    </div>
  );
}
