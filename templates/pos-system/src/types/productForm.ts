export interface TaxFormEntry {
  taxTypeId: number;
  taxCode: string;
  taxDescription: string;
  rate: number;
  taxRateId?: number;
  taxFactorId?: number;
  specialFields?: {
    quantity?: number;
    percentage?: number;
    taxAmountId?: number;
    volumeConsumption?: number;
  };
}

export interface DiscountFormEntry {
  id: string; // unique key (uuid-lite, e.g. Date.now+random)
  discountTypeId: number;
  discountCode: string;
  description: string;
  rate?: number;
  reason?: string; // required when discountCode === "99" (Otros)
}

export interface CodeFormEntry {
  codeTypeId: number;
  codeTypeCode: string;
  codeTypeDescription: string;
  value: string;
  reason?: string; // required when codeTypeCode === "99" (Otros)
}

export interface ProductFormState {
  // General Info
  name: string;
  description: string;
  category_id: string;
  track_inventory: boolean;
  has_fiscal_info: boolean;

  // Packaging
  has_package_info: boolean;

  // Inventory
  low_stock_threshold: string;

  // Fiscal
  cabys: string;
  cabysDescription: string;
  productTypeId?: number;

  // Factory tax charge (affects tax calculation)
  factoryTaxChargeId?: number;
  hasFactoryTax: boolean;

  // Product codes (barcode, manufacturer, etc.)
  codes: CodeFormEntry[];

  // Pricing
  price: string;

  // Taxes & Discounts
  taxes: TaxFormEntry[];
  discounts: DiscountFormEntry[];

  // Image (handled externally via File, stored here as URL for edit mode)
  image_url?: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  category_id: "",
  track_inventory: false,
  has_fiscal_info: false,
  has_package_info: false,
  low_stock_threshold: "",
  cabys: "",
  cabysDescription: "",
  productTypeId: undefined,
  factoryTaxChargeId: undefined,
  hasFactoryTax: false,
  codes: [],
  price: "",
  taxes: [],
  discounts: [],
};
