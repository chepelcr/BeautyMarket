export function DashboardStatSkeleton() {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 12,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      className="animate-pulse"
    >
      {/* Icon + Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "hsl(var(--muted))",
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 4,
            background: "hsl(var(--muted))",
            width: "60%",
          }}
        />
      </div>
      
      {/* Value */}
      <div
        style={{
          height: 28,
          borderRadius: 6,
          background: "hsl(var(--muted))",
          width: "80%",
        }}
      />
      
      {/* Subtitle */}
      <div
        style={{
          height: 10,
          borderRadius: 4,
          background: "hsl(var(--muted))",
          width: "50%",
        }}
      />
    </div>
  );
}
