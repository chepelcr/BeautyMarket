import type { PaginationResponse } from './pagination';

export interface AtvValidation {
  validation_status: number; // 1=Validated 2=Pending 3=Rejected
  validation_message?: string;
  validation_date?: string;
}

export interface ReceiverValidation {
  status: number; // 1=Accepted 2=PartialAccept 3=Rejected
  message?: string;
  validation_date?: string;
}

export interface InvoiceValidation {
  atv_validation?: AtvValidation;
  receiver_validation?: ReceiverValidation;
}

export interface DocumentSummary {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  voucher_total: number;
}

export interface DocumentListItem {
  sale_id: string;
  organization_id: string;
  document_type: number;
  sale_date: string;
  consecutive_number?: string;
  document_key?: string;
  is_received: boolean;
  summary: DocumentSummary;
  atv_validation?: AtvValidation;
  receiver_validation?: ReceiverValidation;
  pdf_url?: string;
  xml_url?: string;
  json_url?: string;
  created_at?: string;
}

export interface DocumentListResponse {
  data: DocumentListItem[];
  pagination: PaginationResponse;
}

export interface ComplexSearchFilters {
  searchTerm?: string;
  status?: 'validated' | 'pending' | 'rejected';
  start_date?: string;
  end_date?: string;
  sort?: string;
}

export interface XmlFilesDto {
  pdf_url?: string;
  xml_url?: string;
  json_url?: string;
}
