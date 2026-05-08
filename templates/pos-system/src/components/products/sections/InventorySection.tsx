import { Boxes } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductFormState } from "@/types/productForm";

interface InventorySectionProps {
  form: ProductFormState;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onChange: (patch: Partial<ProductFormState>) => void;
}

export function InventorySection({
  form,
  isExpanded,
  onToggle,
  disabled,
  onChange,
}: InventorySectionProps) {
  const { t } = useLanguage();

  return (
    <SectionWrapper
      title={t("products.trackInventory") || "Gestión de inventario"}
      icon={Boxes}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
    >
      <div>
        <label className="pp-label">{t("products.minStockLabel")}</label>
        <input
          type="number"
          className="pp-input"
          placeholder={t("products.minStockPlaceholder")}
          min={0}
          value={form.low_stock_threshold}
          onChange={(e) => onChange({ low_stock_threshold: e.target.value })}
        />
        <p className="t-xs" style={{ marginTop: 4, color: "hsl(var(--muted-foreground))" }}>
          Se enviará una alerta cuando el stock llegue a este nivel.
        </p>
      </div>
    </SectionWrapper>
  );
}
