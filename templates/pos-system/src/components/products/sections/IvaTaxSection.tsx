import { Percent } from "lucide-react";
import { Icon } from "@/components/ui";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useAllTaxes, useAllTaxRates, useAllTaxFactors, useAllFactoryTaxCharges } from "@/hooks/useDataApi";
import type { GetAllFactoryTaxChargesParams } from "@/services/data-api/dtos";
import { CountryISO } from "@/lib/enums";
import type { TaxFormEntry } from "@/types/productForm";

const ISO = CountryISO.COSTA_RICA;
const IVA_CODES = ["01", "07", "08"] as const;

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface IvaTaxSectionProps {
  taxes: TaxFormEntry[];
  factoryTaxChargeId?: number;
  baseAmount?: number; // post-discount, post-special-tax amount used for IVA calculation
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onAdd: (entry: TaxFormEntry) => void;
  onRemove: (taxTypeId: number) => void;
  onUpdate: (taxTypeId: number, patch: Partial<TaxFormEntry>) => void;
  onFactoryTaxChargeChange: (chargeId: number | undefined, hasFactoryTax: boolean) => void;
}

export function IvaTaxSection({
  taxes,
  factoryTaxChargeId,
  baseAmount = 0,
  isExpanded,
  onToggle,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
  onFactoryTaxChargeChange,
}: IvaTaxSectionProps) {
  const { data: taxesData } = useAllTaxes({ iso_code: ISO });
  const { data: taxRatesData } = useAllTaxRates({ iso_code: ISO });
  const { data: taxFactorsData } = useAllTaxFactors({ iso_code: ISO });

  // document_version_id is auto-injected by the data API client via DocumentVersionProvider
  const { data: factoryChargesData } = useAllFactoryTaxCharges(
    { iso_code: ISO } as GetAllFactoryTaxChargesParams
  );

  const allTaxTypes = taxesData ?? [];
  const rateList = taxRatesData ?? [];
  const factorList = taxFactorsData ?? [];
  const factoryCharges = factoryChargesData ?? [];

  const ivaTaxTypes = allTaxTypes.filter((t: { code?: string }) =>
    (IVA_CODES as readonly string[]).includes(t.code ?? "")
  );

  const addedIvaTaxes = taxes.filter((t) =>
    (IVA_CODES as readonly string[]).includes(t.taxCode)
  );

  const hasIva = addedIvaTaxes.length > 0;

  const selectedCharge = factoryCharges.find(
    (c: { id: number }) => c.id === factoryTaxChargeId
  );

  return (
    <SectionWrapper
      title="IVA"
      icon={Percent}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
      badge={hasIva ? addedIvaTaxes.length : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {addedIvaTaxes.map((tax) => {
          const isIvarbu = tax.taxCode === "08";
          const ivaAmount = baseAmount > 0 ? baseAmount * tax.rate / 100 : 0;
          return (
            <div
              key={tax.taxTypeId}
              style={{
                padding: "10px 12px",
                background: "hsl(var(--muted) / 0.3)",
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isIvarbu ? 8 : 0 }}>
                {/* Description only, no code */}
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                  {tax.taxDescription}
                </div>

                {!isIvarbu && (
                  <select
                    className="pp-input"
                    style={{ width: 150, padding: "4px 8px", fontSize: 13 }}
                    value={tax.taxRateId ?? ""}
                    onChange={(e) => {
                      const r = rateList.find((r: { id: number }) => String(r.id) === e.target.value);
                      if (r) onUpdate(tax.taxTypeId, { taxRateId: r.id, rate: (r as { percentage: number }).percentage });
                    }}
                  >
                    <option value="">Tasa…</option>
                    {rateList.map((r: { id: number; percentage: number; description: string }) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.percentage}% — {r.description}
                      </option>
                    ))}
                  </select>
                )}

                {/* ₡ amount */}
                {!isIvarbu && ivaAmount > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--primary))", minWidth: 70, textAlign: "right" }}>
                    +{fmt(ivaAmount)}
                  </span>
                )}

                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => onRemove(tax.taxTypeId)}
                >
                  <Icon name="xCircle" size={14} />
                </button>
              </div>

              {isIvarbu && (
                <div>
                  <label className="pp-label" style={{ fontSize: 11 }}>Factor IVARBU</label>
                  <select
                    className="pp-input"
                    style={{ fontSize: 13 }}
                    value={tax.taxFactorId ?? ""}
                    onChange={(e) => onUpdate(tax.taxTypeId, { taxFactorId: Number(e.target.value) })}
                  >
                    <option value="">Seleccionar factor…</option>
                    {factorList.map((f: { id: number; description: string }) => (
                      <option key={f.id} value={String(f.id)}>
                        {f.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}

        {/* Add IVA — description only in options, only one allowed */}
        {addedIvaTaxes.length === 0 && (
          <select
            className="pp-input"
            value=""
            onChange={(e) => {
              const tt = ivaTaxTypes.find((t: { id: number }) => String(t.id) === e.target.value);
              if (tt) {
                const defaultRate = rateList[0];
                onAdd({
                  taxTypeId: tt.id,
                  taxCode: (tt as { code?: string }).code ?? "",
                  taxDescription: tt.description,
                  rate: (defaultRate as { percentage: number })?.percentage ?? 13,
                  taxRateId: defaultRate?.id,
                });
              }
            }}
          >
            <option value="">Agregar IVA…</option>
            {ivaTaxTypes.map((tt: { id: number; description: string }) => (
              <option key={tt.id} value={String(tt.id)}>
                {tt.description}
              </option>
            ))}
          </select>
        )}

        {/* Factory tax charge — description only */}
        {factoryCharges.length > 0 && (
          <div
            style={{
              marginTop: 4,
              padding: "10px 12px",
              background: "hsl(var(--muted) / 0.25)",
              borderRadius: 8,
              border: "1px dashed hsl(var(--border))",
            }}
          >
            <label className="pp-label" style={{ marginBottom: 6 }}>
              Cargo de fábrica (impuesto asumido)
            </label>
            <select
              className="pp-input"
              value={factoryTaxChargeId ?? ""}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : undefined;
                const charge = factoryCharges.find((c: { id: number; code?: string }) => c.id === id);
                onFactoryTaxChargeChange(id, charge?.code === "01");
              }}
            >
              <option value="">Sin cargo de fábrica</option>
              {factoryCharges.map((c: { id: number; description: string }) => (
                <option key={c.id} value={String(c.id)}>
                  {c.description}
                </option>
              ))}
            </select>
            {selectedCharge && (
              <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 4 }}>
                {(selectedCharge as { code?: string }).code === "01"
                  ? "El impuesto de fábrica se asume en el precio — afecta el cálculo del total."
                  : "Cargo de fábrica sin impuesto asumido."}
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
