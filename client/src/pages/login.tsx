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
import { Eye, EyeOff, Home, Loader2 } from "lucide-react";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";

const loginSchema = z.object({
  email: z.string().email("Email válido requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { isAuthenticated, isLoading, login, forceLogout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Landing page URL for registration
  const landingUrl = import.meta.env.VITE_LANDING_URL || 'https://www.jmarkets.jcampos.dev';

  // Set dynamic page title
  useDynamicTitle("Iniciar Sesión");

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
      navigate("/admin");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login.mutateAsync(data);

      if (result.needsVerification) {
        // Redirect to landing page for verification
        toast({
          title: "Verificación requerida",
          description: "Por favor verifica tu email en la página principal",
        });
        window.location.href = `${landingUrl}/register`;
        return;
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta",
      });
      navigate("/admin");
    } catch (error: any) {
      const errorMessage = error.message || "Credenciales incorrectas";

      // Handle specific Cognito errors
      if (errorMessage.includes('UserNotConfirmedException')) {
        toast({
          title: "Verificación requerida",
          description: "Por favor verifica tu email antes de iniciar sesión",
        });
        window.location.href = `${landingUrl}/register`;
        return;
      }

      toast({
        title: "Error de inicio de sesión",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Back to Home Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        onClick={() => window.location.href = landingUrl}
      >
        <Home className="w-4 h-4 mr-2" />
        Volver al inicio
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-pink-primary">
            Administración
          </CardTitle>
          <CardDescription className="text-center">
            Panel de control de tu tienda
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
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
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
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
                className="w-full bg-pink-primary hover:bg-pink-600 text-white"
                disabled={login.isPending}
              >
                {login.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {login.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-pink-primary hover:text-pink-600"
                onClick={() => navigate("/forgot-password")}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <div>
              <span className="text-muted-foreground">
                ¿No tienes cuenta?{" "}
              </span>
              <a
                href={`${landingUrl}/register`}
                className="font-medium text-pink-primary hover:text-pink-600"
              >
                Regístrate
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
