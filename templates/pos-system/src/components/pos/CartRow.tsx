import { Icon } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { POS } from "@/theme/pos";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface CartRowItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
  lineDiscount?: number;
  lineNote?: string;
}

interface CartRowProps {
  item: CartRowItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onEdit: () => void;
}

export function CartRow({ item, onIncrease, onDecrease, onEdit }: CartRowProps) {
  const displayPrice = item.price * (1 - (item.lineDiscount ?? 0) / 100);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: `1px solid ${POS.border}`,
      }}
    >
      <ProductImage imageUrl={item.image_url} name={item.name} size={40} style={{ borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: POS.text, fontFamily: POS.fontUI, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.lineNote || item.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: POS.muted, fontFamily: POS.fontUI }}>{fmt(displayPrice)} c/u</span>
          {(item.lineDiscount ?? 0) > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: POS.rose, background: `${POS.rose}22`, padding: "1px 5px", borderRadius: 4, fontFamily: POS.fontUI }}>
              -{item.lineDiscount}%
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onEdit}
        title="Editar línea"
        style={{ width: 28, height: 28, border: "none", background: "transparent", color: POS.muted, cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        <Icon name="edit" size={12} />
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 20,
          padding: "2px 4px",
        }}
      >
        <button
          onClick={onDecrease}
          style={{ width: 28, height: 28, border: "none", background: "transparent", color: POS.muted, cursor: "pointer", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon name="minus" size={12} />
        </button>
        <span style={{ minWidth: 20, textAlign: "center", fontSize: 14, fontWeight: 700, color: POS.text, fontFamily: POS.fontUI, fontVariantNumeric: "tabular-nums" }}>
          {item.qty}
        </span>
        <button
          onClick={onIncrease}
          style={{ width: 28, height: 28, border: "none", background: "transparent", color: POS.rose, cursor: "pointer", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon name="plus" size={12} />
        </button>
      </div>
      <div style={{ minWidth: 70, textAlign: "right", fontSize: 13, fontWeight: 700, color: POS.text, fontFamily: POS.fontUI, fontVariantNumeric: "tabular-nums" }}>
        {fmt(displayPrice * item.qty)}
      </div>
    </div>
  );
}
