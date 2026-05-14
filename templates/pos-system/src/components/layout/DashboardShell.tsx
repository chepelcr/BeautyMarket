import { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMobileDrawer } from "./DashboardMobileDrawer";
import { DocumentsMobileDrawer } from "./DocumentsMobileDrawer";
import { DashboardToggleButton } from "./DashboardToggleButton";

type NavId = "dashboard" | "config" | "puestos" | "productos" | "reporte" | "pos" | "documents" | "clients";

interface DashboardShellProps {
  children: React.ReactNode;
  active?: NavId;
  onNav?: (id: NavId) => void;
  sessionName?: string;
  sessionLocation?: string;
}

/**
 * Shared open/close state pattern with 450ms slide animation.
 * Returns `[open, isClosing, shouldRender, setOpen]` for a drawer.
 */
function useDrawerState() {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  return { open, isClosing, shouldRender, setOpen };
}

export default function DashboardShell({
  children,
  active = "dashboard",
  onNav,
  sessionName,
  sessionLocation,
}: DashboardShellProps) {
  // Left (main nav) drawer
  const left = useDrawerState();
  // Right (documents) drawer
  const right = useDrawerState();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pendingNavRef = useRef<NavId | null>(null);

  // Defer left-drawer navigation until after the close animation completes
  useEffect(() => {
    if (!left.open && !left.shouldRender && pendingNavRef.current) {
      onNav?.(pendingNavRef.current);
      pendingNavRef.current = null;
    }
  }, [left.open, left.shouldRender, onNav]);

  const handleNav = (id: NavId) => {
    if (left.open && !left.isClosing) {
      pendingNavRef.current = id;
      left.setOpen(false);
    } else {
      onNav?.(id);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Desktop/tablet sidebar (≥769px).
          z-index sits ABOVE the reveal-anchor toggle so the toggle hides
          behind it when the sidebar is expanded — only the peek-out portion
          beyond the sidebar's right edge stays visible. */}
      <div
        style={{
          width: sidebarCollapsed ? 0 : 240,
          display: "none",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
          zIndex: 50,
          background: "hsl(var(--card))",
        }}
        className="dashboard-sidebar-full"
      >
        <DashboardSidebar active={active} onNav={handleNav} />
      </div>

      {/* Desktop sidebar toggle button */}
      <DashboardToggleButton
        collapsed={sidebarCollapsed}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile LEFT drawer (main sidebar) */}
      <DashboardMobileDrawer
        open={left.open}
        isClosing={left.isClosing}
        shouldRender={left.shouldRender}
        active={active}
        onNav={handleNav}
        onClose={() => left.setOpen(false)}
      />

      {/* Mobile RIGHT drawer (documents) */}
      <DocumentsMobileDrawer
        open={right.open}
        isClosing={right.isClosing}
        shouldRender={right.shouldRender}
        onClose={() => right.setOpen(false)}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DashboardHeader
          onMenuClick={() => left.setOpen(true)}
          onDocsClick={() => right.setOpen(true)}
          sessionName={sessionName}
          sessionLocation={sessionLocation}
        />
        <main style={{ flex: 1 }}>{children}</main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .dashboard-sidebar-full { display: block !important; }
          .dashboard-hamburger { display: none !important; }
          .dashboard-sidebar-toggle { display: flex !important; }
        }
        @media (max-width: 768px) {
          .dashboard-sidebar-full { display: none !important; }
          .dashboard-hamburger { display: flex !important; }
          .dashboard-sidebar-toggle { display: none !important; }
        }
      `}</style>
    </div>
  );
}
