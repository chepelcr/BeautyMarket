import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, RefreshCw } from "lucide-react";
import { signIn, getCurrentUser } from 'aws-amplify/auth';

export default function VerifyEmail() {
  const { verifyEmail, completeVerification, resendCode } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Define registration flow steps
  const steps = [
    { id: 'register', title: 'Registro', description: 'Crear cuenta' },
    { id: 'verify', title: 'Verificación', description: 'Confirmar email' },
    { id: 'organization', title: 'Organización', description: 'Crear tienda' }
  ];

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email stored, redirect to register
      navigate("/register");
    }
  }, [navigate]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: t('auth.verifyEmail.invalidCode'),
        description: t('auth.verifyEmail.invalidCodeDescription'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Verify the email with the code
      await verifyEmail.mutateAsync({ email, code });

      // Auto-login after verification
      const password = sessionStorage.getItem('verificationPassword');
      if (password) {
        await signIn({ username: email, password });
        const amplifyUser = await getCurrentUser();

        // Complete verification in backend
        const username = sessionStorage.getItem('verificationUsername') || email;
        const firstName = sessionStorage.getItem('verificationFirstName') || '';
        const lastName = sessionStorage.getItem('verificationLastName') || '';

        await completeVerification.mutateAsync({
          userId: amplifyUser.userId,
          email,
          username,
          firstName,
          lastName,
        });
      }

      // Clear session storage
      sessionStorage.removeItem('verificationEmail');
      sessionStorage.removeItem('verificationPassword');
      sessionStorage.removeItem('verificationUsername');
      sessionStorage.removeItem('verificationFirstName');
      sessionStorage.removeItem('verificationLastName');

      toast({
        title: t('auth.verifyEmail.success'),
        description: t('auth.verifyEmail.successDescription'),
      });

      // Redirect to organization creation page
      navigate("/organizations/new");
    } catch (error: any) {
      const errorMessage = error.message || t('auth.verifyEmail.error');

      if (errorMessage.includes('CodeMismatchException')) {
        toast({
          title: t('auth.verifyEmail.incorrectCode'),
          description: t('auth.verifyEmail.incorrectCodeDescription'),
          variant: "destructive",
        });
        return;
      }

      if (errorMessage.includes('ExpiredCodeException')) {
        toast({
          title: t('auth.verifyEmail.expiredCode'),
          description: t('auth.verifyEmail.expiredCodeDescription'),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('auth.verifyEmail.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await resendCode.mutateAsync(email);
      toast({
        title: t('auth.verifyEmail.resendSuccess'),
        description: t('auth.verifyEmail.resendSuccessDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.verifyEmail.resendError'),
        description: error.message || t('auth.verifyEmail.resendErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.verifyEmail.title')}
          </CardTitle>
          <CardDescription>
            {t('auth.verifyEmail.subtitle')}{" "}
            <span className="font-medium text-primary">{email}</span>
          </CardDescription>

          <ProgressSteps
            steps={steps}
            currentStep="verify"
            completedSteps={['register']}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('auth.verifyEmail.code')}</label>
            <Input
              type="text"
              placeholder={t('auth.verifyEmail.codePlaceholder')}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              disabled={verifyEmail.isPending || completeVerification.isPending}
            />
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            size="lg"
            disabled={verifyEmail.isPending || completeVerification.isPending || code.length !== 6}
          >
            {verifyEmail.isPending || completeVerification.isPending
              ? t('auth.verifyEmail.submitting')
              : t('auth.verifyEmail.submit')}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              {t('auth.verifyEmail.didntReceive')}
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? t('auth.verifyEmail.resending') : t('auth.verifyEmail.resendCode')}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-gray-500"
              onClick={() => navigate("/register")}
            >
              {t('auth.verifyEmail.backToRegister')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
