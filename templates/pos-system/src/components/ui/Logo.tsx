interface LogoProps {
  size?: number;
  showWord?: boolean;
  orgName?: string;
}

export function Logo({ size = 32, showWord = true, orgName }: LogoProps) {
  const initials = orgName
    ? orgName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "JM";

  const displayName = orgName ?? "JMarkets POS";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.25),
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: Math.round(size * 0.52),
          letterSpacing: 0.5,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      {showWord && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "hsl(var(--foreground))",
            }}
          >
            {displayName}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "hsl(var(--muted-foreground))",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginTop: 2,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
            }}
          >
            Punto de venta
          </span>
        </div>
      )}
    </div>
  );
}
