import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  label?: string;
  fullHeight?: boolean; // fills parent with centered content
}

export function Spinner({ size = 28, label, fullHeight = false }: SpinnerProps) {
  const inner = (
    <>
      <Loader2
        size={size}
        style={{ animation: "spin 1s linear infinite", color: "hsl(var(--primary))", flexShrink: 0 }}
      />
      {label && (
        <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{label}</span>
      )}
    </>
  );

  if (fullHeight) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          height: "100%",
          minHeight: "60vh",
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {inner}
    </div>
  );
}
