import { CatalogBase } from './base';

export interface GetTaxAmountParams {
  iso_code: string;
  tax_id: number;
  id?: string;
}

export interface GetAllTaxAmountsParams {
  iso_code: string;
  tax_id: number;
  status?: string;
}

/**
 * Tax amount response from the tax-amounts service.
 * Extends CatalogBase which includes: id, description, country_code, 
 * status, created_on, updated_on, deleted_on
 */
export interface TaxAmountResponse extends CatalogBase {
  // All fields inherited from CatalogBase
}

export type TaxAmountListResponse = TaxAmountResponse[];
