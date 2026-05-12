export function ChartSkeleton() {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 12,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
      className="animate-pulse"
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            height: 16,
            borderRadius: 4,
            background: "hsl(var(--muted))",
            width: "30%",
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 4,
            background: "hsl(var(--muted))",
            width: "15%",
          }}
        />
      </div>
      
      {/* Chart bars */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200 }}>
        {[60, 80, 45, 90, 70, 55, 85].map((height, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${height}%`,
              borderRadius: "4px 4px 0 0",
              background: "hsl(var(--muted))",
            }}
          />
        ))}
      </div>
      
      {/* X-axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 10,
              borderRadius: 4,
              background: "hsl(var(--muted))",
              width: "10%",
            }}
          />
        ))}
      </div>
    </div>
  );
}
