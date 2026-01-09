import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Check, X, Building2 } from 'lucide-react';

export default function CreateOrganization() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { createOrganization, checkSlugAvailable, checkSubdomainAvailable } = useOrganization();
  const [, navigate] = useLocation();

  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'jmarkets.jcampos.dev';

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/register');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Auto-generate slug from name
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
    setSubdomain(generatedSlug);
  }, [name]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      const available = await checkSlugAvailable(slug);
      setSlugAvailable(available);
      setCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Check subdomain availability with debounce
  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSubdomain(true);
      const available = await checkSubdomainAvailable(subdomain);
      setSubdomainAvailable(available);
      setCheckingSubdomain(false);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: t('organizations.create.error'),
        description: t('organizations.create.errorDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (!slugAvailable) {
      toast({
        title: t('organizations.create.error'),
        description: t('organizations.create.slugTaken'),
        variant: 'destructive',
      });
      return;
    }

    if (subdomain && !subdomainAvailable) {
      toast({
        title: t('organizations.create.error'),
        description: t('organizations.create.subdomainTaken'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const organization = await createOrganization.mutateAsync({
        name,
        slug,
        subdomain: subdomain || undefined,
        ownerId: user.id,
      });

      toast({
        title: t('organizations.create.success'),
        description: t('organizations.create.successDescription'),
      });

      // Store selected organization in localStorage and navigate to admin
      localStorage.setItem('selectedOrganization', JSON.stringify(organization));
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: t('organizations.create.error'),
        description: error.message || t('organizations.create.errorDescription'),
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          <CardTitle className="text-2xl">{t('organizations.create.title')}</CardTitle>
          <CardDescription>
            {t('organizations.create.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('organizations.create.name')} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('organizations.create.namePlaceholder')}
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t('organizations.create.slug')} *</Label>
              <div className="relative">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder={t('organizations.create.slugPlaceholder')}
                  required
                  minLength={3}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!checkingSlug && slugAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                  {!checkingSlug && slugAvailable === false && <X className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {slugAvailable === false && (
                <p className="text-sm text-red-500">{t('organizations.create.slugTaken')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">{t('organizations.create.subdomain')}</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={t('organizations.create.slugPlaceholder')}
                    minLength={3}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingSubdomain && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!checkingSubdomain && subdomainAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                    {!checkingSubdomain && subdomainAvailable === false && <X className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                <span className="text-muted-foreground">.{baseDomain}</span>
              </div>
              {subdomainAvailable === false && (
                <p className="text-sm text-red-500">{t('organizations.create.subdomainTaken')}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t('organizations.create.subdomainDescription')} {subdomain || 'your-store'}.{baseDomain}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createOrganization.isPending || !slugAvailable || (!!subdomain && !subdomainAvailable)}
            >
              {createOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('organizations.create.submitting')}
                </>
              ) : (
                t('organizations.create.submit')
              )}
            </Button>

            <div className="text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {t('organizations.select.backToHome')}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
