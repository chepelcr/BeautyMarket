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
import { Lock, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";

// Password requirements for AWS Cognito
const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[a-z]/, "Must include lowercase")
  .regex(/[A-Z]/, "Must include uppercase")
  .regex(/[0-9]/, "Must include number")
  .regex(/[^a-zA-Z0-9]/, "Must include special character");

const resetPasswordSchema = z.object({
  code: z.string().min(1, "Verification code required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [, navigate] = useLocation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("newPassword");

  // Password strength indicators
  const passwordChecks = {
    minLength: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };

  // Get email from session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetPasswordEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email stored, redirect to forgot password
      toast({
        title: "No reset session",
        description: "Please request a password reset first",
        variant: "destructive",
      });
      navigate("/forgot-password");
    }
  }, [navigate, toast]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please request a new reset code.",
        variant: "destructive",
      });
      navigate("/forgot-password");
      return;
    }

    try {
      await resetPassword.mutateAsync({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });

      // Clear stored email
      sessionStorage.removeItem('resetPasswordEmail');

      toast({
        title: "Password reset successful",
        description: "Your password has been changed. You can now log in.",
      });

      // Redirect to login after 1 second
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to reset password";

      if (errorMessage.includes('CodeMismatchException')) {
        toast({
          title: "Invalid code",
          description: "The verification code is incorrect",
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

      if (errorMessage.includes('LimitExceededException')) {
        toast({
          title: "Too many attempts",
          description: "Please wait a moment before trying again",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Reset error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter the verification code and your new password
            {email && (
              <>
                {" "}for{" "}
                <span className="font-medium text-primary">{email}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter the code from your email"
                        disabled={resetPassword.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Create a new password"
                          disabled={resetPassword.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
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

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-1 ${passwordChecks.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordChecks.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Minimum 8 characters
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.hasLower ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordChecks.hasLower ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    One lowercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordChecks.hasUpper ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    One uppercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordChecks.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    One number
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordChecks.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    One special character
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          disabled={resetPassword.isPending}
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

              <Button
                type="submit"
                disabled={resetPassword.isPending}
                className="w-full"
              >
                {resetPassword.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {resetPassword.isPending ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={() => navigate("/login")}
                >
                  Back to login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
