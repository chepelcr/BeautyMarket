import { Icon } from "@/components/ui";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  style?: React.CSSProperties;
}

export function SearchInput({ value, onChange, placeholder = "Buscar…", isLoading, style }: SearchInputProps) {
  return (
    <div style={{ position: "relative", ...style }}>
      <div
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "hsl(var(--muted-foreground))",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <Icon name="refresh" size={14} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Icon name="search" size={14} />
        )}
      </div>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: 36, width: "100%" }}
      />
    </div>
  );
}
