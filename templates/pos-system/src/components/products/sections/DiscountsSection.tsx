import { Tag } from "lucide-react";
import { Icon } from "@/components/ui";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useAllDiscountTypes } from "@/hooks/useDataApi";
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
  const { data: discountTypesData } = useAllDiscountTypes({ iso_code: ISO });
  const discountTypeList = discountTypesData ?? [];

  const totalPct = discounts.reduce((sum, d) => sum + (d.rate ?? 0), 0);
  const totalExceeds = totalPct > 100;
  const totalAmount = basePrice * totalPct / 100;

  // Group discounts by type
  const grouped = discounts.reduce<Record<number, DiscountFormEntry[]>>((acc, d) => {
    if (!acc[d.discountTypeId]) acc[d.discountTypeId] = [];
    acc[d.discountTypeId].push(d);
    return acc;
  }, {});
  const typeIds = Object.keys(grouped).map(Number);

  return (
    <SectionWrapper
      title="Descuentos"
      icon={Tag}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
      badge={discounts.length > 0 ? discounts.length : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {discounts.length === 0 && (
          <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", padding: "4px 0" }}>
            Sin descuentos. Selecciona un tipo abajo para agregar.
          </div>
        )}

        {/* Grouped by type */}
        {typeIds.map((typeId) => {
          const group = grouped[typeId];
          const typeName = group[0].description;
          const isOtros = group[0].discountCode === "99";

          return (
            <div key={typeId}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "hsl(var(--muted-foreground))",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                {typeName}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.map((disc) => {
                  const discAmount = basePrice * (disc.rate ?? 0) / 100;
                  return (
                    <div
                      key={disc.id}
                      style={{
                        padding: "8px 12px",
                        background: "hsl(var(--muted) / 0.3)",
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* % input */}
                        <input
                          type="number"
                          className="pp-input"
                          style={{ width: 72, padding: "3px 8px", fontSize: 12 }}
                          placeholder="%"
                          min={0}
                          max={100}
                          value={disc.rate ?? 0}
                          onChange={(e) => onUpdate(disc.id, { rate: Number(e.target.value) })}
                        />
                        <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>%</span>

                        {/* ₡ amount */}
                        {basePrice > 0 && (
                          <span
                            style={{
                              flex: 1,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "hsl(var(--destructive))",
                              textAlign: "right",
                            }}
                          >
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

                      {/* Reason field for Otros (code 99) */}
                      {isOtros && (
                        <div style={{ marginTop: 6 }}>
                          <label className="pp-label" style={{ fontSize: 11 }}>
                            Razón <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="pp-input"
                            style={{ fontSize: 12 }}
                            placeholder="Describa el motivo del descuento"
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

        {/* Total */}
        {discounts.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Total:</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: totalExceeds ? "hsl(var(--destructive))" : "hsl(var(--foreground))",
              }}
            >
              {totalPct.toFixed(1)}%
            </span>
            {basePrice > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--destructive))" }}>
                -{fmt(totalAmount)}
              </span>
            )}
            {totalExceeds && (
              <span style={{ fontSize: 11, color: "hsl(var(--destructive))" }}>
                ¡No puede exceder 100%!
              </span>
            )}
          </div>
        )}

        {/* Add discount */}
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
          <option value="">Agregar descuento…</option>
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
