import React, { useEffect } from "react";
import { Icon } from "./Icon";
import { Button } from "./Button";

type ModalVariant = "default" | "destructive" | "success" | "warning";

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: string;
  variant?: ModalVariant;
  /** Primary action (right button) */
  confirm?: ModalAction;
  /** Secondary action (left button) — defaults to a Cancel button */
  cancel?: ModalAction;
  /** Extra content rendered between description and buttons */
  children?: React.ReactNode;
}

const variantConfig: Record<ModalVariant, { bg: string; color: string; icon: string }> = {
  default:      { bg: "hsl(var(--primary) / 0.12)",      color: "hsl(var(--primary))",      icon: "info"      },
  destructive:  { bg: "hsl(var(--destructive) / 0.12)",  color: "hsl(var(--destructive))",  icon: "alertTri"  },
  success:      { bg: "hsl(var(--success) / 0.12)",      color: "hsl(var(--success))",      icon: "checkCircle" },
  warning:      { bg: "hsl(var(--secondary) / 0.15)",    color: "hsl(var(--secondary))",    icon: "lock"      },
};

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  variant = "default",
  confirm,
  cancel,
  children,
}: ModalProps) {
  const { bg, color, icon: defaultIcon } = variantConfig[variant];
  const iconName = icon ?? defaultIcon;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          animation: "fadeIn 0.15s ease",
        }}
        onClick={onClose}
      >
        {/* Panel */}
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg, 12px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            padding: 24,
            animation: "fadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div
            className="icon-pill icon-pill-lg"
            style={{
              margin: "0 auto 16px",
              background: bg,
              color,
              width: 56,
              height: 56,
            }}
          >
            <Icon name={iconName} size={24} />
          </div>

          {/* Title */}
          <h3
            className="t-h3"
            style={{ textAlign: "center", marginBottom: description ? 8 : 0 }}
          >
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p
              className="t-sm"
              style={{
                textAlign: "center",
                color: "hsl(var(--muted-foreground))",
                marginBottom: children ? 16 : 0,
              }}
            >
              {description}
            </p>
          )}

          {/* Extra content */}
          {children && <div style={{ marginBottom: 20 }}>{children}</div>}

          {/* Actions */}
          {(confirm || cancel) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20 }}>
              {cancel ? (
                <Button variant={cancel.variant ?? "outline"} onClick={cancel.onClick} disabled={cancel.disabled}>
                  {cancel.label}
                </Button>
              ) : (
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
              )}
              {confirm && (
                <Button
                  variant={confirm.variant ?? "primary"}
                  onClick={confirm.onClick}
                  disabled={confirm.disabled || confirm.loading}
                >
                  {confirm.loading ? (confirm.loadingLabel ?? "Cargando…") : confirm.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px) scale(0.97) } to { opacity: 1; transform: none } }
      `}</style>
    </>
  );
}
