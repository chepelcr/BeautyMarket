import { useLocation } from "wouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { AuthNavbar } from "@/components/layout/auth-navbar";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageTransition } from "@/components/PageTransition";
import { Router } from "@/components/Router";
import { TransitionOverlay } from "@/components/TransitionOverlay";

export default function App() {
  const [location] = useLocation();

  // Pages that should show auth layout with gradient background
  const authPageRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/organizations/new',
    '/organizations/select',
    '/join'
  ];

  // Check if current route is an auth page
  // Handle root path '/' separately to avoid matching all routes
  const isAuthPage = location === '/' || authPageRoutes.some(route =>
    location === route || (route !== '/' && location.startsWith(route))
  );

  return (
    <>
      <TransitionOverlay />
      <ThemeProvider>
        <PageTransition location={location}>
          {(displayLocation, transitionStage, isLayoutSwitch) => (
            <>
              {isAuthPage ? (
                <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 to-primary/20 dark:from-slate-900 dark:to-slate-800 relative">
                  <div className={`relative ${isLayoutSwitch ? transitionStage : ''}`}>
                    <AuthNavbar showLogout={location.startsWith('/verify-email')} />
                  </div>
                  <main className={`flex-grow ${transitionStage}`}>
                    <Router displayLocation={displayLocation} />
                  </main>
                </div>
              ) : (
                <AdminLayout>
                  <div className={transitionStage}>
                    <Router displayLocation={displayLocation} />
                  </div>
                </AdminLayout>
              )}
            </>
          )}
        </PageTransition>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
