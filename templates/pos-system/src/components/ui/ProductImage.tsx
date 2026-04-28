import React from "react";
import { Icon } from "./Icon";

interface ProductImageProps {
  imageUrl?: string | null;
  name?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductImage({ imageUrl, name, size = 40, className = "", style }: ProductImageProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name ?? "producto"}
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "cover", borderRadius: 6, flexShrink: 0, ...style }}
      />
    );
  }
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: "hsl(var(--muted))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "hsl(var(--muted-foreground))",
        ...style,
      }}
    >
      <Icon name="package" size={Math.max(16, Math.round(size * 0.5))} />
    </div>
  );
}
