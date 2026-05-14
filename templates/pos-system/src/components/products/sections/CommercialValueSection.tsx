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

  // Full calculation using the tax service — same engine as the backend
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

  // Per-discount amounts
  const discountLines = discounts.map((d) => ({
    label: d.description,
    rate: d.rate ?? 0,
    amount: price * (d.rate ?? 0) / 100,
  }));
  const totalDiscountAmount = discountLines.reduce((s, d) => s + d.amount, 0);

  // Net price after discounts
  const netPrice = price - totalDiscountAmount;

  // Per-tax amounts — use full calc totals for accuracy, individual approximations for line display
  const ivaTaxes = taxes.filter((t) => IVA_CODES.includes(t.taxCode));
  const otherTaxes = taxes.filter((t) => !IVA_CODES.includes(t.taxCode));

  // IVA amounts: baseAmount × rate / 100 (calc.baseAmount accounts for special taxes)
  const baseAmount = calc?.baseAmount ?? netPrice;
  const ivaLines = ivaTaxes.map((t) => ({
    label: t.taxDescription,
    amount: t.taxCode === "07" || t.taxCode === "01"
      ? (calc?.ivaTaxTotal ?? baseAmount * t.rate / 100) / Math.max(ivaTaxes.length, 1)
      : baseAmount * t.rate / 100,
  }));

  // Other tax amounts — approximation from rate (special taxes use fixed amounts from the service)
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
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              fontWeight: 600,
              color: "hsl(var(--muted-foreground))",
            }}
          >
            ₡
          </span>
          <input
            type="number"
            className="pp-input"
            placeholder="0"
            min={0}
            style={{ paddingLeft: 24 }}
            value={form.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>
      </div>

      {/* Detailed price breakdown — JCampos-Biller style */}
      {price > 0 && (
        <div
          style={{
            padding: "14px 16px",
            background: "hsl(var(--primary) / 0.06)",
            borderRadius: 10,
            border: "1.5px solid hsl(var(--primary) / 0.3)",
          }}
        >
          {/* Sale price header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span className="t-label" style={{ color: "hsl(var(--primary))", display: "block", marginBottom: 0 }}>
              {t("products.estimatedSalePrice")}
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "hsl(var(--primary))",
                fontFamily: "var(--font-display)",
              }}
            >
              {fmt(salePrice)}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Base price */}
            <Row label={t("products.basePriceLine")} value={fmt(price)} />

            {/* Each discount line */}
            {discountLines.map((d, i) => (
              <Row
                key={i}
                label={`${d.label}${d.rate > 0 ? ` (${d.rate}%)` : ""}`}
                value={`-${fmt(d.amount)}`}
                color="hsl(var(--destructive))"
              />
            ))}

            {/* Net price after discounts */}
            {totalDiscountAmount > 0 && (
              <Row label={t("products.netPrice")} value={fmt(netPrice)} bold />
            )}

            {/* Other/special taxes (added before IVA base) */}
            {otherTaxLines.map((t, i) => (
              <Row
                key={i}
                label={t.label}
                value={t.amount > 0 ? `+${fmt(t.amount)}` : "—"}
                color="hsl(var(--muted-foreground))"
              />
            ))}

            {/* Base for IVA — shown when there are IVA taxes */}
            {ivaTaxes.length > 0 && (
              <>
                <div style={{ borderTop: "1px solid hsl(var(--border) / 0.4)", margin: "4px 0" }} />
                <Row
                  label={t("products.baseForIva")}
                  value={fmt(baseAmount)}
                  bold
                  color="hsl(var(--foreground))"
                />
              </>
            )}

            {/* IVA lines */}
            {ivaLines.map((t, i) => (
              <Row
                key={i}
                label={t.label}
                value={`+${fmt(t.amount)}`}
                color="hsl(var(--muted-foreground))"
              />
            ))}

            {/* Factory assumed tax */}
            {factoryAssumedTax > 0 && (
              <Row
                label={t("products.factoryAssumedTax")}
                value={`-${fmt(factoryAssumedTax)}`}
                color="hsl(var(--warning, 38 92% 50%))"
              />
            )}

            {/* Totals */}
            {(ivaTaxes.length > 0 || otherTaxes.length > 0) && (
              <>
                <div style={{ borderTop: "1px solid hsl(var(--border) / 0.5)", margin: "4px 0" }} />
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
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span
        className="t-xs"
        style={{ color: color ?? "hsl(var(--muted-foreground))", fontWeight: bold ? 700 : undefined }}
      >
        {label}
      </span>
      <span
        className="t-xs"
        style={{ color: color ?? "hsl(var(--muted-foreground))", fontWeight: bold ? 700 : undefined }}
      >
        {value}
      </span>
    </div>
  );
}
