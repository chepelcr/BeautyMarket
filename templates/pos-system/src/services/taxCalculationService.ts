import { getTaxConfig } from '@/types/taxTypeConfig';
import type { LineTax, LineDiscount } from '@/types/lineDetail';

// Re-export so internal types here remain stable while delegating to the
// canonical type module.
export type { LineTax, LineDiscount };

// Tax codes — matches Hacienda codes; kept as constants to avoid magic strings
const TAX_CODE = {
  IUC: '03',
  ISEBA: '04',
  IPT: '06',
  ISEBEC: '05',
  OTHERS: '99',
} as const;

/** Discount codes — Hacienda canonical. */
const DISCOUNT_CODE = {
  REGALIA: '01',
  BONIFICACION: '03',
} as const;

export interface TaxType {
  /** Hacienda tax type code. */
  code: string;
  /** Data-api numeric id, kept only for internal catalog lookups. */
  tax_id?: number;
  description?: string;
}

export interface TaxAmount {
  id: number;
  amount: number;
}

interface TaxCalculationParams {
  tax: LineTax;
  taxType: TaxType;
  taxAmount?: TaxAmount;
  detail_quantity: number;
  base_amount: number;
  subtotal: number;
  cabys?: string;
}

interface IvaTaxCalculationParams {
  tax: LineTax;
  taxType: TaxType;
  base_amount: number;
  subtotal: number;
  total_amount: number;
  discounts?: LineDiscount[];
  document_type?: string;
}

export interface LineAmountsParams {
  subtotal: number;
  base_amount?: number;
  taxes: LineTax[];
  tax_types: TaxType[];
  discounts?: LineDiscount[];
  document_type?: string;
  detail_quantity: number;
  cabys?: string;
  /** Keyed by Hacienda tax-type code string. */
  tax_amounts?: { [code: string]: TaxAmount[] };
  has_factory_tax?: boolean;
}

export interface LineAmountsResult {
  net_tax: number;
  total_amount_line: number;
  base_amount: number;
  factory_assumed_tax: number;
  iva_tax_total: number;
  other_tax_total: number;
}

export class TaxCalculationService {
  static getLineAmounts(params: LineAmountsParams): LineAmountsResult {
    const {
      subtotal,
      base_amount: initial_base_amount,
      taxes,
      tax_types,
      discounts = [],
      document_type,
      detail_quantity,
      cabys,
      tax_amounts = {},
      has_factory_tax = false,
    } = params;

    let total_amount_line = subtotal;
    let net_tax = 0;
    let base_amount = initial_base_amount || subtotal;
    let factory_assumed_tax = 0;
    let iva_tax_total = 0;
    let other_tax_total = 0;

    // Check for bonus/gift discounts (Hacienda canonical codes "01" / "03")
    const has_discounts_bonus_or_gifts = discounts.some(
      (d) => d.discount_type === DISCOUNT_CODE.REGALIA ||
             d.discount_type === DISCOUNT_CODE.BONIFICACION
    );

    const is_purchase_or_export_bill =
      document_type === 'PURCHASE_INVOICE' || document_type === 'EXPORT_BILL';

    // Process special taxes first (ISC, IUC, ISEBA, ISEBEC, IPT, ISEC)
    const special_taxes = taxes.filter((tax) => {
      const tax_type = tax_types.find((tt) => tt.code === tax.code);
      const tax_config = getTaxConfig(tax_type?.code);
      return tax_type && !tax_config?.iva && tax_type.code !== '99';
    });

    special_taxes.forEach((tax) => {
      const tax_type = tax_types.find((tt) => tt.code === tax.code);
      if (!tax_type) return;

      const tax_amount_id = tax.special_fields?.tax_amount_id;
      const tax_amount = tax_amounts[tax.code ?? '']?.find(
        (ta) => ta.id === tax_amount_id
      );
      const tax_config = getTaxConfig(tax_type.code);

      const amount = this.calculateTaxAmount({
        tax,
        taxType: tax_type,
        taxAmount: tax_amount,
        detail_quantity,
        base_amount: tax_type.code === '99' ? base_amount : subtotal,
        subtotal,
        cabys,
      });

      net_tax += amount;
      total_amount_line += amount;

      // Add to base amount if tax type requires it
      if (tax_config?.forBaseAmount) {
        base_amount += amount;
      }

      // Factory tax logic — mirrors JCampos-Biller Java implementation exactly
      if (
        (tax_config?.forFactoryTax && !has_factory_tax) ||
        ((tax_type.code === '12' || tax_type.code === '03') && has_factory_tax)
      ) {
        factory_assumed_tax += amount;
        total_amount_line -= amount;
        net_tax -= amount;
      } else if (has_discounts_bonus_or_gifts && !is_purchase_or_export_bill) {
        factory_assumed_tax += amount;
        total_amount_line -= amount;
        net_tax -= amount;
      } else {
        other_tax_total += amount;
      }
    });

    // Process other taxes (OTHERS code 99)
    const other_taxes = taxes.filter((tax) => {
      const tax_type = tax_types.find((tt) => tt.code === tax.code);
      return tax_type && tax_type.code === '99';
    });

    other_taxes.forEach((tax) => {
      const tax_type = tax_types.find((tt) => tt.code === tax.code);
      if (!tax_type) return;

      const amount = this.calculateTaxAmount({
        tax,
        taxType: tax_type,
        taxAmount: undefined,
        detail_quantity,
        base_amount,
        subtotal,
        cabys,
      });

      net_tax += amount;
      total_amount_line += amount;

      const tax_config = getTaxConfig(tax_type.code);
      if (tax_config?.forBaseAmount) {
        base_amount += amount;
      }

      if (has_discounts_bonus_or_gifts && !is_purchase_or_export_bill) {
        factory_assumed_tax += amount;
        total_amount_line -= amount;
        net_tax -= amount;
      } else {
        other_tax_total += amount;
      }
    });

    // Process IVA taxes last (01=IVA, 07=IVACE, 08=IVARBU)
    const iva_taxes = taxes.filter((tax) => {
      const tax_type = tax_types.find((tt) => tt.code === tax.code);
      const tax_config = getTaxConfig(tax_type?.code);
      return tax_type && tax_config?.iva;
    });

    iva_taxes.forEach((tax) => {
      const tax_type = tax_types.find((tt) => tt.code === tax.code);
      if (!tax_type) return;

      const amount = this.calculateIvaTaxAmount({
        tax,
        taxType: tax_type,
        base_amount,
        subtotal,
        total_amount: total_amount_line,
        discounts,
        document_type,
      });

      // Factory assumed tax for IVA
      if (has_discounts_bonus_or_gifts && !is_purchase_or_export_bill) {
        factory_assumed_tax += amount;
      } else {
        net_tax += amount;
        total_amount_line += amount;
        iva_tax_total += amount;
      }
    });

    return {
      net_tax,
      total_amount_line,
      base_amount,
      factory_assumed_tax,
      iva_tax_total,
      other_tax_total,
    };
  }

