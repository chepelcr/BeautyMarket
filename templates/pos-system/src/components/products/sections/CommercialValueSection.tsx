import { DollarSign } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { FormLabel } from "@/components/ui";
import { TaxCalculationService } from "@/services/taxCalculationService";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TaxFormEntry, DiscountFormEntry, ProductFormState } from "@/types/productForm";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");
const IVA_CODES = ["01", "07", "08"];

interface CommercialValueSectionProps {
  form: ProductFormState;
  taxes: TaxFormEntry[];
  discounts: DiscountFormEntry[];
  hasFactoryTax?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onChange: (patch: Partial<ProductFormState>) => void;
}

export function CommercialValueSection({
  form,
  taxes,
  discounts,
  hasFactoryTax,
  isExpanded,
  onToggle,
  disabled,
  onChange,
}: CommercialValueSectionProps) {
  const { t } = useLanguage();
  const price = Number(form.price) || 0;

  const taxEntries = taxes.map((t) => ({
    taxTypeId: t.taxTypeId,
    taxCode: t.taxCode,
    rate: t.rate,
    specialFields: t.specialFields,
  }));
  const discountEntries = discounts.map((d) => ({
    discountTypeId: d.discountTypeId,
    rate: d.rate,
  }));

  const calc = price > 0
    ? TaxCalculationService.getLineAmounts({
        subtotal: price,
        taxes: taxEntries,
        discounts: discountEntries,
        detailQuantity: 1,
        cabys: form.cabys || undefined,
        hasFactoryTax,
      })
    : null;

  const discountLines = discounts.map((d) => ({
    label: d.description,
    rate: d.rate ?? 0,
    amount: price * (d.rate ?? 0) / 100,
  }));
  const totalDiscountAmount = discountLines.reduce((s, d) => s + d.amount, 0);

  const netPrice = price - totalDiscountAmount;

  const ivaTaxes = taxes.filter((t) => IVA_CODES.includes(t.taxCode));
  const otherTaxes = taxes.filter((t) => !IVA_CODES.includes(t.taxCode));

  const baseAmount = calc?.baseAmount ?? netPrice;
  const ivaLines = ivaTaxes.map((t) => ({
    label: t.taxDescription,
    amount: t.taxCode === "07" || t.taxCode === "01"
      ? (calc?.ivaTaxTotal ?? baseAmount * t.rate / 100) / Math.max(ivaTaxes.length, 1)
      : baseAmount * t.rate / 100,
  }));

  const otherTaxLines = otherTaxes.map((t) => ({
    label: t.taxDescription,
    amount: t.rate > 0 ? price * t.rate / 100 : 0,
  }));

  const salePrice = calc?.totalAmountLine ?? price;
  const factoryAssumedTax = calc?.factoryAssumedTax ?? 0;

  return (
    <SectionWrapper
      title={t("products.commercialPrice")}
      icon={DollarSign}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
    >
      {/* Base price input */}
      <div>
        <FormLabel required>{t("products.basePriceNoTax")}</FormLabel>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
            ₡
          </span>
          <input
            type="number"
            className="pp-input pl-6"
            placeholder="0"
            min={0}
            value={form.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>
      </div>

      {price > 0 && (
        <div className="px-4 py-3.5 bg-primary/[0.06] rounded-lg border-[1.5px] border-primary/30">
          <div className="flex justify-between items-center mb-3">
            <span className="t-label !text-primary !mb-0">
              {t("products.estimatedSalePrice")}
            </span>
            <span className="text-[22px] font-bold text-primary font-display">
              {fmt(salePrice)}
            </span>
          </div>

          <div className="flex flex-col gap-[3px]">
            <Row label={t("products.basePriceLine")} value={fmt(price)} />

            {discountLines.map((d, i) => (
              <Row
                key={i}
                label={`${d.label}${d.rate > 0 ? ` (${d.rate}%)` : ""}`}
                value={`-${fmt(d.amount)}`}
                tone="destructive"
              />
            ))}

            {totalDiscountAmount > 0 && (
              <Row label={t("products.netPrice")} value={fmt(netPrice)} bold />
            )}

            {otherTaxLines.map((t, i) => (
              <Row
                key={i}
                label={t.label}
                value={t.amount > 0 ? `+${fmt(t.amount)}` : "—"}
              />
            ))}

            {ivaTaxes.length > 0 && (
              <>
                <div className="border-t border-border/40 my-1" />
                <Row
                  label={t("products.baseForIva")}
                  value={fmt(baseAmount)}
                  bold
                  tone="foreground"
                />
              </>
            )}

            {ivaLines.map((t, i) => (
              <Row key={i} label={t.label} value={`+${fmt(t.amount)}`} />
            ))}

            {factoryAssumedTax > 0 && (
              <Row
                label={t("products.factoryAssumedTax")}
                value={`-${fmt(factoryAssumedTax)}`}
                tone="warning"
              />
            )}

            {(ivaTaxes.length > 0 || otherTaxes.length > 0) && (
              <>
                <div className="border-t border-border/50 my-1" />
                {(calc?.ivaTaxTotal ?? 0) > 0 && (
                  <Row label={t("products.totalIva")} value={`+${fmt(calc!.ivaTaxTotal)}`} bold />
                )}
                {(calc?.otherTaxTotal ?? 0) > 0 && (
                  <Row label={t("products.totalOtherTaxes")} value={`+${fmt(calc!.otherTaxTotal)}`} bold />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}

function Row({
  label,
  value,
  tone = "muted",
  bold,
}: {
  label: string;
  value: string;
  tone?: "muted" | "foreground" | "destructive" | "warning";
  bold?: boolean;
}) {
  const toneClass = {
    muted: "text-muted-foreground",
    foreground: "text-foreground",
    destructive: "text-destructive",
    warning: "text-warning",
  }[tone];
  return (
    <div className="flex justify-between items-center">
      <span className={`t-xs ${toneClass} ${bold ? "font-bold" : ""}`}>{label}</span>
      <span className={`t-xs ${toneClass} ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}
