import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Settings,
  Palette,
  Mail,
  CreditCard,
  Truck,
} from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsNavItems = [
  {
    href: "/admin/settings/general",
    label: "General",
    icon: Settings,
  },
  {
    href: "/admin/settings/theme",
    label: "Tema",
    icon: Palette,
  },
  {
    href: "/admin/settings/contact",
    label: "Contacto",
    icon: Mail,
  },
  {
    href: "/admin/settings/payment",
    label: "Pagos",
    icon: CreditCard,
  },
  {
    href: "/admin/settings/shipping",
    label: "Envíos",
    icon: Truck,
  },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Administra la configuración de tu tienda
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-card rounded-lg border border-border p-2">
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
