import type { SyncStatus } from "@/hooks/useSync";
import { useAuthContext } from "@/contexts/AuthContext";
import { Logo, SyncPill, Button, Icon } from "@/components/ui";

interface POSLayoutProps {
  children: React.ReactNode;
  syncStatus: SyncStatus;
  standName?: string;
  context?: string;
  sessionName?: string;
}

export default function POSLayout({
  children,
  syncStatus,
  standName,
  context,
  sessionName,
}: POSLayoutProps) {
  const { logout } = useAuthContext();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "hsl(var(--background))" }}>
      {/* Header */}
      <div
        className="nav-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          flexShrink: 0,
        }}
      >
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SyncPill state={syncStatus} />
          <Button variant="ghost" size="sm" icon="logOut" onClick={logout}>
            Salir
          </Button>
        </div>
      </div>

      {/* Assignment context strip */}
      {standName && (
        <div
          style={{
            padding: "8px 16px",
            background: "hsl(var(--primary) / 0.08)",
            borderBottom: "1px solid hsl(var(--primary) / 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <Icon name="mapPin" size={13} style={{ color: "hsl(var(--primary))" } as any} />
          <span
            className="t-label"
            style={{ color: "hsl(var(--primary))", fontSize: 12 }}
          >
            {standName}
            {context && ` · ${context.toUpperCase()}`}
            {sessionName && ` · ${sessionName}`}
          </span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
