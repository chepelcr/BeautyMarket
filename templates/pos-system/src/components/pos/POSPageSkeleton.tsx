export function POSPageSkeleton() {
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
