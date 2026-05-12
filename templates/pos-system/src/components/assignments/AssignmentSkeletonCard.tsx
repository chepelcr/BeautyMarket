import { Card } from "@/components/ui";

export function AssignmentSkeletonCard() {
  return (
    <Card style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "hsl(var(--muted) / 0.4)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ height: 12, width: 100, background: "hsl(var(--muted) / 0.4)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 18, width: 60, background: "hsl(var(--muted) / 0.3)", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.1s" }} />
          </div>
          <div style={{ height: 9, width: 180, background: "hsl(var(--muted) / 0.25)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.15s" }} />
        </div>
      </div>
      
      {/* Action button */}
      <div style={{ width: 80, height: 32, background: "hsl(var(--muted) / 0.2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.2s" }} />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Card>
  );
}
