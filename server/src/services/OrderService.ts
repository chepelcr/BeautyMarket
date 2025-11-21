import { OrderRepository } from '../repositories';
import type { Order } from '../entities';
import type { InsertOrder } from '../models';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async getOrders(): Promise<Order[]> {
    return await this.orderRepository.getOrders();
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return await this.orderRepository.getOrderById(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Validate order data
    if (!order.customerName || !order.customerPhone) {
      throw new Error('Customer name and phone are required');
    }

    if (!order.items || order.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    return await this.orderRepository.createOrder(order);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    const updated = await this.orderRepository.updateOrderStatus(id, status);
    if (!updated) {
      throw new Error('Order not found');
    }

    return updated;
  }
}
