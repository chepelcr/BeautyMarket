export function ClientListSkeleton() {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
      className="animate-pulse"
    >
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "hsl(var(--muted))",
          flexShrink: 0,
        }}
      />
      
      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            height: 12,
            borderRadius: 4,
            background: "hsl(var(--muted))",
            width: "70%",
          }}
        />
        <div
          style={{
            height: 10,
            borderRadius: 4,
            background: "hsl(var(--muted))",
            width: "50%",
          }}
        />
      </div>
    </div>
  );
}
