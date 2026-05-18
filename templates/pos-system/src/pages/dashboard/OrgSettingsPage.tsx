import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrgConfigurations } from "@/hooks/useOrgConfigurations";
import { FadeIn } from "@/components/ui/FadeIn";
import { HaciendaTab } from "@/components/org-settings/tabs/HaciendaTab";
import { NotificationsTab } from "@/components/org-settings/tabs/NotificationsTab";
import { HaciendaConfigDrawer } from "@/components/org-settings/HaciendaConfigDrawer";
import { NotificationsDrawer } from "@/components/org-settings/NotificationsDrawer";

type OrgSettingsTab = "hacienda" | "notifications";

export default function OrgSettingsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<OrgSettingsTab>("hacienda");
  const [haciendaOpen, setHaciendaOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: config, isLoading } = useOrgConfigurations(org?.id);

  const tabs: { id: OrgSettingsTab; label: string }[] = [
    { id: "hacienda", label: t("orgSettings.tab.hacienda") },
    { id: "notifications", label: t("orgSettings.tab.notifications") },
  ];

  return (
    <div className="px-6 pt-6 pb-12 max-w-[900px] mx-auto">
      {/* Page header */}
      <div className="fade-up mb-6">
        <h1 className="t-h1 mb-1">{t("orgSettings.title")}</h1>
        <p className="t-body text-muted-foreground">{t("orgSettings.subtitle")}</p>
      </div>

      {/* Tab bar */}
      <div className="fade-up tabs-container mb-6">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "hacienda" && (
        <FadeIn key="hacienda" duration={0.25}>
          <HaciendaTab
            config={config}
            isLoading={isLoading}
            onEdit={() => setHaciendaOpen(true)}
          />
        </FadeIn>
      )}

      {activeTab === "notifications" && (
        <FadeIn key="notifications" duration={0.25}>
          <NotificationsTab
            config={config}
            isLoading={isLoading}
            onEdit={() => setNotificationsOpen(true)}
          />
        </FadeIn>
      )}

      {/* Drawers */}
      {org && (
        <>
          <HaciendaConfigDrawer
            open={haciendaOpen}
            onClose={() => setHaciendaOpen(false)}
            config={config}
            orgId={org.id}
          />
          <NotificationsDrawer
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            config={config}
            orgId={org.id}
          />
        </>
      )}
    </div>
  );
}
