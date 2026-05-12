import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAllTaxes, useAllTaxRates, useAllTaxFactors, useAllTaxAmounts, useAllFactoryTaxCharges } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import { TaxCalculationService } from '@/services/taxCalculationService';
import { DiscountCalculationService } from '@/services/discountCalculationService';
import { GeneralTab } from './GeneralTab';
import { TaxesTab } from './TaxesTab';
import { DiscountsTab } from './DiscountsTab';
import { OtherTab } from './OtherTab';
import type { LineDetail, LineTax, LineDiscount } from '@/types/lineDetail';
import type { Product } from '@/types';

const fmt = (n: number) => '₡' + n.toLocaleString('es-CR', { minimumFractionDigits: 2 });

type TabId = 'general' | 'impuestos' | 'descuentos' | 'otros';
const TABS: { id: TabId; label: string }[] = [
  { id: 'general',    label: 'General'    },
  { id: 'impuestos',  label: 'Impuestos'  },
  { id: 'descuentos', label: 'Descuentos' },
  { id: 'otros',      label: 'Otros'      },
];

interface LineDetailModalProps {
  product: Product;
  qty: number;
  lineDiscount?: number;
  lineNote?: string;
  onSave: (patch: { qty?: number; lineDiscount?: number; lineNote?: string }) => void;
  onClose: () => void;
}

export function LineDetailModal({
  product,
  qty,
  lineDiscount,
  lineNote,
  onSave,
  onClose,
}: LineDetailModalProps) {
  const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxRates } = useAllTaxRates({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxFactors } = useAllTaxFactors({ iso_code: CountryISO.COSTA_RICA });
  const { data: factoryTaxCharges } = useAllFactoryTaxCharges({ iso_code: CountryISO.COSTA_RICA });
  // Note: taxAmounts is fetched per-tax in TaxesTab when needed
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // Build initial LineDetail from product
  const [detail, setDetail] = useState<LineDetail>(() => ({
    product_id: product.product_id,
    description: lineNote || product.name,
    quantity: qty,
    net_price: product.price ?? 0,
    base_amount: undefined,
    unit_id: undefined,
    commercial_unit_measure: undefined,
    customs_part: undefined,
    factory_tax_charge_id: undefined,
    cabys: product.cabys,
    taxes: (product.taxes ?? []).map((t: any) => ({
      tax_type_id: t.tax_type_id ?? t.taxId,
      rate: t.rate,
      special_fields: t.special_fields ?? t.specialFields,
    })) as LineTax[],
    discounts: lineDiscount
      ? [{ discount_type_id: 1, percentage: lineDiscount }]
      : (product.discounts ?? []).map((d: any) => ({
          discount_type_id: d.discount_type_id ?? d.discountTypeId,
          percentage: d.rate ?? d.percentage ?? 0,
        })) as LineDiscount[],
  }));

  const patch = (p: Partial<LineDetail>) => setDetail((d) => ({ ...d, ...p }));

  // Live calculation
  const taxAmountsMap = useMemo(() => {
    const map: Record<number, any[]> = {};
    if (taxAmounts) {
      Object.entries(taxAmounts).forEach(([k, v]) => { map[Number(k)] = v as any[]; });
    }
    return map;
  }, [taxAmounts]);

  const hasFactoryTax = !!detail.factory_tax_charge_id;

  const subtotalAfterDiscount = useMemo(
    () =>
      DiscountCalculationService.calculateSubtotal(
        detail.net_price * detail.quantity,
        detail.discounts
      ),
    [detail.net_price, detail.quantity, detail.discounts]
  );

  const lineAmounts = useMemo(
    () =>
      TaxCalculationService.getLineAmounts({
        subtotal: subtotalAfterDiscount,
        base_amount: detail.base_amount,
        taxes: detail.taxes,
        tax_types: (taxTypes ?? []).map((tt: any) => ({
          tax_id: tt.tax_id ?? tt.taxId,
          code: tt.code,
          description: tt.description,
        })),
        discounts: detail.discounts,
        detail_quantity: detail.quantity,
        cabys: detail.cabys,
        tax_amounts: taxAmountsMap,
        has_factory_tax: hasFactoryTax,
      }),
    [subtotalAfterDiscount, detail, taxTypes, taxAmountsMap, hasFactoryTax]
  );

  const hasIvace = detail.taxes.some((t) => {
    const tt = (taxTypes ?? []).find((x: any) => (x.tax_id ?? x.taxId) === t.tax_type_id);
    return tt?.code === '07';
  });

  const handleSave = () => {
    // Map back to cart-compatible patch
    onSave({
      qty: detail.quantity,
      lineDiscount: detail.discounts.reduce((s, d) => s + (d.percentage || 0), 0) || undefined,
      lineNote: detail.description !== product.name ? detail.description : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-lg sm:rounded-2xl bg-card border border-border shadow-2xl overflow-hidden rounded-t-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <div className="font-display font-bold text-[16px]">Detalle de línea</div>
            <div className="text-[11px] text-muted-foreground line-clamp-1">{product.name}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border bg-card shrink-0">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 py-2.5 text-[12px] font-semibold border-b-2 transition-colors',
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto px-5 py-4">
          {activeTab === 'general' && (
            <GeneralTab
              detail={detail}
              onChange={patch}
              hasIvace={hasIvace}
              hasFactoryTax={hasFactoryTax}
            />
          )}
          {activeTab === 'impuestos' && (
            <TaxesTab
              taxes={detail.taxes}
              onChange={(taxes) => patch({ taxes })}
              factoryAssumedTax={lineAmounts.factory_assumed_tax}
              totalTaxes={lineAmounts.net_tax}
            />
          )}
          {activeTab === 'descuentos' && (
            <DiscountsTab
              discounts={detail.discounts}
              netPrice={detail.net_price}
              quantity={detail.quantity}
              onChange={(discounts) => patch({ discounts })}
            />
          )}
          {activeTab === 'otros' && (
            <OtherTab detail={detail} onChange={patch} />
          )}
        </div>

        {/* Footer: total + actions */}
        <div className="px-5 py-4 border-t border-border bg-card shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-semibold">Total línea</span>
            <span className="font-mono font-bold text-[18px] t-num text-primary">
              {fmt(lineAmounts.total_amount_line)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-[0_0_80px] h-10 rounded-md border border-border bg-card text-[13px] text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
