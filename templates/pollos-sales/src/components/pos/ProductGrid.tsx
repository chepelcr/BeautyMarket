import { cn } from "@/lib/utils";
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

export default function ProductGrid({
  products,
  cart,
  onAdd,
  category,
  onCategoryChange,
}: ProductGridProps) {
  const getStock = useInventory((s) => s.getStock);

  const filtered =
    category === "Todos" ? products : products.filter((p) => (p as any).category_id === category);

  return (
    <>
      {/* Category tabs */}
      <div className="flex gap-2 px-3 py-2.5 bg-surface border-b border-surface-border shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "px-4 py-1.5 rounded-md font-barlow font-bold text-sm transition-colors",
              category === cat
                ? "bg-primary text-white"
                : "bg-surface-high text-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start">
        {filtered.map((p) => {
          const pid = parseInt(p.id, 10);
          const inCart = cart[pid] ?? 0;
          const localStock = getStock(pid);
          const stock = localStock !== undefined ? localStock : (p.stock_quantity ?? 0);
          const isOut = stock === 0;
          const isLow = stock > 0 && stock <= 3;

          return (
            <button
              key={p.id}
              onClick={() => onAdd(p)}
              disabled={isOut}
              className={cn(
                "relative flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-colors min-h-[90px]",
                isOut
                  ? "bg-[#1A1A1A] border-surface-border opacity-40 cursor-not-allowed"
                  : inCart > 0
                  ? "bg-[#2A1608] border-primary/50"
                  : "bg-surface-high border-surface-border active:bg-surface"
              )}
            >
              {/* Badges */}
              {isOut && (
                <span className="absolute top-1.5 right-1.5 bg-destructive/20 text-destructive text-[9px] font-bold px-1.5 py-0.5 rounded">
                  AGOTADO
                </span>
              )}
              {isLow && !isOut && (
                <span className="absolute top-1.5 right-1.5 bg-warning/20 text-warning text-[9px] font-bold px-1.5 py-0.5 rounded">
                  ⚠ {stock}
                </span>
              )}
              {inCart > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[11px] font-extrabold text-white">
                  {inCart}
                </span>
              )}

              <span className="text-3xl">{p.emoji}</span>
              <span className="font-barlow font-bold text-[15px] leading-tight text-foreground">
                {p.name}
              </span>
              <span
                className={cn(
                  "font-barlow font-extrabold text-[17px]",
                  inCart > 0 ? "text-primary" : "text-muted"
                )}
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
