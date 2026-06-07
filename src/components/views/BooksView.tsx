import { useState } from 'react';
import { BookDetailView } from './BookDetailView';

interface Book {
  id: string;
  title: string;
  subject: string;
  pages: number;
  color1: string;
  color2: string;
  icon: string;
  lastOpened: string;
}

const sampleBooks: Book[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    subject: 'Computer Science',
    pages: 42,
    color1: '#6c8cff',
    color2: '#a78bfa',
    icon: '🤖',
    lastOpened: '2 hours ago',
  },
  {
    id: '2',
    title: 'World History: 1900–2000',
    subject: 'History',
    pages: 128,
    color1: '#f0a36b',
    color2: '#f06b9e',
    icon: '🌍',
    lastOpened: 'Yesterday',
  },
  {
    id: '3',
    title: 'Organic Chemistry Basics',
    subject: 'Chemistry',
    pages: 67,
    color1: '#4ade80',
    color2: '#22d3ee',
    icon: '⚗️',
    lastOpened: '3 days ago',
  },
  {
    id: '4',
    title: 'The Art of Persuasion',
    subject: 'Communications',
    pages: 34,
    color1: '#fb923c',
    color2: '#fbbf24',
    icon: '🎭',
    lastOpened: 'Last week',
  },
  {
    id: '5',
    title: 'Linear Algebra Essentials',
    subject: 'Mathematics',
    pages: 89,
    color1: '#a78bfa',
    color2: '#6c8cff',
    icon: '📐',
    lastOpened: 'Last week',
  },
  {
    id: '6',
    title: 'Cognitive Psychology',
    subject: 'Psychology',
    pages: 156,
    color1: '#f472b6',
    color2: '#a78bfa',
    icon: '🧠',
    lastOpened: '2 weeks ago',
  },
];

function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="book-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Open ${book.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <div
        className="book-card-inner rounded-xl overflow-hidden"
        style={{
          height: '260px',
          transform: isHovered ? 'rotateY(-12deg) translateZ(20px)' : 'none',
          boxShadow: isHovered
            ? `12px 12px 30px rgba(0,0,0,0.4), 0 0 40px ${book.color1}15`
            : '4px 4px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
        }}
      >
        {/* Book cover face */}
        <div
          className="relative w-full h-full flex flex-col justify-between p-5"
          style={{
            background: `linear-gradient(145deg, ${book.color1}, ${book.color2})`,
          }}
        >
          {/* Spine edge effect */}
          <div className="absolute left-0 top-0 w-[6px] h-full"
            style={{ background: 'rgba(0,0,0,0.25)' }} />
          <div className="absolute left-[6px] top-0 w-[2px] h-full"
            style={{ background: 'rgba(255,255,255,0.15)' }} />

          {/* Top-right page curl */}
          <div className="absolute top-0 right-0 w-8 h-8"
            style={{
              background: 'linear-gradient(225deg, var(--color-surface-900) 50%, transparent 50%)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }} />

          {/* Icon */}
          <div className="text-3xl mt-2 ml-2">{book.icon}</div>

          {/* Title and info */}
          <div className="ml-2">
            <h3 className="font-serif font-bold text-white text-base leading-snug mb-1 drop-shadow-sm">
              {book.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/70">
                {book.subject}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-[11px] font-mono text-white/60">
                {book.pages}p
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BooksView() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [flippingBookId, setFlippingBookId] = useState<string | null>(null);

  const handleBookClick = (book: Book) => {
    setFlippingBookId(book.id);
    // Wait for flip animation then transition
    setTimeout(() => {
      setSelectedBook(book);
      setFlippingBookId(null);
    }, 600);
  };

  if (selectedBook) {
    return <BookDetailView book={selectedBook} onBack={() => setSelectedBook(null)} />;
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-6 view-enter">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold mb-2" style={{ color: 'var(--color-surface-50)' }}>
            Your Library
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>
            {sampleBooks.length} books in your collection. Select one to continue studying.
          </p>
        </div>

        {/* Create New Book */}
        <button
          className="glass-card w-full p-5 mb-8 flex items-center gap-4 transition-all group"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(108,140,255,0.3)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="text-left">
            <span className="block text-sm font-medium" style={{ color: 'var(--color-surface-100)' }}>
              Create a New Book
            </span>
            <span className="block text-[12px]" style={{ color: 'var(--color-surface-500)' }}>
              Upload documents, paste text, or start from a topic
            </span>
          </div>
        </button>

        {/* Books grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {sampleBooks.map((book) => (
            <div
              key={book.id}
              className={flippingBookId === book.id ? 'flipping' : ''}
              style={{
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: flippingBookId === book.id ? 'perspective(800px) rotateY(-180deg) scale(0.9)' : 'none',
                opacity: flippingBookId === book.id ? 0 : 1,
              }}
            >
              <BookCard book={book} onClick={() => handleBookClick(book)} />
              <p className="mt-2 text-[12px] truncate px-1" style={{ color: 'var(--color-surface-500)' }}>
                Opened {book.lastOpened}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
