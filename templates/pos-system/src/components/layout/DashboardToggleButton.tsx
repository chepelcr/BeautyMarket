import { Icon } from "@/components/ui";

interface DashboardToggleButtonProps {
  collapsed: boolean;
  onClick: () => void;
}

export function DashboardToggleButton({ collapsed, onClick }: DashboardToggleButtonProps) {
  return (
    <>
      <button
        className="dashboard-sidebar-toggle"
        onClick={onClick}
        style={{
          position: "fixed",
          left: collapsed ? -20 : 220,
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
          transition: "left 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s",
          boxShadow: "2px 0 12px rgba(0,0,0,0.06)",
          opacity: 0.3,
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
        /* Semi-hidden tab that reveals on hover */
        .dashboard-sidebar-toggle:hover {
          left: ${collapsed ? '0' : '240'}px !important;
          opacity: 1 !important;
          background: hsl(var(--accent));
        }
        
        /* Also reveal when hovering near the edge */
        .dashboard-sidebar-toggle:before {
          content: '';
          position: absolute;
          left: -20px;
          top: 0;
          width: 20px;
          height: 100%;
        }
      `}</style>
    </>
  );
}
