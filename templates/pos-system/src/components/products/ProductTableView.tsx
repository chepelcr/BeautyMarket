import { Card, Badge, Button } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductPriceEditor } from "./ProductPriceEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/types";

interface ProductTableViewProps {
  products: Product[];
  allProducts: Product[];
  selected: string[];
  editingPrice: string | null;
  priceInput: string;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (p: Product) => void;
  onToggleActive: (id: string, status: number) => void;
  onStartEditPrice: (id: string, price: number) => void;
  onPriceInputChange: (v: string) => void;
  onSavePrice: (id: string, price: number) => void;
  onCancelEditPrice: () => void;
  onNavigate?: (id: string) => void;
}

export function ProductTableView({
  products,
  allProducts,
  selected,
  editingPrice,
  priceInput,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onToggleActive,
  onStartEditPrice,
  onPriceInputChange,
  onSavePrice,
  onCancelEditPrice,
  onNavigate,
}: ProductTableViewProps) {
  const { t } = useLanguage();

  return (
    <Card style={{ padding: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
              <th className="pp-th" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selected.length === products.length && products.length > 0}
                  onChange={onToggleAll}
                  style={{ accentColor: "hsl(var(--primary))" }}
                />
              </th>
              <th className="pp-th">{t("products.product")}</th>
              <th className="pp-th">{t("products.category")}</th>
              <th className="pp-th" style={{ textAlign: "right" }}>{t("products.price")}</th>
              <th className="pp-th" style={{ textAlign: "center" }}>{t("products.status")}</th>
              <th className="pp-th" style={{ width: 100 }} />
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.product_id}
                style={{ 
                  borderBottom: i < products.length - 1 ? "1px solid hsl(var(--border))" : "none",
                  cursor: onNavigate ? "pointer" : "default",
                }}
                onClick={() => onNavigate?.(p.product_id)}
              >
                <td className="pp-td">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.product_id)}
                    onChange={() => onToggleSelect(p.product_id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: "hsl(var(--primary))" }}
                  />
                </td>
                <td className="pp-td">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ProductImage imageUrl={p.image_url} name={p.name} size={36} />
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                  </div>
                </td>
                <td className="pp-td">
                  <Badge variant="outline">{p.category?.name ?? "—"}</Badge>
                </td>
                <td className="pp-td t-num" style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                  <ProductPriceEditor
                    productId={p.product_id}
                    price={p.price}
                    editing={editingPrice === p.product_id}
                    inputValue={priceInput}
                    align="right"
                    onStartEdit={onStartEditPrice}
                    onInputChange={onPriceInputChange}
                    onSave={onSavePrice}
                    onCancel={onCancelEditPrice}
                  />
                </td>
                <td className="pp-td" style={{ textAlign: "center" }}>
                  <Badge variant={p.status === 1 ? "success" : "secondary"}>
                    {p.status === 1 ? t("products.activeLabel") : t("products.inactiveLabel")}
                  </Badge>
                </td>
                <td className="pp-td">
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="xs" icon="edit" onClick={() => onEdit(p)} />
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={p.status === 1 ? "eyeOff" : "eye"}
                      onClick={() => onToggleActive(p.product_id, p.status === 1 ? 2 : 1)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid hsl(var(--border))" }}>
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("products.showing", { n: String(products.length), total: String(allProducts.length) })}
        </div>
      </div>
    </Card>
  );
}
