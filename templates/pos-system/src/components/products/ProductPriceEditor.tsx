import { Icon } from "@/components/ui";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

interface ProductPriceEditorProps {
  productId: string;
  price: number;
  editing: boolean;
  inputValue: string;
  align?: "left" | "right";
  onStartEdit: (id: string, currentPrice: number) => void;
  onInputChange: (v: string) => void;
  onSave: (id: string, price: number) => void;
  onCancel: () => void;
}

export function ProductPriceEditor({
  productId,
  price,
  editing,
  inputValue,
  align = "left",
  onStartEdit,
  onInputChange,
  onSave,
  onCancel,
}: ProductPriceEditorProps) {
  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: align === "right" ? "flex-end" : "flex-start", gap: 6 }}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          autoFocus
          className="pp-input pp-input-sm"
          style={{ width: 90 }}
        />
        <button
          className="btn btn-success btn-xs"
          onClick={() => onSave(productId, Number(inputValue))}
        >
          <Icon name="check" size={12} />
        </button>
        <button className="btn btn-ghost btn-xs" onClick={onCancel}>
          <Icon name="close" size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      style={{
        fontWeight: 700,
        fontFamily: "var(--font-display)",
        color: "hsl(var(--primary))",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: align === "left" ? 20 : 13,
      }}
      onClick={() => onStartEdit(productId, price)}
    >
      {fmt(price)}
    </button>
  );
}
