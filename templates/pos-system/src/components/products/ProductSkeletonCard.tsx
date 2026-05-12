import { Card } from "@/components/ui";

export function ProductSkeletonCard() {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {/* Image skeleton */}
      <div style={{ width: "100%", height: 180, background: "hsl(var(--muted) / 0.3)", animation: "pulse 1.5s ease-in-out infinite" }} />
      
      {/* Content */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Title */}
        <div style={{ height: 14, width: "75%", background: "hsl(var(--muted) / 0.4)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite" }} />
        
        {/* Category */}
        <div style={{ height: 10, width: "45%", background: "hsl(var(--muted) / 0.25)", borderRadius: 5, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.1s" }} />
        
        {/* Price */}
        <div style={{ height: 18, width: "50%", background: "hsl(var(--muted) / 0.35)", borderRadius: 5, marginTop: 4, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.2s" }} />
        
        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <div style={{ flex: 1, height: 32, background: "hsl(var(--muted) / 0.2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
          <div style={{ width: 32, height: 32, background: "hsl(var(--muted) / 0.2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
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
