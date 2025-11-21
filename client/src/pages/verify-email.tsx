import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw } from "lucide-react";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import { signIn, getCurrentUser } from 'aws-amplify/auth';

export default function VerifyEmail() {
  const { verifyEmail, completeVerification, resendCode } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useDynamicTitle("Verificar Email");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email stored, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor ingresa el código de 6 dígitos",
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
        const gender = sessionStorage.getItem('verificationGender') || undefined;
        const genderOther = sessionStorage.getItem('verificationGenderOther') || undefined;

        await completeVerification.mutateAsync({
          userId: amplifyUser.userId,
          email,
          username,
          firstName,
          lastName,
          gender,
          genderOther,
        });
      }

      // Clear session storage
      sessionStorage.removeItem('verificationEmail');
      sessionStorage.removeItem('verificationPassword');
      sessionStorage.removeItem('verificationUsername');
      sessionStorage.removeItem('verificationFirstName');
      sessionStorage.removeItem('verificationLastName');
      sessionStorage.removeItem('verificationGender');
      sessionStorage.removeItem('verificationGenderOther');

      toast({
        title: "Email verificado",
        description: "Tu cuenta ha sido verificada exitosamente",
      });

      navigate("/admin");
    } catch (error: any) {
      const errorMessage = error.message || "Error al verificar";

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
        return;
      }

      toast({
        title: "Error de verificación",
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
        title: "Código reenviado",
        description: "Te hemos enviado un nuevo código de verificación",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reenviar el código",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
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
            Verifica tu Email
          </CardTitle>
          <CardDescription>
            Te hemos enviado un código de 6 dígitos a{" "}
            <span className="font-medium text-pink-primary">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Código de verificación</label>
            <Input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              disabled={verifyEmail.isPending || completeVerification.isPending}
            />
          </div>

          <Button
            onClick={handleVerify}
            className="w-full bg-pink-primary hover:bg-pink-600 text-white"
            size="lg"
            disabled={verifyEmail.isPending || completeVerification.isPending || code.length !== 6}
          >
            {verifyEmail.isPending || completeVerification.isPending
              ? "Verificando..."
              : "Verificar Email"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              ¿No recibiste el código?
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? "Reenviando..." : "Reenviar código"}
            </Button>
          </div>

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
