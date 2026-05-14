import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentStore, newDocTabId } from "@/store/documentStore";
import { documentEditorPath } from "@/routePaths";
import { DOCUMENT_TYPES } from "@/types/invoice";
import type { DocTypeCode } from "@/types/invoice";
import { Icon, Logo } from "@/components/ui";

type NavId = "dashboard" | "config" | "puestos" | "productos" | "reporte" | "pos" | "documents" | "clients";

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
  const { addDocumentTab } = useDocumentStore();
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);

  // Regular nav items — Documentos is rendered separately below as a
  // [label + create button] combo row to mirror the global navbar
  // ([Documentos tab] + [+ Nuevo button]).
  const NAV_ITEMS: { id: NavId; icon: string; label: string }[] = [
    { id: "dashboard", icon: "chart", label: t("shell.panel") },
    { id: "config", icon: "settings", label: t("shell.sessions") },
    { id: "puestos", icon: "store", label: t("shell.stations") },
    { id: "productos", icon: "package", label: t("shell.products") },
    { id: "clients", icon: "user", label: t("shell.clients") },
    { id: "reporte", icon: "trending", label: t("shell.reports") },
  ];

  const docsActive = active === "documents";

  const handleCreateDoc = (docType: typeof DOCUMENT_TYPES[number]) => {
    setCreateOpen(false);
    const tabId = newDocTabId();
    addDocumentTab({
      id: tabId,
      type: "new",
      title: docType.label,
      doc_type: docType.code as DocTypeCode,
      data: { document_type: docType.code as DocTypeCode },
      is_dirty: false,
      opened_at: Date.now(),
    });
    setLocation(documentEditorPath(tabId));
    onClose?.();
  };

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

        {/* Documentos — composite row: nav link + inline "+" create button.
            Mirrors the global navbar pattern (Documentos tab + Nuevo button). */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            gap: 2,
          }}
        >
          <button
            className={`sidebar-item ${docsActive ? "active" : ""}`}
            onClick={() => {
              onNav("documents");
              onClose?.();
            }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <Icon name="fileText" size={16} />
            Documentos
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCreateOpen((v) => !v);
            }}
            title="Crear documento"
            aria-label="Crear documento"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              flexShrink: 0,
              borderRadius: 8,
              border: createOpen
                ? "1px solid hsl(var(--primary))"
                : "1px solid transparent",
              background: createOpen
                ? "hsl(var(--primary) / 0.10)"
                : "hsl(var(--primary))",
              color: createOpen ? "hsl(var(--primary))" : "hsl(var(--primary-foreground))",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <Icon name="plus" size={14} />
          </button>

          {createOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 30 }}
                onClick={() => setCreateOpen(false)}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  marginBottom: 4,
                  left: 0,
                  right: 0,
                  zIndex: 40,
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
                  boxShadow: "0 -8px 24px hsl(var(--foreground) / 0.18)",
                  padding: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <button
                    key={dt.code}
                    onClick={() => handleCreateDoc(dt)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: "transparent",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      color: "hsl(var(--foreground))",
                      textAlign: "left",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "hsl(var(--muted))";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: dt.dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 10, opacity: 0.7 }}>
                      {dt.short}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dt.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
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
