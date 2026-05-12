import { Card } from "@/components/ui";

export function ClientSkeletonCard() {
  return (
    <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: "hsl(var(--muted) / 0.4)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 13, width: "65%", background: "hsl(var(--muted) / 0.4)", borderRadius: 5, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 9, width: "38%", background: "hsl(var(--muted) / 0.25)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.1s" }} />
        </div>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "hsl(var(--muted) / 0.2)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.2s" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 9, width: "78%", background: "hsl(var(--muted) / 0.25)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.15s" }} />
        <div style={{ height: 9, width: "52%", background: "hsl(var(--muted) / 0.18)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.25s" }} />
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Card>
  );
}
