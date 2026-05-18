/**
 * Document list + validation types (canonical Hacienda shape).
 *
 * AtvValidation / ReceiverValidation / DocumentSummary are re-exported from
 * `invoice.ts` to avoid two parallel definitions of the same canonical types.
 * This file owns the list-view-specific projections (DocumentListItem,
 * ComplexSearchFilters, etc.) used by the documents page.
 */

import type { PaginationResponse } from './pagination';
import type {
  AtvValidation,
  DocTypeCode,
  DocumentSummary,
  ReceiverValidation,
} from './invoice';

export type { AtvValidation, DocumentSummary, ReceiverValidation };

export interface InvoiceValidation {
  atv_validation?: AtvValidation;
  receiver_validation?: ReceiverValidation;
}

/**
 * Compact projection for list views (DocumentsListView, DocumentCard, ...).
 * Subset of SaleDocument with only the fields the list UI needs.
 */
export interface DocumentListItem {
  sale_id: string;
  organization_id: string;
  /** Hacienda document type code as string (was numeric). */
  document_type: DocTypeCode;
  sale_date: string;
  consecutive_number?: string;
  document_key?: string;
  is_received: boolean;
  summary?: DocumentSummary;
  atv_validation?: AtvValidation;
  receiver_validation?: ReceiverValidation;
  pdf_url?: string;
  xml_url?: string;
  json_url?: string;
  created_on?: string;
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
