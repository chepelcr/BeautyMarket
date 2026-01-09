import { OrderRepository, OrderStatusHistoryRepository } from '../repositories';
import type { Order, OrderStatus } from '../entities';
import type { InsertOrder } from '../models';

// Define valid status transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [], // terminal state
  cancelled: []  // terminal state
};

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private orderStatusHistoryRepository: OrderStatusHistoryRepository
  ) {}

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

    const newOrder = await this.orderRepository.createOrder(order);

    // Log initial status in history
    if (newOrder.organizationId) {
      await this.orderStatusHistoryRepository.createStatusHistory({
        orderId: newOrder.id,
        organizationId: newOrder.organizationId,
        oldStatus: null,
        newStatus: newOrder.status || 'pending',
        changedBy: null, // System created
      });
    }

    return newOrder;
  }

  /**
   * Validates if a status transition is allowed
   */
  validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validNextStatuses = VALID_TRANSITIONS[currentStatus];

    if (!validNextStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Valid transitions: ${validNextStatuses.join(', ') || 'none (terminal state)'}`
      );
    }
  }

  /**
   * Updates order status with validation and history tracking
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId?: string,
    cancellationReason?: string
  ): Promise<Order> {
    // Get current order
    const order = await this.orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const currentStatus = order.status as OrderStatus;

    // Validate status transition
    this.validateStatusTransition(currentStatus, newStatus);

    // Require cancellation reason when transitioning to cancelled
    if (newStatus === 'cancelled' && !cancellationReason) {
      throw new Error('Cancellation reason is required when cancelling an order');
    }

    // Update order status
    const updated = await this.orderRepository.updateOrderStatus(orderId, newStatus);
    if (!updated) {
      throw new Error('Failed to update order status');
    }

    // Log status change in history
    await this.orderStatusHistoryRepository.createStatusHistory({
      orderId,
      organizationId: order.organizationId,
      oldStatus: currentStatus,
      newStatus,
      changedBy: userId || null,
      cancellationReason: newStatus === 'cancelled' ? cancellationReason : null,
    });

    return updated;
  }

  /**
   * Get status history for an order
   */
  async getOrderStatusHistory(orderId: string) {
    return await this.orderStatusHistoryRepository.getOrderStatusHistory(orderId);
  }
}
