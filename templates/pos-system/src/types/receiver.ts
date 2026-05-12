export interface Phone {
  country_code: string;
  number: string;
}

export interface SaleReceiver {
  id_number?: string;
  id_type?: number;
  id_code?: string;
  nationality?: string;
  business_name?: string;
  trade_name?: string;
  email?: string;
  state_id?: number;
  county_id?: number;
  district_id?: number;
  address?: string;
  personal_phone?: Phone;
  business_phone?: Phone;
  fax?: Phone;
  fiscal_record_8707?: string;
  taxpayer_id?: string;
  customer_type?: number;
  economic_activity?: string;
}
