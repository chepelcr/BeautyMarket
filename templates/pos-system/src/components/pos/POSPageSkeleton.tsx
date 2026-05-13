import { useIsDesktop } from "@/hooks/useIsDesktop";

export function POSPageSkeleton() {
  const isDesktop = useIsDesktop(768);

  if (!isDesktop) {
    return <POSPageSkeletonMobile />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "hsl(var(--background))" }}>
      {/* Left pane skeleton */}
      <div style={{ flex: 1, borderRight: "1px solid hsl(var(--border))", display: "flex", flexDirection: "column" }}>
        {/* Header skeleton */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
          <div style={{ width: "60%", height: 20, background: "hsl(var(--muted))", borderRadius: 4, marginBottom: 12, animation: "pulse 2s ease-in-out infinite" }} />
          <div style={{ width: "100%", height: 40, background: "hsl(var(--muted))", borderRadius: 8, animation: "pulse 2s ease-in-out infinite" }} />
        </div>

        {/* Category tabs skeleton */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid hsl(var(--border))", display: "flex", gap: 8, overflowX: "auto" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: 80, height: 32, background: "hsl(var(--muted))", borderRadius: 6, flexShrink: 0, animation: "pulse 2s ease-in-out infinite" }} />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: 12 }}>
                <div style={{ width: "100%", height: 80, background: "hsl(var(--muted))", borderRadius: 6, marginBottom: 10, animation: "pulse 2s ease-in-out infinite" }} />
                <div style={{ width: "80%", height: 14, background: "hsl(var(--muted))", borderRadius: 3, marginBottom: 6, animation: "pulse 2s ease-in-out infinite" }} />
                <div style={{ width: "50%", height: 18, background: "hsl(var(--muted))", borderRadius: 3, animation: "pulse 2s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar skeleton */}
      <div style={{ width: 380, borderLeft: "1px solid hsl(var(--border))", display: "flex", flexDirection: "column", background: "hsl(var(--card))" }}>
        {/* Cart header skeleton */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border))" }}>
          <div style={{ width: "40%", height: 20, background: "hsl(var(--muted))", borderRadius: 4, marginBottom: 8, animation: "pulse 2s ease-in-out infinite" }} />
          <div style={{ width: "60%", height: 14, background: "hsl(var(--muted))", borderRadius: 3, animation: "pulse 2s ease-in-out infinite" }} />
        </div>

        {/* Cart items skeleton */}
        <div style={{ flex: 1, padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: 12, background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}>
              <div style={{ width: "70%", height: 14, background: "hsl(var(--muted))", borderRadius: 3, marginBottom: 8, animation: "pulse 2s ease-in-out infinite" }} />
              <div style={{ width: "40%", height: 16, background: "hsl(var(--muted))", borderRadius: 3, animation: "pulse 2s ease-in-out infinite" }} />
            </div>
          ))}
        </div>

        {/* Cart footer skeleton */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid hsl(var(--border))" }}>
          <div style={{ width: "100%", height: 48, background: "hsl(var(--muted))", borderRadius: 8, animation: "pulse 2s ease-in-out infinite" }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function POSPageSkeletonMobile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "hsl(var(--background))" }}>
      {/* Mobile header skeleton */}
      <div style={{ 
        height: 48, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "0 16px", 
        borderBottom: "1px solid hsl(var(--border))", 
        background: "hsl(var(--card))",
        flexShrink: 0
      }}>
        <div style={{ width: "40%", height: 18, background: "hsl(var(--muted))", borderRadius: 4, animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ width: 70, height: 24, background: "hsl(var(--muted))", borderRadius: 12, animation: "pulse 2s ease-in-out infinite" }} />
      </div>

      {/* Search bar skeleton */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid hsl(var(--border))" }}>
        <div style={{ width: "100%", height: 40, background: "hsl(var(--muted))", borderRadius: 8, animation: "pulse 2s ease-in-out infinite" }} />
      </div>

      {/* Category tabs skeleton */}
      <div style={{ 
        padding: "10px 16px", 
        borderBottom: "1px solid hsl(var(--border))", 
        display: "flex", 
        gap: 8, 
        overflowX: "auto"
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ 
            minWidth: 75, 
            height: 32, 
            background: "hsl(var(--muted))", 
            borderRadius: 6, 
            flexShrink: 0, 
            animation: "pulse 2s ease-in-out infinite" 
          }} />
        ))}
      </div>

      {/* Product grid skeleton - mobile optimized */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: 12 
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ 
              background: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))", 
              borderRadius: 10, 
              padding: 10,
              aspectRatio: "1"
            }}>
              <div style={{ 
                width: "100%", 
                height: "60%", 
                background: "hsl(var(--muted))", 
                borderRadius: 6, 
                marginBottom: 8, 
                animation: "pulse 2s ease-in-out infinite" 
              }} />
              <div style={{ 
                width: "85%", 
                height: 12, 
                background: "hsl(var(--muted))", 
                borderRadius: 3, 
                marginBottom: 6, 
                animation: "pulse 2s ease-in-out infinite" 
              }} />
              <div style={{ 
                width: "55%", 
                height: 14, 
                background: "hsl(var(--muted))", 
                borderRadius: 3, 
                animation: "pulse 2s ease-in-out infinite" 
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile bottom tab bar skeleton */}
      <div style={{ 
        display: "flex", 
        background: "hsl(var(--card))", 
        borderTop: "1px solid hsl(var(--border))",
        flexShrink: 0
      }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: 4, 
            padding: "10px 0" 
          }}>
            <div style={{ 
              width: 50, 
              height: 10, 
              background: "hsl(var(--muted))", 
              borderRadius: 3, 
              animation: "pulse 2s ease-in-out infinite" 
            }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
