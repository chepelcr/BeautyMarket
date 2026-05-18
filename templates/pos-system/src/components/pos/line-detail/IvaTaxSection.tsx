import { Percent } from 'lucide-react';
import { Icon, FormLabel } from '@/components/ui';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useAllTaxes, useAllTaxRates, useAllTaxFactors, useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
  const { data: taxesData } = useAllTaxes({ iso_code: ISO });
  const { data: taxRatesData } = useAllTaxRates({ iso_code: ISO });
  const { data: taxFactorsData } = useAllTaxFactors({ iso_code: ISO });
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

  const hasIvace = addedIvaTaxes.some((t) => {
    const tt = allTaxTypes.find((x: any) => x.id === t.tax_type_id);
    return tt?.code === '07';
  });

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
      title={t('lineDetail.taxesIvaTitle')}
      icon={Percent}
      isExpanded={isExpanded}
      onToggle={onToggle}
      badge={hasIva ? addedIvaTaxes.length : undefined}
    >
      <div className="flex flex-col gap-2">
        {addedIvaTaxes.map((tax) => {
          const tt = allTaxTypes.find((x: any) => x.id === tax.tax_type_id);
          const isIvarbu = tt?.code === '08';
          const ivaAmount = baseAmount > 0 && tax.rate ? baseAmount * tax.rate / 100 : 0;

          return (
            <div
              key={tax.tax_type_id}
              className="px-3 py-2.5 bg-muted/30 rounded-lg border border-border"
            >
              <div className={`flex items-center gap-2 ${isIvarbu ? "mb-2" : ""}`}>
                <div className="flex-1 text-[13px] font-semibold">
                  {tt?.description ?? t('lineDetail.taxesIvaTitle')}
                </div>

                {!isIvarbu && (
                  <select
                    className="pp-input w-20 !h-auto !px-2 !py-1 text-[13px]"
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

                {!isIvarbu && ivaAmount > 0 && (
                  <span className="text-xs font-semibold text-primary min-w-[70px] text-right">
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
                  <FormLabel>{t('lineDetail.ivarbu')}</FormLabel>
                  <select
                    className="pp-input text-[13px]"
                    value={tax.tax_factor_id ?? ''}
                    onChange={(e) => updateIva(tax.tax_type_id, { tax_factor_id: Number(e.target.value) })}
                  >
                    <option value="">{t('lineDetail.selectFactor')}</option>
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

        {addedIvaTaxes.length === 0 && (
          <select
            className="pp-input"
            value=""
            onChange={(e) => {
              if (e.target.value) addIva(Number(e.target.value));
            }}
          >
            <option value="">{t('lineDetail.addIva')}</option>
            {ivaTaxTypes.map((tt: any) => (
              <option key={tt.id} value={String(tt.id)}>
                {tt.description}
              </option>
            ))}
          </select>
        )}

        {showBaseAmount && (
          <div className="mt-1 px-3 py-2.5 bg-accent/10 rounded-lg border border-border">
            <FormLabel required={hasIvace}>{t('lineDetail.baseAmount')}</FormLabel>
            <input
              className="pp-input"
              type="number"
              value={detail.base_amount ?? ''}
              onChange={(e) => onDetailChange({ base_amount: parseFloat(e.target.value) || undefined })}
              min={0}
              step={0.01}
              placeholder={t('lineDetail.baseAmountPlaceholder')}
            />
            <div className="t-xs text-muted-foreground mt-1">
              {hasIvace
                ? 'IVACE requiere un monto base manual para el cálculo del impuesto'
                : 'El monto base se usa para calcular el IVA cuando hay cargo de fábrica'}
            </div>
          </div>
        )}

        {factoryCharges.length > 0 && (
          <div className="mt-1 px-3 py-2.5 bg-muted/25 rounded-lg border border-dashed border-border">
            <FormLabel>{t('lineDetail.factoryCharge')}</FormLabel>
            <select
              className="pp-input"
              value={factoryTaxChargeId ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : undefined;
                onFactoryTaxChargeChange(id);
              }}
            >
              <option value="">{t('lineDetail.noFactoryCharge')}</option>
              {factoryCharges.map((c: any) => (
                <option key={c.id} value={String(c.id)}>
                  {c.description}
                </option>
              ))}
            </select>
            {selectedCharge && (
              <div className="t-xs text-muted-foreground mt-1">
                {(selectedCharge as any).code === '01'
                  ? 'El impuesto será asumido por la fábrica'
                  : 'El impuesto no será asumido por la fábrica'}
              </div>
            )}
            {factoryAssumedTax > 0 && (
              <div className="text-xs font-semibold text-warning mt-1">
                Asumido: {fmt(factoryAssumedTax)}
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
