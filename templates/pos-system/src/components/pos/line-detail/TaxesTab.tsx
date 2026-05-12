import { useAllTaxes, useAllTaxRates, useAllTaxFactors } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineTax } from '@/types/lineDetail';

interface TaxesTabProps {
  taxes: LineTax[];
  onChange: (taxes: LineTax[]) => void;
  factoryAssumedTax: number;
  totalTaxes: number;
}

const IVA_CODES = ['01', '07', '08'];
const IVA_NEEDS_FACTOR = ['08']; // IVARBU

const OTHER_TAX_TYPES_CODES = ['02', '03', '04', '05', '06', '12', '99'];

export function TaxesTab({ taxes, onChange, factoryAssumedTax, totalTaxes }: TaxesTabProps) {
  const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxRates } = useAllTaxRates({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxFactors } = useAllTaxFactors({ iso_code: CountryISO.COSTA_RICA });

  const ivaTax = taxes.find((t) => {
    const tt = (taxTypes ?? []).find((x: any) => x.tax_id === t.tax_type_id);
    return IVA_CODES.includes(tt?.code ?? '');
  });

  const otherTaxes = taxes.filter((t) => {
    const tt = (taxTypes ?? []).find((x: any) => x.tax_id === t.tax_type_id);
    return !IVA_CODES.includes(tt?.code ?? '');
  });

  const setIva = (patch: Partial<LineTax>) => {
    const withoutIva = taxes.filter((t) => {
      const tt = (taxTypes ?? []).find((x: any) => x.tax_id === t.tax_type_id);
      return !IVA_CODES.includes(tt?.code ?? '');
    });
    if (patch.tax_type_id) {
      onChange([...withoutIva, { ...(ivaTax ?? {}), ...patch } as LineTax]);
    } else {
      onChange(withoutIva);
    }
  };

  const addOther = () => {
    const firstOtherType = (taxTypes ?? []).find((tt: any) => OTHER_TAX_TYPES_CODES.includes(tt.code));
    if (!firstOtherType) return;
    onChange([...taxes, { tax_type_id: firstOtherType.tax_id, rate: 0, special_fields: {} }]);
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
    ? (taxTypes ?? []).find((tt: any) => tt.tax_id === ivaTax.tax_type_id)?.code
    : null;

  return (
    <div className="space-y-4">
      {/* IVA Section (required) */}
      <div className="rounded-md border border-border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold">IVA (requerido)</span>
          <span className="text-[10px] text-destructive">*</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo IVA *</label>
            <select
              value={ivaTax?.tax_type_id ?? ''}
              onChange={(e) => setIva({ tax_type_id: Number(e.target.value) || undefined })}
              className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Seleccionar…</option>
              {(taxTypes ?? [])
                .filter((tt: any) => IVA_CODES.includes(tt.code))
                .map((tt: any) => (
                  <option key={tt.tax_id} value={tt.tax_id}>{tt.code} — {tt.description}</option>
                ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Tarifa *</label>
            <select
              value={ivaTax?.tax_rate_id ?? ''}
              onChange={(e) => {
                const rate = (taxRates ?? []).find((r: any) => r.rate_id === Number(e.target.value));
                setIva({ tax_rate_id: Number(e.target.value) || undefined, rate: rate?.percentage });
              }}
              className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">—</option>
              {(taxRates ?? []).map((r: any) => (
                <option key={r.rate_id} value={r.rate_id}>{r.percentage}%</option>
              ))}
            </select>
          </div>
        </div>

        {ivaTypeCode && IVA_NEEDS_FACTOR.includes(ivaTypeCode) && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Factor (IVARBU) *</label>
            <select
              value={ivaTax?.tax_factor_id ?? ''}
              onChange={(e) => setIva({ tax_factor_id: Number(e.target.value) || undefined })}
              className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Seleccionar…</option>
              {(taxFactors ?? []).map((f: any) => (
                <option key={f.factor_id} value={f.factor_id}>{f.description}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Other taxes */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Otros impuestos
        </div>
        {otherTaxes.map((tax, idx) => {
          const tt = (taxTypes ?? []).find((x: any) => x.tax_id === tax.tax_type_id);
          return (
            <div key={idx} className="rounded-md border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold">{tt?.code ?? '?'} — {tt?.description ?? 'Impuesto'}</span>
                <button onClick={() => removeOther(idx)} className="text-[11px] text-muted-foreground hover:text-destructive">Quitar</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo</label>
                  <select
                    value={tax.tax_type_id}
                    onChange={(e) => updateOther(idx, { tax_type_id: Number(e.target.value) })}
                    className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary"
                  >
                    {(taxTypes ?? [])
                      .filter((x: any) => OTHER_TAX_TYPES_CODES.includes(x.code))
                      .map((x: any) => (
                        <option key={x.tax_id} value={x.tax_id}>{x.code} — {x.description}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Tarifa %</label>
                  <input
                    type="number"
                    value={tax.rate ?? ''}
                    onChange={(e) => updateOther(idx, { rate: parseFloat(e.target.value) || 0 })}
                    className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:border-primary font-mono"
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
          className="w-full h-9 rounded-md border border-dashed border-border text-[12px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + Agregar impuesto
        </button>
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-3 space-y-1 text-[12px]">
        {factoryAssumedTax > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Asumido por fábrica</span>
            <span className="font-mono t-num">₡{factoryAssumedTax.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold">
          <span>Total impuestos</span>
          <span className="font-mono t-num">₡{totalTaxes.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
