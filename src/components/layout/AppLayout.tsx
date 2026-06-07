
interface AppLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
}

export function AppLayout({ sidebar, mainContent }: AppLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden relative">
      {sidebar}
      {mainContent}
    </div>
  );
}
