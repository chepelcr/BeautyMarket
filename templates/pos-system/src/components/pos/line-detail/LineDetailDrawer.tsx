import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Drawer, Button } from '@/components/ui';
import { FadeIn } from '@/components/ui/FadeIn';
import {
  useAllTaxes,
  useAllTaxRates,
  useAllTaxFactors,
  useAllFactoryTaxCharges,
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
  // Note: tax-amounts requires tax_id, so we don't fetch it here - it's fetched per-tax when needed
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

  // The product catalog stores Hacienda code strings throughout (tax_type_id,
  // discount_type_id, unit_measure). Project field names from the product
  // response shape to the canonical LineTax / LineDiscount shape — no catalog
  // lookups needed.
  const productTaxesToLineTaxes = (productTaxes: any[] | undefined): LineTax[] =>
    (productTaxes ?? []).map((t: any) => ({
      code: t.tax_type_id,
      rate: t.tax_rate?.percentage ?? t.rate ?? 0,
      rate_code: t.tax_rate?.code,
      factor: t.tax_factor?.factor,
      other_tax_type: t.other_tax_type,
      special_fields: t.special_fields,
    }));

  const productDiscountsToLineDiscounts = (
    productDiscounts: any[] | undefined
  ): LineDiscount[] =>
    (productDiscounts ?? []).map((d: any) => ({
      discount_type: d.discount_type_id,
      percentage: d.percentage ?? d.rate ?? 0,
      reason: d.reason,
    }));

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
        cabys: existingLineDetail.cabys ?? product.cabys?.code ?? undefined,
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
      unit_measure: (product as any).unit_measure,
      commercial_unit_measure: undefined,
      customs_part: undefined,
      cabys: product.cabys?.code ?? undefined,
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
        cabys: existingLineDetail.cabys ?? product.cabys?.code ?? undefined,
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
      unit_measure: (product as any).unit_measure,
      commercial_unit_measure: undefined,
      customs_part: undefined,
      cabys: product.cabys?.code ?? undefined,
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
          code: tt.code,
          tax_id: tt.id,
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
