import { Icon } from "@/components/ui";

interface DashboardToggleButtonProps {
  collapsed: boolean;
  onClick: () => void;
}

/**
 * Slim handle that sits BEHIND the sidebar (z-index 40 vs sidebar's 50).
 * - Sidebar expanded: the handle is positioned ~20px inside the sidebar's
 *   right edge and is mostly occluded by the sidebar — only a tiny peek is
 *   visible past the right edge. Hover slides it fully out from behind.
 * - Sidebar collapsed: the handle sits at the screen's left edge so the user
 *   has a clear affordance to pull the sidebar back in.
 */
export function DashboardToggleButton({ collapsed, onClick }: DashboardToggleButtonProps) {
  return (
    <>
      <button
        className="dashboard-sidebar-toggle"
        onClick={onClick}
        style={{
          position: "fixed",
          left: collapsed ? 0 : 220,
          top: "50%",
          transform: "translateY(-50%)",
          width: 28,
          height: 80,
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderLeft: "none",
          borderRadius: "0 12px 12px 0",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 40,
          transition: "left 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.15s",
          boxShadow: "2px 0 12px rgba(0,0,0,0.06)",
        }}
        aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
      >
        <Icon
          name={collapsed ? "chevronRight" : "chevronLeft"}
          size={16}
          style={{ color: "hsl(var(--muted-foreground))" }}
        />
      </button>

      <style>{`
        /* Hover slides the handle out from behind the sidebar (or further
           out into the canvas when the sidebar is already collapsed). */
        .dashboard-sidebar-toggle:hover {
          left: ${collapsed ? '6' : '240'}px !important;
          background: hsl(var(--accent)) !important;
        }

        /* Generous invisible hover catcher so the user doesn't need to land
           pixel-perfect on the visible peek. Extends to the LEFT of the
           handle (into the sidebar) and a bit to the right. */
        .dashboard-sidebar-toggle::before {
          content: '';
          position: absolute;
          left: -24px;
          right: -8px;
          top: -8px;
          bottom: -8px;
        }
      `}</style>
    </>
  );
}
