export interface TaxTypeConfig {
  code: string;
  iva: boolean;
  requiresSpecialFields: boolean;
  requireRate: boolean;
  rate: number | null;
  forBaseAmount: boolean;
  forFactoryTax: boolean;
}

export const TAX_TYPE_CONFIGS: Record<string, TaxTypeConfig> = {
  '01': { code: '01', iva: true,  requiresSpecialFields: false, requireRate: true,  rate: null, forBaseAmount: false, forFactoryTax: false },
  '02': { code: '02', iva: false, requiresSpecialFields: false, requireRate: true,  rate: null, forBaseAmount: true,  forFactoryTax: false },
  '03': { code: '03', iva: false, requiresSpecialFields: true,  requireRate: false, rate: null, forBaseAmount: false, forFactoryTax: true  },
  '04': { code: '04', iva: false, requiresSpecialFields: true,  requireRate: false, rate: null, forBaseAmount: true,  forFactoryTax: true  },
  '05': { code: '05', iva: false, requiresSpecialFields: true,  requireRate: false, rate: null, forBaseAmount: true,  forFactoryTax: true  },
  '06': { code: '06', iva: false, requiresSpecialFields: true,  requireRate: false, rate: null, forBaseAmount: false, forFactoryTax: true  },
  '07': { code: '07', iva: true,  requiresSpecialFields: false, requireRate: true,  rate: null, forBaseAmount: false, forFactoryTax: false },
  '08': { code: '08', iva: true,  requiresSpecialFields: false, requireRate: true,  rate: null, forBaseAmount: false, forFactoryTax: false },
  '12': { code: '12', iva: false, requiresSpecialFields: false, requireRate: true,  rate: 5.0, forBaseAmount: true,  forFactoryTax: true  },
  '99': { code: '99', iva: false, requiresSpecialFields: false, requireRate: true,  rate: null, forBaseAmount: false, forFactoryTax: false },
};

export function getTaxConfig(code?: string): TaxTypeConfig | undefined {
  if (!code) return undefined;
  return TAX_TYPE_CONFIGS[code];
}
