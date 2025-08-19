import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Mail, Lock, Eye, EyeOff, Edit, ArrowLeft, RotateCcw, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";

// Form schemas
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido"),
  lastName: z.string().min(1, "Apellido es requerido"),
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function Profile() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [securityOption, setSecurityOption] = useState<'menu' | 'changePassword' | 'forgotPassword'>('menu');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  // Set dynamic page title
  useDynamicTitle("Mi Perfil");

  // Get current user data
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/user"],
  });

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

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateForm) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar tu perfil",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      const response = await apiRequest("POST", "/api/user/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña cambiada",
        description: "Tu contraseña ha sido actualizada exitosamente",
      });
      passwordForm.reset();
      setSecurityOption('menu');
    },
    onError: (error: any) => {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message || "No se pudo cambiar tu contraseña",
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "Revisa tu email para instrucciones de restablecimiento",
      });
      setSecurityOption('menu');
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar email",
        description: error.message || "No se pudo enviar el email de restablecimiento",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="py-5 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-5">
            <div className="text-lg">Cargando información del perfil...</div>
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
              <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {/* Profile Information */}
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-pink-primary" />
                      <CardTitle className="text-gray-900 dark:text-white">Información Personal</CardTitle>
                    </div>
                    {!isEditingProfile && (
                      <Button 
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                        size="sm"
                        className="text-pink-primary border-pink-primary hover:bg-pink-50 dark:hover:bg-pink-900/20"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {isEditingProfile ? "Actualiza tu información personal" : "Tu información de contacto"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isEditingProfile ? (
                    // Display mode
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {user?.firstName || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Apellido</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {user?.lastName || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user?.email || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuario</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {user?.username || "No especificado"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Edit mode
                    <Form {...profileForm}>
                      <form
                        onSubmit={profileForm.handleSubmit((data) =>
                          updateProfileMutation.mutate(data)
                        )}
                        className="space-y-4"
                      >
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Tu nombre" />
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
                              <FormLabel>Apellido</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Tu apellido" />
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
                              <FormLabel>Nombre de Usuario</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="tu_usuario" />
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
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="tu@email.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="flex-1 bg-pink-primary hover:bg-pink-600"
                          >
                            {updateProfileMutation.isPending ? "Actualizando..." : "Guardar Cambios"}
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
                            Cancelar
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
                    <CardTitle className="text-gray-900 dark:text-white">Seguridad</CardTitle>
                  </div>
                  <CardDescription>
                    Gestiona tu contraseña y configuración de seguridad
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
                            <div className="font-medium">Cambiar Contraseña</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Actualiza tu contraseña actual
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
                            <div className="font-medium">Restablecer Contraseña</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Enviar enlace de restablecimiento por email
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
                        Volver
                      </Button>
                      
                      <Form {...passwordForm}>
                        <form
                          onSubmit={passwordForm.handleSubmit((data) =>
                            changePasswordMutation.mutate(data)
                          )}
                          className="space-y-4"
                        >
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contraseña Actual</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showCurrentPassword ? "text" : "password"}
                                      placeholder="Tu contraseña actual"
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
                                <FormLabel>Nueva Contraseña</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showNewPassword ? "text" : "password"}
                                      placeholder="Tu nueva contraseña"
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
                                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showConfirmPassword ? "text" : "password"}
                                      placeholder="Confirma tu nueva contraseña"
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
                            disabled={changePasswordMutation.isPending}
                            className="w-full bg-pink-primary hover:bg-pink-600"
                          >
                            {changePasswordMutation.isPending ? "Cambiando..." : "Cambiar Contraseña"}
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
                        Volver
                      </Button>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Te enviaremos un enlace para restablecer tu contraseña al email asociado con tu cuenta.
                      </div>
                      
                      <Form {...forgotPasswordForm}>
                        <form
                          onSubmit={forgotPasswordForm.handleSubmit((data) =>
                            forgotPasswordMutation.mutate(data)
                          )}
                          className="space-y-4"
                        >
                          <FormField
                            control={forgotPasswordForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="tu@email.com" readOnly />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={forgotPasswordMutation.isPending}
                            className="w-full bg-pink-primary hover:bg-pink-600"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
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