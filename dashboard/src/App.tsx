import { useLocation } from "wouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { AuthNavbar } from "@/components/layout/auth-navbar";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageTransition } from "@/components/PageTransition";
import { Router } from "@/components/Router";
import { TransitionOverlay } from "@/components/TransitionOverlay";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";

export default function App() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { useUserOrganizations } = useOrganization();
  const { data: organizations = [] } = useUserOrganizations(user?.id);

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

  // Determine navbar button display logic
  const isOrgSelectionPage = location === '/organizations/select' || location === '/organizations/new';
  const hasOrganizations = organizations.length > 0;

  const getNavbarProps = () => {
    // Login page: hide all navigation buttons
    if (location === '/' || location === '/login') {
      return { hideNavButton: true };
    }

    // Verify email page: show logout button only
    if (location.startsWith('/verify-email')) {
      return { showLogout: true };
    }

    // Organization selection/creation pages
    if (isOrgSelectionPage) {
      // If user has existing organizations, show both buttons
      if (hasOrganizations) {
        return { showBothButtons: true };
      }
      // If user is creating their first org, show only logout
      return { showLogout: true };
    }

    // Default: show back to home button
    return {};
  };

  return (
    <>
      <TransitionOverlay />
      <ThemeProvider>
        <PageTransition location={location}>
          {(displayLocation, transitionStage, isLayoutSwitch) => (
            <>
              {isAuthPage ? (
                <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 to-primary/20 dark:from-background dark:to-background relative">
                  <div className={`relative ${isLayoutSwitch ? transitionStage : ''}`}>
                    <AuthNavbar {...getNavbarProps()} />
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
