import { Icon } from "@/components/ui";

interface IconPillProps {
  icon: string;
  size?: number;
  iconSize?: number;
  color?: string;
  background?: string;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function IconPill({
  icon,
  size = 36,
  iconSize = 16,
  color,
  background,
  radius = 10,
  className,
  style,
}: IconPillProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: background ?? "hsl(var(--muted))",
        color: color ?? "hsl(var(--muted-foreground))",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <Icon name={icon} size={iconSize} />
    </div>
  );
}
