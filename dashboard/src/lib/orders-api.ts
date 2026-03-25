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

  async getHaciendaTaxpayer(isoCode: string, idNumber: string) {
    return this.makeRequest(`/api/countries/${isoCode}/hacienda-taxpayers/${idNumber}`);
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

  isConfigured() {
    return !!this.organizationId;
  }
}

export const ordersApi = new OrdersApi();
