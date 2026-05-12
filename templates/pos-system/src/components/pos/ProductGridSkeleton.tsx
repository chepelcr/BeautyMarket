export function ProductGridSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1/1",
        borderRadius: 12,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
      className="animate-pulse"
    >
      {/* Image placeholder */}
      <div
        style={{
          flex: 1,
          borderRadius: 8,
          background: "hsl(var(--muted))",
        }}
      />
      
      {/* Name placeholder */}
      <div
        style={{
          height: 14,
          borderRadius: 4,
          background: "hsl(var(--muted))",
          width: "80%",
        }}
      />
      
      {/* Price placeholder */}
      <div
        style={{
          height: 16,
          borderRadius: 4,
          background: "hsl(var(--muted))",
          width: "50%",
        }}
      />
    </div>
  );
}
