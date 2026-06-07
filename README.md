# TEACH

> **Learn Smarter** — An AI-powered learning platform that fuses conversational tutoring with deep, source-grounded study.

TEACH is a web application that combines the best of ChatGPT-style conversational AI with NotebookLM-style source-grounded project workspaces. It targets independent learners, students, teachers, and entrepreneurs.

## Features

### 🎓 Teacher Mode
- **Conversational AI Tutor** — ChatGPT-style chat interface for active, guided tutoring
- **Studio Panel** — Create quizzes, videos, flashcards, audio overviews, mind maps, and more directly from your conversation

### 📚 Books (Library) Mode
- **3D Book Covers** — Beautiful animated book cards with hover effects and flip-open transitions
- **Overview Tab** — Book summary, source references, and quick stats at a glance
- **Pages Tab** — AI-generated chapter pages with narrative content and source citations
- **Split-View Workspace** — Source material on the left, Notes/Chat on the right
- **Highlight-to-Note** — Select any text to instantly pin it as a study note
- **Studio Toolbar** — Generate learning artifacts (quizzes, audio, video) scoped to the current page

### ✨ Design
- **Gray Dark Mode** — Premium aesthetic using deep slates and charcoals
- **Constellation Particles** — Interactive background particles that drift toward your cursor
- **Glassmorphism** — Translucent cards with backdrop blur for depth
- **Mixed Typography** — Inter (UI), Lora (reading), JetBrains Mono (metadata)
- **Responsive** — Works across desktop, tablet, and mobile

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 8 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| Canvas API | Particle background effects |

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/1akubird-dev/teach-app.git
cd teach-app

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Root layout shell
│   │   ├── MainContent.tsx    # View router
│   │   └── Sidebar.tsx        # Collapsible navigation sidebar
│   ├── theme/
│   │   └── ParticleBackground.tsx  # Canvas constellation effect
│   └── views/
│       ├── TeacherView.tsx    # Chat + Studio panel
│       ├── BooksView.tsx      # Library grid with 3D book cards
│       └── BookDetailView.tsx # Overview/Pages split-view workspace
├── styles/
│   └── index.css              # Design tokens & component styles
├── App.tsx                    # Root component
└── main.tsx                   # Entry point
```

## License

MIT
