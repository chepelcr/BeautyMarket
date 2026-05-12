import { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMobileDrawer } from "./DashboardMobileDrawer";
import { DashboardToggleButton } from "./DashboardToggleButton";

type NavId = "dashboard" | "config" | "puestos" | "productos" | "reporte" | "pos" | "clients";

interface DashboardShellProps {
  children: React.ReactNode;
  active?: NavId;
  onNav?: (id: NavId) => void;
  sessionName?: string;
  sessionLocation?: string;
}

export default function DashboardShell({
  children,
  active = "dashboard",
  onNav,
  sessionName,
  sessionLocation,
}: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pendingNavRef = useRef<NavId | null>(null);

  // Handle drawer open/close with animation - 450ms to match Drawer.tsx
  useEffect(() => {
    if (drawerOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        
        // Execute pending navigation after animation completes
        if (pendingNavRef.current) {
          onNav?.(pendingNavRef.current);
          pendingNavRef.current = null;
        }
      }, 450); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [drawerOpen, shouldRender, onNav]);

  const handleNav = (id: NavId) => {
    // If drawer is open (mobile), close it first and defer navigation
    if (drawerOpen && !isClosing) {
      pendingNavRef.current = id;
      setDrawerOpen(false);
    } else {
      // Desktop or drawer already closed - navigate immediately
      onNav?.(id);
    }
  };

  const handleCloseDrawer = () => {
    if (!isClosing) {
      setDrawerOpen(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Desktop/tablet sidebar (≥769px) */}
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

      {/* Mobile drawer */}
      <DashboardMobileDrawer
        open={drawerOpen}
        isClosing={isClosing}
        shouldRender={shouldRender}
        active={active}
        onNav={handleNav}
        onClose={handleCloseDrawer}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setDrawerOpen(true)}
          sessionName={sessionName}
          sessionLocation={sessionLocation}
        />

        {/* Page content */}
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
