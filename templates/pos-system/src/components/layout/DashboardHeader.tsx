import { Icon, Badge, Button } from "@/components/ui";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useLanguageSwitch } from "@/hooks/useLanguageSwitch";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  sessionName?: string;
  sessionLocation?: string;
}

export function DashboardHeader({
  onMenuClick,
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
          onClick={onMenuClick}
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
  );
}
