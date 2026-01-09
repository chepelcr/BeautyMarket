import { db } from '../config/database';
import { orderStatusHistory as orderStatusHistoryTable, type OrderStatusHistory, type InsertOrderStatusHistory } from '../entities';
import { eq, desc } from 'drizzle-orm';

export class OrderStatusHistoryRepository {
  /**
   * Create a new status history record
   */
  async createStatusHistory(data: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const [newHistory] = await db
      .insert(orderStatusHistoryTable)
      .values(data)
      .returning();
    return newHistory;
  }

  /**
   * Get all status history for a specific order
   */
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return await db
      .select()
      .from(orderStatusHistoryTable)
      .where(eq(orderStatusHistoryTable.orderId, orderId))
      .orderBy(desc(orderStatusHistoryTable.createdAt));
  }

  /**
   * Get the latest status change for an order
   */
  async getLatestStatusChange(orderId: string): Promise<OrderStatusHistory | undefined> {
    const [latest] = await db
      .select()
      .from(orderStatusHistoryTable)
      .where(eq(orderStatusHistoryTable.orderId, orderId))
      .orderBy(desc(orderStatusHistoryTable.createdAt))
      .limit(1);
    return latest;
  }

  /**
   * Get status history for all orders in an organization
   */
  async getOrganizationStatusHistory(organizationId: string): Promise<OrderStatusHistory[]> {
    return await db
      .select()
      .from(orderStatusHistoryTable)
      .where(eq(orderStatusHistoryTable.organizationId, organizationId))
      .orderBy(desc(orderStatusHistoryTable.createdAt));
  }
}
