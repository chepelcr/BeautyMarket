import { Card } from "@/components/ui";

export function BranchSkeletonCard() {
  return (
    <Card style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "hsl(var(--muted) / 0.4)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div>
            <div style={{ height: 14, width: 120, background: "hsl(var(--muted) / 0.4)", borderRadius: 5, marginBottom: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 10, width: 80, background: "hsl(var(--muted) / 0.25)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.1s" }} />
          </div>
        </div>
        <div style={{ width: 60, height: 22, background: "hsl(var(--muted) / 0.3)", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.15s" }} />
      </div>
      
      {/* Stats */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, height: 50, background: "hsl(var(--muted) / 0.15)", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.2s" }} />
        <div style={{ flex: 1, height: 50, background: "hsl(var(--muted) / 0.15)", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.25s" }} />
      </div>
      
      {/* Actions */}
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1, height: 32, background: "hsl(var(--muted) / 0.2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
        <div style={{ width: 32, height: 32, background: "hsl(var(--muted) / 0.2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
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
