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

export default function CartBar({
  items,
  total,
  count,
  onAdd,
  onRemove,
  onCheckout,
}: CartBarProps) {
  return (
    <div className="bg-surface border-t border-surface-border px-3 py-2.5 shrink-0">
      {/* Cart items */}
      {items.length > 0 && (
        <div className="max-h-[120px] overflow-y-auto mb-2.5 space-y-1.5">
          {items.map(({ product, qty }) => (
            <div
              key={product.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRemove(product.id)}
                  className="w-6 h-6 bg-surface-high border border-surface-border rounded text-muted text-sm leading-none"
                >
                  −
                </button>
                <span className="text-muted text-xs w-4 text-center">{qty}</span>
                <button
                  onClick={() => onAdd(product)}
                  className="w-6 h-6 bg-primary/20 border border-primary/40 rounded text-primary text-sm leading-none"
                >
                  +
                </button>
                <span className="text-foreground text-sm font-barlow">
                  {product.emoji} {product.name}
                </span>
              </div>
              <span className="text-primary font-barlow font-bold text-sm">
                ₡{(product.price * qty).toLocaleString("es-CR")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Checkout button */}
      <button
        onClick={onCheckout}
        disabled={items.length === 0}
        className="w-full py-3.5 rounded-xl font-barlow font-extrabold text-xl tracking-wide flex items-center justify-between px-4 transition-colors disabled:bg-surface-high disabled:text-muted-foreground bg-primary text-white active:bg-primary-dark"
      >
        <span>
          {items.length > 0
            ? `🛒 ${count} ítem${count !== 1 ? "s" : ""}`
            : "Seleccioná productos"}
        </span>
        {items.length > 0 && (
          <span>₡{total.toLocaleString("es-CR")}</span>
        )}
      </button>
    </div>
  );
}
