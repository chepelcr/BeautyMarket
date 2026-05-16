import { Tag } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { FormLabel } from '@/components/ui';
import { useAllDiscountTypes } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineDiscount } from '@/types/lineDetail';

interface DiscountsTabProps {
  discounts: LineDiscount[];
  netPrice: number;
  quantity: number;
  onChange: (discounts: LineDiscount[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DiscountsTab({ discounts, netPrice, quantity, onChange, isExpanded, onToggle }: DiscountsTabProps) {
  const { data: discountTypes } = useAllDiscountTypes({ iso_code: CountryISO.COSTA_RICA });

  const add = () => {
    const first = (discountTypes ?? [])[0];
    onChange([...discounts, {
      discount_type_id: first?.id ?? 1,
      discount_code: first?.code ?? '01',
      percentage: 0
    }]);
  };
  const remove = (i: number) => onChange(discounts.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<LineDiscount>) => {
    if (patch.discount_type_id !== undefined) {
      const dt = (discountTypes ?? []).find((d: any) => d.id === patch.discount_type_id);
      patch.discount_code = dt?.code;
    }
    onChange(discounts.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  const total_pct = discounts.reduce((s, d) => s + (d.percentage || 0), 0);
  const total_amt = discounts.reduce(
    (s, d) => s + (netPrice * quantity * (d.percentage || 0)) / 100,
    0
  );

  return (
    <SectionWrapper
      title="Descuentos"
      icon={Tag}
      isExpanded={isExpanded}
      onToggle={onToggle}
      badge={discounts.length > 0 ? discounts.length : undefined}
    >
      <div className="flex flex-col gap-3">
        {discounts.map((disc, i) => {
          const dt = (discountTypes ?? []).find((d: any) => d.id === disc.discount_type_id);
          const needs_reason = dt?.code === '99';
          const disc_amount = (netPrice * quantity * (disc.percentage || 0)) / 100;

          return (
            <div key={i} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold">{dt?.description ?? 'Descuento'}</span>
                <button
                  onClick={() => remove(i)}
                  className="text-[11px] text-muted-foreground bg-transparent border-0 cursor-pointer hover:text-destructive transition-colors"
                >
                  Quitar
                </button>
              </div>

              <div className={`grid grid-cols-2 gap-2 ${needs_reason ? "mb-2" : ""}`}>
                <div>
                  <FormLabel required>Tipo</FormLabel>
                  <select
                    className="pp-input"
                    value={disc.discount_type_id}
                    onChange={(e) => update(i, { discount_type_id: Number(e.target.value) })}
                  >
                    {(discountTypes ?? []).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FormLabel required>Porcentaje %</FormLabel>
                  <input
                    className="pp-input"
                    type="number"
                    value={disc.percentage}
                    onChange={(e) => update(i, { percentage: parseFloat(e.target.value) || 0 })}
                    min={0}
                    max={100}
                    step={0.01}
                  />
                </div>
              </div>

              {needs_reason && (
                <div>
                  <FormLabel required>Razón</FormLabel>
                  <input
                    className="pp-input"
                    value={disc.reason || ''}
                    onChange={(e) => update(i, { reason: e.target.value })}
                    placeholder="Motivo del descuento"
                  />
                </div>
              )}

              <div className="text-[11px] text-muted-foreground text-right mt-1">
                Monto: ₡{disc_amount.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}

        <button
          onClick={add}
          className="w-full h-9 rounded-md border border-dashed border-border text-xs text-muted-foreground bg-transparent cursor-pointer transition-colors hover:border-primary hover:text-primary"
        >
          + Agregar descuento
        </button>

        {discounts.length > 0 && (
          <div className="border-t border-border pt-3 flex flex-col gap-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Total porcentaje</span>
              <span className="font-mono">{total_pct.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total descuentos</span>
              <span className="font-mono">₡{total_amt.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
            </div>
            {total_pct > 100 && (
              <div className="text-[11px] text-destructive">⚠ Los descuentos superan el 100%</div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
