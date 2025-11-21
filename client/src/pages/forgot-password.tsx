import { useState } from "react";
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
import { Mail, Eye, EyeOff, Check, X } from "lucide-react";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";

const emailSchema = z.object({
  email: z.string().email("Email válido requerido"),
});

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[a-z]/, "Debe incluir minúscula")
  .regex(/[A-Z]/, "Debe incluir mayúscula")
  .regex(/[0-9]/, "Debe incluir número")
  .regex(/[^a-zA-Z0-9]/, "Debe incluir carácter especial");

const resetSchema = z.object({
  code: z.string().length(6, "El código debe ser de 6 dígitos"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useDynamicTitle("Recuperar Contraseña");

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = resetForm.watch("newPassword");

  const passwordChecks = {
    minLength: newPassword?.length >= 8,
    hasLower: /[a-z]/.test(newPassword || ''),
    hasUpper: /[A-Z]/.test(newPassword || ''),
    hasNumber: /[0-9]/.test(newPassword || ''),
    hasSpecial: /[^a-zA-Z0-9]/.test(newPassword || ''),
  };

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      await forgotPassword.mutateAsync(data.email);
      setEmail(data.email);
      setStep('reset');
      toast({
        title: "Código enviado",
        description: "Te hemos enviado un código de recuperación a tu email",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el código",
        variant: "destructive",
      });
    }
  };

  const onResetSubmit = async (data: ResetForm) => {
    try {
      await resetPassword.mutateAsync({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });

      navigate("/login");
    } catch (error: any) {
      const errorMessage = error.message || "Error al cambiar contraseña";

      if (errorMessage.includes('CodeMismatchException')) {
        toast({
          title: "Código incorrecto",
          description: "El código ingresado no es válido",
          variant: "destructive",
        });
        return;
      }

      if (errorMessage.includes('ExpiredCodeException')) {
        toast({
          title: "Código expirado",
          description: "El código ha expirado, solicita uno nuevo",
          variant: "destructive",
        });
        setStep('email');
        return;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-pink-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'email' ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Ingresa tu email para recibir un código de recuperación'
              : `Ingresa el código enviado a ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'email' ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                          disabled={forgotPassword.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-pink-primary hover:bg-pink-600 text-white"
                  size="lg"
                  disabled={forgotPassword.isPending}
                >
                  {forgotPassword.isPending ? "Enviando..." : "Enviar Código"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de verificación</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="text-center tracking-widest"
                          maxLength={6}
                          disabled={resetPassword.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nueva contraseña"
                            {...field}
                            disabled={resetPassword.isPending}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {newPassword && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-1 ${passwordChecks.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.hasLower ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.hasLower ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Una letra minúscula
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.hasUpper ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Una letra mayúscula
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Un número
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Un carácter especial
                    </div>
                  </div>
                )}

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar contraseña"
                            {...field}
                            disabled={resetPassword.isPending}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  size="lg"
                  disabled={resetPassword.isPending}
                >
                  {resetPassword.isPending ? "Actualizando..." : "Cambiar Contraseña"}
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-gray-500"
              onClick={() => navigate("/login")}
            >
              ← Volver al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
