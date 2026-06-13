import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import ShippingSettingsForm from "@/components/admin/settings/ShippingSettingsForm";

export default function ShippingSettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);

  const {
    data: shippingSettings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [buildOrgApiUrl(user?.id || "", defaultOrg?.id || "", "/settings/shipping")],
    enabled: !!user?.id && !!defaultOrg?.id,
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("settings.shipping.pageTitle")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t("settings.shipping.pageSubtitle")}
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("settings.shipping.loadError")}: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : (
        <ShippingSettingsForm
          userId={user?.id || ""}
          organizationId={defaultOrg?.id || ""}
          initialData={shippingSettings}
        />
      )}
    </div>
  );
}
