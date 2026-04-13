import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Check, X, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { buildPublicApiUrl, buildUserApiUrl } from '@/lib/apiUtils';
import { TemplatePreview } from '@/components/admin/templates/TemplatePreview';
import { TemplateCard } from '@/components/admin/templates/TemplateCard';
import { Template as ComponentTemplate } from '@/components/admin/templates/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Step 1: Organization Info Schema
const step1Schema = z.object({
  name: z.string().min(3, 'Organization name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  subdomain: z.string().min(3, 'Subdomain must be at least 3 characters').optional().or(z.literal('')),
});

// Step 2: Contact Info Schema
const step2Schema = z.object({
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

// Backend Template structure from API
interface BackendTemplate {
  id: string;
  organizationId: string;
  name: string;
  displayName?: string;
  description: string | null;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  isActive: boolean;
  sortOrder?: number;
}

// Mapper function to convert backend template to component template
const mapBackendTemplateToComponent = (template: BackendTemplate): ComponentTemplate => ({
  id: template.id,
  name: template.name,
  displayName: template.displayName || template.name,
  description: template.description || '',
  category: template.category || 'general',
  thumbnailUrl: template.thumbnailUrl || undefined,
  isActive: template.isActive,
  sortOrder: template.sortOrder || 0,
});

export default function CreateOrganization() {
  const [currentStep, setCurrentStep] = useState<'info' | 'contact' | 'template'>('info');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null); // Track created org ID
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null); // Stores template.id
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [templateToConfirm, setTemplateToConfirm] = useState<ComponentTemplate | null>(null);
  const [templates, setTemplates] = useState<ComponentTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingExistingOrg, setLoadingExistingOrg] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ComponentTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const {
    createOrganization,
    completeOnboardingStep2,
    completeOnboardingStep3,
    checkSlugAvailable,
    checkSubdomainAvailable
  } = useOrganization();
  const [, navigate] = useLocation();

  // Handler for template selection - shows confirmation dialog
  const handleTemplateSelect = (templateId: string | null) => {
    if (templateId === null) {
      // "Start from scratch" option - apply immediately without confirmation
      applyTemplate(null);
    } else {
      // Show confirmation dialog for template selection
      const template = templates.find(t => t.id === templateId);
      setTemplateToConfirm(template || null);
      setConfirmDialogOpen(true);
    }
  };

  // Handler for confirming template selection
  const handleConfirmTemplate = () => {
    if (templateToConfirm) {
      applyTemplate(templateToConfirm.id);
    }
    setConfirmDialogOpen(false);
    setTemplateToConfirm(null);
  };

  // Apply template and complete onboarding
  const applyTemplate = async (templateId: string | null) => {
    if (!user?.id || !createdOrgId || !step1Data) {
      toast({
        title: t('common.error'),
        description: 'Missing required data',
        variant: 'destructive',
      });
      return;
    }

    // If no template selected, skip to redirect
    if (!templateId) {
      toast({
        title: t('organizations.create.success'),
        description: `${step1Data.name} ${t('organizations.create.successDescription')}`,
      });

      sessionStorage.removeItem('resumeOrgId');
      sessionStorage.setItem('selectedOrgId', createdOrgId);
      navigate('/admin');
      return;
    }

    try {
      const organization = await completeOnboardingStep3.mutateAsync({
        organizationId: createdOrgId,
        userId: user.id,
        templateId,
        includeCategories: true,
      });

      setCompletedSteps(['info', 'contact', 'template']);

      const templateName = templates.find(t => t.id === templateId)?.displayName || '';
      toast({
        title: t('organizations.create.success'),
        description: `${step1Data.name} ${t('organizations.create.successDescription')} - ${templateName}`,
      });

      sessionStorage.removeItem('resumeOrgId');
      sessionStorage.setItem('selectedOrgId', organization.id);
      queryClient.setQueryData(['user-organizations', user.id], [organization]);
      queryClient.setQueryData(['default-organization', user.id], organization);

      navigate('/admin');
    } catch (error: any) {
      console.error('Error applying template:', error);
      toast({
        title: t('common.error'),
        description: error.message || 'Could not apply template',
        variant: 'destructive',
      });
    }
  };

  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'j-markets.jcampos.dev';

  const steps = [
    { id: 'info', title: 'Información Básica', description: 'Nombre y identificador' },
    { id: 'contact', title: 'Contacto', description: 'Información de contacto' },
    { id: 'template', title: 'Plantilla', description: 'Elige tu diseño' }
  ];

  // Step 1 form
  const step1Form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      slug: '',
      subdomain: '',
    },
  });

  // Step 2 form
  const step2Form = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      phone: '',
      email: '',
      address: '',
    },
  });

  const name = step1Form.watch('name');
  const slug = step1Form.watch('slug');
  const subdomain = step1Form.watch('subdomain');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load existing incomplete organization if resuming
  useEffect(() => {
    const loadExistingOrg = async () => {
      // Check if there's an orgId in sessionStorage
      const orgId = sessionStorage.getItem('resumeOrgId');

      if (!orgId || !user?.id) return;

      setLoadingExistingOrg(true);
      try {
        const response = await apiRequest('GET', buildUserApiUrl(user.id, `/organizations/${orgId}`));
        if (!response.ok) throw new Error('Failed to load organization');

        const org = await response.json();

        // Set the org ID
        setCreatedOrgId(org.id);

        // Load step 1 data
        const step1 = {
          name: org.name,
          slug: org.slug,
          subdomain: org.subdomain || '',
        };
        setStep1Data(step1);
        step1Form.reset(step1);

        // Load step 2 data if exists
        if (org.contactSettings) {
          step2Form.reset({
            email: org.contactSettings.email || '',
            phone: org.contactSettings.phone || '',
            address: org.contactSettings.address || '',
          });
        }

        // Determine current step based on onboardingStep
        const onboardingStep = org.onboardingStep || 1;
        if (onboardingStep >= 3) {
          // Already complete, redirect to org
          const subdomain = org.subdomain || org.slug;
          window.location.href = `https://${subdomain}.${baseDomain}`;
          return;
        } else if (onboardingStep === 2) {
          setCurrentStep('template');
          setCompletedSteps(['info', 'contact']);
        } else if (onboardingStep === 1) {
          setCurrentStep('contact');
          setCompletedSteps(['info']);
        }

        toast({
          title: 'Continuando configuración',
          description: `Retomando configuración de ${org.name}`,
        });
      } catch (error: any) {
        console.error('Error loading organization:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la organización',
          variant: 'destructive',
        });
      } finally {
        setLoadingExistingOrg(false);
      }
    };

    if (user && !authLoading) {
      loadExistingOrg();
    }
  }, [user, authLoading]);

  // Auto-generate slug and subdomain from name
  useEffect(() => {
    if (currentStep === 'info' && name) {
      const generated = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      step1Form.setValue('slug', generated);
      step1Form.setValue('subdomain', generated);
    }
  }, [name, currentStep]);

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
  }, [slug, checkSlugAvailable]);

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
  }, [subdomain, checkSubdomainAvailable]);

  // Load templates when reaching step 3
  useEffect(() => {
    if (currentStep === 'template' && templates.length === 0) {
      loadTemplates();
    }
  }, [currentStep]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await apiRequest('GET', buildPublicApiUrl('/templates?activeOnly=true'));
      const data: BackendTemplate[] = await response.json();
      // Map backend templates to component templates
      const mappedTemplates = data.map(mapBackendTemplateToComponent);
      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Could not load templates',
        variant: 'destructive',
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handlePreviewTemplate = (template: ComponentTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSelectFromPreview = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsPreviewOpen(false);
    toast({
      title: 'Plantilla seleccionada',
      description: 'Has seleccionado una plantilla para tu tienda',
    });
  };

  const handleStep1Submit = async (values: Step1Form) => {
    if (!slugAvailable) {
      toast({
        title: 'Error',
        description: 'The slug is not available',
        variant: 'destructive',
      });
      return;
    }

    if (values.subdomain && !subdomainAvailable) {
      toast({
        title: 'Error',
        description: 'The subdomain is not available',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create organization draft immediately (onboardingStep = 1)
      const organization = await createOrganization.mutateAsync({
        name: values.name,
        slug: values.slug,
        subdomain: values.subdomain || undefined,
        ownerId: user.id,
      });

      setCreatedOrgId(organization.id);
      setStep1Data(values);
      setCompletedSteps(['info']);
      setCurrentStep('contact');

      toast({
        title: 'Step 1 completed',
        description: 'Organization draft created successfully',
      });
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not create organization',
        variant: 'destructive',
      });
    }
  };

  const handleStep2Submit = async (values: Step2Form) => {
    if (!user?.id || !createdOrgId) {
      toast({
        title: 'Error',
        description: 'Missing organization data',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Update contact info (onboardingStep = 2)
      await completeOnboardingStep2.mutateAsync({
        organizationId: createdOrgId,
        userId: user.id,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
      });

      setCompletedSteps(['info', 'contact']);
      setCurrentStep('template');

      toast({
        title: 'Step 2 completed',
        description: 'Contact information saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save contact information',
        variant: 'destructive',
      });
    }
  };

  const goBackToStep1 = () => {
    setCurrentStep('info');
    setCompletedSteps([]);
  };

  if (authLoading || loadingExistingOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          {loadingExistingOrg && <p className="text-muted-foreground">Cargando organización...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto pt-20 pb-10 px-4 min-h-screen flex items-center relative z-10">
        <Card className="w-full bg-card/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Crea tu Organización</CardTitle>
          <CardDescription>
            Configura tu tienda en línea en 3 simples pasos
          </CardDescription>

          <ProgressSteps
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </CardHeader>
        <CardContent>
          {/* Step 1: Organization Info */}
          {currentStep === 'info' && (
            <Form {...step1Form}>
              <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                <FormField
                  control={step1Form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Organización *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Mi Tienda"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identificador (slug) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="mi-tienda"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {checkingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            {!checkingSlug && slugAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                            {!checkingSlug && slugAvailable === false && <X className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                      </FormControl>
                      {slugAvailable === false && (
                        <p className="text-sm text-red-500">Este identificador ya está en uso</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdominio</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                              placeholder="mi-tienda"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {checkingSubdomain && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                              {!checkingSubdomain && subdomainAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                              {!checkingSubdomain && subdomainAvailable === false && <X className="h-4 w-4 text-red-500" />}
                            </div>
                          </div>
                          <span className="text-muted-foreground">.{baseDomain}</span>
                        </div>
                      </FormControl>
                      {subdomainAvailable === false && (
                        <p className="text-sm text-red-500">Este subdominio ya está en uso</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Tu tienda estará disponible en {subdomain || 'tu-tienda'}.{baseDomain}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!slugAvailable || (!!subdomain && !subdomainAvailable) || createOrganization.isPending}
                >
                  {createOrganization.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Continuar
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <a href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    Volver al inicio
                  </a>
                </div>
              </form>
            </Form>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 'contact' && (
            <Form {...step2Form}>
              <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                <FormField
                  control={step2Form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="contacto@ejemplo.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step2Form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+506 8888-8888"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step2Form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="San José, Costa Rica"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={completeOnboardingStep2.isPending}
                >
                  {completeOnboardingStep2.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Continuar
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 3: Template Selection */}
          {currentStep === 'template' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{t('template.card.chooseTemplate')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('template.card.chooseTemplateDescription')}
                </p>
              </div>

              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option to skip template selection */}
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect(null)}
                    disabled={completeOnboardingStep3.isPending}
                    className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedTemplate === null
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded">
                        <Sparkles className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{t('template.card.startFromScratch')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('template.card.startFromScratchDescription')}
                        </p>
                      </div>
                      {completeOnboardingStep3.isPending && selectedTemplate === null && (
                        <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Template cards with TemplateCard component */}
                  {templates.map((template) => (
                    <div key={template.id} className="relative">
                      <TemplateCard
                        template={template}
                        onSelect={handleTemplateSelect}
                        onPreview={handlePreviewTemplate}
                        isSelected={selectedTemplate === template.id}
                        disabled={completeOnboardingStep3.isPending}
                      />
                      {completeOnboardingStep3.isPending && selectedTemplate === template.id && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onSelectTemplate={handleSelectFromPreview}
      />

      {/* Template Selection Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('template.card.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('template.card.confirmMessage')} <strong>{templateToConfirm?.displayName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('template.card.confirmNo')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTemplate}>
              {t('template.card.confirmYes')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
