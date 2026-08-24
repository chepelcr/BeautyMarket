import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { useConfig } from '@/hooks/useConfig';

export function AppShell() {
  const { config } = useConfig();

  return (
    <div className="min-h-screen flex flex-col smooth-tokens">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      {config.sections.footer.visible && <Footer />}
    </div>
  );
}
