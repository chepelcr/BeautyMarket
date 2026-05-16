import { Tag } from "lucide-react";
import { Icon, FormLabel } from "@/components/ui";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useAllDiscountTypes } from "@/hooks/useDataApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { CountryISO } from "@/lib/enums";
import type { DiscountFormEntry } from "@/types/productForm";

const ISO = CountryISO.COSTA_RICA;
const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface DiscountsSectionProps {
  discounts: DiscountFormEntry[];
  basePrice?: number;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onAdd: (entry: DiscountFormEntry) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<DiscountFormEntry>) => void;
}

export function DiscountsSection({
  discounts,
  basePrice = 0,
  isExpanded,
  onToggle,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
}: DiscountsSectionProps) {
  const { t } = useLanguage();
  const { data: discountTypesData } = useAllDiscountTypes({ iso_code: ISO });
  const discountTypeList = discountTypesData ?? [];

  const totalPct = discounts.reduce((sum, d) => sum + (d.rate ?? 0), 0);
  const totalExceeds = totalPct > 100;
  const totalAmount = basePrice * totalPct / 100;

  const grouped = discounts.reduce<Record<number, DiscountFormEntry[]>>((acc, d) => {
    if (!acc[d.discountTypeId]) acc[d.discountTypeId] = [];
    acc[d.discountTypeId].push(d);
    return acc;
  }, {});
  const typeIds = Object.keys(grouped).map(Number);

  return (
    <SectionWrapper
      title={t("products.discounts")}
      icon={Tag}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
      badge={discounts.length > 0 ? discounts.length : undefined}
    >
      <div className="flex flex-col gap-2.5">
        {discounts.length === 0 && (
          <div className="t-xs text-muted-foreground py-1">
            {t("products.noDiscountsHint")}
          </div>
        )}

        {typeIds.map((typeId) => {
          const group = grouped[typeId];
          const typeName = group[0].description;
          const isOtros = group[0].discountCode === "99";

          return (
            <div key={typeId}>
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.05em] mb-1">
                {typeName}
              </div>

              <div className="flex flex-col gap-1.5">
                {group.map((disc) => {
                  const discAmount = basePrice * (disc.rate ?? 0) / 100;
                  return (
                    <div
                      key={disc.id}
                      className="px-3 py-2 bg-muted/30 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="pp-input w-[72px] !h-auto !px-2 !py-[3px] text-xs"
                          placeholder="%"
                          min={0}
                          max={100}
                          value={disc.rate ?? 0}
                          onChange={(e) => onUpdate(disc.id, { rate: Number(e.target.value) })}
                        />
                        <span className="text-[11px] text-muted-foreground">%</span>

                        {basePrice > 0 && (
                          <span className="flex-1 text-xs font-semibold text-destructive text-right">
                            -{fmt(discAmount)}
                          </span>
                        )}

                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => onRemove(disc.id)}
                        >
                          <Icon name="xCircle" size={14} />
                        </button>
                      </div>

                      {isOtros && (
                        <div className="mt-1.5">
                          <FormLabel required>{t("products.discountReason")}</FormLabel>
                          <input
                            type="text"
                            className="pp-input text-xs"
                            placeholder={t("products.discountReasonPlaceholder")}
                            value={disc.reason ?? ""}
                            onChange={(e) => onUpdate(disc.id, { reason: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {discounts.length > 0 && (
          <div className="flex justify-end items-center gap-2">
            <span className="t-xs text-muted-foreground">{t("products.discountTotal")}</span>
            <span className={`text-[13px] font-bold ${totalExceeds ? "text-destructive" : "text-foreground"}`}>
              {totalPct.toFixed(1)}%
            </span>
            {basePrice > 0 && (
              <span className="text-xs font-semibold text-destructive">
                -{fmt(totalAmount)}
              </span>
            )}
            {totalExceeds && (
              <span className="text-[11px] text-destructive">
                {t("products.discountExceeds")}
              </span>
            )}
          </div>
        )}

        <select
          className="pp-input"
          value=""
          onChange={(e) => {
            const dt = discountTypeList.find(
              (d: { id: number }) => String(d.id) === e.target.value
            );
            if (dt) {
              onAdd({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                discountTypeId: dt.id,
                discountCode: (dt as { code?: string }).code ?? "",
                description: dt.description,
                rate: 0,
              });
            }
          }}
        >
          <option value="">{t("products.addDiscount")}</option>
          {discountTypeList.map((dt: { id: number; description: string }) => (
            <option key={dt.id} value={String(dt.id)}>
              {dt.description}
            </option>
          ))}
        </select>
      </div>
    </SectionWrapper>
  );
}
