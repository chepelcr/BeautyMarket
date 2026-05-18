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
  onToggle
}: OtherTaxSectionProps) {
  const { t } = useLanguage();
  const { data: taxesData } = useAllTaxes({ iso_code: ISO });
  const allTaxTypes = taxesData ?? [];
  
  // Calculate tax amount based on type and special fields
  const calculateTaxAmount = (tax: LineTax, taxAmounts: any[]): number => {
    const tt = allTaxTypes.find((x: any) => x.id === tax.tax_type_id);
    if (!tt) {
      console.log('Tax type not found for tax_type_id:', tax.tax_type_id);
      return 0;
    }
    
    const code = (tt as any).code;
    
    // Simple percentage-based taxes
    if (code === '02' || code === '99') {
      return basePrice * (tax.rate || 0) / 100;
    }
    
    // ISEC - fixed 5%
    if (code === '12') {
      return basePrice * 0.05;
    }
    
    // Special field taxes
    const taxAmountId = tax.special_fields?.tax_amount_id;
    const taxAmountItem = taxAmounts.find((ta: any) => ta.id === taxAmountId);
    const taxAmountValue = taxAmountItem?.amount || 0;
    
    // Debug logging
    if (SPECIAL_AMOUNT_CODES.includes(code)) {
      console.log(`Tax ${code} calculation:`, {
        taxTypeId: tax.tax_type_id,
        code,
        specialFields: tax.special_fields,
        taxAmountId,
        taxAmountItem,
        taxAmountValue,
        detailQuantity,
        basePrice,
        taxAmountsArray: taxAmounts,
      });
    }
    
    // IUC (03): quantity × tax_amount
    if (code === '03') {
      const quantity = tax.special_fields?.quantity || 0;
      const result = quantity * taxAmountValue;
      console.log(`IUC calculation result: ${quantity} × ${taxAmountValue} = ${result}`);
      return result;
    }
    
    // ISEBA (04): detail_quantity × (quantity × percentage/100) × tax_amount
    if (code === '04') {
      const quantity = tax.special_fields?.quantity || 0;
      const percentage = tax.special_fields?.percentage || 0;
      const proportion = (quantity * percentage) / 100;
      return detailQuantity * proportion * taxAmountValue;
    }
    
    // ISEBEC (05): depends on CABYS
    if (code === '05') {
      const quantity = tax.special_fields?.quantity || 0;
      const volumeConsumption = tax.special_fields?.volume_consumption || 0;
      
      if (cabys?.startsWith('2202')) {
        // Non-alcoholic: detail_quantity × quantity × (tax_amount / volume_consumption)
        const altAmount = taxAmountValue / (volumeConsumption || 1);
        return detailQuantity * quantity * altAmount;
      } else {
        // Alcoholic/Soaps: quantity × volume_consumption × tax_amount
        return quantity * volumeConsumption * taxAmountValue;
      }
    }
    
    // IPT (06): detail_quantity × quantity × tax_amount
    if (code === '06') {
      const quantity = tax.special_fields?.quantity || 0;
      return detailQuantity * quantity * taxAmountValue;
    }
    
    return 0;
  };

  const otherTaxTypes = allTaxTypes.filter(
    (t: { code?: string }) => !IVA_CODES.includes(t.code ?? '')
  );
  
  const addedOtherTaxes = taxes.filter((t) => {
    const tt = allTaxTypes.find((x: any) => x.id === t.tax_type_id);
    return !IVA_CODES.includes(tt?.code ?? '');
  });

  const addOther = (taxTypeId: number) => {
    const tt = otherTaxTypes.find((t: any) => t.id === taxTypeId);
    if (!tt) return;
    
    const newTax: LineTax = {
      tax_type_id: tt.id,
      rate: (tt as any).code === '12' ? 5 : 0,
      special_fields: {},
    };
    
    onChange([...taxes, newTax]);
  };

  const removeOther = (taxTypeId: number) => {
    onChange(taxes.filter((t) => t.tax_type_id !== taxTypeId));
  };

  const updateOther = (taxTypeId: number, patch: Partial<LineTax>) => {
    onChange(taxes.map((t) => (t.tax_type_id === taxTypeId ? { ...t, ...patch } : t)));
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
          const tt = allTaxTypes.find((x: any) => x.id === tax.tax_type_id);
          const cfg = getTaxConfig(tt?.code);
          const code = (tt as any)?.code;
          const isFixed = code === '12'; // ISEC has fixed 5% rate
          const requireRate = cfg?.requireRate ?? true;
          const needsSpecialFields = SPECIAL_AMOUNT_CODES.includes(code ?? '');

          return (
            <TaxCard
              key={tax.tax_type_id}
              tax={tax}
              taxType={tt}
              code={code}
              isFixed={isFixed}
              requireRate={requireRate}
              needsSpecialFields={needsSpecialFields}
              basePrice={basePrice}
              calculateTaxAmount={calculateTaxAmount}
              onUpdate={(patch) => updateOther(tax.tax_type_id, patch)}
              onRemove={() => removeOther(tax.tax_type_id)}
            />
          );
        })}

        {/* Add other tax */}
        <select
          className="pp-input"
          value=""
          onChange={(e) => {
            if (e.target.value) addOther(Number(e.target.value));
          }}
        >
          <option value="">{t('lineDetail.addTax')}</option>
          {otherTaxTypes
            .filter((tt: any) => {
              // OTHERS (99) can be repeated
              if (tt.code === '99') return true;
              // Other types can't be repeated
              return !taxes.some((t) => t.tax_type_id === tt.id);
            })
            .map((tt: any) => (
              <option key={tt.id} value={String(tt.id)}>
                {tt.description}
              </option>
            ))}
        </select>
      </div>
    </SectionWrapper>
  );
}

