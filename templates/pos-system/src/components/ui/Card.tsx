import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverable?: boolean;
  onClick?: () => void;
  as?: keyof React.JSX.IntrinsicElements;
}

export function Card({ children, className = "", style, hoverable, onClick, as: Tag = "div", ...rest }: CardProps) {
  return (
    // @ts-ignore — dynamic tag
    <Tag
      className={`card ${hoverable ? "card-hover" : ""} ${className}`}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Tag>
  );
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardHeader({ children, className = "", style }: CardSectionProps) {
  return (
    <div className={className} style={{ padding: "20px 24px 0", ...style }}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "", style }: CardSectionProps) {
  return (
    <div className={className} style={{ padding: 24, ...style }}>
      {children}
    </div>
  );
}

interface CardFooterProps extends CardSectionProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function CardFooter({ children, className = "", style, onClick }: CardFooterProps) {
  return (
    <div
      className={className}
      style={{ padding: "16px 24px", borderTop: "1px solid hsl(var(--border))", ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", style }: CardSectionProps) {
  return (
    <h3 className={`t-h4 ${className}`} style={{ marginBottom: 4, ...style }}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", style }: CardSectionProps) {
  return (
    <p className={`t-sm ${className}`} style={{ color: "hsl(var(--muted-foreground))", ...style }}>
      {children}
    </p>
  );
}
