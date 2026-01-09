export interface Customer {
  id: string;
  organizationId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  totalOrders: number;
  totalSpent: string;
  lastOrderDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CustomerFilters {
  search?: string;
  minSpent?: number;
  maxSpent?: number;
  minOrders?: number;
  maxOrders?: number;
  limit?: number;
  offset?: number;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
}
