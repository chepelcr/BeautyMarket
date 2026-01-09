import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Settings,
  Users,
  Rocket,
  User,
  LogOut,
  ChevronRight,
  Building2,
  Palette,
  Mail,
  CreditCard,
  Truck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

// Menu item type
interface MenuItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string; // RBAC permission check (optional)
}

// Main navigation items
const mainNavItems: MenuItem[] = [
  {
    titleKey: "sidebar.dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    titleKey: "sidebar.products",
    href: "/admin/products",
    icon: Package,
  },
  {
    titleKey: "sidebar.categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    titleKey: "sidebar.content",
    href: "/admin/content",
    icon: FileText,
  },
];

// Settings navigation items
const settingsNavItems: MenuItem[] = [
  {
    titleKey: "sidebar.settings.general",
    href: "/admin/settings/general",
    icon: Settings,
  },
  {
    titleKey: "sidebar.settings.theme",
    href: "/admin/settings/theme",
    icon: Palette,
  },
  {
    titleKey: "sidebar.settings.contact",
    href: "/admin/settings/contact",
    icon: Mail,
  },
  {
    titleKey: "sidebar.settings.payment",
    href: "/admin/settings/payment",
    icon: CreditCard,
  },
  {
    titleKey: "sidebar.settings.shipping",
    href: "/admin/settings/shipping",
    icon: Truck,
  },
  {
    titleKey: "sidebar.settings.teamMembers",
    href: "/admin/members",
    icon: Users,
  },
  {
    titleKey: "sidebar.settings.deployments",
    href: "/admin/deployments",
    icon: Rocket,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const { state } = useSidebar();
  const { t } = useLanguage();

  // Check if menu item is active
  const isActive = (href: string) => {
    if (href === "/admin") {
      return location === href;
    }
    return location.startsWith(href);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  // Handle logout with redirect
  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      "JMarkets"
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t("sidebar.dashboard")}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={state === "collapsed" ? t(item.titleKey) : undefined}
                  >
                    <a href={item.href} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.href);
                    }}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.settings")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={state === "collapsed" ? t(item.titleKey) : undefined}
                  >
                    <a href={item.href} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.href);
                    }}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {isLoading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email
                      )}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/admin/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  {t("sidebar.profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("sidebar.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
