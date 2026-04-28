import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Icon, Logo, Badge, Button } from "@/components/ui";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useLanguageSwitch } from "@/hooks/useLanguageSwitch";
import { useLanguage } from "@/contexts/LanguageContext";

type NavId = "dashboard" | "config" | "puestos" | "productos" | "reporte";

interface DashboardShellProps {
  children: React.ReactNode;
  active?: NavId;
  onNav?: (id: NavId) => void;
  sessionName?: string;
  sessionLocation?: string;
}

function Sidebar({
  active,
  onNav,
  onClose,
}: {
  active: NavId;
  onNav: (id: NavId) => void;
  onClose?: () => void;
}) {
  const { user, logout } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();

  const NAV_ITEMS: { id: NavId; icon: string; label: string }[] = [
    { id: "dashboard", icon: "chart", label: t("shell.panel") },
    { id: "config", icon: "settings", label: t("shell.sessions") },
    { id: "puestos", icon: "store", label: t("shell.stations") },
    { id: "productos", icon: "package", label: t("shell.products") },
    { id: "reporte", icon: "trending", label: t("shell.reports") },
  ];

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "";
  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";
  const displayName = fullName || user?.email || "Usuario";

  return (
    <aside
      className="sidebar"
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 16,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "4px 8px 20px",
          borderBottom: "1px solid hsl(var(--sidebar-border))",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo orgName={org?.name} />
        {onClose && (
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={onClose}
            style={{ marginLeft: 8 }}
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {/* Nav label */}
      <div className="t-label" style={{ padding: "8px 10px 6px" }}>
        {t("shell.navigation")}
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${active === item.id ? "active" : ""}`}
            onClick={() => {
              onNav(item.id);
              onClose?.();
            }}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />
      <div className="separator" style={{ margin: "12px 0" }} />

      {/* User + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 4 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "hsl(var(--primary))",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName}
          </div>
          <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {user?.role ?? ""}
          </div>
        </div>
      </div>
      <button className="sidebar-item" onClick={logout}>
        <Icon name="logOut" size={16} /> {t("shell.logout")}
      </button>
    </aside>
  );
}

export default function DashboardShell({
  children,
  active = "dashboard",
  onNav,
  sessionName,
  sessionLocation,
}: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();
  const { language, toggle: toggleLanguage } = useLanguageSwitch();
  const { t } = useLanguage();

  const handleNav = (id: NavId) => {
    onNav?.(id);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Desktop/tablet sidebar (≥769px) */}
      <div
        style={{
          width: 240,
          display: "none",
        }}
        className="dashboard-sidebar-full"
      >
        <Sidebar active={active} onNav={handleNav} />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100 }}
        >
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fade-up"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              zIndex: 101,
            }}
          >
            <Sidebar
              active={active}
              onNav={handleNav}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header
          className="nav-bar"
          style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile hamburger */}
            <button
              className="btn btn-ghost btn-sm btn-icon dashboard-hamburger"
              onClick={() => setDrawerOpen(true)}
            >
              <Icon name="menu" size={18} />
            </button>

            {sessionName && (
              <>
                <Badge variant="success" style={{ gap: 6 }}>
                  <span
                    className="status-dot status-dot-live"
                    style={{ width: 6, height: 6 }}
                  />
                  {t("shell.liveLabel")}
                </Badge>
                <div>
                  <div className="t-label" style={{ fontSize: 10 }}>
                    {t("shell.activeSession")}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {sessionName}
                    {sessionLocation && ` · ${sessionLocation}`}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Language toggle */}
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={toggleLanguage}
              aria-label="Toggle language"
            >
              <img
                src={language === "es" ? "https://flagcdn.com/w20/cr.png" : "https://flagcdn.com/w20/us.png"}
                alt={language === "es" ? "Costa Rica" : "United States"}
                style={{ width: 20, height: "auto", borderRadius: 2 }}
              />
            </button>

            {/* Dark mode toggle */}
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={toggleDark}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Icon name={dark ? "sun" : "moon"} size={16} />
            </button>

            <Button variant="outline" size="sm" icon="refresh">
              {t("shell.sync")}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>{children}</main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .dashboard-sidebar-full { display: block !important; }
          .dashboard-hamburger { display: none !important; }
        }
        @media (max-width: 768px) {
          .dashboard-sidebar-full { display: none !important; }
          .dashboard-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
