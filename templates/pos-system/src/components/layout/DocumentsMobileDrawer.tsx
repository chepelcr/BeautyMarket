import { useEffect } from "react";
import { useLocation } from "wouter";
import { useDocumentStore } from "@/store/documentStore";
import { ROUTES, documentEditorPath } from "@/routePaths";
import { getDocumentTypeInfo } from "@/types/invoice";
import { NewDocumentButton } from "@/components/documents/NewDocumentButton";

interface DocumentsMobileDrawerProps {
  open: boolean;
  isClosing: boolean;
  shouldRender: boolean;
  onClose: () => void;
}

/**
 * Right-side mobile drawer for documents. Mirrors DashboardMobileDrawer
 * with slideInRight/slideOutRight animations. Contains:
 *  - Header (title + close ✕)
 *  - "Documentos" big button → navigates to list
 *  - "+ Nuevo" dropdown (full-width)
 *  - List of open document drafts with doc-type bar + title + close
 */
export function DocumentsMobileDrawer({
  open,
  isClosing,
  shouldRender,
  onClose,
}: DocumentsMobileDrawerProps) {
  const { open_documents, removeDocumentTab } = useDocumentStore();
  const [location, setLocation] = useLocation();

  const editorMatch = location.match(/^\/dashboard\/documents\/new\/([^/?#]+)/);
  const activeTabId = editorMatch?.[1] ?? null;

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open && shouldRender) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  const handleTabClick = (id: string) => {
    setLocation(documentEditorPath(id));
    onClose();
  };

  const handleTabClose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeDocumentTab(id);
    if (activeTabId === id) {
      const remaining = open_documents.filter((d) => d.id !== id);
      if (remaining.length === 0) {
        setLocation(ROUTES.DASHBOARD_DOCUMENTS);
        onClose();
      } else {
        setLocation(documentEditorPath(remaining[remaining.length - 1].id));
      }
    }
  };

  const goToDocsList = () => {
    setLocation(ROUTES.DASHBOARD_DOCUMENTS);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Overlay backdrop */}
      <div
        className={isClosing ? "drawer-overlay-exit" : "drawer-overlay-enter"}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(1px)",
        }}
        onClick={onClose}
      />

      {/* Drawer panel — RIGHT SIDE */}
      <div
        className={isClosing ? "drawer-panel-right-exit" : "drawer-panel-right-enter"}
        style={{
          position: "relative",
          width: 280,
          height: "100dvh",
          zIndex: 101,
          background: "hsl(var(--card))",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top row — Documentos nav button (acts as both title + go-to-list) + close */}
        <div
          style={{
            padding: "12px 12px 8px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            onClick={goToDocsList}
            style={{
              flex: 1,
              minWidth: 0,
              height: 40,
              borderRadius: 10,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16 }} aria-hidden>📄</span>
            Documentos
          </button>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 10,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--muted-foreground))",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Open documents — fills the middle area */}
        {open_documents.length > 0 ? (
          <>
            <div
              className="t-label"
              style={{ padding: "12px 16px 4px", color: "hsl(var(--muted-foreground))" }}
            >
              Abiertos
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "4px 12px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {open_documents.map((tab) => {
                const info = getDocumentTypeInfo(tab.doc_type);
                const isActive = activeTabId === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: isActive ? "hsl(var(--muted))" : "transparent",
                      border: isActive
                        ? `1px solid ${info?.dotColor ?? "hsl(var(--border))"}`
                        : "1px solid transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Color bar */}
                    <span
                      style={{
                        width: 4,
                        height: 28,
                        borderRadius: 4,
                        background: info?.dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "var(--font-display)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        {info?.short ?? "?"}
                        {tab.is_dirty && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 6,
                              height: 6,
                              borderRadius: 999,
                              background: "#fb923c",
                              marginLeft: 6,
                              verticalAlign: "middle",
                            }}
                            title="Cambios sin guardar"
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "hsl(var(--foreground))",
                        }}
                      >
                        {tab.title}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleTabClose(tab.id, e)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "none",
                        background: "transparent",
                        color: "hsl(var(--muted-foreground))",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                      title="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              textAlign: "center",
              color: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          >
            No hay documentos abiertos
          </div>
        )}

        {/* Footer — "+ Nuevo" with dropdown opening UP (toward the open-docs list) */}
        <div
          style={{
            padding: "8px 12px 14px",
            borderTop: "1px solid hsl(var(--border))",
          }}
        >
          <NewDocumentButton fullWidth direction="up" onCreate={onClose} />
        </div>
      </div>

      <style>{`
        .drawer-overlay-enter { animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
        .drawer-overlay-exit { animation: fadeOut 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
        .drawer-panel-right-enter { animation: slideInRight 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
        .drawer-panel-right-exit { animation: slideOutRight 0.45s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}