// Separate component for each tax card
function TaxCard({
  tax,
  taxType,
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
    { iso_code: ISO, tax_id: tax.tax_type_id },
    { enabled: needsSpecialFields }
  );
  const taxAmounts = taxAmountsData ?? [];

  // Calculate tax amount
  const taxAmount = calculateTaxAmount(tax, taxAmounts);

  return (
    <div className="px-3 py-2.5 bg-muted/30 rounded-lg border border-border">
      {/* Header */}
      <div className={`flex items-center gap-2 ${needsSpecialFields ? "mb-2" : ""}`}>
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
            <span className="text-xs font-semibold text-muted-foreground px-2 py-[3px]">
              5%
            </span>
            {basePrice > 0 && (
              <span className="text-xs font-semibold text-primary min-w-[64px] text-right">
                +{fmt(basePrice * 0.05)}
              </span>
            )}
          </>
        )}

        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          onClick={onRemove}
        >
          <Icon name="xCircle" size={14} />
        </button>
      </div>

      {/* Special Fields */}
      {needsSpecialFields && (
        <>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
            {/* Tax Amount dropdown - shown for all special field taxes */}
          {taxAmounts.length > 0 && (
            <div>
              <FormLabel>{t('lineDetail.taxAmount')}</FormLabel>
              <select
                className="pp-input text-xs"
                value={tax.special_fields?.tax_amount_id ?? ''}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selectedTaxAmount = taxAmounts.find((ta: any) => ta.id === selectedId);
                  onUpdate({
                    special_fields: {
                      ...tax.special_fields,
                      tax_amount_id: selectedId,
                      amount: selectedTaxAmount?.amount || 0 // Store the amount value
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

          {/* Quantity field — IUC, ISEBA, ISEBEC, IPT */}
          {['03', '04', '05', '06'].includes(code) && (
            <div>
              <FormLabel>
                {t('products.quantityUdm')}
              </FormLabel>
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

          {/* ISEBA percentage - manual input, no auto-select */}
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

          {/* ISEBEC volume per unit */}
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
                    special_fields: { ...tax.special_fields, volume_consumption: Number(e.target.value) },
                  })
                }
              />
            </div>
          )}
        </div>
        
        {/* Calculated Amount Display - Always show for special field taxes */}
        <div className={`mt-2 px-2.5 py-1.5 rounded-md flex justify-between items-center ${
          taxAmount > 0 ? "bg-primary/[0.08]" : "bg-muted/30"
        }`}>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {t('lineDetail.taxAmount')}
          </span>
          <span className={`text-[13px] font-bold font-mono ${
            taxAmount > 0 ? "text-primary" : "text-muted-foreground"
          }`}>
            {taxAmount > 0 ? `+${fmt(taxAmount)}` : '₡0'}
          </span>
        </div>
      </>
      )}
    </div>
  );
}
