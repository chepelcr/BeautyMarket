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
    description: 'IVA',
    iva: true,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: false
  },
  '02': {
    code: '02',
    description: 'Impuesto Selectivo de Consumo',
    iva: false,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: true,
    forFactoryTax: false
  },
  '07': {
    code: '07',
    description: 'IVA (Cálculo Especial)',
    iva: true,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: false
  },
  '99': {
    code: '99',
    description: 'Otros',
    iva: false,
    requiresSpecialFields: false,
    requireRate: true,
    rate: null,
    forBaseAmount: false,
    forFactoryTax: false
  }
};

export function getTaxConfig(code: string | undefined): TaxTypeConfig | undefined {
  if (!code) return undefined;
  return TAX_TYPE_CONFIGS[code];
}
