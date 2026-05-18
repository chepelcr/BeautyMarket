import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrgConfigurations } from "@/hooks/useOrgConfigurations";
import { Icon, Badge } from "@/components/ui";
import { FadeIn } from "@/components/ui/FadeIn";
import { ROUTES } from "@/routePaths";

export default function OrgSettingsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const { data: config, isLoading } = useOrgConfigurations(org?.id);

  const cards = [
    {
      id: "hacienda",
      icon: "lock",
      iconClass: "icon-pill-primary-soft",
      title: t("orgSettings.tab.hacienda"),
      description: t("orgSettings.hacienda.empty.desc"),
      configured: config !== null && config !== undefined,
      route: ROUTES.DASHBOARD_ORG_HACIENDA,
    },
    {
      id: "notifications",
      icon: "sliders",
      iconClass: "icon-pill-info",
      title: t("orgSettings.tab.notifications"),
      description: t("orgSettings.notifications.empty.desc"),
      configured: !!(config?.notificationSettings),
      route: ROUTES.DASHBOARD_ORG_NOTIFICATIONS,
    },
  ];

  return (
    <div className="px-6 pt-6 pb-12 max-w-[900px] mx-auto">
      <FadeIn duration={0.3}>
        <div className="mb-8">
          <h1 className="t-h1 mb-1">{t("orgSettings.title")}</h1>
          <p className="t-body text-muted-foreground">{t("orgSettings.subtitle")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <button
              key={card.id}
              className="card card-hover text-left w-full p-5 flex items-start gap-4 group"
              onClick={() => navigate(card.route)}
            >
              <div className={`icon-pill icon-pill-lg w-12 h-12 flex-shrink-0 ${card.iconClass}`}>
                <Icon name={card.icon} size={22} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="t-h4 !mb-0">{card.title}</span>
                  {!isLoading && (
                    <Badge variant={card.configured ? "success" : "secondary"}>
                      {card.configured ? "Configurado" : "Sin configurar"}
                    </Badge>
                  )}
                  {isLoading && (
                    <div className="skeleton-block h-5 w-20 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="t-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </div>

              <div className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-0.5">
                <Icon name="chevronRight" size={18} />
              </div>
            </button>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
