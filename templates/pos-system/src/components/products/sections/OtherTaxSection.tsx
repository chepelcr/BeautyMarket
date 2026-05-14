import { Receipt } from "lucide-react";
import { Icon, FormLabel } from "@/components/ui";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useAllTaxes, useAllTaxAmounts } from "@/hooks/useDataApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { CountryISO } from "@/lib/enums";
import { getTaxConfig } from "@/types/taxTypeConfig";
import type { TaxFormEntry } from "@/types/productForm";
import type { TaxAmountResponse } from "@/services/data-api/dtos";

const ISO = CountryISO.COSTA_RICA;
const IVA_CODES = ["01", "07", "08"];
const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");
// Codes that require fetching tax amounts from the API
const SPECIAL_AMOUNT_CODES = ["03", "04", "05", "06"];

interface OtherTaxSectionProps {
  taxes: TaxFormEntry[];
  cabys?: string;
  basePrice?: number;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onAdd: (entry: TaxFormEntry) => void;
  onRemove: (taxTypeId: number) => void;
  onUpdate: (taxTypeId: number, patch: Partial<TaxFormEntry>) => void;
}

// Per-tax row — lives in its own component so each can call useAllTaxAmounts independently
function SpecialTaxRow({
  tax,
  cabys,
  basePrice = 0,
  onUpdate,
  onRemove,
}: {
  tax: TaxFormEntry;
  cabys?: string;
  basePrice?: number;
  onUpdate: (taxTypeId: number, patch: Partial<TaxFormEntry>) => void;
  onRemove: (taxTypeId: number) => void;
}) {
  const { t } = useLanguage();
  const cfg = getTaxConfig(tax.taxCode);
  const needsAmounts = SPECIAL_AMOUNT_CODES.includes(tax.taxCode);

  const { data: taxAmountsData } = useAllTaxAmounts(
    { iso_code: ISO, tax_id: tax.taxTypeId },
    { enabled: needsAmounts }
  );
  const taxAmounts: TaxAmountResponse[] = taxAmountsData ?? [];

  // ISEBEC (05): beverages — alcoholic (3401) or non-alcoholic (2202)
  const isIsebec = tax.taxCode === "05";
  const isAlcoholic = cabys?.startsWith("3401");
  const isNonAlcoholic = cabys?.startsWith("2202");
  const isBeverage = isAlcoholic || isNonAlcoholic;

  // Auto-select tax amount for ISEBEC based on entered percentage matching min/max range
  const handlePercentageChange = (pct: number) => {
    const match = taxAmounts.find(
      (ta) =>
        ta.min_percentage !== null &&
        ta.max_percentage !== null &&
        pct >= ta.min_percentage &&
        pct <= ta.max_percentage
    );
    onUpdate(tax.taxTypeId, {
      specialFields: {
        ...tax.specialFields,
        percentage: pct,
        taxAmountId: match?.id ?? tax.specialFields?.taxAmountId,
      },
    });
  };

  const selectedAmount = taxAmounts.find((ta) => ta.id === tax.specialFields?.taxAmountId);

  return (
    <div
      style={{
        padding: "10px 12px",
        background: "hsl(var(--muted) / 0.3)",
        borderRadius: 8,
        border: "1px solid hsl(var(--border))",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{tax.taxDescription}</div>

        {(cfg?.requireRate ?? true) && tax.taxCode !== "12" && !needsAmounts && (
          <>
            <input
              type="number"
              className="pp-input"
              style={{ width: 72, padding: "3px 8px", fontSize: 12 }}
              placeholder="%"
              min={0}
              max={100}
              value={tax.rate}
              onChange={(e) => onUpdate(tax.taxTypeId, { rate: Number(e.target.value) })}
            />
            {basePrice > 0 && tax.rate > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--primary))", minWidth: 64, textAlign: "right" }}>
                +{fmt(basePrice * tax.rate / 100)}
              </span>
            )}
          </>
        )}
        {tax.taxCode === "12" && (
          <>
            <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))", padding: "3px 8px" }}>
              5%
            </span>
            {basePrice > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--primary))", minWidth: 64, textAlign: "right" }}>
                +{fmt(basePrice * 0.05)}
              </span>
            )}
          </>
        )}

        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => onRemove(tax.taxTypeId)}
        >
          <Icon name="xCircle" size={14} />
        </button>
      </div>

      {/* Special fields for codes 03, 04, 05, 06 */}
      {needsAmounts && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* ISEBEC (05) — beverage specific */}
          {isIsebec && isBeverage && (
            <>
              {/* Alcohol percentage — auto-selects tax amount */}
              {isAlcoholic && (
                <div>
                  <FormLabel style={{ fontSize: 11 }}>{t("products.alcoholPercentage")}</FormLabel>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="number"
                      className="pp-input"
                      style={{ flex: 1, fontSize: 12 }}
                      placeholder={t("products.alcoholPercentageExample")}
                      min={0}
                      max={100}
                      step={0.1}
                      value={tax.specialFields?.percentage ?? ""}
                      onChange={(e) => handlePercentageChange(Number(e.target.value))}
                    />
                    <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>%</span>
                  </div>
                  {selectedAmount && (
                    <div className="t-xs" style={{ color: "hsl(var(--primary))", marginTop: 3 }}>
                      {t("products.amountPerUnit", { amount: selectedAmount.amount.toLocaleString("es-CR"), desc: selectedAmount.description })}
                    </div>
                  )}
                  {tax.specialFields?.percentage && !selectedAmount && taxAmounts.length > 0 && (
                    <div className="t-xs" style={{ color: "hsl(var(--destructive))", marginTop: 3 }}>
                      {t("products.noAmountForPercentage")}
                    </div>
                  )}
                </div>
              )}

              {/* Manual tax amount select for non-alcoholic */}
              {isNonAlcoholic && taxAmounts.length > 0 && (
                <div>
                  <FormLabel style={{ fontSize: 11 }}>{t("products.taxAmountLabel")}</FormLabel>
                  <select
                    className="pp-input"
                    style={{ fontSize: 12 }}
                    value={tax.specialFields?.taxAmountId ?? ""}
                    onChange={(e) =>
                      onUpdate(tax.taxTypeId, {
                        specialFields: { ...tax.specialFields, taxAmountId: Number(e.target.value) },
                      })
                    }
                  >
                    <option value="">{t("products.selectAmount")}</option>
                    {taxAmounts.map((ta) => (
                      <option key={ta.id} value={String(ta.id)}>
                        {ta.description} — ₡{ta.amount.toLocaleString("es-CR")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Non-beverage ISEBEC or other special codes: manual tax amount select */}
          {(!isIsebec || !isBeverage) && taxAmounts.length > 0 && (
            <div>
              <FormLabel style={{ fontSize: 11 }}>Monto de impuesto</FormLabel>
              <select
                className="pp-input"
                style={{ fontSize: 12 }}
                value={tax.specialFields?.taxAmountId ?? ""}
                onChange={(e) =>
                  onUpdate(tax.taxTypeId, {
                    specialFields: { ...tax.specialFields, taxAmountId: Number(e.target.value) },
                  })
                }
              >
                <option value="">{t("products.selectAmount")}</option>
                {taxAmounts.map((ta) => (
                  <option key={ta.id} value={String(ta.id)}>
                    {ta.description} — ₡{ta.amount.toLocaleString("es-CR")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity field — all special codes */}
          {["03", "04", "05", "06"].includes(tax.taxCode) && (
            <div>
              <FormLabel style={{ fontSize: 11 }}>{t("products.quantityUdm")}</FormLabel>
              <input
                type="number"
                className="pp-input"
                style={{ fontSize: 12 }}
                placeholder="0"
                min={0}
                value={tax.specialFields?.quantity ?? ""}
                onChange={(e) =>
                  onUpdate(tax.taxTypeId, {
                    specialFields: { ...tax.specialFields, quantity: Number(e.target.value) },
                  })
                }
              />
            </div>
          )}

          {/* ISEBA (04) percentage */}
          {tax.taxCode === "04" && (
            <div>
              <FormLabel style={{ fontSize: 11 }}>{t("products.percentage")}</FormLabel>
              <input
                type="number"
                className="pp-input"
                style={{ fontSize: 12 }}
                placeholder="0"
                min={0}
                max={100}
                value={tax.specialFields?.percentage ?? ""}
                onChange={(e) =>
                  onUpdate(tax.taxTypeId, {
                    specialFields: { ...tax.specialFields, percentage: Number(e.target.value) },
                  })
                }
              />
            </div>
          )}

          {/* ISEBEC (05) volume per unit */}
          {tax.taxCode === "05" && (
            <div>
              <FormLabel style={{ fontSize: 11 }}>{t("products.volumePerUnit")}</FormLabel>
              <input
                type="number"
                className="pp-input"
                style={{ fontSize: 12 }}
                placeholder="0"
                min={0}
                value={tax.specialFields?.volumeConsumption ?? ""}
                onChange={(e) =>
                  onUpdate(tax.taxTypeId, {
                    specialFields: { ...tax.specialFields, volumeConsumption: Number(e.target.value) },
                  })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function OtherTaxSection({
  taxes,
  cabys,
  basePrice = 0,
  isExpanded,
  onToggle,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
}: OtherTaxSectionProps) {
  const { t } = useLanguage();
  const { data: taxesData } = useAllTaxes({ iso_code: ISO });
  const allTaxTypes = taxesData ?? [];

  const otherTaxTypes = allTaxTypes.filter(
    (t: { code?: string }) => !IVA_CODES.includes(t.code ?? "")
  );
  const addedOtherTaxes = taxes.filter((t) => !IVA_CODES.includes(t.taxCode));

  return (
    <SectionWrapper
      title={t("products.otherTaxes")}
      icon={Receipt}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
      badge={addedOtherTaxes.length > 0 ? addedOtherTaxes.length : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {addedOtherTaxes.map((tax) => (
          <SpecialTaxRow
            key={tax.taxTypeId}
            tax={tax}
            cabys={cabys}
            basePrice={basePrice}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}

        <select
          className="pp-input"
          value=""
          onChange={(e) => {
            const tt = otherTaxTypes.find(
              (t: { id: number }) => String(t.id) === e.target.value
            );
            if (tt) {
              onAdd({
                taxTypeId: tt.id,
                taxCode: (tt as { code?: string }).code ?? "",
                taxDescription: tt.description,
                rate: (tt as { code?: string }).code === "12" ? 5 : 0,
              });
            }
          }}
        >
          <option value="">{t("products.addTax")}</option>
          {otherTaxTypes
            .filter((tt: { id: number }) => !taxes.some((ft) => ft.taxTypeId === tt.id))
            .map((tt: { id: number; description: string }) => (
              <option key={tt.id} value={String(tt.id)}>
                {tt.description}
              </option>
            ))}
        </select>
      </div>
    </SectionWrapper>
  );
}
