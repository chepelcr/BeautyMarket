import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { buildPublicApiUrl } from '@/lib/apiUtils';

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useDynamicTitle(t('organizations.invitation.title'));

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await apiRequest('GET', buildPublicApiUrl(`/invitations/token/${token}`));
        const data = await response.json();
        setInvitation(data);

        // Check if expired
        if (new Date(data.expiresAt) < new Date()) {
          setError(t('organizations.invitation.expired'));
        } else if (data.status !== 'pending') {
          setError(t('organizations.invitation.notValid'));
        }
      } catch (err: any) {
        if (err.message?.includes('404')) {
          setError(t('organizations.invitation.notFound'));
        } else {
          setError(t('organizations.invitation.loadError'));
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token, t]);

  const handleAccept = async () => {
    if (!user?.id || !token) return;

    setAccepting(true);
    try {
      await apiRequest('POST', buildPublicApiUrl(`/invitations/accept/${token}`), { userId: user.id });

      setSuccess(true);
      toast({
        title: t('organizations.invitation.accepted'),
        description: t('organizations.invitation.acceptedDescription'),
      });

      // Redirect to organization after a moment
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err: any) {
      toast({
        title: t('organizations.invitation.acceptError'),
        description: err.message || t('organizations.invitation.acceptErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  const getRoleName = (roleName: string) => {
    switch (roleName) {
      case 'owner': return t('organizations.settings.roleOwner');
      case 'admin': return t('organizations.settings.roleAdmin');
      case 'manager': return t('organizations.settings.roleManager');
      case 'staff': return t('organizations.settings.roleStaff');
      default: return roleName;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Not authenticated - prompt to login/register
  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{t('organizations.invitation.receivedTitle')}</CardTitle>
            <CardDescription>
              {invitation ? (
                <>{t('organizations.invitation.receivedDescription')}</>
              ) : (
                <>{t('organizations.invitation.loginRequiredDescription')}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {t('organizations.invitation.loginRequiredDescription')}
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate(`/login?redirect=/join/${token}`)}>
                {t('organizations.invitation.signIn')}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/register?redirect=/join/${token}`)}>
                {t('organizations.invitation.createAccount')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle>{t('organizations.invitation.invalidTitle')}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/')}>
              {t('organizations.invitation.backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>{t('organizations.invitation.welcomeTitle')}</CardTitle>
            <CardDescription>
              {t('organizations.invitation.welcomeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{t('organizations.invitation.redirecting')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show invitation details
  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{t('organizations.invitation.toOrganization')}</CardTitle>
          <CardDescription>
            {t('organizations.invitation.invitedToTeam')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">{t('organizations.invitation.emailLabel')}</span>
              {invitation.email}
            </p>
            {invitation.organization && (
              <p className="text-sm">
                <span className="text-muted-foreground">{t('organizations.invitation.organizationLabel')}</span>
                {invitation.organization.name}
              </p>
            )}
            {invitation.role && (
              <p className="text-sm">
                <span className="text-muted-foreground">{t('organizations.invitation.roleLabel')}</span>
                {getRoleName(invitation.role.name)}
              </p>
            )}
          </div>

          {user?.email?.toLowerCase() !== invitation.email?.toLowerCase() && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              {t('organizations.invitation.wrongEmail').replace('{email}', invitation.email)}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={accepting || user?.email?.toLowerCase() !== invitation.email?.toLowerCase()}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('organizations.invitation.accepting')}
              </>
            ) : (
              t('organizations.invitation.accept')
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