  static calculateIvaTaxAmount(params: IvaTaxCalculationParams): number {
    const { tax, taxType, base_amount, subtotal, total_amount, discounts = [], document_type } =
      params;

    if (!taxType) return 0;

    let amount = 0;

    if (taxType.code === '07' || taxType.code === '01') {
      // IVACE / IVA — use total_amount when bonus/gift discounts present or export bill
      const use_total_amount =
        discounts.some(
          (d) =>
            d.discount_type === DISCOUNT_CODE.REGALIA ||
            d.discount_type === DISCOUNT_CODE.BONIFICACION
        ) ||
        document_type === 'EXPORT_BILL';

      amount = use_total_amount
        ? total_amount * (tax.rate || 0) / 100
        : base_amount * (tax.rate || 0) / 100;
    } else if (taxType.code === '08') {
      // IVARBU — factor × subtotal
      amount = (tax.factor || 0) * subtotal;
    }

    return amount;
  }

  static calculateTaxAmount(params: TaxCalculationParams): number {
    const { tax, taxType, taxAmount, detail_quantity, base_amount, subtotal, cabys } = params;

    if (!taxType) return 0;

    let amount = 0;
    
    // Tax amount per unit, sourced from the data-api tax-amounts catalog
    // (resolved by the caller via the tax-amount id stored in special_fields).
    const taxAmountValue = taxAmount?.amount || 0;

    if (taxType.code === TAX_CODE.IUC) {
      // IUC: quantity × tax per unit (quantity from special_fields)
      amount = (tax.special_fields?.quantity || 0) * taxAmountValue;
    } else if (taxType.code === TAX_CODE.ISEBA) {
      // Proportion: (quantity × percentage/100) × detail_quantity × tax per unit
      const proportion =
        (tax.special_fields?.quantity || 0) * (tax.special_fields?.percentage || 0) / 100;
      amount = detail_quantity * proportion * taxAmountValue;
    } else if (taxType.code === TAX_CODE.IPT) {
      // detail_quantity × quantity × tax per unit
      amount =
        detail_quantity * (tax.special_fields?.quantity || 0) * taxAmountValue;
    } else if (taxType.code === TAX_CODE.ISEBEC) {
      const is_non_alcoholic_beverage = cabys?.startsWith('2202');

      if (is_non_alcoholic_beverage) {
        // tax per unit / volume_consumption — then × detail_quantity × quantity
        const alt_amount =
          taxAmountValue / (tax.special_fields?.volume_consumption || 1);
        amount = detail_quantity * (tax.special_fields?.quantity || 0) * alt_amount;
      } else {
        // quantity × volume_consumption × tax per unit
        amount =
          (tax.special_fields?.quantity || 0) *
          (tax.special_fields?.volume_consumption || 0) *
          taxAmountValue;
      }
    } else if (taxType.code === TAX_CODE.OTHERS) {
      amount = base_amount * (tax.rate || 0) / 100;
    } else {
      // Default: ISC (02), ISEC (12)
      amount = subtotal * (tax.rate || 0) / 100;
    }

    return amount;
  }
}
