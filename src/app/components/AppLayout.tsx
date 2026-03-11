import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { PageTransition } from './PageTransition';
import { AppBreadcrumbs } from './AppBreadcrumbs';
import { ScrollToTop } from './ScrollToTop';
import { ErrorBoundary } from './ErrorBoundary';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';

export function AppLayout() {
  useGlobalShortcuts();
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ScrollToTop />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 pt-4 pb-0 max-w-[1400px]">
            <AppBreadcrumbs />
          </div>
          <ErrorBoundary>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </ErrorBoundary>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
