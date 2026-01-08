import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
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
        title: "Password reset code sent",
        description: "Check your email for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset code",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent a verification code to{" "}
              <span className="font-medium text-primary">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => navigate("/reset-password")}
            >
              Enter Verification Code
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              Use Different Email
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you a reset code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotPassword.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={forgotPassword.isPending || !email}
            >
              {forgotPassword.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {forgotPassword.isPending ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="p-0 h-auto font-medium"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
