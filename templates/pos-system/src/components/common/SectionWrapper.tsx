import { type LucideIcon, Eye, EyeOff } from "lucide-react";

interface SectionWrapperProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  visible?: boolean;
  badge?: string | number;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function SectionWrapper({
  title,
  icon: SectionIcon,
  children,
  isExpanded = true,
  onToggle,
  disabled = false,
  visible = true,
  badge,
  loading = false,
  error,
  className,
}: SectionWrapperProps) {
  if (!visible) return null;

  return (
    <div
      className={className}
      style={{
        border: `1px solid ${disabled ? "hsl(var(--border) / 0.4)" : "hsl(var(--border))"}`,
        borderRadius: 10,
        overflow: "hidden",
        opacity: disabled ? 0.55 : 1,
        transition: "opacity 200ms ease",
      }}
    >
      {/* Header */}
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          background: "hsl(var(--muted) / 0.35)",
          border: "none",
          cursor: disabled ? "not-allowed" : onToggle ? "pointer" : "default",
          textAlign: "left",
          borderBottom: isExpanded ? "1px solid hsl(var(--border) / 0.6)" : "none",
        }}
      >
        <SectionIcon
          size={15}
          style={{ color: disabled ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))", flexShrink: 0 }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: disabled ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </span>

        {badge !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "hsl(var(--primary))",
              background: "hsl(var(--primary) / 0.1)",
              borderRadius: 4,
              padding: "1px 6px",
            }}
          >
            {badge}
          </span>
        )}

        {disabled && (
          <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontStyle: "italic" }}>
            bloqueado
          </span>
        )}

        {!disabled && onToggle && (
          isExpanded
            ? <EyeOff size={14} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
            : <Eye size={14} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
        )}
      </button>

      {/* Content — overflow visible when expanded so absolute dropdowns (CABYS, etc.) aren't clipped */}
      <div
        style={{
          maxHeight: isExpanded ? 9999 : 0,
          overflow: isExpanded ? "visible" : "hidden",
          transition: "max-height 300ms ease-in-out",
        }}
      >
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "8px 0", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
              Cargando…
            </div>
          )}
          {error && (
            <div style={{ padding: "8px 10px", background: "hsl(var(--destructive) / 0.08)", borderRadius: 6, fontSize: 12, color: "hsl(var(--destructive))" }}>
              {error}
            </div>
          )}
          {!loading && children}
        </div>
      </div>
    </div>
  );
}
