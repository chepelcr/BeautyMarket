import type { SaleReceiver } from './receiver';
import type { SaleReference } from './reference';
import type { LineDetail } from './lineDetail';
import type { AtvValidation, ReceiverValidation, DocumentSummary } from './document';
import type { PaginationResponse } from './pagination';

export interface CurrencyCode {
  iso_code: string;
  exchange_rate: number;
}

export interface SalePayment {
  payment_type_id: number;
  amount: number;
}

// Document types per Hacienda codes
export const DOCUMENT_TYPES = [
  { code: 1,  label: 'Factura Electrónica',  short: 'FE',  color: 'text-green-600' },
  { code: 4,  label: 'Tiquete Electrónico',   short: 'TE',  color: 'text-blue-600'  },
  { code: 3,  label: 'Nota de Crédito',       short: 'NC',  color: 'text-red-600'   },
  { code: 2,  label: 'Nota de Débito',        short: 'ND',  color: 'text-yellow-600'},
  { code: 8,  label: 'Factura de Compra',     short: 'FC',  color: 'text-purple-600'},
  { code: 9,  label: 'Factura Exportación',   short: 'FExp',color: 'text-indigo-600'},
] as const;

export type DocTypeCode = 1 | 2 | 3 | 4 | 8 | 9;

/** Request DTO sent to POST /sales */
export interface InvoiceRequest {
  assignment_id?: string;
  branch_code: number;
  terminal_code: number;
  client_id?: string | null;
  document_type: DocTypeCode;
  version_id: number;
  activity_code: string;
  sale_condition_id: number;
  credit_term: string;
  notes?: string;
  copy_emails?: string[];
  currency_code: CurrencyCode;
  receiver?: SaleReceiver | null;
  details: (LineDetail & {
    line_number: number;
    discount_amount: number;
    tax_amount: number;
    factory_assumed_tax: number;
    line_total: number;
  })[];
  payments: SalePayment[];
  references?: SaleReference[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
}

/** Detail line in response */
export interface SaleLineResponse {
  line_id: number;
  line_number: number;
  product_id?: string;
  description: string;
  quantity: number;
  net_price: number;
  base_amount?: number;
  unit_id?: number;
  discount_amount: number;
  tax_amount: number;
  factory_assumed_tax: number;
  line_total: number;
  taxes: any[];
  discounts: any[];
}

/** Full sale response from GET /sales/:id */
export interface SaleResponse {
  sale_id: string;
  organization_id: string;
  assignment_id?: string;
  branch_code: number;
  terminal_code: number;
  client_id?: string;
  document_type: DocTypeCode;
  version_id: number;
  activity_code: string;
  sale_condition_id: number;
  credit_term: string;
  notes?: string;
  copy_emails?: string[];
  currency_code: CurrencyCode;
  is_received: boolean;
  sale_date: string;
  consecutive_number?: string;
  document_key?: string;
  document_route?: string;
  document_name?: string;
  pdf_url?: string;
  xml_url?: string;
  json_url?: string;
  summary: DocumentSummary;
  atv_validation?: AtvValidation;
  receiver_validation?: ReceiverValidation;
  receiver?: SaleReceiver;
  details: SaleLineResponse[];
  payments: SalePayment[];
  references?: SaleReference[];
  created_at?: string;
  created_by?: string;
}

export interface SaleListResponse {
  data: SaleResponse[];
  pagination: PaginationResponse;
}

/** Form state for creating/editing an invoice in DocumentsPage tabs */
export interface InvoiceFormData {
  document_type: DocTypeCode;
  version_id: number;
  activity_code: string;
  sale_condition_id: number;
  credit_term: string;
  notes?: string;
  copy_emails: string[];
  currency_code: CurrencyCode;
  receiver?: SaleReceiver;
  details: LineDetail[];
  payments: SalePayment[];
  references: SaleReference[];
}
