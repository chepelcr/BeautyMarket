import { useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

type NavId = "dashboard" | "config" | "puestos" | "productos" | "reporte" | "pos" | "documents" | "clients";

interface DashboardMobileDrawerProps {
  open: boolean;
  isClosing: boolean;
  shouldRender: boolean;
  active: NavId;
  onNav: (id: NavId) => void;
  onClose: () => void;
}

export function DashboardMobileDrawer({
  open,
  isClosing,
  shouldRender,
  active,
  onNav,
  onClose,
}: DashboardMobileDrawerProps) {
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

  if (!shouldRender) return null;

  return (
    <div
      style={{ 
        position: "fixed", 
        inset: 0, 
        zIndex: 100,
        display: "flex",
      }}
    >
      {/* Overlay */}
      <div
        className={isClosing ? "drawer-overlay-exit" : "drawer-overlay-enter"}
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(1px)",
        }}
        onClick={onClose}
      />
      
      {/* Drawer panel */}
      <div
        className={isClosing ? "drawer-panel-exit" : "drawer-panel-enter"}
        style={{
          position: "relative",
          width: 260,
          height: "100dvh",
          zIndex: 101,
          background: "hsl(var(--card))",
          boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <DashboardSidebar
          active={active}
          onNav={onNav}
          onClose={onClose}
        />
      </div>

      <style>{`
        /* Mobile drawer animations - 450ms to match Drawer.tsx */
        .drawer-overlay-enter {
          animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-overlay-exit {
          animation: fadeOut 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-panel-enter {
          animation: slideInLeft 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-panel-exit {
          animation: slideOutLeft 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideInLeft {
          from { 
            transform: translateX(-100%); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
        
        @keyframes slideOutLeft {
          from { 
            transform: translateX(0); 
            opacity: 1; 
          }
          to { 
            transform: translateX(-100%); 
            opacity: 0; 
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
