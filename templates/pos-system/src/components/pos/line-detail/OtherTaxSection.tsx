import { Receipt } from 'lucide-react';
import { Icon, FormLabel } from '@/components/ui';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useAllTaxes, useAllTaxAmounts } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import { getTaxConfig } from '@/types/taxTypeConfig';
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
      title="Otros Impuestos"
      icon={Receipt}
      isExpanded={isExpanded}
      onToggle={onToggle}
      badge={addedOtherTaxes.length > 0 ? addedOtherTaxes.length : undefined}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              cfg={cfg}
              code={code}
              isFixed={isFixed}
              requireRate={requireRate}
              needsSpecialFields={needsSpecialFields}
              basePrice={basePrice}
              cabys={cabys}
              detailQuantity={detailQuantity}
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
          <option value="">Agregar impuesto</option>
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
  cfg,
  code,
  isFixed,
  requireRate,
  needsSpecialFields,
  basePrice,
  cabys,
  detailQuantity,
  calculateTaxAmount,
  onUpdate,
  onRemove,
}: {
  tax: LineTax;
  taxType: any;
  cfg: any;
  code: string;
  isFixed: boolean;
  requireRate: boolean;
  needsSpecialFields: boolean;
  basePrice: number;
  cabys?: string;
  detailQuantity: number;
  calculateTaxAmount: (tax: LineTax, taxAmounts: any[]) => number;
  onUpdate: (patch: Partial<LineTax>) => void;
  onRemove: () => void;
}) {
  const { data: taxAmountsData } = useAllTaxAmounts(
    { iso_code: ISO, tax_id: tax.tax_type_id },
    { enabled: needsSpecialFields }
  );
  const taxAmounts = taxAmountsData ?? [];
  
  // Calculate tax amount
  const taxAmount = calculateTaxAmount(tax, taxAmounts);
  
  // ISEBEC (05): beverages — alcoholic (3401) or non-alcoholic (2202)
  const isIsebec = code === '05';
  const isAlcoholic = cabys?.startsWith('3401');
  const isNonAlcoholic = cabys?.startsWith('2202');
  const isBeverage = isAlcoholic || isNonAlcoholic;

  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'hsl(var(--muted) / 0.3)',
        borderRadius: 8,
        border: '1px solid hsl(var(--border))',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: needsSpecialFields ? 8 : 0 }}>
        <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>
          {taxType?.description ?? 'Impuesto'}
        </div>

        {requireRate && !isFixed && !needsSpecialFields && (
          <>
            <input
              type="number"
              className="pp-input"
              style={{ width: 72, padding: '3px 8px', fontSize: 12 }}
              placeholder="%"
              min={0}
              max={100}
              value={tax.rate ?? ''}
              onChange={(e) => onUpdate({ rate: Number(e.target.value) })}
            />
            {taxAmount > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', minWidth: 64, textAlign: 'right' }}>
                +{fmt(taxAmount)}
              </span>
            )}
          </>
        )}
        
        {isFixed && (
          <>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))', padding: '3px 8px' }}>
              5%
            </span>
            {basePrice > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', minWidth: 64, textAlign: 'right' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
            {/* Tax Amount dropdown - shown for all special field taxes */}
          {taxAmounts.length > 0 && (
            <div>
              <FormLabel>Monto impuesto</FormLabel>
              <select
                className="pp-input"
                style={{ fontSize: 12 }}
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
                <option value="">Seleccionar</option>
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
                Cantidad UdM
              </FormLabel>
              <input
                type="number"
                className="pp-input"
                style={{ fontSize: 12 }}
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
              <FormLabel>Porcentaje</FormLabel>
              <input
                type="number"
                className="pp-input"
                style={{ fontSize: 12 }}
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
              <FormLabel>Volumen/unidad</FormLabel>
              <input
                type="number"
                className="pp-input"
                style={{ fontSize: 12 }}
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
        <div style={{ 
          marginTop: 8, 
          padding: '6px 10px', 
          background: taxAmount > 0 ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--muted) / 0.3)', 
          borderRadius: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
            Monto calculado
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: taxAmount > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}>
            {taxAmount > 0 ? `+${fmt(taxAmount)}` : '₡0'}
          </span>
        </div>
      </>
      )}
    </div>
  );
}
