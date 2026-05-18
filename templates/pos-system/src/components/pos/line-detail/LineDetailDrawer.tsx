import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Drawer, Button } from '@/components/ui';
import { FadeIn } from '@/components/ui/FadeIn';
import {
  useAllTaxes,
  useAllTaxRates,
  useAllTaxFactors,
  useAllFactoryTaxCharges,
  useAllDiscountTypes,
  useAllMeasurementUnits,
} from '@/hooks/useDataApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { CountryISO } from '@/lib/enums';
import type { GetAllFactoryTaxChargesParams } from '@/services/data-api/dtos';
import { TaxCalculationService } from '@/services/taxCalculationService';
import { DiscountCalculationService } from '@/services/discountCalculationService';
import { GeneralTab } from './GeneralTab';
import { IvaTaxSection } from './IvaTaxSection';
import { OtherTaxSection } from './OtherTaxSection';
import { DiscountsTab } from './DiscountsTab';
import { FiscalInfoSection } from './FiscalInfoSection';
import { CommercialValueSection } from './CommercialValueSection';
import type { LineDetail, LineTax, LineDiscount } from '@/types/lineDetail';
import type { Product } from '@/types';

const fmt = (n: number) => '₡' + n.toLocaleString('es-CR', { minimumFractionDigits: 2 });

interface SectionExpanded {
  general: boolean;
  fiscal: boolean;
  discounts: boolean;
  otherTaxes: boolean;
  ivaTax: boolean;
  commercial: boolean;
}

