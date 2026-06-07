import { useState } from 'react';

type ViewType = 'teacher' | 'books';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Sample recent items for the sidebar
const recentChats = [
  { id: '1', title: 'Quantum Mechanics Overview', time: '2 min ago' },
  { id: '2', title: 'Essay Structure Help', time: '1 hour ago' },
  { id: '3', title: 'Python Data Analysis', time: 'Yesterday' },
];

const recentBooks = [
  { id: '1', title: 'Intro to Machine Learning', pages: 42 },
  { id: '2', title: 'World History: 1900–2000', pages: 128 },
  { id: '3', title: 'Organic Chemistry Basics', pages: 67 },
];

export function Sidebar({ activeView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav
      className={`
        flex flex-col h-full
        ${isCollapsed ? 'w-[60px]' : 'w-[280px]'}
        transition-all duration-300 ease-in-out
        glass-card-strong
        border-r border-r-[var(--color-glass-border)]
        shrink-0 overflow-hidden
      `}
      style={{ borderRadius: 0 }}
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-b-[var(--color-glass-border)]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }}>
              T
            </div>
            <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--color-surface-50)' }}>
              TEACH
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mx-auto"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }}>
            T
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-md transition-colors"
          style={{ color: 'var(--color-surface-400)' }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-700)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            {isCollapsed ? (
              <path d="M6 3l5 5-5 5" />
            ) : (
              <path d="M10 3L5 8l5 5" />
            )}
          </svg>
        </button>
      </div>

      {/* Main tabs */}
      <div className="px-3 pt-4 pb-2" role="tablist" aria-label="Main Navigation Views">
        {!isCollapsed && (
          <span className="px-2 mb-2 block text-[11px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-surface-500)' }}>
            Navigate
          </span>
        )}
        <button
          role="tab"
          id="tab-teacher"
          aria-selected={activeView === 'teacher'}
          aria-controls="main-panel"
          onClick={() => onViewChange('teacher')}
          className={`sidebar-item ${activeView === 'teacher' ? 'active' : ''}`}
          style={isCollapsed ? { justifyContent: 'center', padding: '10px' } : undefined}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {!isCollapsed && <span>Teacher</span>}
        </button>
        <button
          role="tab"
          id="tab-books"
          aria-selected={activeView === 'books'}
          aria-controls="main-panel"
          onClick={() => onViewChange('books')}
          className={`sidebar-item ${activeView === 'books' ? 'active' : ''}`}
          style={isCollapsed ? { justifyContent: 'center', padding: '10px' } : undefined}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          {!isCollapsed && <span>Books</span>}
        </button>
      </div>

      {/* Recent items */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 pt-2">
          {/* Recent chats */}
          <span className="px-2 mb-2 mt-4 block text-[11px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-surface-500)' }}>
            Recent Chats
          </span>
          {recentChats.map((chat) => (
            <button
              key={chat.id}
              className="sidebar-item"
              style={{ padding: '8px 14px' }}
              onMouseEnter={() => setHoveredItem(`chat-${chat.id}`)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="block truncate text-[13px]">{chat.title}</span>
                {hoveredItem === `chat-${chat.id}` && (
                  <span className="block text-[11px] mt-0.5" style={{ color: 'var(--color-surface-500)' }}>{chat.time}</span>
                )}
              </div>
            </button>
          ))}

          {/* Recent books */}
          <span className="px-2 mb-2 mt-5 block text-[11px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-surface-500)' }}>
            Recent Books
          </span>
          {recentBooks.map((book) => (
            <button
              key={book.id}
              className="sidebar-item"
              style={{ padding: '8px 14px' }}
              onMouseEnter={() => setHoveredItem(`book-${book.id}`)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5, flexShrink: 0 }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="block truncate text-[13px]">{book.title}</span>
                {hoveredItem === `book-${book.id}` && (
                  <span className="block text-[11px] mt-0.5" style={{ color: 'var(--color-surface-500)' }}>{book.pages} pages</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New chat button at bottom */}
      <div className="px-3 py-4 border-t border-t-[var(--color-glass-border)]">
        <button
          className="sidebar-item justify-center"
          style={{
            background: 'var(--color-accent-glow)',
            color: 'var(--color-accent-primary)',
            ...(isCollapsed ? { padding: '10px' } : {}),
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>
    </nav>
  );
}
