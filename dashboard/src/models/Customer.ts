import type { PaginationResponse } from "./Pagination";

export interface Client {
  client_id: string;
  company_id: string;
  client_name?: string;
  client_gln?: string;
  identification?: {
    type: number;
    code: string;
    number: string;
  };
  business_name?: string;
  nationality?: string;
  email?: string;
  phone?: {
    country_code: string;
    area_code: string;
    number: string;
    description: string;
  };
  residence?: {
    state_id: number;
    county_id: number;
    district_id: number;
    neighborhood_id?: number | null;
    address: string;
  };
  status?: number;
}

export interface CreateClientData {
  client_name?: string;
  client_gln?: string;
  identification?: {
    type: number;
    code: string;
    number: string;
  };
  business_name?: string;
  nationality?: string;
  email?: string;
  phone?: {
    country_code: string;
    area_code: string;
    number: string;
    description: string;
  };
  residence?: {
    state_id: number;
    county_id: number;
    district_id: number;
    neighborhood_id?: number | null;
    address: string;
  };
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export interface CreateCustomerData {
  clientName?: string;
  clientGln?: string;
  identification?: {
    type: number;
    code: string;
    number: string;
  };
  businessName?: string;
  nationality?: string;
  email?: string;
  phone?: {
    countryCode: string;
    areaCode?: string;
    number: string;
    description?: string;
  };
  residence?: {
    stateId: number;
    countyId: number;
    districtId: number;
    address: string;
  };
  customerType?: number;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CustomerFormData {
  client_name?: string;
  client_gln?: string;
  identification: {
    type: number;
    code: string;
    number: string;
  };
  business_name?: string;
  nationality?: string;
  email?: string;
  phone?: {
    country_code: string;
    area_code?: string;
    number: string;
    description?: string;
  };
  residence?: {
    state_id: number;
    county_id: number;
    district_id: number;
    neighborhood_id?: number | null;
    address: string;
  };
  customer_type?: number;
}

export interface StoreResponse {
  store_id: string;
  company_id: string;
  client_id: string;
  store_code: string;
  store_name?: string;
  slot_id?: string;
  chain?: string;
  gln?: string;
  status?: number;
}

export interface StoreRequestDTO {
  store_code: string;
  store_name?: string;
  slot_id?: string;
  chain?: string;
}

export interface DepartmentResponse {
  department_id: string;
  company_id: string;
  client_id: string;
  department_code: string;
  name?: string;
  supplier_code?: string;
}

export interface CreateDepartmentDTO {
  department_code: string;
  name?: string;
  supplier_code?: string;
}

export interface UpdateDepartmentDTO {
  department_code?: string;
  name?: string;
  supplier_code?: string;
}

export interface ClientsResponse {
  data: Client[];
  pagination: PaginationResponse;
}

// Legacy Customer interface for backward compatibility
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
  clientGln?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
}
