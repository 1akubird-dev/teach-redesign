import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { ParticleBackground } from './components/theme/ParticleBackground';

type ViewType = 'teacher' | 'books';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('teacher');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      <ParticleBackground />
      <AppLayout
        sidebar={
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        }
        mainContent={
          <MainContent activeView={activeView} />
        }
      />
    </>
  );
}

export default App;
