import { Icon, Button } from "@/components/ui";
import type { Product } from "@/hooks/useProducts";

interface CartItem {
  product: Product;
  qty: number;
}

interface CartBarProps {
  items: CartItem[];
  total: number;
  count: number;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartBar({ items, total, count, onAdd, onRemove, onCheckout }: CartBarProps) {
  return (
    <div
      style={{
        background: "hsl(var(--card))",
        borderTop: "1px solid hsl(var(--border))",
        padding: "10px 12px",
        flexShrink: 0,
      }}
    >
      {/* Item list */}
      {items.length > 0 && (
        <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map(({ product, qty }) => (
            <div
              key={product.product_id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* − */}
                <button
                  onClick={() => onRemove(product.product_id)}
                  className="btn btn-outline btn-xs btn-icon"
                  type="button"
                >
                  <Icon name="minus" size={12} />
                </button>
                <span className="t-xs" style={{ width: 16, textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  {qty}
                </span>
                {/* + */}
                <button
                  onClick={() => onAdd(product)}
                  className="btn btn-xs btn-icon"
                  style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}
                  type="button"
                >
                  <Icon name="plus" size={12} />
                </button>
                <span className="t-sm" style={{ fontWeight: 500 }}>
                  {product.emoji} {product.name}
                </span>
              </div>
              <span
                className="t-num"
                style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--primary))" }}
              >
                ₡{(product.price * qty).toLocaleString("es-CR")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Checkout button */}
      <Button
        variant="primary"
        size="xl"
        onClick={onCheckout}
        disabled={items.length === 0}
        style={{ width: "100%", display: "flex", justifyContent: "space-between" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="cart" size={18} />
          {items.length > 0
            ? `${count} ítem${count !== 1 ? "s" : ""}`
            : "Seleccioná productos"}
        </span>
        {items.length > 0 && (
          <span className="t-num" style={{ fontSize: 18, fontWeight: 800 }}>
            ₡{total.toLocaleString("es-CR")}
          </span>
        )}
      </Button>
    </div>
  );
}
