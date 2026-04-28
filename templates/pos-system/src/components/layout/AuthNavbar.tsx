import { useLanguageSwitch } from "@/hooks/useLanguageSwitch";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Icon } from "@/components/ui";

interface AuthNavbarProps {
  leftSlot?: React.ReactNode;
}

export function AuthNavbar({ leftSlot }: AuthNavbarProps) {
  const { language, toggle: toggleLanguage } = useLanguageSwitch();
  const { dark, toggle: toggleDark } = useDarkMode();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "hsl(var(--background) / 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      <div>{leftSlot}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          type="button"
          onClick={toggleLanguage}
          className="btn btn-ghost btn-sm btn-icon"
          aria-label="Toggle language"
        >
          <img
            src={language === "es" ? "https://flagcdn.com/w20/cr.png" : "https://flagcdn.com/w20/us.png"}
            alt={language === "es" ? "Costa Rica" : "United States"}
            style={{ width: 20, height: "auto", borderRadius: 2 }}
          />
        </button>
        <button
          type="button"
          onClick={toggleDark}
          className="btn btn-ghost btn-sm btn-icon"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Icon name={dark ? "sun" : "moon"} size={16} />
        </button>
      </div>
    </header>
  );
}
