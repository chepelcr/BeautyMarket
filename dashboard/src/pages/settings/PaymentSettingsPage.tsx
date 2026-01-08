import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import PaymentSettingsForm from "@/components/admin/settings/PaymentSettingsForm";

export default function PaymentSettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);

  const {
    data: paymentSettings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [buildOrgApiUrl(user?.id || "", defaultOrg?.id || "", "/settings/payment")],
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
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
          {t("settings.payment.pageTitle")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t("settings.payment.pageSubtitle")}
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("settings.payment.loadError")}: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : (
        <PaymentSettingsForm
          userId={user?.id || ""}
          organizationId={defaultOrg?.id || ""}
          initialData={paymentSettings}
        />
      )}
    </div>
  );
}
