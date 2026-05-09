import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from '@/context/ConfigContext';
import { ThemeApplicator } from '@/context/ThemeContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

const LandingPage   = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DemoPage      = lazy(() => import('@/pages/DemoPage').then(m => ({ default: m.DemoPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));

export default function App() {
  return (
    <ConfigProvider>
      <ThemeApplicator />
      <BrowserRouter>
        <Routes>
          {/* Public routes — wrapped in AppShell (TopNav + Footer) */}
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <LandingPage />
                </Suspense>
              }
            />
            <Route
              path="/demo"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <DemoPage />
                </Suspense>
              }
            />
          </Route>

          {/* Dashboard — no shell, localhost-only */}
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <DashboardPage />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
