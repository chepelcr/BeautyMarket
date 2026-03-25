export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export type ReportColorScheme = 'green' | 'orange' | 'blue' | 'green_alt';

export const REPORT_COLOR_OPTIONS: { value: ReportColorScheme; label: string; hex: string }[] = [
  { value: 'green',     label: 'Verde',       hex: '#0e5c23' },
  { value: 'orange',    label: 'Naranja',     hex: '#c65811' },
  { value: 'blue',      label: 'Azul',        hex: '#1e4e77' },
  { value: 'green_alt', label: 'Verde Claro', hex: '#375522' },
];

export interface OrderParty {
  name: string;
  gln: string;
  internal_code: string;
}

export interface DeliveryLocation {
  code: string;
  name: string;
  gln: string;
  latitude?: string;
  longitude?: string;
}

export interface OrderAttachments {
  pdf_url?: string;
  excel_url?: string;
  nuevo_reporte_url?: string;
}

export interface Order {
  order_id: number;
  company_id: string;
  document_number: string;
  document_type: string;
  bgm011: string | null;
  order_type: string;
  creation_date: string;
  delivery_date: string;
  order_status: OrderStatus;
  client: OrderParty;
  supplier: OrderParty;
  delivery_location: DeliveryLocation;
  event: string;
  department: string;
  report_color?: ReportColorScheme;
  comment: string;
  line_count: number;
  total_quantities: number;
  subtotal: number;
  discounts: number;
  net_total: number;
  taxes: number;
  grand_total: number;
  attachments: OrderAttachments;
  lines: OrderLine[];
  order_totals: OrderTotals;
  crossdocking?: Crossdocking | null;
}

export interface OrderLine {
  line_number: number;
  internal_code: string;
  code: string;
  client_article_code: string;
  description: string;
  units_per_box: number;
  quantity_ordered: number;
  units_ordered: number;
  unit_price: number;
  discount: number;
  line_total: number;
  tax: number;
  quantity_dispatched: number;
  dispatch_rejection_reason: string | null;
  quantity_received: number;
  article_code: string;
}

export interface CrossdockingSalePointItem {
  internal_code: string;
  original_code: string;
  description: string;
  quantity: number;
  units_per_box: number;
  total_units: number;
  sent: number;
  missing: number;
}

export interface CrossdockingSalePoint {
  store_number: string;
  store_name: string;
  full_name: string;
  slot_id: string;
  items: CrossdockingSalePointItem[];
  total_boxes: number;
  total_units: number;
}

export interface CrossdockingItemSummary {
  internal_code: string;
  original_code: string;
  description: string;
  units_per_box: number;
  total_boxes: number;
  total_units: number;
}

export interface CrossdockingBoxSummary {
  items_per_box: number;
  box_count: number;
  total_boxes: number;
  total_units: number;
}

export interface CrossdockingTotals {
  total_sale_points: number;
  total_line_items: number;
  total_boxes: number;
  total_units: number;
}

export interface Crossdocking {
  attachments: OrderAttachments;
  sale_points: CrossdockingSalePoint[];
  item_summary: CrossdockingItemSummary[];
  box_summary: CrossdockingBoxSummary[];
  totals: CrossdockingTotals;
}

export interface OrderTotals {
  total_lines: number;
  total_quantity_ordered: number;
  total_units_ordered: number;
  total_quantity_dispatched: number;
  total_quantity_received: number;
  subtotal: number;
  net_total: number;
  grand_total: number;
}

export type InsertOrder = Omit<Order, 'order_id' | 'order_totals'>;

export const deliveryMethods = ['standard', 'express', 'pickup'] as const;
export type DeliveryMethod = typeof deliveryMethods[number];

export const insertOrderSchema = {} as any; // Placeholder for validation schema
