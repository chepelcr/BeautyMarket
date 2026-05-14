interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  style?: React.CSSProperties;
}

export function FormLabel({ children, required, htmlFor, style }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="t-label"
      style={{
        display: "block",
        marginBottom: 6,
        ...style,
      }}
    >
      {children}
      {required && <span style={{ color: "hsl(var(--destructive))" }}> *</span>}
    </label>
  );
}
