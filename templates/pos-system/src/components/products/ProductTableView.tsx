import { Card, Badge, Button } from "@/components/ui";
import { FadeIn } from "@/components/ui/FadeIn";
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
    <Card className="!p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/40">
              <th className="pp-th w-10">
                <input
                  type="checkbox"
                  checked={selected.length === products.length && products.length > 0}
                  onChange={onToggleAll}
                  className="accent-primary"
                />
              </th>
              <th className="pp-th">{t("products.product")}</th>
              <th className="pp-th">{t("products.category")}</th>
              <th className="pp-th !text-right">{t("products.price")}</th>
              <th className="pp-th !text-center">{t("products.status")}</th>
              <th className="pp-th w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <FadeIn key={p.product_id} delay={i * 0.02} duration={0.3}>
                <tr
                  className={`${i < products.length - 1 ? "border-b border-border" : ""} ${
                    onNavigate ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() => onNavigate?.(p.product_id)}
                >
                  <td className="pp-td">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.product_id)}
                      onChange={() => onToggleSelect(p.product_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-primary"
                    />
                  </td>
                  <td className="pp-td">
                    <div className="flex items-center gap-2.5">
                      <ProductImage imageUrl={p.image_url} name={p.name} size={36} />
                      <div className="text-[13px] font-bold">{p.name}</div>
                    </div>
                  </td>
                  <td className="pp-td">
                    <Badge variant="outline">{p.category?.name ?? "—"}</Badge>
                  </td>
                  <td className="pp-td t-num !text-right" onClick={(e) => e.stopPropagation()}>
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
                  <td className="pp-td !text-center">
                    <Badge variant={p.status === 1 ? "success" : "secondary"}>
                      {p.status === 1 ? t("products.activeLabel") : t("products.inactiveLabel")}
                    </Badge>
                  </td>
                  <td className="pp-td">
                    <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
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
              </FadeIn>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3.5 flex justify-between items-center border-t border-border">
        <div className="t-sm text-muted-foreground">
          {t("products.showing", { n: String(products.length), total: String(allProducts.length) })}
        </div>
      </div>
    </Card>
  );
}
