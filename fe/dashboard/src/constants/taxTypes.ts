export const TAX_TYPES = {
  IVA: '01',
  ISC: '02',
  IUC: '03',
  ISEBA: '04',
  ISEBEC: '05',
  IPT: '06',
  IVACE: '07',
  IVARBU: '08',
  ISEC: '12',
  OTHERS: '99'
} as const;

export type TaxTypeCode = typeof TAX_TYPES[keyof typeof TAX_TYPES];

export interface TaxTypeConfig {
  code: string;
  description: string;
  iva: boolean;
  requiresSpecialFields: boolean;
  requireRate: boolean;
  rate: number | null;
  forBaseAmount: boolean;
  forFactoryTax: boolean;
}

export const TAX_TYPE_CONFIGS: Record<string, TaxTypeConfig> = {
  '01': {
    code: '01',
    description: 'taxes.valueAddedTax',
    iva: true,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: false
  },
  '02': {
    code: '02',
    description: 'taxes.selectiveConsumptionTax',
    iva: false,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: true,
    forFactoryTax: false
  },
  '03': {
    code: '03',
    description: 'taxes.uniqueFuelTax',
    iva: false,
    requiresSpecialFields: true,
    requireRate: false,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: true
  },
  '04': {
    code: '04',
    description: 'taxes.specificAlcoholicBeveragesTax',
    iva: false,
    requiresSpecialFields: true,
    requireRate: false,
    rate: null,
    forBaseAmount: true,
    forFactoryTax: true
  },
  '05': {
    code: '05',
    description: 'taxes.specificPackagedBeveragesTax',
    iva: false,
    requiresSpecialFields: true,
    requireRate: false,
    rate: null,
    forBaseAmount: true,
    forFactoryTax: true
  },
  '06': {
    code: '06',
    description: 'taxes.tobaccoProductsTax',
    iva: false,
    requiresSpecialFields: true,
    requireRate: false,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: true
  },
  '07': {
    code: '07',
    description: 'taxes.ivaSpecialCalculation',
    iva: true,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: false
  },
  '08': {
    code: '08',
    description: 'taxes.ivaUsedGoodsRegime',
    iva: true,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: false
  },
  '12': {
    code: '12',
    description: 'taxes.specificCementTax',
    iva: false,
    requiresSpecialFields: false,
    requireRate: true,
    rate: 5.0,
    forBaseAmount: true,
    forFactoryTax: true
  },
  '99': {
    code: '99',
    description: 'taxes.others',
    iva: false,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: false
  }
};

export function getTaxConfig(code: string): TaxTypeConfig | undefined {
  return TAX_TYPE_CONFIGS[code];
}

export function isIvaTax(code: string): boolean {
  const config = getTaxConfig(code);
  return config?.iva || false;
}

export function requiresSpecialFields(code: string): boolean {
  const config = getTaxConfig(code);
  return config?.requiresSpecialFields || false;
}

export function getRequiredSpecialFields(taxTypeCode: string, cabys?: string) {
  switch (taxTypeCode) {
    case TAX_TYPES.IUC: // 03
      return { 
        quantity: true, 
        percentage: false, 
        volumeConsumption: false, 
        taxAmountId: true 
      };
    case TAX_TYPES.ISEBA: // 04
      return { 
        quantity: true, 
        percentage: true, 
        volumeConsumption: false, 
        taxAmountId: true 
      };
    case TAX_TYPES.ISEBEC: // 05
      const isValidProduct = cabys?.startsWith('2202') || cabys?.startsWith('3401');
      if (isValidProduct) {
        return { 
          quantity: true, 
          percentage: false, 
          volumeConsumption: true, 
          taxAmountId: true 
        };
      }
      return { 
        quantity: false, 
        percentage: false, 
        volumeConsumption: false, 
        taxAmountId: false 
      };
    case TAX_TYPES.IPT: // 06
      return { 
        quantity: true, 
        percentage: false, 
        volumeConsumption: false, 
        taxAmountId: true 
      };
    case TAX_TYPES.ISEC: // 12
      return { 
        quantity: false, 
        percentage: false, 
        volumeConsumption: false, 
        taxAmountId: false 
      };
    default:
      return { 
        quantity: false, 
        percentage: false, 
        volumeConsumption: false, 
        taxAmountId: false 
      };
  }
}
