import { Icon, Badge, Button } from "@/components/ui";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useLanguageSwitch } from "@/hooks/useLanguageSwitch";
import { useLanguage } from "@/contexts/LanguageContext";
import { DocumentsToolbar } from "@/components/documents/DocumentsToolbar";
import { NewDocumentButton } from "@/components/documents/NewDocumentButton";

interface DashboardHeaderProps {
  /** Mobile hamburger → opens left sidebar drawer */
  onMenuClick: () => void;
  /** Mobile docs icon → opens right-side documents drawer */
  onDocsClick?: () => void;
  /** Live session badge — preserved on the left after the documents toolbar */
  sessionName?: string;
  sessionLocation?: string;
}

export function DashboardHeader({
  onMenuClick,
  onDocsClick,
  sessionName,
  sessionLocation,
}: DashboardHeaderProps) {
  const { dark, toggle: toggleDark } = useDarkMode();
  const { language, toggle: toggleLanguage } = useLanguageSwitch();
  const { t } = useLanguage();

  return (
    <header
      className="nav-bar"
      style={{
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      {/* LEFT SLOT — hamburger · page title · documents toolbar · live badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <button
          className="btn btn-ghost btn-sm btn-icon dashboard-hamburger"
          onClick={onMenuClick}
        >
          <Icon name="menu" size={18} />
        </button>

        {/* Desktop-only documents toolbar (Documentos tab + open tab strip) */}
        <div className="documents-toolbar-desktop" style={{ minWidth: 0, display: "none" }}>
          <DocumentsToolbar />
        </div>

        {/* Live session badge — kept on the left after the toolbar */}
        {sessionName && (
          <>
            <Badge variant="success" style={{ gap: 6, flexShrink: 0 }}>
              <span
                className="status-dot status-dot-live"
                style={{ width: 6, height: 6 }}
              />
              {t("shell.liveLabel")}
            </Badge>
            <div style={{ minWidth: 0, flexShrink: 0 }}>
              <div className="t-label" style={{ fontSize: 10 }}>
                {t("shell.activeSession")}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 200,
                }}
              >
                {sessionName}
                {sessionLocation && ` · ${sessionLocation}`}
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SLOT — + Nuevo (desktop) · flag · dark · sync · 📄 (mobile drawer toggle) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Desktop-only New Document button — sits next to the country flag */}
        <div className="documents-toolbar-desktop" style={{ display: "none" }}>
          <NewDocumentButton />
        </div>

        {/* Language toggle + Country flag */}
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

        {/* Sync button */}
        <Button variant="outline" size="sm" icon="refresh">
          {t("shell.sync")}
        </Button>

        {/* Mobile-only right-drawer toggle — Documentos + open tabs live there on small screens */}
        {onDocsClick && (
          <button
            className="btn btn-ghost btn-sm btn-icon documents-drawer-mobile"
            onClick={onDocsClick}
            aria-label="Open documents drawer"
            style={{ display: "none" }}
          >
            <Icon name="fileText" size={18} />
          </button>
        )}
      </div>

      <style>{`
        @media (min-width: 769px) {
          .documents-toolbar-desktop { display: flex !important; align-items: center; }
          .documents-drawer-mobile { display: none !important; }
        }
        @media (max-width: 768px) {
          .documents-toolbar-desktop { display: none !important; }
          .documents-drawer-mobile { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
