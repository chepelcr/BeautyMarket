import { Percent } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { FormLabel } from '@/components/ui';
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
      <div className="flex flex-col gap-3">
        {/* IVA Section (required) */}
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold">IVA (requerido)</span>
            <span className="text-[10px] text-destructive">*</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <FormLabel required>Tipo IVA</FormLabel>
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
              <FormLabel required>Tarifa</FormLabel>
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
            <div className="mb-2">
              <FormLabel required>Factor (IVARBU)</FormLabel>
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
            <FormLabel>Cargo por fábrica</FormLabel>
            <select
              className="pp-input"
              value={factoryTaxChargeId ?? ''}
              onChange={(e) => onFactoryTaxChargeChange(Number(e.target.value) || undefined)}
            >
              <option value="">Sin cargo de fábrica</option>
              {(factoryTaxCharges ?? []).map((f: any) => (
                <option key={f.id} value={f.id}>{f.description}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Other taxes */}
        <div>
          <div className="label-section mb-2">Otros impuestos</div>
          {otherTaxes.map((tax, idx) => {
            const tt = (taxTypes ?? []).find((x: any) => x.id === tax.tax_type_id);
            return (
              <div key={idx} className="border border-border rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold">{tt?.code ?? '?'} — {tt?.description ?? 'Impuesto'}</span>
                  <button
                    onClick={() => removeOther(idx)}
                    className="text-[11px] text-muted-foreground bg-transparent border-0 cursor-pointer hover:text-destructive transition-colors"
                  >
                    Quitar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <FormLabel>Tipo</FormLabel>
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
                    <FormLabel>Tarifa %</FormLabel>
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
            className="w-full h-9 rounded-md border border-dashed border-border text-xs text-muted-foreground bg-transparent cursor-pointer transition-colors hover:border-primary hover:text-primary"
          >
            + Agregar impuesto
          </button>
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-3 flex flex-col gap-1 text-xs">
          {factoryAssumedTax > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Asumido por fábrica</span>
              <span className="font-mono">₡{factoryAssumedTax.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total impuestos</span>
            <span className="font-mono">₡{totalTaxes.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
