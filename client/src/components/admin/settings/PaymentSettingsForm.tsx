import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { apiRequest } from "@/lib/queryClient";

interface PaymentSettingsFormProps {
  userId: string;
  organizationId: string;
  initialData?: any;
}

export default function PaymentSettingsForm({
  userId,
  organizationId,
  initialData,
}: PaymentSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = buildOrgApiUrl(userId, organizationId, "/settings/payment");
      return await apiRequest("PUT", url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/payment")],
      });
      toast({
        title: "Guardado",
        description: "La configuración de pagos ha sido actualizada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración de pagos.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    // Placeholder implementation
    await updateMutation.mutateAsync({
      acceptCash: true,
      acceptSinpe: true,
      sinpeNumber: "8888-8888",
      acceptCard: false,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Pagos</CardTitle>
        <CardDescription>
          Métodos de pago aceptados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Formulario de configuración de pagos (pendiente de implementación)
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Este componente será reemplazado con el formulario completo
          </p>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>userId:</strong> {userId}</p>
          <p><strong>organizationId:</strong> {organizationId}</p>
          <p><strong>initialData:</strong> {initialData ? JSON.stringify(initialData, null, 2) : "null"}</p>
        </div>

        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Guardando..." : "Guardar Pagos"}
        </Button>
      </CardContent>
    </Card>
  );
}
