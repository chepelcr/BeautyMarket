import React from "react";
import { Icon } from "./Icon";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "package", title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        className="icon-pill icon-pill-lg icon-pill-muted"
        style={{ marginBottom: 16, width: 64, height: 64 }}
      >
        <Icon name={icon} size={28} strokeWidth={1.5} />
      </div>
      <h3 className="t-h3" style={{ marginBottom: 6 }}>
        {title}
      </h3>
      {description && (
        <p
          className="t-sm"
          style={{ color: "hsl(var(--muted-foreground))", maxWidth: 360, marginBottom: 20 }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
