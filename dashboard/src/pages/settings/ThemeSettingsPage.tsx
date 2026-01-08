import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeSettingsForm, {
  type ThemeSettingsFormValues,
} from "@/components/admin/settings/ThemeSettingsForm";

export default function ThemeSettingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);

  const {
    data: themeSettings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [buildOrgApiUrl(user?.id || "", defaultOrg?.id || "", "/settings/theme")],
    enabled: !!user?.id && !!defaultOrg?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ThemeSettingsFormValues) => {
      if (!user?.id || !defaultOrg?.id) throw new Error("Missing user or organization");
      const url = buildOrgApiUrl(user.id, defaultOrg.id, "/settings/theme");
      return await apiRequest("PUT", url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [buildOrgApiUrl(user?.id || "", defaultOrg?.id || "", "/settings/theme")],
      });
      toast({
        title: t("settings.theme.saved"),
        description: t("settings.theme.savedDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("settings.theme.saveError"),
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
          {t("settings.theme.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t("settings.theme.subtitle")}
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("settings.theme.loadError")}: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="p-6">
          <ThemeSettingsForm
            initialValues={themeSettings as Partial<ThemeSettingsFormValues>}
            onSubmit={async (data) => {
              await updateMutation.mutateAsync(data);
            }}
            isLoading={updateMutation.isPending}
          />
        </Card>
      )}
    </div>
  );
}
