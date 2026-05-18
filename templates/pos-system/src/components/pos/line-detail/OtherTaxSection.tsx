import { Receipt } from 'lucide-react';
import { Icon, FormLabel } from '@/components/ui';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useAllTaxes, useAllTaxAmounts } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import { getTaxConfig } from '@/types/taxTypeConfig';
import { useLanguage } from '@/contexts/LanguageContext';
import type { LineTax } from '@/types/lineDetail';

const ISO = CountryISO.COSTA_RICA;
const IVA_CODES = ['01', '07', '08'];
const SPECIAL_AMOUNT_CODES = ['03', '04', '05', '06']; // IUC, ISEBA, ISEBEC, IPT
const fmt = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');

interface OtherTaxSectionProps {
  taxes: LineTax[];
  onChange: (taxes: LineTax[]) => void;
  basePrice: number;
  cabys?: string;
  detailQuantity: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function OtherTaxSection({
  taxes,
  onChange,
  basePrice,
  cabys,
  detailQuantity,
  isExpanded,
  onToggle,
}: OtherTaxSectionProps) {
  const { t } = useLanguage();
  const { data: taxesData } = useAllTaxes({ iso_code: ISO });
  const allTaxTypes = taxesData ?? [];

  /**
   * Calculate tax amount based on Hacienda code + special fields.
   * `taxAmounts` are catalog lookups keyed by the data-api numeric id, which
   * persists inside `tax.special_fields.tax_amount_id` (Hacienda canonical).
   */
  const calculateTaxAmount = (tax: LineTax, taxAmounts: any[]): number => {
    const code = tax.code;
    if (!code) return 0;

    // Simple percentage-based taxes
    if (code === '02' || code === '99') return (basePrice * (tax.rate || 0)) / 100;
    if (code === '12') return basePrice * 0.05; // ISEC fixed 5%

    // Special-field taxes: look up the configured amount
    const taxAmountId = tax.special_fields?.tax_amount_id;
    const taxAmountItem = taxAmounts.find((ta: any) => ta.id === taxAmountId);
    const taxAmountValue = taxAmountItem?.amount || 0;

    if (code === '03') {
      return (tax.special_fields?.quantity || 0) * taxAmountValue;
    }
    if (code === '04') {
      const quantity = tax.special_fields?.quantity || 0;
      const percentage = tax.special_fields?.percentage || 0;
      const proportion = (quantity * percentage) / 100;
      return detailQuantity * proportion * taxAmountValue;
    }
    if (code === '05') {
      const quantity = tax.special_fields?.quantity || 0;
      const volumeConsumption = tax.special_fields?.volume_consumption || 0;
      if (cabys?.startsWith('2202')) {
        const altAmount = taxAmountValue / (volumeConsumption || 1);
        return detailQuantity * quantity * altAmount;
      }
      return quantity * volumeConsumption * taxAmountValue;
    }
    if (code === '06') {
      return detailQuantity * (tax.special_fields?.quantity || 0) * taxAmountValue;
    }
    return 0;
  };

  const otherTaxTypes = allTaxTypes.filter(
    (t: { code?: string }) => !IVA_CODES.includes(t.code ?? '')
  );

  const addedOtherTaxes = taxes.filter((t) => !IVA_CODES.includes(t.code ?? ''));

  const addOther = (taxCode: string) => {
    const tt = otherTaxTypes.find((t: any) => t.code === taxCode);
    if (!tt) return;
    onChange([
      ...taxes,
      {
        code: taxCode,
        rate: taxCode === '12' ? 5 : 0,
        special_fields: {},
      },
    ]);
  };

  const removeOther = (taxCode: string) => {
    onChange(taxes.filter((t) => t.code !== taxCode));
  };

  const updateOther = (taxCode: string, patch: Partial<LineTax>) => {
    onChange(taxes.map((t) => (t.code === taxCode ? { ...t, ...patch } : t)));
  };

  return (
    <SectionWrapper
      title={t('products.otherTaxes')}
      icon={Receipt}
      isExpanded={isExpanded}
      onToggle={onToggle}
      badge={addedOtherTaxes.length > 0 ? addedOtherTaxes.length : undefined}
    >
      <div className="flex flex-col gap-2">
        {addedOtherTaxes.map((tax) => {
          const tt = allTaxTypes.find((x: any) => x.code === tax.code);
          const cfg = getTaxConfig(tax.code);
          const isFixed = tax.code === '12'; // ISEC fixed 5%
          const requireRate = cfg?.requireRate ?? true;
          const needsSpecialFields = SPECIAL_AMOUNT_CODES.includes(tax.code ?? '');

          return (
            <TaxCard
              key={tax.code}
              tax={tax}
              taxType={tt}
              // Pass the data-api numeric id so TaxCard can fetch the
              // tax-amounts catalog (tax_id query param on the data-api).
              taxTypeId={(tt as any)?.id}
              code={tax.code ?? ''}
              isFixed={isFixed}
              requireRate={requireRate}
              needsSpecialFields={needsSpecialFields}
              basePrice={basePrice}
              calculateTaxAmount={calculateTaxAmount}
              onUpdate={(patch) => updateOther(tax.code!, patch)}
              onRemove={() => removeOther(tax.code!)}
            />
          );
        })}

        {/* Add other tax */}
        <select
          className="pp-input"
          value=""
          onChange={(e) => {
            if (e.target.value) addOther(e.target.value);
          }}
        >
          <option value="">{t('lineDetail.addTax')}</option>
          {otherTaxTypes
            .filter((tt: any) => {
              if (tt.code === '99') return true; // OTHERS can be repeated
              return !taxes.some((t) => t.code === tt.code);
            })
            .map((tt: any) => (
              <option key={tt.code ?? tt.id} value={tt.code}>
                {tt.description}
              </option>
            ))}
        </select>
      </div>
    </SectionWrapper>
  );
}

function TaxCard({
  tax,
  taxType,
  taxTypeId,
  code,
  isFixed,
  requireRate,
  needsSpecialFields,
  basePrice,
  calculateTaxAmount,
  onUpdate,
  onRemove,
}: {
  tax: LineTax;
  taxType: any;
  /** Data-api numeric id (only used to fetch the tax-amounts catalog). */
  taxTypeId?: number;
  code: string;
  isFixed: boolean;
  requireRate: boolean;
  needsSpecialFields: boolean;
  basePrice: number;
  calculateTaxAmount: (tax: LineTax, taxAmounts: any[]) => number;
  onUpdate: (patch: Partial<LineTax>) => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const { data: taxAmountsData } = useAllTaxAmounts(
    { iso_code: ISO, tax_id: taxTypeId ?? 0 },
    { enabled: needsSpecialFields && !!taxTypeId }
  );
  const taxAmounts = taxAmountsData ?? [];
  const taxAmount = calculateTaxAmount(tax, taxAmounts);

  return (
    <div className="px-3 py-2.5 bg-muted/30 rounded-lg border border-border">
      <div className={`flex items-center gap-2 ${needsSpecialFields ? 'mb-2' : ''}`}>
        <div className="flex-1 text-xs font-semibold">
          {taxType?.description ?? t('lineDetail.taxes')}
        </div>

        {requireRate && !isFixed && !needsSpecialFields && (
          <>
            <input
              type="number"
              className="pp-input w-[72px] !h-auto !px-2 !py-[3px] text-xs"
              placeholder="%"
              min={0}
              max={100}
              value={tax.rate ?? ''}
              onChange={(e) => onUpdate({ rate: Number(e.target.value) })}
            />
            {taxAmount > 0 && (
              <span className="text-xs font-semibold text-primary min-w-[64px] text-right">
                +{fmt(taxAmount)}
              </span>
            )}
          </>
        )}

        {isFixed && (
          <>
            <span className="text-xs font-semibold text-muted-foreground px-2 py-[3px]">5%</span>
            {basePrice > 0 && (
              <span className="text-xs font-semibold text-primary min-w-[64px] text-right">
                +{fmt(basePrice * 0.05)}
              </span>
            )}
          </>
        )}

        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onRemove}>
          <Icon name="xCircle" size={14} />
        </button>
      </div>

      {needsSpecialFields && (
        <>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
          >
            {taxAmounts.length > 0 && (
              <div>
                <FormLabel>{t('lineDetail.taxAmount')}</FormLabel>
                <select
                  className="pp-input text-xs"
                  value={tax.special_fields?.tax_amount_id ?? ''}
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                    onUpdate({
                      special_fields: {
                        ...tax.special_fields,
                        tax_amount_id: selectedId,
                      },
                    });
                  }}
                >
                  <option value="">{t('lineDetail.selectAmount')}</option>
                  {taxAmounts.map((ta: any) => (
                    <option key={ta.id} value={ta.id}>
                      {ta.description} — ₡{ta.amount.toLocaleString('es-CR')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {['03', '04', '05', '06'].includes(code) && (
              <div>
                <FormLabel>{t('products.quantityUdm')}</FormLabel>
                <input
                  type="number"
                  className="pp-input text-xs"
                  placeholder="0"
                  min={0}
                  value={tax.special_fields?.quantity ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      special_fields: { ...tax.special_fields, quantity: Number(e.target.value) },
                    })
                  }
                />
              </div>
            )}

            {code === '04' && (
              <div>
                <FormLabel>{t('products.percentage')}</FormLabel>
                <input
                  type="number"
                  className="pp-input text-xs"
                  placeholder="0"
                  min={0}
                  max={100}
                  step={0.01}
                  value={tax.special_fields?.percentage ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      special_fields: { ...tax.special_fields, percentage: Number(e.target.value) },
                    })
                  }
                />
              </div>
            )}

            {code === '05' && (
              <div>
                <FormLabel>{t('products.volumePerUnit')}</FormLabel>
                <input
                  type="number"
                  className="pp-input text-xs"
                  placeholder="0"
                  min={0}
                  value={tax.special_fields?.volume_consumption ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      special_fields: {
                        ...tax.special_fields,
                        volume_consumption: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            )}
          </div>

          <div
            className={`mt-2 px-2.5 py-1.5 rounded-md flex justify-between items-center ${
              taxAmount > 0 ? 'bg-primary/[0.08]' : 'bg-muted/30'
            }`}
          >
            <span className="text-[11px] font-semibold text-muted-foreground">
              {t('lineDetail.taxAmount')}
            </span>
            <span
              className={`text-[13px] font-bold font-mono ${
                taxAmount > 0 ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {taxAmount > 0 ? `+${fmt(taxAmount)}` : '₡0'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