interface LineDetailDrawerProps {
  open: boolean;
  product: Product | null;
  qty: number;
  lineDiscount?: number;
  lineNote?: string;
  documentType?: number | string;
  lineDetail?: Partial<LineDetail>; // Existing line detail from cart
  onSave: (patch: { 
    qty?: number; 
    lineDiscount?: number; 
    lineNote?: string;
    lineDetail?: Partial<LineDetail>;
  }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function LineDetailDrawer({
  open,
  product,
  qty,
  lineDiscount,
  lineNote,
  documentType,
  lineDetail: existingLineDetail,
  onSave,
  onDelete,
  onClose,
}: LineDetailDrawerProps) {
  const { data: taxTypes } = useAllTaxes({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxRates } = useAllTaxRates({ iso_code: CountryISO.COSTA_RICA });
  const { data: taxFactors } = useAllTaxFactors({ iso_code: CountryISO.COSTA_RICA });
  const { data: factoryTaxCharges } = useAllFactoryTaxCharges({ iso_code: CountryISO.COSTA_RICA } as GetAllFactoryTaxChargesParams);
  const { data: discountTypes } = useAllDiscountTypes({ iso_code: CountryISO.COSTA_RICA });
  // Measurement units catalog — needed to resolve product.unit_id (data-api
  // numeric id) → unit_measure (Hacienda code string) when initializing a
  // line. React Query caches by queryKey, so this is the same fetch
  // GeneralTab uses; no duplicate BE call.
  const { data: measurementUnits } = useAllMeasurementUnits();
  // Note: taxAmounts requires tax_id, so we don't fetch it here - it's fetched per-tax when needed
  const { confirm, ConfirmModal } = useConfirmModal();
  const { t } = useLanguage();
  
  const [expanded, setExpanded] = useState<SectionExpanded>({
    general: true,
    fiscal: false,
    discounts: false,
    otherTaxes: false,
    ivaTax: false,
    commercial: true,
  });

  // Build initial LineDetail from product - reset when product changes
  /**
   * Translate product-catalog taxes (cross-app-be) → canonical LineTax[].
   * cross-app-be products carry numeric data-api catalog ids
   * (`tax_type_id`, `tax_rate_id`). The canonical downstream shape needs
   * Hacienda code strings. We look up each id in the already-loaded
   * catalogs (`taxTypes`, `taxRates`) — that's the single seam where the
   * id→code resolution happens.
   */
  const productTaxesToLineTaxes = (productTaxes: any[] | undefined): LineTax[] =>
    (productTaxes ?? []).map((t: any) => {
      const taxTypeEntry = (taxTypes ?? []).find(
        (tt: any) => tt.id === (t.tax_type_id ?? t.taxId)
      );
      const rateEntry = (taxRates ?? []).find(
        (r: any) => r.id === (t.tax_rate_id ?? t.taxRateId)
      );
      return {
        code: (taxTypeEntry as any)?.code ?? t.tax_code ?? t.code,
        rate: t.rate,
        rate_code: (rateEntry as any)?.code ?? t.rate_code ?? t.tax_rate_code,
        special_fields: t.special_fields ?? t.specialFields,
      };
    });

  /**
   * Translate product-catalog discounts → canonical LineDiscount[]. The
   * data-api `discountTypes` catalog resolves numeric `discount_type_id`
   * to the Hacienda discount-type code string.
   */
  const productDiscountsToLineDiscounts = (
    productDiscounts: any[] | undefined
  ): LineDiscount[] =>
    (productDiscounts ?? []).map((d: any) => {
      const entry = (discountTypes ?? []).find(
        (dt: any) => dt.id === (d.discount_type_id ?? d.discountTypeId)
      );
      return {
        discount_type: (entry as any)?.code ?? d.discount_code ?? d.discount_type,
        percentage: d.rate ?? d.percentage ?? 0,
      };
    });

  /**
   * Resolve product.unit_id (data-api numeric id) → unit_measure (Hacienda
   * code string) via the measurementUnits catalog.
   */
  const productUnitToCode = (unitId: number | undefined): string | undefined => {
    if (unitId == null) return undefined;
    const entry = (measurementUnits ?? []).find((u: any) => u.id === unitId);
    return (entry as any)?.code;
  };

  const [detail, setDetail] = useState<LineDetail>(() => {
    if (!product) {
      return {
        product_id: '',
        description: '',
        quantity: 1,
        net_price: 0,
        base_amount: undefined,
        product_type: undefined,
        unit_measure: undefined,
        commercial_unit_measure: undefined,
        customs_part: undefined,
        cabys: undefined,
        taxes: [],
        discounts: [],
      };
    }

    if (existingLineDetail) {
      return {
        product_id: product.product_id,
        description: existingLineDetail.description ?? lineNote ?? product.name,
        quantity: existingLineDetail.quantity ?? qty,
        net_price: existingLineDetail.net_price ?? product.price ?? 0,
        base_amount: existingLineDetail.base_amount,
        product_type: existingLineDetail.product_type,
        unit_measure: existingLineDetail.unit_measure,
        commercial_unit_measure: existingLineDetail.commercial_unit_measure,
        customs_part: existingLineDetail.customs_part,
        cabys: existingLineDetail.cabys ?? product.cabys ?? undefined,
        taxes: existingLineDetail.taxes ?? [],
        discounts: existingLineDetail.discounts ?? [],
      };
    }

    return {
      product_id: product.product_id,
      description: lineNote || product.name,
      quantity: qty,
      net_price: product.price ?? 0,
      base_amount: undefined,
      product_type: undefined,
      // Resolve the data-api unit id → Hacienda unit_measure code via catalog.
      unit_measure: productUnitToCode((product as any).unit_id),
      commercial_unit_measure: undefined,
      customs_part: undefined,
      cabys: product.cabys ?? undefined,
      taxes: productTaxesToLineTaxes(product.taxes),
      discounts: lineDiscount
        ? [{ discount_type: '01', percentage: lineDiscount }]
        : productDiscountsToLineDiscounts(product.discounts),
    };
  });

  // Reset detail when product changes (but NOT when data loads)
  useEffect(() => {
    if (!product) return;

    if (existingLineDetail) {
      setDetail({
        product_id: product.product_id,
        description: existingLineDetail.description ?? lineNote ?? product.name,
        quantity: existingLineDetail.quantity ?? qty,
        net_price: existingLineDetail.net_price ?? product.price ?? 0,
        base_amount: existingLineDetail.base_amount,
        product_type: existingLineDetail.product_type,
        unit_measure: existingLineDetail.unit_measure,
        commercial_unit_measure: existingLineDetail.commercial_unit_measure,
        customs_part: existingLineDetail.customs_part,
        cabys: existingLineDetail.cabys ?? product.cabys ?? undefined,
        taxes: existingLineDetail.taxes ?? [],
        discounts: existingLineDetail.discounts ?? [],
      });
      return;
    }

    setDetail({
      product_id: product.product_id,
      description: lineNote || product.name,
      quantity: qty,
      net_price: product.price ?? 0,
      base_amount: undefined,
      product_type: undefined,
      // Resolve the data-api unit id → Hacienda unit_measure code via catalog.
      unit_measure: productUnitToCode((product as any).unit_id),
      commercial_unit_measure: undefined,
      customs_part: undefined,
      cabys: product.cabys ?? undefined,
      taxes: productTaxesToLineTaxes(product.taxes),
      discounts: lineDiscount
        ? [{ discount_type: '01', percentage: lineDiscount }]
        : productDiscountsToLineDiscounts(product.discounts),
    });
  }, [product?.product_id, qty, lineDiscount, lineNote, existingLineDetail]);
  
  // Auto-expand sections based on content (separate effect)
  useEffect(() => {
    if (!taxTypes) return;

    const ivaTaxes = detail.taxes.filter((t) =>
      ['01', '07', '08'].includes(t.code ?? '')
    );
    const otherTaxes = detail.taxes.filter(
      (t) => !['01', '07', '08'].includes(t.code ?? '')
    );
    
    setExpanded((prev) => ({
      ...prev,
      // fiscal section always stays open (don't collapse when CABYS is cleared)
      discounts: detail.discounts.length > 0,
      otherTaxes: otherTaxes.length > 0,
      ivaTax: ivaTaxes.length > 0,
    }));
  }, [detail.taxes.length, detail.discounts.length, taxTypes]);

  const toggle = (key: keyof SectionExpanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const patch = (p: Partial<LineDetail>) => setDetail((d) => ({ ...d, ...p }));

  // Get the selected factory charge to check its code. `detail.factory_tax`
  // holds the Hacienda factory-tax-charge code (string) — canonical.
  const selectedFactoryCharge = (factoryTaxCharges ?? []).find(
    (c: any) => c.code === detail.factory_tax
  );
  const hasFactoryTaxAssumed = selectedFactoryCharge?.code === '01';

  const subtotalAfterDiscount = useMemo(
    () =>
      DiscountCalculationService.calculateSubtotal(
        detail.net_price * detail.quantity,
        detail.discounts
      ),
    [detail.net_price, detail.quantity, detail.discounts]
  );

  const lineAmounts = useMemo(
    () => {
      const result = TaxCalculationService.getLineAmounts({
        subtotal: subtotalAfterDiscount,
        base_amount: detail.base_amount,
        taxes: detail.taxes,
        tax_types: (taxTypes ?? []).map((tt: any) => ({
          tax_id: tt.id, // API returns 'id' from HaciendaBase
          code: tt.code,
          description: tt.description,
        })),
        discounts: detail.discounts,
        detail_quantity: detail.quantity,
        cabys: detail.cabys,
        tax_amounts: {}, // Tax amounts not available here - calculated in OtherTaxSection
        has_factory_tax: hasFactoryTaxAssumed,
      });
      
      // hasBonusGiftDiscount left here for future calc tweaks (factory tax / IVA);
      // discount_type "01" = Regalía and "03" = Bonificación per Hacienda.
      void detail.discounts.some(
        (d) => d.discount_type === '01' || d.discount_type === '03'
      );

      return result;
    },
    [subtotalAfterDiscount, detail, taxTypes, hasFactoryTaxAssumed, factoryTaxCharges, selectedFactoryCharge]
  );

  const handleDelete = () => {
    confirm({
      title: t("lineDetail.deleteTitle"),
      message: t("lineDetail.deleteMessage"),
      variant: "destructive",
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      icon: "trash",
      onConfirm: () => {
        onDelete?.();
        onClose();
      },
    });
  };

  const handleSave = () => {
    if (!product) return;
    
    // Save full line detail
    onSave({
      qty: detail.quantity,
      lineDiscount: detail.discounts.reduce((s, d) => s + (d.percentage || 0), 0) || undefined,
      lineNote: detail.description !== product.name ? detail.description : undefined,
      lineDetail: detail, // Save the complete detail
    });
  };

  // Data ready check
  const dataReady = !!(taxTypes && taxRates && taxFactors);

  if (!product) return null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={t('lineDetail.title')}
        subtitle={product?.name}
        icon="edit"
        width="min(500px, 100vw)"
        footer={
          <div className="px-6 py-4 flex gap-2 items-center">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon="trash"
                onClick={handleDelete}
                className="!text-destructive"
              >
                {t('common.delete')}
              </Button>
            )}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[13px] font-semibold text-muted-foreground">
                {t('lineEditor.lineTotal')}
              </span>
              <span className="text-lg font-bold font-mono text-primary">
                {fmt(lineAmounts.total_amount_line)}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
      {!dataReady ? (
        <div className="p-10 text-center text-muted-foreground">
          Cargando...
        </div>
      ) : (
        <FadeIn duration={0.3}>
          <div className="p-5 flex flex-col gap-2.5">
            {/* 1. General */}
            <GeneralTab
              detail={detail}
              onChange={patch}
              isExpanded={expanded.general}
              onToggle={() => toggle('general')}
              isExportInvoice={documentType === 9 || documentType === '09' || String(documentType) === '9'}
            />

            {/* 2. Fiscal Info */}
            <FiscalInfoSection
              detail={detail}
              isExpanded={expanded.fiscal}
              onToggle={() => toggle('fiscal')}
              onChange={patch}
            />

            {/* 3. Discounts */}
            <DiscountsTab
              discounts={detail.discounts}
              netPrice={detail.net_price}
              quantity={detail.quantity}
              onChange={(discounts) => patch({ discounts })}
              isExpanded={expanded.discounts}
              onToggle={() => toggle('discounts')}
            />

            {/* 4. Other Taxes */}
            <OtherTaxSection
              taxes={detail.taxes}
              onChange={(taxes) => patch({ taxes })}
              basePrice={detail.net_price * detail.quantity}
              cabys={detail.cabys}
              detailQuantity={detail.quantity}
              isExpanded={expanded.otherTaxes}
              onToggle={() => toggle('otherTaxes')}
            />

            {/* 5. IVA Tax */}
            <IvaTaxSection
              taxes={detail.taxes}
              onChange={(taxes) => patch({ taxes })}
              factoryTaxChargeCode={detail.factory_tax}
              onFactoryTaxChargeChange={(code) => patch({ factory_tax: code })}
              baseAmount={lineAmounts.base_amount}
              factoryAssumedTax={lineAmounts.factory_assumed_tax}
              isExpanded={expanded.ivaTax}
              onToggle={() => toggle('ivaTax')}
              detail={detail}
              onDetailChange={patch}
            />

            {/* 6. Commercial Value */}
            <CommercialValueSection
              detail={detail}
              subtotalAfterDiscount={subtotalAfterDiscount}
              lineAmounts={lineAmounts}
              isExpanded={expanded.commercial}
              onToggle={() => toggle('commercial')}
            />
          </div>
        </FadeIn>
      )}
    </Drawer>
    
    {/* Confirmation Modal */}
    <ConfirmModal />
  </>
  );
}
