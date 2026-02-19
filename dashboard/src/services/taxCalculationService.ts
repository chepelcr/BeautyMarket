import { getTaxConfig } from "@/types/taxTypeConfig";

interface TaxCalculationParams {
  tax: any;
  taxType: any;
  taxAmount?: any;
  detailQuantity: number;
  baseAmount: number;
  subtotal: number;
  cabys?: string;
}

interface LineAmountsParams {
  subtotal: number;
  baseAmount?: number;
  taxes: any[];
  taxTypes: any[];
  discounts?: any[];
  detailQuantity: number;
  cabys?: string;
  taxAmounts?: {[taxTypeId: number]: any[]};
}

interface LineAmountsResult {
  netTax: number;
  totalAmountLine: number;
  baseAmount: number;
  ivaTaxTotal: number;
  otherTaxTotal: number;
}

export class TaxCalculationService {
  static getLineAmounts(params: LineAmountsParams): LineAmountsResult {
    const { subtotal, baseAmount: initialBaseAmount, taxes, taxTypes, discounts = [], detailQuantity, cabys, taxAmounts = {} } = params;
    
    let totalAmountLine = subtotal;
    let netTax = 0;
    let baseAmount = initialBaseAmount || subtotal;
    let ivaTaxTotal = 0;
    let otherTaxTotal = 0;
    
    const hasIvaCE = taxes.some(tax => {
      const taxType = taxTypes.find(tt => tt.taxId === tax.taxTypeId);
      return taxType?.code === '07';
    });
    
    // Process special taxes first (ISC, IUC, ISEBA, ISEBEC, IPT, ISEC)
    const specialTaxes = taxes.filter(tax => {
      const taxType = taxTypes.find(tt => tt.taxId === tax.taxTypeId);
      return taxType && !['01', '07', '08', '99'].includes(taxType.code);
    });
    
    specialTaxes.forEach(tax => {
      const taxType = taxTypes.find(tt => tt.taxId === tax.taxTypeId);
      if (!taxType) return;
      
      const taxAmountId = tax.specialFields?.taxAmountId || tax.specialFields?.taxAmount?.id;
      const taxAmount = taxAmounts[tax.taxTypeId]?.find(ta => ta.id === taxAmountId);
      
      const amount = this.calculateTaxAmount({
        tax,
        taxType,
        taxAmount,
        detailQuantity,
        baseAmount: taxType.code === '99' ? baseAmount : subtotal,
        subtotal,
        cabys
      });
      
      netTax += amount;
      totalAmountLine += amount;
      
      // Add to base amount if tax type requires it (ISC, ISEBA, ISEBEC, ISEC)
      if (['02', '04', '05', '12'].includes(taxType.code)) {
        baseAmount += amount;
      }
      
      otherTaxTotal += amount;
    });

    // Process other taxes (OTHERS - code 99)
    const otherTaxes = taxes.filter(tax => {
      const taxType = taxTypes.find(tt => tt.taxId === tax.taxTypeId);
      return taxType && taxType.code === '99';
    });
    
    otherTaxes.forEach(tax => {
      const taxType = taxTypes.find(tt => tt.taxId === tax.taxTypeId);
      if (!taxType) return;
      
      const amount = this.calculateTaxAmount({
        tax,
        taxType,
        taxAmount: undefined,
        detailQuantity,
        baseAmount,
        subtotal,
        cabys
      });
      
      netTax += amount;
      totalAmountLine += amount;
      otherTaxTotal += amount;
    });
    
    // Process IVA taxes last (IVA, IVACE, IVARBU)
    const ivaTaxes = taxes.filter(tax => {
      const taxType = taxTypes.find(tt => tt.taxId === tax.taxTypeId);
      return taxType && ['01', '07', '08'].includes(taxType.code);
    });
    
    ivaTaxes.forEach(tax => {
      const taxType = taxTypes.find(tt => tt.taxId === tax.taxTypeId);
      if (!taxType) return;
      
      let amount = 0;
      
      if (taxType.code === '07' || taxType.code === '01') {
        // IVA and IVACE: baseAmount * rate / 100
        amount = baseAmount * (tax.rate || 0) / 100;
      } else if (taxType.code === '08') {
        // IVARBU: factor * subtotal
        amount = (tax.factor || 0) * subtotal;
      }
      
      netTax += amount;
      totalAmountLine += amount;
      ivaTaxTotal += amount;
    });
    
    return {
      netTax,
      totalAmountLine,
      baseAmount,
      ivaTaxTotal,
      otherTaxTotal
    };
  }

  static calculateTaxAmount(params: TaxCalculationParams): number {
    const { tax, taxType, taxAmount, detailQuantity, baseAmount, subtotal, cabys } = params;
    
    if (!taxType) return 0;
    
    let amount = 0;
    
    if (taxType.code === '02') { // IUC
      amount = (taxAmount?.amount || 0) * (tax.specialFields?.quantity || 0);
      
    } else if (taxType.code === '03') { // ISEBA
      const proportion = (tax.specialFields?.quantity || 0) * (tax.specialFields?.percentage || 0) / 100;
      amount = detailQuantity * proportion * (taxAmount?.amount || 0);
      
    } else if (taxType.code === '04') { // IPT
      amount = detailQuantity * (tax.specialFields?.quantity || 0) * (taxAmount?.amount || 0);
      
    } else if (taxType.code === '05') { // ISEBEC
      const isNonAlcoholicBeverage = cabys?.startsWith('2202');
      
      if (isNonAlcoholicBeverage) {
        const altAmount = (taxAmount?.amount || 0) / (tax.specialFields?.volumeConsumption || 1);
        amount = detailQuantity * (tax.specialFields?.quantity || 0) * altAmount;
      } else {
        amount = (tax.specialFields?.quantity || 0) * (tax.specialFields?.volumeConsumption || 0) * (taxAmount?.amount || 0);
      }
      
    } else if (taxType.code === '99') { // OTHERS
      amount = baseAmount * (tax.rate || 0) / 100;
      
    } else {
      amount = subtotal * (tax.rate || 0) / 100;
    }
    
    return amount;
  }
}
