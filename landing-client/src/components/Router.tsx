import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";

// Lazy load all pages for better code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Examples = lazy(() => import("@/pages/Examples"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const Contact = lazy(() => import("@/pages/Contact"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Cookies = lazy(() => import("@/pages/Cookies"));

interface RouterProps {
  displayLocation: string;
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function Router({ displayLocation }: RouterProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch location={displayLocation}>
        <Route path="/" component={Landing} />
        <Route path="/examples" component={Examples} />
        <Route path="/about" component={About} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        {/* Section routes for direct navigation - must be after specific routes */}
        <Route path="/features" component={Landing} />
        <Route path="/pricing" component={Landing} />
        <Route>404 - Page not found</Route>
      </Switch>
    </Suspense>
  );
}
