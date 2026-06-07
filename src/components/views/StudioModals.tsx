import { useState, useEffect, useRef } from 'react';

/* ════════════════════════════════════════════════
   INTERFACES & TYPES
   ════════════════════════════════════════════════ */

interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon: string;
  snippet: string;
  addedAt: Date;
}

interface StudioOutput {
  id: string;
  type: 'video' | 'audio' | 'flashcards' | 'quiz' | 'pages' | 'sources';
  title: string;
  createdAt: Date;
  status: 'complete' | 'generating';
}

interface StudioModalsProps {
  output: StudioOutput;
  onClose: () => void;
  onAddSource?: (source: Source) => void;
}

/* ════════════════════════════════════════════════
   QUIZ COMPONENT
   ════════════════════════════════════════════════ */

interface Question {
  q: string;
  options: string[];
  answerIdx: number;
}

const MOCK_QUIZ_QUESTIONS: Question[] = [
  {
    q: "What is the primary difference between supervised and unsupervised learning?",
    options: [
      "Supervised learning requires labeled training data; unsupervised learning models unlabeled data.",
      "Supervised learning only works with neural networks, while unsupervised uses linear algebra.",
      "Unsupervised learning is faster and always produces more accurate outcomes.",
      "Supervised learning is performed by humans, whereas unsupervised learning runs automatically."
    ],
    answerIdx: 0,
  },
  {
    q: "Which of the following algorithms is a classic example of unsupervised learning?",
    options: [
      "Linear Regression",
      "K-Means Clustering",
      "Support Vector Machines (SVM)",
      "Decision Trees"
    ],
    answerIdx: 1,
  },
  {
    q: "In artificial neural networks, what is the core purpose of an activation function?",
    options: [
      "To connect the model to an external database.",
      "To reset weights to zero after every optimization step.",
      "To introduce non-linearity, allowing the model to learn complex relationships.",
      "To adjust the learning rate dynamically based on gradient size."
    ],
    answerIdx: 2,
  },
  {
    q: "Which mathematical concept serves as the foundational bedrock for linear regression optimization?",
    options: [
      "Fourier Transforms",
      "Markov Decision Processes",
      "Least Squares Criterion",
      "Dijkstra's Algorithm"
    ],
    answerIdx: 2,
  },
  {
    q: "What does the term 'overfitting' describe in machine learning?",
    options: [
      "When a model performs exceptionally well on testing data but poorly on training data.",
      "When a model learns noise in the training dataset, resulting in poor generalization to new data.",
      "When a model has too few parameters to capture the basic trend of the dataset.",
      "When the training process takes too much RAM and crashes the host machine."
    ],
    answerIdx: 1,
  }
];

