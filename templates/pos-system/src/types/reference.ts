export interface SaleReference {
  reference_type_id: number;
  other_type?: string;
  document_number: string;
  reference_date: string;
  reference_code: number;
  other_code?: string;
  reason?: string;
}
