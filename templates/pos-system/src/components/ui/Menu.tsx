import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

export interface MenuItem {
  label: string;
  icon?: string;
  color?: string;
  action: () => void;
  hidden?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
}

export function Menu({ items, trigger, align = "right" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const visible = items.filter((i) => !i.hidden);

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + 4, left: rect.left, right: window.innerWidth - rect.right });
      }
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  };

  return (
    <div style={{ display: "inline-block" }}>
      <div ref={triggerRef} onClick={handleOpen}>
        {trigger ?? (
          <button className="btn btn-ghost btn-sm btn-icon" type="button">
            <Icon name="moreV" size={15} />
          </button>
        )}
      </div>

      {open && createPortal(
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: coords.top,
              ...(align === "right" ? { right: coords.right } : { left: coords.left }),
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              zIndex: 9999,
              minWidth: 170,
              overflow: "hidden",
            }}
          >
            {visible.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action();
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  color: item.color ?? "hsl(var(--foreground))",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted) / 0.6)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {item.icon && <Icon name={item.icon} size={14} />}
                {item.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
