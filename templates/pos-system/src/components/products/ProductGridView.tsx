import { Card, Badge, Button } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductPriceEditor } from "./ProductPriceEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/types";

interface ProductGridViewProps {
  products: Product[];
  selected: string[];
  editingPrice: string | null;
  priceInput: string;
  onToggleSelect: (id: string) => void;
  onEdit: (p: Product) => void;
  onToggleActive: (id: string, status: number) => void;
  onStartEditPrice: (id: string, price: number) => void;
  onPriceInputChange: (v: string) => void;
  onSavePrice: (id: string, price: number) => void;
  onCancelEditPrice: () => void;
  onNavigate?: (id: string) => void;
}

const lowStock = (p: Product) => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5;

export function ProductGridView({
  products,
  selected,
  editingPrice,
  priceInput,
  onToggleSelect,
  onEdit,
  onToggleActive,
  onStartEditPrice,
  onPriceInputChange,
  onSavePrice,
  onCancelEditPrice,
  onNavigate,
}: ProductGridViewProps) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
      }}
    >
      {products.map((p) => (
        <Card 
          key={p.product_id} 
          hoverable 
          style={{ padding: 0, overflow: "hidden", opacity: p.status !== 0 ? 1 : 0.6, cursor: onNavigate ? "pointer" : "default" }}
          onClick={() => onNavigate?.(p.product_id)}
        >
          <div style={{ position: "relative" }}>
            <ProductImage
              imageUrl={p.image_url}
              name={p.name}
              size={0}
              style={{ width: "100%", height: "auto", aspectRatio: "1/1", borderRadius: 0, objectFit: "cover" }}
            />
            <div style={{ position: "absolute", top: 8, left: 8 }}>
              <input
                type="checkbox"
                checked={selected.includes(p.product_id)}
                onChange={() => onToggleSelect(p.product_id)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 18, height: 18, accentColor: "hsl(var(--primary))", cursor: "pointer" }}
              />
            </div>
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
              {p.status === 0 && <Badge variant="secondary">{t("products.inactive")}</Badge>}
              {lowStock(p) && <Badge variant="warning">{t("products.stock", { n: String(p.stock_quantity) })}</Badge>}
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{p.name}</div>
              <Badge variant="outline" style={{ flexShrink: 0, fontSize: 9 }}>{p.category?.name ?? "—"}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <ProductPriceEditor
                productId={p.product_id}
                price={p.price}
                editing={editingPrice === p.product_id}
                inputValue={priceInput}
                align="left"
                onStartEdit={onStartEditPrice}
                onInputChange={onPriceInputChange}
                onSave={onSavePrice}
                onCancel={onCancelEditPrice}
              />
              <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="xs" icon="edit" onClick={() => onEdit(p)} />
                <Button
                  variant="ghost"
                  size="xs"
                  icon={p.status === 1 ? "eye" : "eyeOff"}
                  onClick={() => onToggleActive(p.product_id, p.status === 1 ? 2 : 1)}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
