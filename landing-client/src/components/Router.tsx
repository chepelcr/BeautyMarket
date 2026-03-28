import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load all pages for better code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Examples = lazy(() => import("@/pages/Examples"));
const About = lazy(() => import("@/pages/About"));
const Funcionalidades = lazy(() => import("@/pages/Funcionalidades"));
const Ferias = lazy(() => import("@/pages/Ferias"));
const Comunidad = lazy(() => import("@/pages/Comunidad"));
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}

export function Router({ displayLocation }: RouterProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch location={displayLocation}>
        <Route path="/" component={Landing} />
        <Route path="/funcionalidades" component={Funcionalidades} />
        <Route path="/ferias" component={Ferias} />
        <Route path="/comunidad" component={Comunidad} />
        <Route path="/quienes-somos" component={About} />
        <Route path="/ejemplos" component={Examples} />
        <Route path="/examples" component={Examples} />
        <Route path="/blog" component={Blog} />
        <Route path="/contacto" component={Contact} />
        <Route path="/contact" component={Contact} />
        <Route path="/terminos" component={Terms} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacidad" component={Privacy} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        <Route>404 - Page not found</Route>
      </Switch>
    </Suspense>
  );
}
