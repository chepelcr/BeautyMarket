import { Percent } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useAllTaxes, useAllTaxRates, useAllTaxFactors, useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineTax } from '@/types/lineDetail';

interface TaxesTabProps {
  taxes: LineTax[];
  onChange: (taxes: LineTax[]) => void;
  factoryAssumedTax: number;
  totalTaxes: number;
  factoryTaxChargeId?: number;
  onFactoryTaxChargeChange: (chargeId: number | undefined) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const IVA_CODES = ['01', '07', '08'];
const IVA_NEEDS_FACTOR = ['08']; // IVARBU

const OTHER_TAX_TYPES_CODES = ['02', '03', '04', '05', '06', '12', '99'];

export function TaxesTab({ 
  taxes, 
  onChange, 
  factoryAssumedTax, 
  totalTaxes, 
  factoryTaxChargeId,
  onFactoryTaxChargeChange,
  isExpanded, 
  onToggle 
}: TaxesTabProps) {
  const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxRates } = useAllTaxRates({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxFactors } = useAllTaxFactors({ iso_code: CountryISO.COSTA_RICA });
  const { data: factoryTaxCharges } = useAllFactoryTaxCharges({ iso_code: CountryISO.COSTA_RICA, document_version_id: 1 });

  const ivaTax = taxes.find((t) => {
    const tt = (taxTypes ?? []).find((x: any) => x.id === t.tax_type_id);
    return IVA_CODES.includes(tt?.code ?? '');
  });

  const otherTaxes = taxes.filter((t) => {
    const tt = (taxTypes ?? []).find((x: any) => x.id === t.tax_type_id);
    return !IVA_CODES.includes(tt?.code ?? '');
  });

  const setIva = (patch: Partial<LineTax>) => {
    const withoutIva = taxes.filter((t) => {
      const tt = (taxTypes ?? []).find((x: any) => x.id === t.tax_type_id);
      return !IVA_CODES.includes(tt?.code ?? '');
    });
    if (patch.tax_type_id !== undefined || ivaTax) {
      // Merge with existing IVA tax to preserve all fields
      const updatedIva = { ...(ivaTax ?? { tax_type_id: undefined, rate: 0, special_fields: {} }), ...patch };
      if (updatedIva.tax_type_id) {
        onChange([...withoutIva, updatedIva as LineTax]);
      } else {
        onChange(withoutIva);
      }
    }
  };

  const addOther = () => {
    const firstOtherType = (taxTypes ?? []).find((tt: any) => OTHER_TAX_TYPES_CODES.includes(tt.code));
    if (!firstOtherType) return;
    onChange([...taxes, { tax_type_id: firstOtherType.id, rate: 0, special_fields: {} }]);
  };

  const removeOther = (idx: number) => {
    const items = otherTaxes.filter((_, i) => i !== idx);
    const ivaList = ivaTax ? [ivaTax] : [];
    onChange([...ivaList, ...items]);
  };

  const updateOther = (idx: number, patch: Partial<LineTax>) => {
    const items = otherTaxes.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    const ivaList = ivaTax ? [ivaTax] : [];
    onChange([...ivaList, ...items]);
  };

  const ivaTypeCode = ivaTax
    ? (taxTypes ?? []).find((tt: any) => tt.id === ivaTax.tax_type_id)?.code
    : null;

  return (
    <SectionWrapper
      title="Impuestos"
      icon={Percent}
      isExpanded={isExpanded}
      onToggle={onToggle}
      badge={taxes.length > 0 ? taxes.length : undefined}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* IVA Section (required) */}
        <div style={{ border: '1px solid hsl(var(--border))', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>IVA (requerido)</span>
            <span style={{ fontSize: 10, color: 'hsl(var(--destructive))' }}>*</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label className="pp-label">Tipo IVA *</label>
              <select
                className="pp-input"
                value={ivaTax?.tax_type_id ?? ''}
                onChange={(e) => setIva({ tax_type_id: Number(e.target.value) || undefined })}
              >
                <option value="">Seleccionar…</option>
                {(taxTypes ?? [])
                  .filter((tt: any) => IVA_CODES.includes(tt.code))
                  .map((tt: any) => (
                    <option key={tt.id} value={tt.id}>{tt.code} — {tt.description}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="pp-label">Tarifa *</label>
              <select
                className="pp-input"
                value={ivaTax?.tax_rate_id ?? ''}
                onChange={(e) => {
                  const rate = (taxRates ?? []).find((r: any) => r.id === Number(e.target.value));
                  setIva({ tax_rate_id: Number(e.target.value) || undefined, rate: rate?.percentage });
                }}
              >
                <option value="">—</option>
                {(taxRates ?? []).map((r: any) => (
                  <option key={r.id} value={r.id}>{r.percentage}%</option>
                ))}
              </select>
            </div>
          </div>

          {ivaTypeCode && IVA_NEEDS_FACTOR.includes(ivaTypeCode) && (
            <div style={{ marginBottom: 8 }}>
              <label className="pp-label">Factor (IVARBU) *</label>
              <select
                className="pp-input"
                value={ivaTax?.tax_factor_id ?? ''}
                onChange={(e) => setIva({ tax_factor_id: Number(e.target.value) || undefined })}
              >
                <option value="">Seleccionar…</option>
                {(taxFactors ?? []).map((f: any) => (
                  <option key={f.id} value={f.id}>{f.description}</option>
                ))}
              </select>
            </div>
          )}

          {/* Factory Tax Charge */}
          <div>
            <label className="pp-label">Cargo por fábrica</label>
            <select
              className="pp-input"
              value={factoryTaxChargeId ?? ''}
              onChange={(e) => onFactoryTaxChargeChange(Number(e.target.value) || undefined)}
            >
              <option value="">Sin cargo de fábrica</option>
              {(factoryTaxCharges ?? []).map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Other taxes */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: 8 }}>
            Otros impuestos
          </div>
          {otherTaxes.map((tax, idx) => {
            const tt = (taxTypes ?? []).find((x: any) => x.id === tax.tax_type_id);
            return (
              <div key={idx} style={{ border: '1px solid hsl(var(--border))', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{tt?.code ?? '?'} — {tt?.description ?? 'Impuesto'}</span>
                  <button 
                    onClick={() => removeOther(idx)} 
                    style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--destructive))'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Quitar
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="pp-label">Tipo</label>
                    <select
                      className="pp-input"
                      value={tax.tax_type_id}
                      onChange={(e) => updateOther(idx, { tax_type_id: Number(e.target.value) })}
                    >
                      {(taxTypes ?? [])
                        .filter((x: any) => OTHER_TAX_TYPES_CODES.includes(x.code))
                        .map((x: any) => (
                          <option key={x.id} value={x.id}>{x.code} — {x.description}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="pp-label">Tarifa %</label>
                    <input
                      className="pp-input"
                      type="number"
                      value={tax.rate ?? ''}
                      onChange={(e) => updateOther(idx, { rate: parseFloat(e.target.value) || 0 })}
                      min={0}
                      max={100}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={addOther}
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
            + Agregar impuesto
          </button>
        </div>

        {/* Totals */}
        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
          {factoryAssumedTax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--muted-foreground))' }}>
              <span>Asumido por fábrica</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₡{factoryAssumedTax.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>Total impuestos</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>₡{totalTaxes.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
