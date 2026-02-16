import { db } from '../config/database';
import { customers, type Customer, type InsertCustomer } from '../entities';
import { eq, and, or, like, desc, sql, gte, lte } from 'drizzle-orm';

export interface CustomerFilters {
  organizationId: string;
  search?: string;
  minSpent?: number;
  maxSpent?: number;
  minOrders?: number;
  maxOrders?: number;
  limit?: number;
  offset?: number;
}

export class CustomerRepository {
  async getCustomers(filters: CustomerFilters): Promise<{ customers: Customer[]; total: number }> {
    const conditions = [eq(customers.organizationId, filters.organizationId)];

    // Search by name, email, or phone
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(customers.email, searchTerm),
          like(customers.firstName, searchTerm),
          like(customers.lastName, searchTerm),
          like(customers.phone, searchTerm)
        )!
      );
    }

    // Filter by total spent range
    if (filters.minSpent !== undefined) {
      conditions.push(gte(customers.totalSpent, filters.minSpent.toString()));
    }
    if (filters.maxSpent !== undefined) {
      conditions.push(lte(customers.totalSpent, filters.maxSpent.toString()));
    }

    // Filter by order count range
    if (filters.minOrders !== undefined) {
      conditions.push(gte(customers.totalOrders, filters.minOrders));
    }
    if (filters.maxOrders !== undefined) {
      conditions.push(lte(customers.totalOrders, filters.maxOrders));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(and(...conditions));

    const total = Number(countResult?.count) || 0;

    // Get customers with pagination
    const customerList = await db
      .select()
      .from(customers)
      .where(and(...conditions))
      .orderBy(desc(customers.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { customers: customerList, total };
  }

  async getCustomerById(id: string, organizationId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.organizationId, organizationId)));
    return customer;
  }

  async getCustomerByEmail(email: string, organizationId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, email), eq(customers.organizationId, organizationId)));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(
    id: string,
    organizationId: string,
    customer: Partial<InsertCustomer>
  ): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.organizationId, organizationId)))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.organizationId, organizationId)))
      .returning();
    return result.length > 0;
  }

  async updateCustomerStats(
    id: string,
    organizationId: string,
    stats: {
      totalOrders?: number;
      totalSpent?: number;
      lastOrderDate?: Date;
    }
  ): Promise<Customer | undefined> {
    const setData: Record<string, any> = { updatedAt: new Date() };
    if (stats.totalOrders !== undefined) setData.totalOrders = stats.totalOrders;
    if (stats.totalSpent !== undefined) setData.totalSpent = String(stats.totalSpent);
    if (stats.lastOrderDate !== undefined) setData.lastOrderDate = stats.lastOrderDate;
    const [updatedCustomer] = await db
      .update(customers)
      .set(setData)
      .where(and(eq(customers.id, id), eq(customers.organizationId, organizationId)))
      .returning();
    return updatedCustomer;
  }

  async getCustomerCount(organizationId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(eq(customers.organizationId, organizationId));
    return Number(result?.count) || 0;
  }
}
