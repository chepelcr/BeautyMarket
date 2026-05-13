import { Percent } from 'lucide-react';
import { Icon } from '@/components/ui';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useAllTaxes, useAllTaxRates, useAllTaxFactors, useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineTax } from '@/types/lineDetail';
import type { GetAllFactoryTaxChargesParams } from '@/services/data-api/dtos';

const ISO = CountryISO.COSTA_RICA;
const IVA_CODES = ['01', '07', '08'] as const;
const fmt = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');

interface IvaTaxSectionProps {
  taxes: LineTax[];
  onChange: (taxes: LineTax[]) => void;
  factoryTaxChargeId?: number;
  onFactoryTaxChargeChange: (chargeId: number | undefined) => void;
  baseAmount: number;
  factoryAssumedTax: number;
  isExpanded: boolean;
  onToggle: () => void;
  detail: { base_amount?: number };
  onDetailChange: (patch: { base_amount?: number }) => void;
}

export function IvaTaxSection({ 
  taxes, 
  onChange, 
  factoryTaxChargeId,
  onFactoryTaxChargeChange,
  baseAmount,
  factoryAssumedTax,
  isExpanded, 
  onToggle,
  detail,
  onDetailChange,
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
    (IVA_CODES as readonly string[]).includes(t.code ?? '')
  );

  const addedIvaTaxes = taxes.filter((t) => {
    const tt = allTaxTypes.find((x: any) => x.id === t.tax_type_id);
    return (IVA_CODES as readonly string[]).includes(tt?.code ?? '');
  });

  const hasIva = addedIvaTaxes.length > 0;
  
  // Check if IVACE (code 07) is present
  const hasIvace = addedIvaTaxes.some((t) => {
    const tt = allTaxTypes.find((x: any) => x.id === t.tax_type_id);
    return tt?.code === '07';
  });
  
  // Base amount should be shown and editable when IVACE or factory tax charge is present
  const showBaseAmount = hasIvace || !!factoryTaxChargeId;

  const addIva = (taxTypeId: number) => {
    const tt = ivaTaxTypes.find((t: any) => t.id === taxTypeId);
    if (!tt) return;
    
    const defaultRate = rateList[0];
    const newTax: LineTax = {
      tax_type_id: tt.id,
      rate: (defaultRate as any)?.percentage ?? 13,
      tax_rate_id: (defaultRate as any)?.id,
      special_fields: {},
    };
    
    onChange([...taxes, newTax]);
  };

  const removeIva = (taxTypeId: number) => {
    onChange(taxes.filter((t) => t.tax_type_id !== taxTypeId));
  };

  const updateIva = (taxTypeId: number, patch: Partial<LineTax>) => {
    onChange(taxes.map((t) => (t.tax_type_id === taxTypeId ? { ...t, ...patch } : t)));
  };

  const selectedCharge = factoryCharges.find(
    (c: { id: number }) => c.id === factoryTaxChargeId
  );

  return (
    <SectionWrapper
      title="IVA"
      icon={Percent}
      isExpanded={isExpanded}
      onToggle={onToggle}
      badge={hasIva ? addedIvaTaxes.length : undefined}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {addedIvaTaxes.map((tax) => {
          const tt = allTaxTypes.find((x: any) => x.id === tax.tax_type_id);
          const isIvarbu = tt?.code === '08';
          const ivaAmount = baseAmount > 0 && tax.rate ? baseAmount * tax.rate / 100 : 0;

          return (
            <div
              key={tax.tax_type_id}
              style={{
                padding: '10px 12px',
                background: 'hsl(var(--muted) / 0.3)',
                borderRadius: 8,
                border: '1px solid hsl(var(--border))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isIvarbu ? 8 : 0 }}>
                {/* Description only, no code */}
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                  {tt?.description ?? 'IVA'}
                </div>

                {!isIvarbu && (
                  <select
                    className="pp-input"
                    style={{ width: 80, padding: '4px 8px', fontSize: 13 }}
                    value={tax.tax_rate_id ?? ''}
                    onChange={(e) => {
                      const r = rateList.find((r: any) => String(r.id) === e.target.value);
                      if (r) updateIva(tax.tax_type_id, { tax_rate_id: r.id, rate: (r as any).percentage });
                    }}
                  >
                    <option value="">%</option>
                    {rateList.map((r: any) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.percentage}%
                      </option>
                    ))}
                  </select>
                )}

                {/* ₡ amount */}
                {!isIvarbu && ivaAmount > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', minWidth: 70, textAlign: 'right' }}>
                    +{fmt(ivaAmount)}
                  </span>
                )}

                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => removeIva(tax.tax_type_id)}
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
                    value={tax.tax_factor_id ?? ''}
                    onChange={(e) => updateIva(tax.tax_type_id, { tax_factor_id: Number(e.target.value) })}
                  >
                    <option value="">Seleccionar factor</option>
                    {factorList.map((f: any) => (
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
              if (e.target.value) addIva(Number(e.target.value));
            }}
          >
            <option value="">Agregar IVA</option>
            {ivaTaxTypes.map((tt: any) => (
              <option key={tt.id} value={String(tt.id)}>
                {tt.description}
              </option>
            ))}
          </select>
        )}

        {/* Base amount — only shown when IVACE or factory tax charge is present */}
        {showBaseAmount && (
          <div
            style={{
              marginTop: 4,
              padding: '10px 12px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: 8,
              border: '1px solid hsl(var(--border))',
            }}
          >
            <label className="pp-label" style={{ marginBottom: 6 }}>
              Monto base {hasIvace && <span style={{ color: "hsl(var(--destructive))" }}>*</span>}
            </label>
            <input
              className="pp-input"
              type="number"
              value={detail.base_amount ?? ''}
              onChange={(e) => onDetailChange({ base_amount: parseFloat(e.target.value) || undefined })}
              min={0}
              step={0.01}
              placeholder="Ingrese el monto base"
            />
            <div className="t-xs" style={{ color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
              {hasIvace 
                ? 'IVACE requiere un monto base manual para el cálculo del impuesto'
                : 'El monto base se usa para calcular el IVA cuando hay cargo de fábrica'}
            </div>
          </div>
        )}

        {/* Factory tax charge — description only */}
        {factoryCharges.length > 0 && (
          <div
            style={{
              marginTop: 4,
              padding: '10px 12px',
              background: 'hsl(var(--muted) / 0.25)',
              borderRadius: 8,
              border: '1px dashed hsl(var(--border))',
            }}
          >
            <label className="pp-label" style={{ marginBottom: 6 }}>
              Cargo por fábrica
            </label>
            <select
              className="pp-input"
              value={factoryTaxChargeId ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : undefined;
                onFactoryTaxChargeChange(id);
              }}
            >
              <option value="">Sin cargo de fábrica</option>
              {factoryCharges.map((c: any) => (
                <option key={c.id} value={String(c.id)}>
                  {c.description}
                </option>
              ))}
            </select>
            {selectedCharge && (
              <div className="t-xs" style={{ color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
                {(selectedCharge as any).code === '01'
                  ? 'El impuesto será asumido por la fábrica'
                  : 'El impuesto no será asumido por la fábrica'}
              </div>
            )}
            {factoryAssumedTax > 0 && (
              <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--warning, 38 92% 50%))', marginTop: 4 }}>
                Asumido: {fmt(factoryAssumedTax)}
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
