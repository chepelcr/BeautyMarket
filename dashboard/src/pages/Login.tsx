import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading, login, forceLogout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Force logout on page load to clear stale sessions
  useEffect(() => {
    forceLogout();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/organizations/select");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login.mutateAsync(data);

      if (result.needsVerification) {
        // Store email for verification page
        sessionStorage.setItem('verificationEmail', data.email);
        sessionStorage.setItem('verificationPassword', data.password);
        navigate("/verify-email");
        return;
      }

      toast({
        title: t('auth.login.success'),
        description: t('auth.login.successDescription'),
      });
      navigate("/organizations/select");
    } catch (error: any) {
      const errorMessage = error.message || "Invalid credentials";

      // Handle specific Cognito errors
      if (errorMessage.includes('UserNotConfirmedException')) {
        sessionStorage.setItem('verificationEmail', data.email);
        sessionStorage.setItem('verificationPassword', data.password);
        navigate("/verify-email");
        return;
      }

      toast({
        title: t('auth.login.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card dark:bg-slate-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.login.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('auth.login.emailPlaceholder')}
                        {...field}
                        disabled={login.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.password')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t('auth.login.passwordPlaceholder')}
                          {...field}
                          disabled={login.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={login.isPending}
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

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={login.isPending}
              >
                {login.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('auth.login.submit')}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary"
                onClick={() => navigate("/forgot-password")}
              >
                {t('auth.login.forgotPassword')}
              </Button>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t('auth.login.noAccount')}{" "}
              </span>
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary"
                onClick={() => navigate("/register")}
              >
                {t('auth.login.register')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
