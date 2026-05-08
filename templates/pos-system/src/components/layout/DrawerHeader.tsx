import { IconPill } from "@/components/common/IconPill";

interface DrawerHeaderProps {
  icon: string;
  label: string;
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconBackground?: string;
  style?: React.CSSProperties;
}

export function DrawerHeader({ icon, label, title, subtitle, iconColor, iconBackground, style }: DrawerHeaderProps) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: subtitle ? 8 : 0 }}>
        <IconPill
          icon={icon}
          size={38}
          iconSize={16}
          color={iconColor ?? "hsl(var(--primary))"}
          background={iconBackground ?? "hsl(var(--primary) / 0.1)"}
          radius={11}
        />
        <div>
          <small className="t-label" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {label}
          </small>
          <h2 className="t-h3" style={{ marginTop: 1 }}>{title}</h2>
        </div>
      </div>
      {subtitle && <p className="t-sm" style={{ marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}
