interface LoadingSkeletonProps {
  height?: number | string;
  width?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}

export function LoadingSkeleton({ height = 16, width = "100%", radius = 6, style }: LoadingSkeletonProps) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background: "hsl(var(--muted) / 0.4)",
        animation: "pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}
