import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/pages/LandingPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <div className="flex-1">
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route>{() => <LandingPage />}</Route>
            </Switch>
          </div>
          <Footer />
        </div>
      </OrganizationProvider>
    </QueryClientProvider>
  );
}
