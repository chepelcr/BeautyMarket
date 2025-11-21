import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw } from "lucide-react";
import { signIn, getCurrentUser } from 'aws-amplify/auth';

export default function VerifyEmail() {
  const { verifyEmail, completeVerification, resendCode } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

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
        title: "Invalid code",
        description: "Please enter the 6-digit code",
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
        title: "Email verified",
        description: "Your account has been verified successfully",
      });

      // Redirect to organization creation page
      navigate("/organizations/new");
    } catch (error: any) {
      const errorMessage = error.message || "Verification error";

      if (errorMessage.includes('CodeMismatchException')) {
        toast({
          title: "Incorrect code",
          description: "The code entered is not valid",
          variant: "destructive",
        });
        return;
      }

      if (errorMessage.includes('ExpiredCodeException')) {
        toast({
          title: "Code expired",
          description: "The code has expired, request a new one",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verification error",
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
        title: "Code resent",
        description: "We have sent a new verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not resend code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify your Email
          </CardTitle>
          <CardDescription>
            We have sent a 6-digit code to{" "}
            <span className="font-medium text-primary">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification code</label>
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
            className="w-full"
            size="lg"
            disabled={verifyEmail.isPending || completeVerification.isPending || code.length !== 6}
          >
            {verifyEmail.isPending || completeVerification.isPending
              ? "Verifying..."
              : "Verify Email"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? "Resending..." : "Resend code"}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-gray-500"
              onClick={() => navigate("/register")}
            >
              Back to registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
