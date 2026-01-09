import { CustomerRepository, type CustomerFilters } from '../repositories';
import type { Customer, InsertCustomer } from '../entities';

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async getCustomers(
    organizationId: string,
    filters?: {
      search?: string;
      minSpent?: number;
      maxSpent?: number;
      minOrders?: number;
      maxOrders?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ customers: Customer[]; total: number }> {
    const customerFilters: CustomerFilters = {
      organizationId,
      ...filters,
    };
    return await this.customerRepository.getCustomers(customerFilters);
  }

  async getCustomerById(id: string, organizationId: string): Promise<Customer> {
    const customer = await this.customerRepository.getCustomerById(id, organizationId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    // Check if email already exists in this organization
    const existingCustomer = await this.customerRepository.getCustomerByEmail(
      customerData.email,
      customerData.organizationId
    );

    if (existingCustomer) {
      throw new Error('A customer with this email already exists');
    }

    return await this.customerRepository.createCustomer(customerData);
  }

  async updateCustomer(
    id: string,
    organizationId: string,
    updates: Partial<InsertCustomer>
  ): Promise<Customer> {
    // If updating email, check it doesn't conflict with another customer
    if (updates.email) {
      const existingCustomer = await this.customerRepository.getCustomerByEmail(
        updates.email,
        organizationId
      );

      if (existingCustomer && existingCustomer.id !== id) {
        throw new Error('A customer with this email already exists');
      }
    }

    const updated = await this.customerRepository.updateCustomer(id, organizationId, updates);
    if (!updated) {
      throw new Error('Customer not found');
    }

    return updated;
  }

  async deleteCustomer(id: string, organizationId: string): Promise<boolean> {
    const deleted = await this.customerRepository.deleteCustomer(id, organizationId);
    if (!deleted) {
      throw new Error('Customer not found');
    }
    return deleted;
  }

  async updateCustomerStats(
    id: string,
    organizationId: string,
    stats: {
      totalOrders?: number;
      totalSpent?: number;
      lastOrderDate?: Date;
    }
  ): Promise<Customer> {
    const updated = await this.customerRepository.updateCustomerStats(id, organizationId, stats);
    if (!updated) {
      throw new Error('Customer not found');
    }
    return updated;
  }

  async getCustomerCount(organizationId: string): Promise<number> {
    return await this.customerRepository.getCustomerCount(organizationId);
  }

  async exportCustomersCSV(organizationId: string): Promise<string> {
    const { customers } = await this.customerRepository.getCustomers({
      organizationId,
      limit: 10000, // Large limit for export
    });

    // CSV header
    const headers = [
      'ID',
      'Email',
      'First Name',
      'Last Name',
      'Phone',
      'Total Orders',
      'Total Spent',
      'Last Order Date',
      'Created At',
    ];

    // CSV rows
    const rows = customers.map(customer => [
      customer.id,
      customer.email,
      customer.firstName || '',
      customer.lastName || '',
      customer.phone || '',
      customer.totalOrders.toString(),
      customer.totalSpent,
      customer.lastOrderDate?.toISOString() || '',
      customer.createdAt.toISOString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }
}
