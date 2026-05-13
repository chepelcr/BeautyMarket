import { Tag } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
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
    // If discount_type_id changes, also update the code
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {discounts.map((disc, i) => {
          const dt = (discountTypes ?? []).find((d: any) => d.id === disc.discount_type_id);
          const needs_reason = dt?.code === '99';
          const disc_amount = (netPrice * quantity * (disc.percentage || 0)) / 100;

          return (
            <div key={i} style={{ border: '1px solid hsl(var(--border))', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{dt?.description ?? 'Descuento'}</span>
                <button 
                  onClick={() => remove(i)} 
                  style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--destructive))'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                >
                  Quitar
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: needs_reason ? 8 : 0 }}>
                <div>
                  <label className="pp-label">Tipo *</label>
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
                  <label className="pp-label">Porcentaje % *</label>
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
                  <label className="pp-label">Razón *</label>
                  <input
                    className="pp-input"
                    value={disc.reason || ''}
                    onChange={(e) => update(i, { reason: e.target.value })}
                    placeholder="Motivo del descuento"
                  />
                </div>
              )}

              <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', textAlign: 'right', marginTop: 4 }}>
                Monto: ₡{disc_amount.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}

        <button
          onClick={add}
          style={{
            width: '100%',
            height: 36,
            borderRadius: 6,
            border: '1px dashed hsl(var(--border))',
            fontSize: 12,
            color: 'hsl(var(--muted-foreground))',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'hsl(var(--primary))';
            e.currentTarget.style.color = 'hsl(var(--primary))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'hsl(var(--border))';
            e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
          }}
        >
          + Agregar descuento
        </button>

        {discounts.length > 0 && (
          <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--muted-foreground))' }}>
              <span>Total porcentaje</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{total_pct.toFixed(2)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Total descuentos</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₡{total_amt.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
            </div>
            {total_pct > 100 && (
              <div style={{ fontSize: 11, color: 'hsl(var(--destructive))' }}>⚠ Los descuentos superan el 100%</div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
