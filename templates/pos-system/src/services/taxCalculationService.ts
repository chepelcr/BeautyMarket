import { getTaxConfig } from "@/types/taxTypeConfig";

// Mirrors the Hacienda tax codes
const TaxCodes = {
  IUC:    "03",
  ISEBA:  "04",
  ISEBEC: "05",
  IPT:    "06",
  OTHERS: "99",
} as const;

export interface TaxEntry {
  taxTypeId: number;
  taxCode: string;  // e.g. "01" for IVA
  rate: number;     // percentage, e.g. 13
  specialFields?: {
    quantity?: number;
    percentage?: number;
    taxAmountId?: number;
    volumeConsumption?: number;
  };
}

export interface TaxAmountEntry {
  id: number;
  amount: number;
}

export interface DiscountEntry {
  discountTypeId: number;
  rate?: number;
}

export interface LineAmountsParams {
  subtotal: number;
  baseAmount?: number;
  taxes: TaxEntry[];
  discounts?: DiscountEntry[];
  documentType?: string;
  detailQuantity: number;
  cabys?: string;
  taxAmounts?: Record<number, TaxAmountEntry[]>;
  hasFactoryTax?: boolean;
}

export interface LineAmountsResult {
  netTax: number;
  totalAmountLine: number;
  baseAmount: number;
  factoryAssumedTax: number;
  ivaTaxTotal: number;
  otherTaxTotal: number;
}

export class TaxCalculationService {
  static getLineAmounts(params: LineAmountsParams): LineAmountsResult {
    const {
      subtotal,
      baseAmount: initialBaseAmount,
      taxes,
      discounts = [],
      documentType,
      detailQuantity,
      cabys,
      taxAmounts = {},
      hasFactoryTax = false,
    } = params;

    let totalAmountLine = subtotal;
    let netTax = 0;
    let baseAmount = initialBaseAmount ?? subtotal;
    let factoryAssumedTax = 0;
    let ivaTaxTotal = 0;
    let otherTaxTotal = 0;

    const hasDiscountsBonusOrGifts = discounts.some(d => d.discountTypeId === 1 || d.discountTypeId === 3);
    const isPurchaseOrExportBill = documentType === "PURCHASE_INVOICE" || documentType === "EXPORT_BILL";

    // 1. Special taxes (non-IVA, non-OTHERS)
    const specialTaxes = taxes.filter(t => {
      const cfg = getTaxConfig(t.taxCode);
      return cfg && !cfg.iva && t.taxCode !== "99";
    });

    specialTaxes.forEach(tax => {
      const cfg = getTaxConfig(tax.taxCode);
      if (!cfg) return;

      const taxAmountEntry = taxAmounts[tax.taxTypeId]?.find(ta => ta.id === (tax.specialFields?.taxAmountId ?? 0));
      const amount = this.calculateSpecialTaxAmount(tax, detailQuantity, subtotal, cabys, taxAmountEntry);

      netTax += amount;
      totalAmountLine += amount;

      if (cfg.forBaseAmount) baseAmount += amount;

      if ((cfg.forFactoryTax && !hasFactoryTax) || ((tax.taxCode === "12" || tax.taxCode === "03") && hasFactoryTax)) {
        factoryAssumedTax += amount;
        totalAmountLine -= amount;
        netTax -= amount;
      } else if (hasDiscountsBonusOrGifts && !isPurchaseOrExportBill) {
        factoryAssumedTax += amount;
        totalAmountLine -= amount;
        netTax -= amount;
      } else {
        otherTaxTotal += amount;
      }
    });

    // 2. OTHERS (code 99)
    const othersTaxes = taxes.filter(t => t.taxCode === "99");
    othersTaxes.forEach(tax => {
      const amount = baseAmount * tax.rate / 100;
      const cfg = getTaxConfig(tax.taxCode);

      netTax += amount;
      totalAmountLine += amount;

      if (cfg?.forBaseAmount) baseAmount += amount;

      if (hasDiscountsBonusOrGifts && !isPurchaseOrExportBill) {
        factoryAssumedTax += amount;
        totalAmountLine -= amount;
        netTax -= amount;
      } else {
        otherTaxTotal += amount;
      }
    });

    // 3. IVA taxes last
    const ivaTaxes = taxes.filter(t => getTaxConfig(t.taxCode)?.iva);
    ivaTaxes.forEach(tax => {
      const amount = this.calculateIvaTaxAmount(tax, baseAmount, subtotal, totalAmountLine, discounts, documentType);

      if (hasDiscountsBonusOrGifts && !isPurchaseOrExportBill) {
        factoryAssumedTax += amount;
      } else {
        netTax += amount;
        totalAmountLine += amount;
        ivaTaxTotal += amount;
      }
    });

    return { netTax, totalAmountLine, baseAmount, factoryAssumedTax, ivaTaxTotal, otherTaxTotal };
  }

  private static calculateIvaTaxAmount(
    tax: TaxEntry,
    baseAmount: number,
    subtotal: number,
    totalAmount: number,
    discounts: DiscountEntry[],
    documentType?: string,
  ): number {
    const code = tax.taxCode;
    if (code === "07" || code === "01") {
      const useTotalAmount =
        discounts.some(d => d.discountTypeId === 1 || d.discountTypeId === 3) ||
        documentType === "EXPORT_BILL";
      return (useTotalAmount ? totalAmount : baseAmount) * tax.rate / 100;
    }
    if (code === "08") {
      return (tax.specialFields?.quantity ?? 0) * subtotal;
    }
    return baseAmount * tax.rate / 100;
  }

  private static calculateSpecialTaxAmount(
    tax: TaxEntry,
    detailQuantity: number,
    subtotal: number,
    cabys?: string,
    taxAmount?: TaxAmountEntry,
  ): number {
    const amt = taxAmount?.amount ?? 0;
    switch (tax.taxCode) {
      case TaxCodes.IUC:
        return amt * (tax.specialFields?.quantity ?? 0);
      case TaxCodes.ISEBA: {
        const proportion = (tax.specialFields?.quantity ?? 0) * (tax.specialFields?.percentage ?? 0) / 100;
        return detailQuantity * proportion * amt;
      }
      case TaxCodes.IPT:
        return detailQuantity * (tax.specialFields?.quantity ?? 0) * amt;
      case TaxCodes.ISEBEC: {
        if (cabys?.startsWith("2202")) {
          const altAmt = amt / (tax.specialFields?.volumeConsumption ?? 1);
          return detailQuantity * (tax.specialFields?.quantity ?? 0) * altAmt;
        }
        return (tax.specialFields?.quantity ?? 0) * (tax.specialFields?.volumeConsumption ?? 0) * amt;
      }
      default:
        return subtotal * tax.rate / 100;
    }
  }
}

export function computeSalePrice(price: number, taxes: TaxEntry[], discounts: DiscountEntry[] = [], cabys?: string, hasFactoryTax?: boolean): number {
  if (!price || taxes.length === 0) return price;
  const { totalAmountLine } = TaxCalculationService.getLineAmounts({
    subtotal: price,
    taxes,
    discounts,
    detailQuantity: 1,
    cabys,
    hasFactoryTax,
  });
  return totalAmountLine;
}
