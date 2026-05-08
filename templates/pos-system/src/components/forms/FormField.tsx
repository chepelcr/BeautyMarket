interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function FormField({ label, required, error, children, style }: FormFieldProps) {
  return (
    <div style={style}>
      <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: "hsl(var(--destructive))", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 12, color: "hsl(var(--destructive))", marginTop: 4, display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}
