import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const { forgotPassword } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t('common.error'),
        description: t('auth.login.email'),
        variant: "destructive",
      });
      return;
    }

    try {
      await forgotPassword.mutateAsync(email);
      setSubmitted(true);

      // Store email for reset password page
      sessionStorage.setItem('resetPasswordEmail', email);

      toast({
        title: t('auth.forgotPassword.success'),
        description: t('auth.forgotPassword.successDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.forgotPassword.error'),
        description: error.message || t('auth.forgotPassword.error'),
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t('auth.forgotPassword.checkEmail.title')}
            </CardTitle>
            <CardDescription>
              {t('auth.forgotPassword.checkEmail.subtitle')}{" "}
              <span className="font-medium text-primary">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full btn-primary"
              onClick={() => navigate("/reset-password")}
            >
              {t('auth.forgotPassword.checkEmail.enterCode')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              {t('auth.forgotPassword.checkEmail.differentEmail')}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('auth.forgotPassword.backToLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.forgotPassword.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.forgotPassword.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotPassword.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={forgotPassword.isPending || !email}
            >
              {forgotPassword.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {forgotPassword.isPending ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('auth.forgotPassword.backToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
