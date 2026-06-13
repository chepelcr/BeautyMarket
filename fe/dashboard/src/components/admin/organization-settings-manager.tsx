import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

// Import settings form components
import ThemeSettingsForm, { type ThemeSettingsFormValues } from "./settings/ThemeSettingsForm";
import ContactSettingsForm, { type ContactSettingsFormValues } from "./settings/ContactSettingsForm";
import PaymentSettingsForm from "./settings/PaymentSettingsForm";
import ShippingSettingsForm from "./settings/ShippingSettingsForm";

interface OrganizationSettingsManagerProps {
  userId: string;
  organizationId: string;
}

export default function OrganizationSettingsManager({
  userId,
  organizationId,
}: OrganizationSettingsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch theme settings
  const {
    data: themeSettings,
    isLoading: isLoadingTheme,
    error: themeError,
  } = useQuery({
    queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/theme")],
    enabled: !!userId && !!organizationId,
  });

  // Fetch contact settings
  const {
    data: contactSettings,
    isLoading: isLoadingContact,
    error: contactError,
  } = useQuery({
    queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/contact")],
    enabled: !!userId && !!organizationId,
  });

  // Fetch payment settings
  const {
    data: paymentSettings,
    isLoading: isLoadingPayment,
    error: paymentError,
  } = useQuery({
    queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/payment")],
    enabled: !!userId && !!organizationId,
  });

  // Fetch shipping settings
  const {
    data: shippingSettings,
    isLoading: isLoadingShipping,
    error: shippingError,
  } = useQuery({
    queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/shipping")],
    enabled: !!userId && !!organizationId,
  });

  // Theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (data: ThemeSettingsFormValues) => {
      const url = buildOrgApiUrl(userId, organizationId, "/settings/theme");
      return await apiRequest("PUT", url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/theme")],
      });
      toast({
        title: "Guardado",
        description: "La configuración de tema ha sido actualizada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración de tema.",
        variant: "destructive",
      });
    },
  });

  // Contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async (data: ContactSettingsFormValues) => {
      const url = buildOrgApiUrl(userId, organizationId, "/settings/contact");
      return await apiRequest("PUT", url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/contact")],
      });
      toast({
        title: "Guardado",
        description: "La configuración de contacto ha sido actualizada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración de contacto.",
        variant: "destructive",
      });
    },
  });

  // Note: Payment and Shipping forms are placeholders and handle their own mutations internally

  const isLoading = isLoadingTheme || isLoadingContact || isLoadingPayment || isLoadingShipping;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
          Configuración de Organización
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Administra la configuración de tu mercado
        </p>
      </div>

      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="theme">Tema</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
          <TabsTrigger value="shipping">Envíos</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4">
          {themeError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar la configuración de tema: {(themeError as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="p-6">
              <ThemeSettingsForm
                initialValues={themeSettings as Partial<ThemeSettingsFormValues>}
                onSubmit={async (data) => {
                  await updateThemeMutation.mutateAsync(data);
                }}
                isLoading={updateThemeMutation.isPending}
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          {contactError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar la configuración de contacto: {(contactError as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="p-6">
              <ContactSettingsForm
                initialValues={contactSettings as Partial<ContactSettingsFormValues>}
                onSubmit={async (data) => {
                  await updateContactMutation.mutateAsync(data);
                }}
                isLoading={updateContactMutation.isPending}
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          {paymentError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar la configuración de pagos: {(paymentError as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <PaymentSettingsForm
              userId={userId}
              organizationId={organizationId}
              initialData={paymentSettings}
            />
          )}
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          {shippingError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar la configuración de envíos: {(shippingError as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <ShippingSettingsForm
              userId={userId}
              organizationId={organizationId}
              initialData={shippingSettings}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
