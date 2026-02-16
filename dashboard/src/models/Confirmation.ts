export interface ConfirmationOrder {
  order_id: number;
  document_number: string;
  delivery_date: string;
  deliver_to_code: string;
  deliver_to_name: string;
  order_status: string;
}

export interface Confirmation {
  confirmation_id: number;
  company_id: string;
  confirmation_number: string;
  delivery_date: string;
  deliver_to_code: string;
  deliver_to_name: string;
  confirmation_status: string;
  orders: ConfirmationOrder[];
}
