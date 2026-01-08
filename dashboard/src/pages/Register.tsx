import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { Loader2, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';

// AWS Cognito password policy: min 8 chars, uppercase, lowercase, number, special char
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  gender: z.string().optional(),
  genderOther: z.string().optional(),
}).refine((data) => {
  // If gender is "other", genderOther must be provided
  if (data.gender === 'other' && !data.genderOther?.trim()) {
    return false;
  }
  return true;
}, {
  message: 'Please specify your gender',
  path: ['genderOther'],
});

const step2Schema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { register, forceLogout } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<'info' | 'password' | 'verify'>('info');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Create localized steps
  const localizedSteps = [
    { id: 'info', title: t('auth.register.steps.personalInfo'), description: t('auth.register.steps.personalInfoDesc') },
    { id: 'password', title: t('auth.register.steps.security'), description: t('auth.register.steps.securityDesc') },
    { id: 'verify', title: t('auth.register.steps.verify'), description: t('auth.register.steps.verifyDesc') }
  ];

  // Step 1 form (Personal Info)
  const step1Form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      genderOther: '',
    },
  });

  // Step 2 form (Password)
  const step2Form = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const currentPassword = step2Form.watch('password') || '';

  // Force logout when registration page loads to clear any stale sessions
  useEffect(() => {
    forceLogout();
  }, [forceLogout]);

  const handleStep1Submit = (values: Step1Form) => {
    setStep1Data(values);
    setCompletedSteps(['info']);
    setCurrentStep('password');
  };

  const handleStep2Submit = async (values: Step2Form) => {
    if (!step1Data) {
      toast({
        title: t('common.error'),
        description: t('auth.register.completeStep1'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const fullRegistrationData = {
        ...step1Data,
        ...values,
      };

      const result = await register.mutateAsync(fullRegistrationData);

      setCompletedSteps(['info', 'password']);

      // Check if verification is needed
      if (result?.needsVerification) {
        setCurrentStep('verify');

        // Store verification data in session storage
        sessionStorage.setItem('verificationEmail', step1Data.email);
        sessionStorage.setItem('verificationPassword', values.password);
        if (step1Data.gender) {
          sessionStorage.setItem('verificationGender', step1Data.gender);
        }
        if (step1Data.genderOther) {
          sessionStorage.setItem('verificationGenderOther', step1Data.genderOther);
        }

        toast({
          title: t('auth.register.success'),
          description: t('auth.register.successDescription'),
        });
        navigate("/verify-email");
      } else {
        // Registration complete, redirect to organization selection
        setCompletedSteps(['info', 'password', 'verify']);
        navigate("/organizations/select");
        toast({
          title: t('auth.register.complete'),
          description: t('auth.register.completeDescription'),
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('auth.register.error'),
        variant: 'destructive',
      });
    }
  };

  const goBackToStep1 = () => {
    setCurrentStep('info');
    setCompletedSteps([]);
  };

  // Pre-populate step1 form if we have data and user goes back
  useEffect(() => {
    if (step1Data && currentStep === 'info') {
      step1Form.reset(step1Data);
    }
  }, [step1Data, currentStep, step1Form]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800">
        <CardHeader className="space-y-4">
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t('auth.register.title')}
            </CardTitle>
            <CardDescription>
              {t('auth.register.subtitle')}
            </CardDescription>
          </div>

          {/* Progress Steps */}
          <ProgressSteps
            steps={localizedSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </CardHeader>
        <CardContent>
          {/* Step 1: Personal Information */}
          {currentStep === 'info' && (
            <Form {...step1Form}>
              <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={step1Form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.firstName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('auth.register.firstNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.lastName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('auth.register.lastNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step1Form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.register.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.register.emailPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.register.gender')}</FormLabel>
                      <FormControl>
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('auth.register.gender.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{t('auth.register.gender.male')}</SelectItem>
                            <SelectItem value="female">{t('auth.register.gender.female')}</SelectItem>
                            <SelectItem value="other">{t('auth.register.gender.other')}</SelectItem>
                            <SelectItem value="prefer_not_to_say">{t('auth.register.gender.preferNotToSay')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {step1Form.watch('gender') === 'other' && (
                  <FormField
                    control={step1Form.control}
                    name="genderOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.gender.otherPlaceholder')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Please specify..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full btn-primary">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {t('auth.register.continue')}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: Password Setup */}
          {currentStep === 'password' && (
            <Form {...step2Form}>
              <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                <FormField
                  control={step2Form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.register.password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.register.passwordPlaceholder')}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Strength Indicator */}
                {currentPassword && (
                  <PasswordStrengthIndicator password={currentPassword} className="mt-4" />
                )}

                <FormField
                  control={step2Form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.register.confirmPassword')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('auth.register.confirmPasswordPlaceholder')}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBackToStep1}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('auth.register.back')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={register.isPending}
                  >
                    {register.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('auth.register.createAccount')}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Sign In Link */}
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {t('auth.register.hasAccount')}{' '}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary"
              onClick={() => navigate("/login")}
            >
              {t('auth.register.signIn')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
