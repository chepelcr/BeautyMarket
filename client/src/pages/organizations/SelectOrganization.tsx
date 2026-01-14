import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization, Organization } from '@/hooks/useOrganization';
import { Loader2, Building2, ChevronRight, Plus, AlertCircle } from 'lucide-react';

export default function SelectOrganization() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useUserOrganizations } = useOrganization();
  const [, navigate] = useLocation();

  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'jmarkets.jcampos.dev';

  // Fetch user's organizations
  const { data: organizations, isLoading: orgsLoading, error } = useUserOrganizations(user?.id);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/register');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // If user has only one organization AND it's complete, redirect directly
  useEffect(() => {
    if (organizations && organizations.length === 1) {
      const org = organizations[0];
      // Only auto-redirect if onboarding is complete (step 3)
      if (org.onboardingStep === 3) {
        const subdomain = org.subdomain || org.slug;
        window.location.href = `https://${subdomain}.${baseDomain}`;
      }
      // If incomplete, let user see the organization and choose to continue setup
    }
  }, [organizations, baseDomain]);

  const handleSelectOrganization = (org: Organization) => {
    // If organization setup is incomplete, redirect to create page to continue
    if (!org.onboardingStep || org.onboardingStep < 3) {
      navigate('/organizations/new');
      return;
    }

    // Organization is complete, go to subdomain
    const subdomain = org.subdomain || org.slug;
    window.location.href = `https://${subdomain}.${baseDomain}`;
  };

  const getOnboardingStatus = (org: Organization) => {
    const step = org.onboardingStep || 0;
    if (step === 0) return { label: 'Not started', variant: 'secondary' as const };
    if (step === 1) return { label: 'Basic info complete', variant: 'secondary' as const };
    if (step === 2) return { label: 'Contact info added', variant: 'secondary' as const };
    return { label: 'Complete', variant: 'default' as const };
  };

  if (authLoading || orgsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto py-10 px-4 min-h-screen flex items-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-500">Error</CardTitle>
            <CardDescription>
              Could not load your organizations. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No organizations - redirect to create
  if (!organizations || organizations.length === 0) {
    return (
      <div className="container max-w-md mx-auto py-10 px-4 min-h-screen flex items-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">No Organizations</CardTitle>
            <CardDescription>
              You don't belong to any organization yet. Create your first one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/organizations/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 min-h-screen flex items-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Select Organization</CardTitle>
          <CardDescription>
            Choose which organization you want to access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizations.map((org) => {
            const status = getOnboardingStatus(org);
            const isIncomplete = !org.onboardingStep || org.onboardingStep < 3;

            return (
              <button
                key={org.id}
                onClick={() => handleSelectOrganization(org)}
                className="w-full p-4 border rounded-lg hover:bg-accent transition-colors flex items-center justify-between group text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{org.name}</h3>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {org.subdomain || org.slug}.{baseDomain}
                  </p>
                  {isIncomplete && (
                    <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Click to continue setup
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </button>
            );
          })}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate('/organizations/new')}
            >
              <Plus className="h-4 w-4" />
              Create New Organization
            </Button>
          </div>

          <div className="text-center pt-2">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Back to home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
