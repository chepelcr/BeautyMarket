import { FormLabel } from "@/components/ui";

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
      <FormLabel required={required}>
        {label}
      </FormLabel>
      {children}
      {error && (
        <span style={{ fontSize: 12, color: "hsl(var(--destructive))", marginTop: 4, display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}
