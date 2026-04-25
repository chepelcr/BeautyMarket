import { Badge, Icon } from "@/components/ui";
import type { Product } from "@/hooks/useProducts";
import { useInventory } from "@/store/inventory";

interface ProductGridProps {
  products: Product[];
  cart: Record<number, number>;
  onAdd: (product: Product) => void;
  category: string;
  onCategoryChange: (cat: string) => void;
}

const CATEGORIES = ["Todos", "Comida", "Bebida"];

export default function ProductGrid({ products, cart, onAdd, category, onCategoryChange }: ProductGridProps) {
  const getStock = useInventory((s) => s.getStock);

  const filtered =
    category === "Todos" ? products : products.filter((p) => (p as any).category_id === category);

  return (
    <>
      {/* Category tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 12px",
          background: "hsl(var(--card))",
          borderBottom: "1px solid hsl(var(--border))",
          flexShrink: 0,
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`btn btn-sm ${category === cat ? "btn-primary" : "btn-outline"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          alignContent: "start",
        }}
      >
        {filtered.map((p) => {
          const pid = parseInt(p.product_id, 10);
          const inCart = cart[pid] ?? 0;
          const localStock = getStock(pid);
          const stock = localStock !== undefined ? localStock : (p.stock_quantity ?? 0);
          const isOut = stock === 0;
          const isLow = stock > 0 && stock <= 3;

          return (
            <button
              key={p.product_id}
              type="button"
              onClick={() => onAdd(p)}
              disabled={isOut}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
                padding: 12,
                borderRadius: 12,
                border: `1.5px solid ${
                  inCart > 0
                    ? "hsl(var(--primary) / 0.5)"
                    : "hsl(var(--border))"
                }`,
                background: isOut
                  ? "hsl(var(--muted) / 0.4)"
                  : inCart > 0
                  ? "hsl(var(--primary) / 0.06)"
                  : "hsl(var(--card))",
                cursor: isOut ? "not-allowed" : "pointer",
                opacity: isOut ? 0.5 : 1,
                textAlign: "left",
                minHeight: 90,
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              {/* Stock badge */}
              {isOut && (
                <div style={{ position: "absolute", top: 6, right: 6 }}>
                  <Badge variant="destructive">Agotado</Badge>
                </div>
              )}
              {isLow && !isOut && (
                <div style={{ position: "absolute", top: 6, right: 6 }}>
                  <Badge variant="warning">
                    <Icon name="alert" size={10} />
                    {" "}{stock}
                  </Badge>
                </div>
              )}

              {/* Cart count bubble */}
              {inCart > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: "hsl(var(--primary))",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {inCart}
                </div>
              )}

              <span style={{ fontSize: 28 }}>{p.emoji}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  lineHeight: 1.2,
                  color: "hsl(var(--foreground))",
                }}
              >
                {p.name}
              </span>
              <span
                className="t-num"
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: inCart > 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                }}
              >
                ₡{p.price.toLocaleString("es-CR")}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
