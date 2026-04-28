/**
 * Dashboard DTOs for Pollos Sales
 */

export interface StandData {
  id: string;
  name: string;
  cashier: string;
  revenue: number;
  transactions: number;
  last_sale: number; // seconds ago
  status: "active" | "idle" | "closed";
  session_id: string;
  assignment_id: string;
}

export interface DashboardData {
  stands: StandData[];
  total_revenue: number;
  total_transactions: number;
  active_stands: number;
}

export interface DashboardKPIs {
  total_sales?: number;
  total_transactions?: number;
  average_ticket?: number;
  active_cashiers?: number;
}
