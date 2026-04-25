import { useState } from "react";
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
  const visible = items.filter((i) => !i.hidden);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div onClick={() => setOpen((v) => !v)}>
        {trigger ?? (
          <button className="btn btn-ghost btn-sm btn-icon" type="button">
            <Icon name="moreV" size={15} />
          </button>
        )}
      </div>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 50 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              [align === "right" ? "right" : "left"]: 0,
              top: "calc(100% + 4px)",
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 51,
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "hsl(var(--muted) / 0.6)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {item.icon && <Icon name={item.icon} size={14} />}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
