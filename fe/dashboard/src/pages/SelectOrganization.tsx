import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization, Organization } from '@/hooks/useOrganization';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { buildUserApiUrl, buildPublicApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Building2, ChevronRight, Plus, AlertCircle, Mail, Check } from 'lucide-react';

interface PendingInvitation {
  id: string;
  token: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  email: string;
  expiresAt: string;
}

export default function SelectOrganization() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useUserOrganizations } = useOrganization();
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'j-markets.jcampos.dev';

  // Fetch user's organizations
  const { data: organizations, isLoading: orgsLoading, error } = useUserOrganizations(user?.id);

  // Fetch pending invitations for this user
  const { data: pendingInvitations = [], isLoading: invitationsLoading } = useQuery<PendingInvitation[]>({
    queryKey: ['my-pending-invitations', user?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', buildUserApiUrl(user!.id, '/invitations/pending'));
      if (!res.ok) throw new Error('Failed to fetch invitations');
      return res.json();
    },
    enabled: !!user?.id,
  });

  const acceptMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest('POST', buildPublicApiUrl(`/invitations/accept/${token}`), { userId: user!.id });
      return res.json();
    },
    onSuccess: (_, token) => {
      const inv = pendingInvitations.find(i => i.token === token);
      toast({ title: `Joined ${inv?.organizationName ?? 'organization'} successfully` });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-organizations', user?.id] });
      if (inv) {
        sessionStorage.setItem('selectedOrgId', inv.organizationId);
        navigate('/admin');
      }
    },
    onError: (err: Error) => toast({ title: 'Failed to accept invitation', description: err.message, variant: 'destructive' }),
  });


  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // If user has only one organization AND it's complete AND no pending invitations, redirect directly
  useEffect(() => {
    if (!invitationsLoading && organizations && organizations.length === 1 && pendingInvitations.length === 0) {
      const org = organizations[0];
      if (org.onboardingStep === 3) {
        sessionStorage.setItem('selectedOrgId', org.id);
        queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
        navigate('/admin');
      }
    }
  }, [organizations, pendingInvitations, invitationsLoading, navigate]);

  const handleSelectOrganization = (org: Organization) => {
    // If organization setup is incomplete, redirect to create page to continue
    if (!org.onboardingStep || org.onboardingStep < 3) {
      // Store orgId in sessionStorage to resume incomplete organization
      sessionStorage.setItem('resumeOrgId', org.id);
      navigate(`/organizations/new`);
      return;
    }

    // Organization is complete, go to admin dashboard
    sessionStorage.setItem('selectedOrgId', org.id);
    // Invalidate so useDefaultOrganization re-runs its select with the new selectedOrgId
    queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
    navigate('/admin');
  };

  const getOnboardingStatus = (org: Organization) => {
    const step = org.onboardingStep || 0;
    if (step === 0) return { label: t('organizations.select.status.notStarted'), variant: 'secondary' as const };
    if (step === 1) return { label: t('organizations.select.status.basicInfoComplete'), variant: 'secondary' as const };
    if (step === 2) return { label: t('organizations.select.status.contactInfoAdded'), variant: 'secondary' as const };
    return { label: t('organizations.select.status.complete'), variant: 'default' as const };
  };

  if (authLoading || orgsLoading || invitationsLoading) {
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
            <CardTitle className="text-xl text-red-500">{t('organizations.select.error')}</CardTitle>
            <CardDescription>
              {t('organizations.select.errorDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>
              {t('organizations.select.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No organizations - show create option + pending invitations if any
  if (!organizations || organizations.length === 0) {
    return (
      <div className="container max-w-md mx-auto py-10 px-4 min-h-screen flex items-center">
        <div className="w-full space-y-4">
          {pendingInvitations.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Pending Invitations</CardTitle>
                </div>
                <CardDescription>You have been invited to join these organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{inv.organizationName}</p>
                      <p className="text-xs text-muted-foreground">{inv.organizationSlug}.{baseDomain}</p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => acceptMutation.mutate(inv.token)}
                      disabled={acceptMutation.isPending}
                    >
                      <Check className="h-3 w-3" />
                      Accept
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('organizations.select.noOrgsTitle')}</CardTitle>
              <CardDescription>
                {t('organizations.select.noOrgsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/organizations/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('organizations.select.createOrganization')}
              </Button>
            </CardContent>
          </Card>
        </div>
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
          <CardTitle className="text-2xl">{t('organizations.select.selectTitle')}</CardTitle>
          <CardDescription>
            {t('organizations.select.selectDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingInvitations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="h-4 w-4" />
                Pending Invitations
              </div>
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border border-primary/20 bg-primary/5 rounded-lg">
                  <div>
                    <p className="font-semibold">{inv.organizationName}</p>
                    <p className="text-xs text-muted-foreground">{inv.organizationSlug}.{baseDomain}</p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => acceptMutation.mutate(inv.token)}
                    disabled={acceptMutation.isPending}
                  >
                    <Check className="h-3 w-3" />
                    Accept
                  </Button>
                </div>
              ))}
              <div className="border-t pt-2" />
            </div>
          )}
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
                      {t('organizations.select.continueSetup')}
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
              {t('organizations.select.createNewOrganization')}
            </Button>
          </div>

          <div className="text-center pt-2">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              {t('organizations.select.backToHome')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
