import { apiRequest } from '@/lib/queryClient';

const ORDERS_API_URL = import.meta.env.VITE_ORDERS_API_URL;

export class OrdersApi {
  private organizationId: string = '';

  setOrganization(orgId: string) {
    this.organizationId = orgId;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${ORDERS_API_URL}${endpoint}`;
    const method = ((options.method as string) || 'GET').toUpperCase();
    const data = options.body ? JSON.parse(options.body as string) : undefined;
    const response = await apiRequest(method, url, data);
    return response.json();
  }

  async getCountries() {
    return this.makeRequest('/api/countries/all');
  }

  async getStates(isoCode: string) {
    return this.makeRequest(`/api/countries/${isoCode}/states`);
  }

  async getCounties(isoCode: string, stateId: number) {
    return this.makeRequest(`/api/countries/${isoCode}/states/${stateId}/counties`);
  }

  async getDistricts(isoCode: string, stateId: number, countyId: number) {
    return this.makeRequest(`/api/countries/${isoCode}/states/${stateId}/counties/${countyId}/districts`);
  }

  async getIdentificationTypes() {
    return this.makeRequest('/api/identification-types');
  }

  async getCustomerTypes() {
    return [
      { id: 1, description: 'Física' },
      { id: 2, description: 'Jurídica' }
    ];
  }

  async getClient(clientId: string) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}`);
  }

  async createClient(data: any) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(clientId: string, data: any) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateClientStatus(clientId: string, status: number) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Stores
  async listStores(clientId: string, params: { search?: string; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', String(params.page));
    if (params.pageSize) q.append('page_size', String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/stores${qs}`);
  }

  async getStore(clientId: string, storeId: string) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/stores/${storeId}`);
  }

  async createStore(clientId: string, data: any) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/stores`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStore(clientId: string, storeId: string, data: any) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateStoreStatus(clientId: string, storeId: string, status: number) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/stores/${storeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async uploadStores(clientId: string, file: string, filename: string) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/stores/upload`, {
      method: 'POST',
      body: JSON.stringify({ file, filename }),
    });
  }

  // Departments
  async listDepartments(clientId: string, params: { search?: string; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', String(params.page));
    if (params.pageSize) q.append('page_size', String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/departments${qs}`);
  }

  async getDepartment(clientId: string, departmentId: string) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/departments/${departmentId}`);
  }

  async createDepartment(clientId: string, data: any) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/departments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(clientId: string, departmentId: string, data: any) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateDepartmentStatus(clientId: string, departmentId: string, status: number) {
    return this.makeRequest(`/api/organizations/${this.organizationId}/clients/${clientId}/departments/${departmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteDepartment(clientId: string, departmentId: string) {
    const url = `${ORDERS_API_URL}/api/organizations/${this.organizationId}/clients/${clientId}/departments/${departmentId}`;
    const response = await apiRequest('DELETE', url);
    // 204 No Content — no body to parse
    if (response.status === 204) return;
    return response.json();
  }

  isConfigured() {
    return !!this.organizationId;
  }
}

export const ordersApi = new OrdersApi();
