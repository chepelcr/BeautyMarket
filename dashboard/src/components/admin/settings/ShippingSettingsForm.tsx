import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShippingSettingsFormProps {
  userId: string;
  organizationId: string;
  initialData?: any;
}

export default function ShippingSettingsForm({
  userId,
  organizationId,
  initialData,
}: ShippingSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = buildOrgApiUrl(userId, organizationId, "/settings/shipping");
      return await apiRequest("PUT", url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [buildOrgApiUrl(userId, organizationId, "/settings/shipping")],
      });
      toast({
        title: t("settings.shipping.success"),
        description: t("settings.shipping.successDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("settings.shipping.error"),
        description: error.message || t("settings.shipping.errorDesc"),
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    // Placeholder implementation
    await updateMutation.mutateAsync({
      offerShipping: true,
      offerLocalPickup: true,
      shippingCost: 2500,
      freeShippingThreshold: 50000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.shipping.title")}</CardTitle>
        <CardDescription>
          {t("settings.shipping.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t("settings.shipping.placeholder")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {t("settings.shipping.placeholderDesc")}
          </p>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>userId:</strong> {userId}</p>
          <p><strong>organizationId:</strong> {organizationId}</p>
          <p><strong>initialData:</strong> {initialData ? JSON.stringify(initialData, null, 2) : "null"}</p>
        </div>

        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? t("settings.shipping.saving") : t("settings.shipping.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
