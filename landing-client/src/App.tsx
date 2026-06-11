import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { resolveSeo } from "@/lib/seo";
import { useHeadTags } from "@/hooks/useHeadTags";
import LandingNavbar from "@/components/layout/navbar";
import LandingFooter from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { Router } from "@/components/Router";
import { TransitionOverlay } from "@/components/TransitionOverlay";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";

// Lazy + gated: the admin chunk is only ever imported when ADMIN_ENABLED is
// true, so a normal prod build tree-shakes it out entirely.
const AdminApp = ADMIN_ENABLED ? lazy(() => import("@/admin/AdminApp")) : null;

// Sets default <head> tags from seo.json on every public route/language change.
// Head-only, no rendered output. Pages may still override document.title after.
function HeadTags() {
  const [location] = useLocation();
  const { language } = useLanguage();
  useHeadTags(resolveSeo(location, language));
  return null;
}

export default function App() {
  const [location] = useLocation();

  // Admin shell renders full-screen, outside the public navbar/footer chrome.
  if (ADMIN_ENABLED && AdminApp && location.startsWith("/admin")) {
    return (
      <ThemeProvider>
        <Suspense fallback={null}>
          <AdminApp />
        </Suspense>
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <>
      <HeadTags />
      <TransitionOverlay />
      <ThemeProvider>
        <PageTransition location={location}>
          {(displayLocation, transitionStage, isLayoutSwitch) => (
            <div className="min-h-screen flex flex-col bg-background">
              <LandingNavbar transitionStage={isLayoutSwitch ? transitionStage : ''} />
              <main className={`flex-grow ${transitionStage}`}>
                <Router displayLocation={displayLocation} />
              </main>
              <LandingFooter />
            </div>
          )}
        </PageTransition>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
