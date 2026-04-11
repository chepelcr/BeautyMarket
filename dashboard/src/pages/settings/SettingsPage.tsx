import { useLocation } from "wouter";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings, Palette, Mail, CreditCard, Truck } from "lucide-react";

const settingsCards = [
  {
    titleKey: "sidebar.settings.general",
    descriptionKey: "settings.general.subtitle",
    href: "/admin/settings/general",
    icon: Settings,
  },
  {
    titleKey: "sidebar.settings.theme",
    descriptionKey: "settings.theme.subtitle",
    href: "/admin/settings/theme",
    icon: Palette,
  },
  {
    titleKey: "sidebar.settings.contact",
    descriptionKey: "settings.contact.pageSubtitle",
    href: "/admin/settings/contact",
    icon: Mail,
  },
  {
    titleKey: "sidebar.settings.payment",
    descriptionKey: "settings.payment.pageSubtitle",
    href: "/admin/settings/payment",
    icon: CreditCard,
  },
  {
    titleKey: "sidebar.settings.shipping",
    descriptionKey: "settings.shipping.pageSubtitle",
    href: "/admin/settings/shipping",
    icon: Truck,
  },
];

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("sidebar.organization")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("settings.general.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.href}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setLocation(card.href);
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle>{t(card.titleKey)}</CardTitle>
                </div>
                <CardDescription>{t(card.descriptionKey)}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
