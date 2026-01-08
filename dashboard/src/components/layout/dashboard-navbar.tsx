import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/contexts/LanguageContext";

export function DashboardNavbar() {
  const [location] = useLocation();
  const { t } = useLanguage();

  // Generate breadcrumbs based on current location
  const getBreadcrumbs = () => {
    const paths = location.split("/").filter(Boolean);

    // Map path segments to translation keys
    const labelMap: Record<string, string> = {
      admin: "nav.dashboard",
      products: "nav.products",
      categories: "nav.categories",
      content: "nav.content",
      settings: "nav.settings",
      general: "nav.settings.general",
      theme: "nav.settings.theme",
      members: "nav.settings.members",
      deployments: "nav.settings.deployments",
      profile: "nav.profile",
    };

    const breadcrumbs: Array<{ label: string; href: string; isLast: boolean }> = [];

    // Build breadcrumb trail
    let currentPath = "";
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const translationKey = labelMap[segment];
      const label = translationKey ? t(translationKey) : segment;
      const isLast = index === paths.length - 1;

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.length > 0 && (
            <BreadcrumbSeparator className="hidden md:block">
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          )}
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.href}>
              {!crumb.isLast ? (
                <>
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                </>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side - Theme and Language toggles */}
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
