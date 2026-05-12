import { useAllDiscountTypes } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineDiscount } from '@/types/lineDetail';

interface DiscountsTabProps {
  discounts: LineDiscount[];
  netPrice: number;
  quantity: number;
  onChange: (discounts: LineDiscount[]) => void;
}

export function DiscountsTab({ discounts, netPrice, quantity, onChange }: DiscountsTabProps) {
  const { data: discountTypes } = useAllDiscountTypes({ iso_code: CountryISO.COSTA_RICA });

  const add = () => {
    const first = (discountTypes ?? [])[0];
    onChange([...discounts, { discount_type_id: first?.id ?? 1, percentage: 0 }]);
  };
  const remove = (i: number) => onChange(discounts.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<LineDiscount>) =>
    onChange(discounts.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const total_pct = discounts.reduce((s, d) => s + (d.percentage || 0), 0);
  const total_amt = discounts.reduce(
    (s, d) => s + (netPrice * quantity * (d.percentage || 0)) / 100,
    0
  );

  return (
    <div className="space-y-3">
      {discounts.map((disc, i) => {
        const dt = (discountTypes ?? []).find((d: any) => d.id === disc.discount_type_id);
        const needs_reason = dt?.code === '99';
        const disc_amount = (netPrice * quantity * (disc.percentage || 0)) / 100;

        return (
          <div key={i} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">{dt?.description ?? 'Descuento'}</span>
              <button onClick={() => remove(i)} className="text-[11px] text-muted-foreground hover:text-destructive">
                Quitar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo *</label>
                <select
                  value={disc.discount_type_id}
                  onChange={(e) => update(i, { discount_type_id: Number(e.target.value) })}
                  className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
                >
                  {(discountTypes ?? []).map((d: any) => (
                    <option key={d.id} value={d.id}>{d.description}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Porcentaje % *</label>
                <input
                  type="number"
                  value={disc.percentage}
                  onChange={(e) => update(i, { percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary font-mono"
                  min={0}
                  max={100}
                  step={0.01}
                />
              </div>
            </div>

            {needs_reason && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Razón *</label>
                <input
                  value={disc.reason || ''}
                  onChange={(e) => update(i, { reason: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Motivo del descuento"
                />
              </div>
            )}

            <div className="text-[11px] text-muted-foreground text-right">
              Monto: ₡{disc_amount.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        );
      })}

      <button
        onClick={add}
        className="w-full h-9 rounded-md border border-dashed border-border text-[12px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        + Agregar descuento
      </button>

      {discounts.length > 0 && (
        <div className="border-t border-border pt-3 space-y-1 text-[12px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Total porcentaje</span>
            <span className="font-mono t-num">{total_pct.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total descuentos</span>
            <span className="font-mono t-num">₡{total_amt.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
          </div>
          {total_pct > 100 && (
            <div className="text-[11px] text-destructive">⚠ Los descuentos superan el 100%</div>
          )}
        </div>
      )}
    </div>
  );
}
