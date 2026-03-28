export interface Client {
  clientId: string;
  companyId: string;
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
    areaCode: string;
    number: string;
    description: string;
  };
  residence?: {
    stateId: number;
    countyId: number;
    districtId: number;
    address: string;
  };
  status?: number;
}

export interface CreateClientData {
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
    areaCode: string;
    number: string;
    description: string;
  };
  residence?: {
    stateId: number;
    countyId: number;
    districtId: number;
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
  clientName?: string;
  clientGln?: string;
  identification: {
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

export interface StoreResponse {
  storeId: string;
  companyId: string;
  clientId: string;
  storeCode: string;
  storeName?: string;
  slotId?: string;
  chain?: string;
  gln?: string;
  status?: number;
}

export interface StoreRequestDTO {
  storeCode: string;
  storeName?: string;
  slotId?: string;
  chain?: string;
}

export interface DepartmentResponse {
  departmentId: string;
  companyId: string;
  clientId: string;
  departmentCode: string;
  name?: string;
  supplierCode?: string;
}

export interface CreateDepartmentDTO {
  departmentCode: string;
  name?: string;
  supplierCode?: string;
}

export interface UpdateDepartmentDTO {
  departmentCode?: string;
  name?: string;
  supplierCode?: string;
}

export interface ClientsResponse {
  data: Client[];
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
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
