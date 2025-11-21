import { db } from '../config/database';
import { orders as ordersTable, type Order } from '../entities';
import type { InsertOrder } from '../models';
import { eq } from 'drizzle-orm';
import type { IOrderRepository } from '../types';

export class OrderRepository implements IOrderRepository {
  async getOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(ordersTable)
      .orderBy(ordersTable.createdAt);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(ordersTable)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    return updatedOrder;
  }
}
