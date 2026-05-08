interface ErrorBoxProps {
  message: string;
  style?: React.CSSProperties;
}

export function ErrorBox({ message, style }: ErrorBoxProps) {
  return (
    <div
      style={{
        background: "hsl(var(--destructive) / 0.1)",
        border: "1px solid hsl(var(--destructive) / 0.3)",
        borderRadius: 10,
        color: "hsl(var(--destructive))",
        padding: "10px 14px",
        fontSize: 13,
        ...style,
      }}
    >
      {message}
    </div>
  );
}
