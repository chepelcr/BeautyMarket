import { Card } from "@/components/ui";

export function SessionSkeletonCard() {
  return (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        {/* Left side */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "hsl(var(--muted) / 0.4)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 15, width: "60%", background: "hsl(var(--muted) / 0.4)", borderRadius: 5, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 10, width: "40%", background: "hsl(var(--muted) / 0.25)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.1s" }} />
          </div>
        </div>
        
        {/* Stats */}
        <div style={{ display: "flex", gap: 16 }}>
          <div>
            <div style={{ height: 9, width: 60, background: "hsl(var(--muted) / 0.25)", borderRadius: 5, marginBottom: 6, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.15s" }} />
            <div style={{ height: 16, width: 80, background: "hsl(var(--muted) / 0.35)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.2s" }} />
          </div>
          <div>
            <div style={{ height: 9, width: 60, background: "hsl(var(--muted) / 0.25)", borderRadius: 5, marginBottom: 6, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.25s" }} />
            <div style={{ height: 16, width: 50, background: "hsl(var(--muted) / 0.35)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 80, height: 34, background: "hsl(var(--muted) / 0.2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.35s" }} />
          <div style={{ width: 34, height: 34, background: "hsl(var(--muted) / 0.2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.35s" }} />
        </div>
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