function QuizPlayer() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const currentQuestion = MOCK_QUIZ_QUESTIONS[currentIdx];

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    const correct = selectedOpt === currentQuestion.answerIdx;
    if (correct) {
      setScore((s) => s + 1);
    }
    setUserAnswers((prev) => [...prev, selectedOpt]);
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsSubmitted(false);
    if (currentIdx < MOCK_QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setUserAnswers([]);
  };

  if (isFinished) {
    const percentage = Math.round((score / MOCK_QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="text-center py-6">
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="56" cy="56" r="48" stroke="var(--color-surface-800)" strokeWidth="8" fill="transparent" />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke={percentage >= 70 ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)'}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - percentage / 100)}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <span className="absolute text-xl font-bold font-mono" style={{ color: 'var(--color-surface-50)' }}>
            {percentage}%
          </span>
        </div>

        <h3 className="text-lg font-bold font-serif mb-2" style={{ color: 'var(--color-surface-50)' }}>
          {percentage >= 80 ? 'Excellent Work!' : percentage >= 50 ? 'Good Effort!' : 'Keep Studying!'}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-surface-400)' }}>
          You scored <strong className="text-white">{score}</strong> out of {MOCK_QUIZ_QUESTIONS.length} questions correctly.
        </p>

        <div className="max-h-[200px] overflow-y-auto text-left mb-6 px-4 py-3 rounded-lg border"
          style={{ background: 'var(--color-surface-900)', borderColor: 'var(--color-glass-border)' }}>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-surface-500)' }}>
            Performance Breakdown
          </h4>
          {MOCK_QUIZ_QUESTIONS.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.answerIdx;
            return (
              <div key={idx} className="text-xs mb-3 last:mb-0 pb-2 border-b last:border-b-0"
                style={{ borderColor: 'var(--color-glass-border)' }}>
                <span className="font-medium block text-slate-200">{idx + 1}. {q.q}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span style={{ color: 'var(--color-surface-400)' }}>
                    Your answer: {q.options[userAnswers[idx]]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-all w-full"
          style={{ background: 'var(--color-accent-primary)', color: 'white' }}
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="flex justify-between items-center text-[10px] font-mono mb-2" style={{ color: 'var(--color-surface-400)' }}>
        <span>QUESTION {currentIdx + 1} OF {MOCK_QUIZ_QUESTIONS.length}</span>
        <span>{Math.round(((currentIdx) / MOCK_QUIZ_QUESTIONS.length) * 100)}% COMPLETE</span>
      </div>
      <div className="h-1 rounded-full mb-6 overflow-hidden" style={{ background: 'var(--color-surface-800)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{
            background: 'var(--color-accent-primary)',
            width: `${((currentIdx) / MOCK_QUIZ_QUESTIONS.length) * 100}%`
          }}
        />
      </div>

      {/* Question */}
      <h3 className="text-sm md:text-base font-serif font-bold mb-5 leading-snug" style={{ color: 'var(--color-surface-100)' }}>
        {currentQuestion.q}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-2.5 mb-6">
        {currentQuestion.options.map((opt, optIdx) => {
          let optionStyle = {
            background: 'var(--color-surface-850)',
            borderColor: 'var(--color-glass-border)',
            color: 'var(--color-surface-300)'
          };

          if (selectedOpt === optIdx) {
            optionStyle = {
              background: 'var(--color-accent-glow)',
              borderColor: 'var(--color-accent-primary)',
              color: 'var(--color-accent-primary)'
            };
          }

          if (isSubmitted) {
            if (optIdx === currentQuestion.answerIdx) {
              // Always show correct in green
              optionStyle = {
                background: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10b981',
                color: '#34d399'
              };
            } else if (selectedOpt === optIdx) {
              // Wrong selection in red
              optionStyle = {
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
                color: '#f87171'
              };
            } else {
              // Others dim
              optionStyle = {
                background: 'var(--color-surface-900)',
                borderColor: 'var(--color-glass-border)',
                color: 'var(--color-surface-500)'
              };
            }
          }

          return (
            <button
              key={optIdx}
              disabled={isSubmitted}
              onClick={() => setSelectedOpt(optIdx)}
              className="px-4 py-3 rounded-lg text-left text-xs leading-relaxed border transition-all flex items-start gap-3 w-full"
              style={optionStyle}
            >
              <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-mono font-bold text-[10px]"
                style={{
                  background: selectedOpt === optIdx ? 'var(--color-accent-primary)' : 'var(--color-surface-800)',
                  color: selectedOpt === optIdx ? 'white' : 'var(--color-surface-400)'
                }}>
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Buttons */}
      {!isSubmitted ? (
        <button
          disabled={selectedOpt === null}
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-all w-full flex items-center justify-center"
          style={{
            background: selectedOpt !== null ? 'var(--color-accent-primary)' : 'var(--color-surface-800)',
            color: selectedOpt !== null ? 'white' : 'var(--color-surface-500)'
          }}
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-all w-full flex items-center justify-center text-white"
          style={{ background: 'var(--color-accent-primary)' }}
        >
          {currentIdx === MOCK_QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   FLASHCARDS COMPONENT
   ════════════════════════════════════════════════ */

interface Flashcard {
  front: string;
  back: string;
}

const MOCK_FLASHCARDS: Flashcard[] = [
  { front: "Supervised Learning", back: "An approach where algorithms learn mappings from input variables to labeled output variables based on training examples." },
  { front: "Gradient Descent", back: "A primary first-order optimization algorithm used to minimize model loss functions by iteratively calculating partial derivatives." },
  { front: "Activation Function", back: "A mathematical node transformation that introduces non-linearity into a neural network, enabling it to fit complex curved relationships." },
  { front: "Overfitting", back: "A modelling error where the algorithm learns noise and detailed nuances of training inputs, degrading performance on novel datasets." },
  { front: "Regularization", back: "Techniques (such as L1/L2 penalties or Dropout) that discourage model complexity to prevent overfitting and encourage robustness." }
];

function FlashcardViewer() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewed, setReviewed] = useState<Record<number, 'known' | 'retry'>>({});

  const card = MOCK_FLASHCARDS[currentIdx];

  const handleAction = (status: 'known' | 'retry') => {
    const prevStatus = reviewed[currentIdx];
    setReviewed((prev) => ({ ...prev, [currentIdx]: status }));

    if (status === 'known' && prevStatus !== 'known') {
      setKnownCount((k) => k + 1);
    } else if (status === 'retry' && prevStatus === 'known') {
      setKnownCount((k) => Math.max(0, k - 1));
    }

    // Go next card automatically after a brief delay
    setTimeout(() => {
      setIsFlipped(false);
      if (currentIdx < MOCK_FLASHCARDS.length - 1) {
        setCurrentIdx((i) => i + 1);
      }
    }, 400);
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setIsFlipped(false);
      setCurrentIdx((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < MOCK_FLASHCARDS.length - 1) {
      setIsFlipped(false);
      setCurrentIdx((i) => i + 1);
    }
  };

  return (
    <div>
      {/* Progress */}
      <div className="flex justify-between items-center text-[10px] font-mono mb-2" style={{ color: 'var(--color-surface-400)' }}>
        <span>CARD {currentIdx + 1} OF {MOCK_FLASHCARDS.length}</span>
        <span>{knownCount} KNOWN • {Object.keys(reviewed).length} REVIEWED</span>
      </div>
      <div className="h-1 rounded-full mb-6 overflow-hidden" style={{ background: 'var(--color-surface-800)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{
            background: 'var(--color-accent-primary)',
            width: `${((currentIdx + 1) / MOCK_FLASHCARDS.length) * 100}%`
          }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full h-52 cursor-pointer mb-6"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full duration-500 select-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'none'
          }}
        >
          {/* Card Front */}
          <div
            className="absolute inset-0 rounded-xl border flex flex-col justify-center items-center p-6 text-center shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, var(--color-surface-850), var(--color-surface-900))',
              borderColor: 'var(--color-glass-border)'
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--color-surface-500)' }}>
              Term
            </span>
            <h2 className="text-base font-serif font-bold" style={{ color: 'var(--color-surface-50)' }}>
              {card.front}
            </h2>
            <span className="text-[10px] mt-6 px-2.5 py-1 rounded-full" style={{ background: 'var(--color-surface-800)', color: 'var(--color-surface-400)' }}>
              🖱️ Click to Flip
            </span>
          </div>

          {/* Card Back */}
          <div
            className="absolute inset-0 rounded-xl border flex flex-col justify-center items-center p-6 text-center shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, var(--color-surface-900), var(--color-surface-850))',
              borderColor: 'var(--color-glass-border)'
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent-primary)' }}>
              Definition
            </span>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--color-surface-200)' }}>
              {card.back}
            </p>
            <span className="text-[10px] mt-4" style={{ color: 'var(--color-surface-500)' }}>
              🖱️ Click to flip back
            </span>
          </div>
        </div>
      </div>

      {/* Review Actions */}
      <div className="flex gap-2.5 mb-5">
        <button
          onClick={() => handleAction('retry')}
          className="flex-1 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.2)',
            background: reviewed[currentIdx] === 'retry' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.04)',
            color: '#f87171'
          }}
        >
          Study Again 🔄
        </button>
        <button
          onClick={() => handleAction('known')}
          className="flex-1 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.2)',
            background: reviewed[currentIdx] === 'known' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.04)',
            color: '#34d399'
          }}
        >
          Know It ✓
        </button>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--color-glass-border)' }}>
        <button
          disabled={currentIdx === 0}
          onClick={handlePrev}
          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
          style={{
            color: currentIdx === 0 ? 'var(--color-surface-600)' : 'var(--color-surface-300)',
            background: currentIdx === 0 ? 'transparent' : 'var(--color-surface-850)'
          }}
        >
          ← Prev
        </button>
        <span className="text-xs font-mono" style={{ color: 'var(--color-surface-500)' }}>
          {currentIdx + 1} / {MOCK_FLASHCARDS.length}
        </span>
        <button
          disabled={currentIdx === MOCK_FLASHCARDS.length - 1}
          onClick={handleNext}
          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
          style={{
            color: currentIdx === MOCK_FLASHCARDS.length - 1 ? 'var(--color-surface-600)' : 'var(--color-surface-300)',
            background: currentIdx === MOCK_FLASHCARDS.length - 1 ? 'transparent' : 'var(--color-surface-850)'
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   AUDIO COMPONENT
   ════════════════════════════════════════════════ */

function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const duration = 192; // 3 min 12 sec
  const timerRef = useRef<number | null>(null);

  // Sample static heights for waveform visualization
  const heights = [
    30, 45, 60, 25, 40, 50, 75, 90, 35, 20, 65, 80, 40, 55, 30, 20, 45, 70, 85, 95,
    60, 45, 30, 50, 65, 80, 25, 35, 50, 40, 75, 90, 60, 30, 45, 55, 70, 35, 20, 40
  ];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((t) => {
          if (t >= duration) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return t + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    setCurrentTime(Math.floor(pct * duration));
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="py-2">
      <div className="glass-card p-4 mb-6" style={{ background: 'var(--color-surface-900)' }}>
        {/* Animated Waveform Visualization */}
        <div className="h-28 flex items-center justify-between gap-0.5 px-3">
          {heights.map((h, i) => {
            const progressRatio = currentTime / duration;
            const barIndexRatio = i / heights.length;
            const isActive = progressRatio >= barIndexRatio;

            // Height oscillation if playing
            let scaleY = 1;
            if (isPlaying) {
              scaleY = 0.85 + Math.sin(currentTime * 2 + i) * 0.15;
            }

            return (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-300"
                style={{
                  height: `${h * scaleY}%`,
                  background: isActive
                    ? 'linear-gradient(to top, var(--color-accent-primary), var(--color-accent-secondary))'
                    : 'var(--color-surface-800)',
                  opacity: isActive ? 1 : 0.4
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Scrub Bar */}
      <div className="relative group cursor-pointer mb-5" onClick={handleProgressBarClick}>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-800)' }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              background: 'var(--color-accent-primary)',
              width: `${(currentTime / duration) * 100}%`
            }}
          />
        </div>
        <div
          className="absolute -top-1 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow"
          style={{
            background: 'white',
            left: `calc(${(currentTime / duration) * 100}% - 7px)`
          }}
        />
      </div>

      {/* Timeline Label */}
      <div className="flex justify-between items-center text-[11px] font-mono mb-6" style={{ color: 'var(--color-surface-400)' }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls panel */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-300"
          style={{ background: 'var(--color-surface-850)' }}
          title="Rewind 10s"
        >
          ⏪
        </button>

        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
          style={{ background: 'var(--color-accent-primary)', color: 'white' }}
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="4" height="16" /><rect x="16" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-300"
          style={{ background: 'var(--color-surface-850)' }}
          title="Forward 10s"
        >
          ⏩
        </button>

        <button
          onClick={cycleSpeed}
          className="absolute right-8 text-[11px] font-mono px-2 py-1 rounded border transition-colors shrink-0"
          style={{
            borderColor: 'var(--color-glass-border)',
            background: 'var(--color-surface-850)',
            color: 'var(--color-surface-300)'
          }}
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   VIDEO COMPONENT
   ════════════════════════════════════════════════ */

interface VideoCaption {
  start: number;
  end: number;
  text: string;
  slideNode: React.ReactNode;
}

function VideoPlayerView() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 100; // 1 min 40 sec
  const timerRef = useRef<number | null>(null);

  const captions: VideoCaption[] = [
    {
      start: 0,
      end: 15,
      text: "Welcome to the video course on Foundations of Machine Learning. Today we will explore the core framework.",
      slideNode: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <span className="text-4xl mb-3 animate-bounce">📚</span>
          <h2 className="text-lg font-serif font-bold text-white mb-1">Foundations of ML</h2>
          <p className="text-[11px] text-slate-400">Section 1: Theoretical Overview</p>
        </div>
      )
    },
    {
      start: 15,
      end: 35,
      text: "First, let's understand supervised learning. Here, we feed labeled data to our algorithm to map inputs to outputs.",
      slideNode: (
        <div className="flex flex-col justify-center h-full px-6 text-left">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wide mb-1">Concept 1</span>
          <h3 className="text-sm font-bold text-white mb-3">Supervised Learning</h3>
          <div className="flex items-center gap-2 border border-slate-700 rounded p-2 bg-slate-900/60">
            <span className="text-[11px] font-mono text-slate-300">Labeled Data (X, Y)</span>
            <span className="text-slate-500">→</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Model</span>
            <span className="text-slate-500">→</span>
            <span className="text-[11px] font-mono text-emerald-400">Prediction (Y')</span>
          </div>
        </div>
      )
    },
    {
      start: 35,
      end: 55,
      text: "Next, we have unsupervised learning, where the model seeks hidden structures in unlabeled data, like clustering.",
      slideNode: (
        <div className="flex flex-col justify-center h-full px-6 text-left">
          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wide mb-1">Concept 2</span>
          <h3 className="text-sm font-bold text-white mb-3">Unsupervised Learning (Clustering)</h3>
          <div className="flex justify-around items-center h-16 bg-slate-900/60 rounded border border-slate-700/80 p-2">
            <div className="flex flex-col items-center">
              <span className="text-lg">🍇🍇</span>
              <span className="text-[9px] text-slate-400">Cluster A</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div className="flex flex-col items-center">
              <span className="text-lg">🍒🍒🍒</span>
              <span className="text-[9px] text-slate-400">Cluster B</span>
            </div>
          </div>
        </div>
      )
    },
    {
      start: 55,
      end: 80,
      text: "We will also dive into neural networks, which are inspired by the biological structure of the human brain.",
      slideNode: (
        <div className="flex flex-col justify-center h-full px-6 text-left">
          <span className="text-[10px] font-mono text-pink-400 font-bold uppercase tracking-wide mb-1">Concept 3</span>
          <h3 className="text-sm font-bold text-white mb-2">Neural Networks</h3>
          <div className="flex items-center justify-center gap-3 bg-slate-900/60 rounded border border-slate-700 p-2">
            <div className="flex flex-col gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <span className="text-slate-500">➜</span>
            <div className="flex flex-col gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <span className="text-slate-500">➜</span>
            <div className="flex flex-col gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      )
    },
    {
      start: 80,
      end: 100,
      text: "By the end of this course, you will be equipped to apply these algorithms to real-world datasets. Let's get started!",
      slideNode: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <span className="text-4xl mb-2">🚀</span>
          <h2 className="text-sm font-bold text-white mb-1">Ready to Deploy</h2>
          <p className="text-[10px] text-slate-400 max-w-xs px-4">Use the quiz and flashcard tools to test your knowledge.</p>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((t) => {
          if (t >= duration) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const activeCaption = captions.find(c => currentTime >= c.start && currentTime < c.end) || captions[0];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    setCurrentTime(Math.floor(pct * duration));
  };

  return (
    <div>
      {/* Video Screen Panel */}
      <div className="relative w-full h-56 rounded-xl overflow-hidden border mb-4 bg-slate-950 flex flex-col justify-between"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        {/* Animated Slide Canvas */}
        <div className="flex-1 w-full bg-gradient-to-br from-slate-900/60 via-slate-950 to-slate-900/40 relative z-10">
          {activeCaption.slideNode}
        </div>

        {/* Captions Display overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-center z-20 pointer-events-none">
          <span className="px-3 py-1.5 rounded text-[11px] leading-relaxed inline-block font-sans max-w-[90%]"
            style={{ background: 'rgba(0, 0, 0, 0.75)', color: 'var(--color-surface-50)' }}>
            {activeCaption.text}
          </span>
        </div>
      </div>

      {/* Scrub Bar */}
      <div className="relative group cursor-pointer mb-4" onClick={handleProgressBarClick}>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-800)' }}>
          <div
            className="h-full rounded-full transition-all duration-100 animate-pulse"
            style={{
              background: 'var(--color-accent-primary)',
              width: `${(currentTime / duration) * 100}%`
            }}
          />
        </div>
        <div
          className="absolute -top-1 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow"
          style={{
            background: 'white',
            left: `calc(${(currentTime / duration) * 100}% - 7px)`
          }}
        />
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-white"
            style={{ background: 'var(--color-accent-primary)' }}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="4" height="16" /><rect x="16" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="text-[11px] font-mono" style={{ color: 'var(--color-surface-400)' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase"
          style={{ borderColor: 'var(--color-glass-border)', color: 'var(--color-surface-500)' }}>
          720p HD
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SOURCE GATHERER COMPONENT
   ════════════════════════════════════════════════ */

function SourceGatherer({ onAddSource, onClose }: {
  onAddSource: (src: Source) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [isGathering, setIsGathering] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logIndexRef = useRef(0);

  const handleGather = () => {
    if (!url.trim()) return;
    setIsGathering(true);
    setLogs([]);
    logIndexRef.current = 0;

    let targetDomain = 'unknown-host.com';
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      targetDomain = parsedUrl.hostname.replace('www.', '');
    } catch {
      // fallback
      if (url.includes('.')) targetDomain = url.split('/')[0];
    }

    const logSteps = [
      `Connecting to https://${targetDomain}...`,
      `HTTP status code 200: Handshake complete.`,
      `Scanning website nodes and DOM structure...`,
      `Extracted metadata matching document schema: Article`,
      `Parsed Title: "Understanding Neural Foundations"`,
      `Extracted favicon details & logo indicators.`,
      `Running AI context extraction on 5,600 parsed words...`,
      `Successfully generated text summaries and content fragments.`,
      `Source metadata added to project library catalog successfully.`
    ];

    const addLogLine = () => {
      if (logIndexRef.current < logSteps.length) {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${logSteps[logIndexRef.current]}`]);
        logIndexRef.current += 1;
        setTimeout(addLogLine, 400 + Math.random() * 300);
      } else {
        // Complete
        const newSource: Source = {
          id: `src-${Date.now()}`,
          title: `Understanding Neural Foundations — ${targetDomain.split('.')[0].toUpperCase()}`,
          url: url.startsWith('http') ? url : `https://${url}`,
          domain: targetDomain,
          favicon: '🌐',
          snippet: 'This newly scanned material covers the advanced theoretical concepts and frameworks discussed in academic papers.',
          addedAt: new Date()
        };
        onAddSource(newSource);
        setIsGathering(false);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    };

    setTimeout(addLogLine, 200);
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-surface-400)' }}>
          Target Resource URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            disabled={isGathering}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. https://example.com/topic"
            className="flex-1 px-3 py-2.5 rounded-lg border text-xs outline-none transition-all"
            style={{
              background: 'var(--color-surface-850)',
              borderColor: 'var(--color-glass-border)',
              color: 'var(--color-surface-100)'
            }}
          />
          <button
            disabled={isGathering || !url.trim()}
            onClick={handleGather}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0"
            style={{
              background: url.trim() && !isGathering ? 'var(--color-accent-primary)' : 'var(--color-surface-800)',
              color: url.trim() && !isGathering ? 'white' : 'var(--color-surface-500)'
            }}
          >
            {isGathering ? 'Gathering...' : 'Scan Site'}
          </button>
        </div>
      </div>

      {/* Logs Window */}
      {(isGathering || logs.length > 0) && (
        <div className="border rounded-lg p-3 font-mono text-[10px] leading-relaxed h-44 overflow-y-auto"
          style={{
            background: 'var(--color-surface-950)',
            borderColor: 'var(--color-glass-border)',
            color: 'var(--color-accent-secondary)'
          }}>
          {logs.map((log, index) => (
            <div key={index} className="mb-1 select-text">
              <span className="text-emerald-400">➜</span> {log}
            </div>
          ))}
          {isGathering && (
            <div className="flex items-center gap-1.5 mt-2 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-ping" />
              <span>Scanning host...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN MODAL SHELL EXPORT
   ════════════════════════════════════════════════ */

export function StudioModals({ output, onClose, onAddSource }: StudioModalsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg rounded-2xl border p-5 md:p-6 shadow-2xl flex flex-col z-10 glass-card-strong animate-in fade-in zoom-in duration-300"
        style={{
          background: 'var(--color-glass-bg)',
          borderColor: 'var(--color-glass-border)'
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {output.type === 'quiz' && '📝'}
              {output.type === 'flashcards' && '🗂️'}
              {output.type === 'audio' && '🎧'}
              {output.type === 'video' && '🎬'}
              {output.type === 'sources' && '🔍'}
            </span>
            <div>
              <h2 className="text-sm font-bold font-serif leading-none" style={{ color: 'var(--color-surface-50)' }}>
                {output.title.split(' — ')[0]}
              </h2>
              <span className="text-[10px] font-mono uppercase mt-1 block" style={{ color: 'var(--color-surface-500)' }}>
                Studio Output • {output.type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors"
            style={{ borderColor: 'var(--color-glass-border)', color: 'var(--color-surface-400)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-800)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-surface-400)'; }}
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1">
          {output.type === 'quiz' && <QuizPlayer />}
          {output.type === 'flashcards' && <FlashcardViewer />}
          {output.type === 'audio' && <AudioPlayer />}
          {output.type === 'video' && <VideoPlayerView />}
          {output.type === 'sources' && onAddSource && (
            <SourceGatherer onAddSource={onAddSource} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
