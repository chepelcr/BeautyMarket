import { DollarSign } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { FormLabel } from "@/components/ui";
import { TaxCalculationService, type LineTax, type LineDiscount } from "@/services/taxCalculationService";
import { useAllTaxes } from "@/hooks/useDataApi";
import { CountryISO } from "@/lib/enums";
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
  const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
  const price = Number(form.price) || 0;

  // Project the product-form internal shape into the canonical LineTax /
  // LineDiscount shapes the calc service expects.
  const taxEntries = taxes.map((tx) => ({
    code: tx.taxCode,
    rate: tx.rate,
    special_fields: tx.specialFields,
  })) as LineTax[];
  const discountEntries = discounts.map((d) => ({
    discount_type:
      ((d as any).discountCode as string) ??
      String(d.discountTypeId).padStart(2, '0'),
    percentage: d.rate ?? 0,
  })) as LineDiscount[];

  const calc = price > 0
    ? TaxCalculationService.getLineAmounts({
        subtotal: price,
        taxes: taxEntries,
        tax_types: (taxTypes ?? []) as any,
        discounts: discountEntries,
        detail_quantity: 1,
        cabys: form.cabys || undefined,
        has_factory_tax: hasFactoryTax,
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

  const baseAmount = calc?.base_amount ?? netPrice;
  const ivaLines = ivaTaxes.map((tx) => ({
    label: tx.taxDescription,
    amount: tx.taxCode === "07" || tx.taxCode === "01"
      ? (calc?.iva_tax_total ?? baseAmount * tx.rate / 100) / Math.max(ivaTaxes.length, 1)
      : baseAmount * tx.rate / 100,
  }));

  const otherTaxLines = otherTaxes.map((tx) => ({
    label: tx.taxDescription,
    amount: tx.rate > 0 ? price * tx.rate / 100 : 0,
  }));

  const salePrice = calc?.total_amount_line ?? price;
  const factoryAssumedTax = calc?.factory_assumed_tax ?? 0;

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
                {(calc?.iva_tax_total ?? 0) > 0 && (
                  <Row label={t("products.totalIva")} value={`+${fmt(calc!.iva_tax_total)}`} bold />
                )}
                {(calc?.other_tax_total ?? 0) > 0 && (
                  <Row label={t("products.totalOtherTaxes")} value={`+${fmt(calc!.other_tax_total)}`} bold />
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
