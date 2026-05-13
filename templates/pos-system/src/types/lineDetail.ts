export interface TaxSpecialFields {
  quantity?: number;
  percentage?: number;
  volume_consumption?: number;
  tax_amount_id?: number;
  tax_amount?: { id: number };
  amount?: number; // Store the tax amount value for calculation
}

export interface LineTax {
  tax_type_id: number;
  other_tax_type?: string;
  tax_rate_id?: number;
  tax_factor_id?: number;
  rate?: number;
  factor?: number;
  special_fields?: TaxSpecialFields;
  exemption?: any;
}

export interface LineDiscount {
  discount_type_id: number;
  discount_code?: string; // Add code for proper type matching
  percentage: number;
  amount?: number;
  reason?: string;
}

export interface LineDetail {
  product_id?: string;
  description: string;
  quantity: number;
  net_price: number;
  base_amount?: number;
  unit_id?: number;
  commercial_unit_measure?: string;
  customs_part?: string;
  factory_tax_charge_id?: number;
  cabys?: string;
  taxes: LineTax[];
  discounts: LineDiscount[];
  // Computed — filled by taxCalculationService before submission
  discount_amount?: number;
  tax_amount?: number;
  factory_assumed_tax?: number;
  line_total?: number;
}
