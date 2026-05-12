import React, { useEffect, useState } from "react";
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
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  // Handle open/close with animation
  useEffect(() => {
    if (open) {
      // Opening
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      // Closing - start animation
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 450); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

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

  const handleClose = () => {
    if (!isClosing) {
      onClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={isClosing ? "drawer-overlay-exit" : "drawer-overlay-enter"}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 200,
          backdropFilter: "blur(1px)",
        }}
        onClick={handleClose}
      />

      <div
        className={isClosing ? "drawer-panel-exit" : "drawer-panel-enter"}
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
            opacity: isClosing ? 0 : 1,
            transition: "opacity 0.1s ease-out",
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
            onClick={handleClose}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", opacity: isClosing ? 0 : 1, transition: "opacity 0.1s ease-out" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ borderTop: "1px solid hsl(var(--border))", flexShrink: 0, opacity: isClosing ? 0 : 1, transition: "opacity 0.1s ease-out" }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        /* Enter animations */
        .drawer-overlay-enter {
          animation: overlayFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-panel-enter {
          animation: drawerSlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Exit animations */
        .drawer-overlay-exit {
          animation: overlayFadeOut 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-panel-exit {
          animation: drawerSlideOut 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes drawerSlideOut {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(100%); opacity: 0; }
        }
        
        /* Mobile full-screen */
        @media (max-width: 768px) {
          .drawer-panel-enter,
          .drawer-panel-exit {
            width: 100vw !important;
            border-left: none;
          }
        }
      `}</style>
    </>
  );
}
