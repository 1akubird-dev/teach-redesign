import { TeacherView } from '../views/TeacherView';
import { BooksView } from '../views/BooksView';

type ViewType = 'teacher' | 'books';

interface MainContentProps {
  activeView: ViewType;
}

export function MainContent({ activeView }: MainContentProps) {
  return (
    <main
      role="tabpanel"
      id="main-panel"
      aria-labelledby={`tab-${activeView}`}
      className="flex-1 overflow-hidden relative"
      style={{ zIndex: 1 }}
    >
      {activeView === 'teacher' && <TeacherView />}
      {activeView === 'books' && <BooksView />}
    </main>
  );
}
