import { useState, useEffect, useRef } from "react";
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
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const hasCheckedVerification = useRef(false);

  useEffect(() => {
    // Only run verification check once
    if (hasCheckedVerification.current) {
      return;
    }
    hasCheckedVerification.current = true;

    const checkVerificationStatus = async () => {
      const storedEmail = sessionStorage.getItem('verificationEmail');
      if (!storedEmail) {
        // No email stored, redirect to register
        navigate("/register");
        return;
      }

      setEmail(storedEmail);

      // Check if user is already verified
      const storedPassword = sessionStorage.getItem('verificationPassword');
      if (storedPassword) {
        try {
          // Try to sign in - if successful, email is verified
          const result = await signIn({ username: storedEmail, password: storedPassword });

          // If we get here without CONFIRM_SIGN_UP step, user is verified
          if (result.nextStep?.signInStep !== 'CONFIRM_SIGN_UP') {
            console.log('✓ Email already verified, completing flow...');

            // User is already verified, complete the flow
            const amplifyUser = await getCurrentUser();

            // Complete verification in backend
            await completeVerification.mutateAsync({
              userId: amplifyUser.userId,
              email: storedEmail,
              username: sessionStorage.getItem('verificationUsername') || '',
              firstName: sessionStorage.getItem('verificationFirstName') || '',
              lastName: sessionStorage.getItem('verificationLastName') || '',
            });

            // Clear session storage
            sessionStorage.removeItem('verificationEmail');
            sessionStorage.removeItem('verificationPassword');
            sessionStorage.removeItem('verificationUsername');
            sessionStorage.removeItem('verificationFirstName');
            sessionStorage.removeItem('verificationLastName');

            // Show info message
            toast({
              title: "Email already verified",
              description: "Redirecting to login...",
            });

            // Redirect to login
            navigate('/login');
            return;
          } else {
            console.log('User still needs to verify email - showing form');
          }
        } catch (error: any) {
          const errorMessage = error.message || '';

          // Check if user is already signed in - this means they're verified
          if (errorMessage.includes('There is already a signed in user')) {
            console.log('✓ User already signed in (verified), completing flow...');

            try {
              const amplifyUser = await getCurrentUser();

              await completeVerification.mutateAsync({
                userId: amplifyUser.userId,
                email: storedEmail,
                username: sessionStorage.getItem('verificationUsername') || '',
                firstName: sessionStorage.getItem('verificationFirstName') || '',
                lastName: sessionStorage.getItem('verificationLastName') || '',
              });

              sessionStorage.removeItem('verificationEmail');
              sessionStorage.removeItem('verificationPassword');
              sessionStorage.removeItem('verificationUsername');
              sessionStorage.removeItem('verificationFirstName');
              sessionStorage.removeItem('verificationLastName');

              toast({
                title: "Email already verified",
                description: "Redirecting to login...",
              });

              navigate('/login');
              return;
            } catch (completeError) {
              console.error('Error completing verification:', completeError);
            }
          }

          // Check if it's an "already confirmed" error
          if (errorMessage.includes('Current status is CONFIRMED') ||
              errorMessage.includes('User is already confirmed')) {
            console.log('✓ Email already verified (detected from error), completing flow...');

            try {
              const amplifyUser = await getCurrentUser();

              await completeVerification.mutateAsync({
                userId: amplifyUser.userId,
                email: storedEmail,
                username: sessionStorage.getItem('verificationUsername') || '',
                firstName: sessionStorage.getItem('verificationFirstName') || '',
                lastName: sessionStorage.getItem('verificationLastName') || '',
              });

              sessionStorage.removeItem('verificationEmail');
              sessionStorage.removeItem('verificationPassword');
              sessionStorage.removeItem('verificationUsername');
              sessionStorage.removeItem('verificationFirstName');
              sessionStorage.removeItem('verificationLastName');

              toast({
                title: "Email already verified",
                description: "Redirecting to login...",
              });

              navigate('/login');
              return;
            } catch (completeError) {
              console.error('Error completing verification:', completeError);
            }
          }

          // Other errors - user needs to verify
          console.log('Sign-in check failed, showing verification form:', errorMessage);
        }
      }

      setIsCheckingVerification(false);
    };

    checkVerificationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code",
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

        // Complete verification in backend (backend will fetch data from Cognito)
        await completeVerification.mutateAsync({
          userId: amplifyUser.userId,
          email,
          username: sessionStorage.getItem('verificationUsername') || '',
          firstName: sessionStorage.getItem('verificationFirstName') || '',
          lastName: sessionStorage.getItem('verificationLastName') || '',
        });
      }

      // Clear session storage
      sessionStorage.removeItem('verificationEmail');
      sessionStorage.removeItem('verificationPassword');
      sessionStorage.removeItem('verificationUsername');
      sessionStorage.removeItem('verificationFirstName');
      sessionStorage.removeItem('verificationLastName');

      toast({
        title: "Email verified!",
        description: "Your account has been verified. You can now log in.",
      });

      // Redirect to login
      navigate("/login");
    } catch (error: any) {
      const errorMessage = error.message || "Verification error";

      if (errorMessage.includes('CodeMismatchException')) {
        toast({
          title: "Incorrect code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (errorMessage.includes('ExpiredCodeException')) {
        toast({
          title: "Code expired",
          description: "The verification code has expired. Please request a new one.",
          variant: "destructive",
        });
        return;
      }

      // Handle already verified error - complete verification flow
      if (errorMessage.includes('Current status is CONFIRMED') ||
          errorMessage.includes('User cannot be confirmed') ||
          errorMessage.includes('User is already confirmed')) {
        toast({
          title: "Email already verified",
          description: "Your email is already verified. Redirecting to login...",
        });

        // Complete verification flow since email is already verified
        try {
          const password = sessionStorage.getItem('verificationPassword');
          if (password) {
            await signIn({ username: email, password });
            const amplifyUser = await getCurrentUser();

            // Complete verification in backend
            await completeVerification.mutateAsync({
              userId: amplifyUser.userId,
              email,
              username: sessionStorage.getItem('verificationUsername') || '',
              firstName: sessionStorage.getItem('verificationFirstName') || '',
              lastName: sessionStorage.getItem('verificationLastName') || '',
            });

            // Clear session storage
            sessionStorage.removeItem('verificationEmail');
            sessionStorage.removeItem('verificationPassword');
            sessionStorage.removeItem('verificationUsername');
            sessionStorage.removeItem('verificationFirstName');
            sessionStorage.removeItem('verificationLastName');

            // Redirect to login
            navigate('/login');
          } else {
            // No password stored, redirect to login
            navigate('/login');
          }
        } catch (completeError) {
          console.error('Error completing verification:', completeError);
          navigate('/login');
        }
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
        description: "A new verification code has been sent to your email",
      });
    } catch (error: any) {
      const errorMessage = error.message || '';

      // Handle already verified error - complete verification flow
      if (errorMessage.includes('Current status is CONFIRMED') ||
          errorMessage.includes('User cannot be confirmed')) {
        toast({
          title: "Email already verified",
          description: "Your email is already verified. Redirecting to login...",
        });

        // Complete verification flow - sign in and sync to backend
        try {
          const password = sessionStorage.getItem('verificationPassword');
          if (password) {
            await signIn({ username: email, password });
            const amplifyUser = await getCurrentUser();

            // Complete verification in backend
            await completeVerification.mutateAsync({
              userId: amplifyUser.userId,
              email,
              username: sessionStorage.getItem('verificationUsername') || '',
              firstName: sessionStorage.getItem('verificationFirstName') || '',
              lastName: sessionStorage.getItem('verificationLastName') || '',
            });

            // Clear session storage
            sessionStorage.removeItem('verificationEmail');
            sessionStorage.removeItem('verificationPassword');
            sessionStorage.removeItem('verificationUsername');
            sessionStorage.removeItem('verificationFirstName');
            sessionStorage.removeItem('verificationLastName');

            // Redirect to login
            navigate('/login');
          } else {
            // No password stored, redirect to login
            navigate('/login');
          }
        } catch (completeError) {
          console.error('Error completing verification:', completeError);
          navigate('/login');
        }
        return;
      }

      toast({
        title: "Resend error",
        description: errorMessage || "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Show loading while checking verification status
  if (isCheckingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We've sent a verification code to{" "}
            <span className="font-medium text-primary">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Code</label>
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
              {isResending ? "Resending..." : "Resend Code"}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-gray-500"
              onClick={() => navigate("/register")}
            >
              Back to register
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
