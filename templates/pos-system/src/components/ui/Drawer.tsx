import React from "react";
import { Icon } from "./Icon";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  icon,
  iconBg,
  iconColor,
  children,
  footer,
  width = 440,
}: DrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 200,
          backdropFilter: "blur(1px)",
        }}
        onClick={onClose}
      />

      <div
        className="drawer-panel"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: typeof width === "number" ? `min(${width}px, 100vw)` : width,
          background: "hsl(var(--card))",
          borderLeft: "1px solid hsl(var(--border))",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid hsl(var(--border))",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {icon && (
            <div
              className="icon-pill"
              style={{
                width: 36,
                height: 36,
                background: iconBg ?? "hsl(var(--primary) / 0.12)",
                color: iconColor ?? "hsl(var(--primary))",
              }}
            >
              <Icon name={icon} size={16} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{ borderTop: "1px solid hsl(var(--border))", flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        .drawer-panel {
          animation: drawerSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
