import { useLocation } from "wouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LandingNavbar from "@/components/layout/navbar";
import LandingFooter from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { Router } from "@/components/Router";
import { TransitionOverlay } from "@/components/TransitionOverlay";

export default function App() {
  const [location] = useLocation();

  return (
    <>
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
