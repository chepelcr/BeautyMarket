import { useLocation } from "wouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LandingNavbar from "@/components/layout/navbar";
import LandingFooter from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthNavbar } from "@/components/layout/auth-navbar";
import { PageTransition } from "@/components/PageTransition";
import { Router } from "@/components/Router";
import { TransitionOverlay } from "@/components/TransitionOverlay";

export default function App() {
  const [location] = useLocation();

  // Pages that should show full-page layout without main navbar/footer
  const fullPageRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/organizations/new',
    '/organizations/select'
  ];
  const isFullPageRoute = fullPageRoutes.some(route => location.startsWith(route));

  return (
    <>
      <TransitionOverlay />
      <ThemeProvider>
        <PageTransition location={location}>
          {(displayLocation, transitionStage, isLayoutSwitch) => (
            <div className={`min-h-screen flex flex-col ${
              isFullPageRoute
                ? 'bg-gradient-to-br from-primary/10 to-primary/20 dark:from-slate-900 dark:to-slate-800 relative'
                : 'bg-white dark:bg-gray-900'
            }`}>
              {isFullPageRoute ? (
                <>
                  <div className={`relative ${isLayoutSwitch ? transitionStage : ''}`}>
                    <AuthNavbar showLogout={location.startsWith('/verify-email')} />
                  </div>
                  <main className={`flex-grow ${transitionStage}`}>
                    <Router displayLocation={displayLocation} />
                  </main>
                </>
              ) : (
                <>
                  <LandingNavbar transitionStage={isLayoutSwitch ? transitionStage : ''} />
                  <main className={`flex-grow ${transitionStage}`}>
                    <Router displayLocation={displayLocation} />
                  </main>
                  <LandingFooter />
                </>
              )}
            </div>
          )}
        </PageTransition>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
