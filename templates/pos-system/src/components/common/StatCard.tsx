import { IconPill } from "./IconPill";

interface StatCardProps {
  icon: string;
  iconColor?: string;
  iconBackground?: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  style?: React.CSSProperties;
}

export function StatCard({ icon, iconColor, iconBackground, label, value, sub, style }: StatCardProps) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        ...style,
      }}
    >
      <IconPill
        icon={icon}
        size={40}
        iconSize={18}
        color={iconColor}
        background={iconBackground ?? "hsl(var(--primary) / 0.1)"}
        radius={11}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="t-label" style={{ marginBottom: 4 }}>{label}</div>
        <div className="t-stat">{value}</div>
        {sub && <div className="t-xs" style={{ marginTop: 3, color: "hsl(var(--muted-foreground))" }}>{sub}</div>}
      </div>
    </div>
  );
}
