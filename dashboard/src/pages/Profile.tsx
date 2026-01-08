import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, Mail, Lock, Eye, EyeOff, Edit, ArrowLeft, RotateCcw, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { t } = useLanguage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [securityOption, setSecurityOption] = useState<'menu' | 'changePassword' | 'forgotPassword'>('menu');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const { toast } = useToast();

  // Set dynamic page title
  useDynamicTitle(t('profile.title'));

  // Get current user data
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form schemas with translations
  const profileUpdateSchema = z.object({
    firstName: z.string().min(1, t('profile.firstNameRequired')),
    lastName: z.string().min(1, t('profile.lastNameRequired')),
    email: z.string().email(t('profile.emailInvalid')),
    username: z.string().min(3, t('profile.usernameRequired')).regex(/^[a-zA-Z0-9_]+$/, t('profile.usernameFormat')),
  });

  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, t('profile.currentPasswordRequired')),
    newPassword: z.string().min(6, t('profile.newPasswordRequired')),
    confirmPassword: z.string().min(1, t('profile.confirmPasswordRequired')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('profile.passwordMismatch'),
    path: ["confirmPassword"],
  });

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('profile.emailInvalid')),
  });

  type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
  type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
  type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiRequest('GET', '/api/user');
        setUser(await response.json());
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Profile update form
  const profileForm = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
    },
  });

  // Change password form
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Update form default values when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
      });
      forgotPasswordForm.setValue("email", user.email || "");
    }
  }, [user, profileForm, forgotPasswordForm]);

  const handleProfileUpdate = async (data: ProfileUpdateForm) => {
    setIsUpdatingProfile(true);
    try {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      await response.json();
      toast({
        title: t('profile.updated'),
        description: t('profile.updatedDescription'),
      });
      // Reload user data
      const userResponse = await apiRequest('GET', '/api/user');
      setUser(await userResponse.json());
      setIsEditingProfile(false);
    } catch (error: any) {
      toast({
        title: t('profile.updateError'),
        description: error.message || t('profile.updateErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (data: ChangePasswordForm) => {
    setIsChangingPassword(true);
    try {
      const response = await apiRequest("POST", "/api/user/change-password", data);
      await response.json();
      toast({
        title: t('profile.passwordChanged'),
        description: t('profile.passwordChangedDescription'),
      });
      passwordForm.reset();
      setSecurityOption('menu');
    } catch (error: any) {
      toast({
        title: t('profile.passwordChangeError'),
        description: error.message || t('profile.passwordChangeErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setIsSendingResetEmail(true);
    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      await response.json();
      toast({
        title: t('profile.emailSent'),
        description: t('profile.emailSentDescription'),
      });
      setSecurityOption('menu');
    } catch (error: any) {
      toast({
        title: t('profile.emailSendError'),
        description: error.message || t('profile.emailSendErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-5 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-5">
            <div className="text-lg">{t('profile.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <User className="w-8 h-8 text-pink-primary" />
              <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {/* Profile Information */}
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-pink-primary" />
                      <CardTitle className="text-gray-900 dark:text-white">{t('profile.personalInfo')}</CardTitle>
                    </div>
                    {!isEditingProfile && (
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                        size="sm"
                        className="text-pink-primary border-pink-primary hover:bg-pink-50 dark:hover:bg-pink-900/20"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t('profile.edit')}
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {isEditingProfile ? t('profile.updateInfo') : t('profile.contactInfo')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isEditingProfile ? (
                    // Display mode
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.firstName')}</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {user?.firstName || t('profile.notSpecified')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.lastName')}</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {user?.lastName || t('profile.notSpecified')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.email')}</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user?.email || t('profile.notSpecified')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.username')}</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {user?.username || t('profile.notSpecified')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Edit mode
                    <Form {...profileForm}>
                      <form
                        onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
                        className="space-y-4"
                      >
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.firstName')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('profile.firstNamePlaceholder')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.lastName')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('profile.lastNamePlaceholder')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.username')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('profile.usernamePlaceholder')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.email')}</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder={t('profile.emailPlaceholder')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="flex-1 bg-pink-primary hover:bg-pink-600"
                          >
                            {isUpdatingProfile ? t('profile.saving') : t('profile.saveChanges')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditingProfile(false);
                              profileForm.reset({
                                firstName: user?.firstName || "",
                                lastName: user?.lastName || "",
                                email: user?.email || "",
                                username: user?.username || "",
                              });
                            }}
                          >
                            {t('profile.cancel')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>

              {/* Security Section */}
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-pink-primary" />
                    <CardTitle className="text-gray-900 dark:text-white">{t('profile.security')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('profile.securityDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {securityOption === 'menu' && (
                    // Security options menu
                    <div className="space-y-4">
                      <Button
                        onClick={() => setSecurityOption('changePassword')}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-4 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-pink-primary" />
                          <div>
                            <div className="font-medium">{t('profile.changePassword')}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('profile.changePasswordDescription')}
                            </div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        onClick={() => setSecurityOption('forgotPassword')}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-4 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <RotateCcw className="w-5 h-5 text-pink-primary" />
                          <div>
                            <div className="font-medium">{t('profile.resetPassword')}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('profile.resetPasswordDescription')}
                            </div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  )}

                  {securityOption === 'changePassword' && (
                    // Change password form
                    <div className="space-y-4">
                      <Button
                        onClick={() => setSecurityOption('menu')}
                        variant="ghost"
                        size="sm"
                        className="mb-4"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('profile.back')}
                      </Button>

                      <Form {...passwordForm}>
                        <form
                          onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                          className="space-y-4"
                        >
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.currentPassword')}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showCurrentPassword ? "text" : "password"}
                                      placeholder={t('profile.currentPasswordPlaceholder')}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                      {showCurrentPassword ? (
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

                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.newPassword')}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showNewPassword ? "text" : "password"}
                                      placeholder={t('profile.newPasswordPlaceholder')}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3"
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

                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showConfirmPassword ? "text" : "password"}
                                      placeholder={t('profile.confirmPasswordPlaceholder')}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3"
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
                            disabled={isChangingPassword}
                            className="w-full bg-pink-primary hover:bg-pink-600"
                          >
                            {isChangingPassword ? t('profile.saving') : t('profile.changePassword')}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}

                  {securityOption === 'forgotPassword' && (
                    // Forgot password form
                    <div className="space-y-4">
                      <Button
                        onClick={() => setSecurityOption('menu')}
                        variant="ghost"
                        size="sm"
                        className="mb-4"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('profile.back')}
                      </Button>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {t('profile.resetPasswordInfo')}
                      </div>

                      <Form {...forgotPasswordForm}>
                        <form
                          onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}
                          className="space-y-4"
                        >
                          <FormField
                            control={forgotPasswordForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.email')}</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder={t('profile.emailPlaceholder')} readOnly />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={isSendingResetEmail}
                            className="w-full bg-pink-primary hover:bg-pink-600"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {isSendingResetEmail ? t('profile.saving') : t('profile.sendResetLink')}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
