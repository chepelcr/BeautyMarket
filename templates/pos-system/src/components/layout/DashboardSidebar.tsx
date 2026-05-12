import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { Icon, Logo } from "@/components/ui";

type NavId = "dashboard" | "config" | "puestos" | "productos" | "reporte" | "pos" | "clients";

interface DashboardSidebarProps {
  active: NavId;
  onNav: (id: NavId) => void;
  onClose?: () => void;
}

export function DashboardSidebar({ active, onNav, onClose }: DashboardSidebarProps) {
  const { user, logout } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();

  const NAV_ITEMS: { id: NavId; icon: string; label: string }[] = [
    { id: "dashboard", icon: "chart", label: t("shell.panel") },
    { id: "config", icon: "settings", label: t("shell.sessions") },
    { id: "puestos", icon: "store", label: t("shell.stations") },
    { id: "productos", icon: "package", label: t("shell.products") },
    { id: "clients", icon: "user", label: t("shell.clients") },
    { id: "reporte", icon: "trending", label: t("shell.reports") },
    { id: "pos", icon: "smartphone", label: "POS" },
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
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 16,
        overflowY: "auto",
        overflowX: "hidden",
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
