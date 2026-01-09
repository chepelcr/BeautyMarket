import { Router, Request, Response } from 'express';
import { OrderService } from '../services';
import { insertOrderSchema } from '../models';
import { z } from 'zod';

export class OrderController {
  constructor(private orderService: OrderService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getOrders.bind(this));
    router.get('/:id', this.getOrderById.bind(this));
    router.get('/:id/status-history', this.getOrderStatusHistory.bind(this));
    router.post('/', this.createOrder.bind(this));
    router.put('/:id/status', this.updateOrderStatus.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: Get all orders (admin only)
   *     tags: [Orders]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: List of orders
   */
  async getOrders(req: Request, res: Response) {
    try {
      const orders = await this.orderService.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  /**
   * @swagger
   * /api/orders/{id}:
   *   get:
   *     summary: Get a single order by ID
   *     tags: [Orders]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order details
   *       404:
   *         description: Order not found
   */
  async getOrderById(req: Request, res: Response) {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  }

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Create a new order
   *     tags: [Orders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Order'
   *     responses:
   *       201:
   *         description: Order created successfully
   */
  async createOrder(req: Request, res: Response) {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await this.orderService.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  }

  /**
   * @swagger
   * /api/orders/{id}/status:
   *   put:
   *     summary: Update order status with validation and history tracking
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, processing, shipped, delivered, cancelled]
   *               cancellationReason:
   *                 type: string
   *                 description: Required when status is 'cancelled'
   *     responses:
   *       200:
   *         description: Order status updated successfully
   *       400:
   *         description: Invalid status transition or missing cancellation reason
   *       404:
   *         description: Order not found
   */
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { status, cancellationReason } = req.body;

      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: "Status is required" });
      }

      // Extract userId from request (assuming it's set by auth middleware)
      const userId = (req as any).userId;

      const order = await this.orderService.updateOrderStatus(
        req.params.id,
        status,
        userId,
        cancellationReason
      );

      res.json(order);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          return res.status(404).json({ error: error.message });
        }
        if (
          error.message.includes('Invalid status transition') ||
          error.message.includes('Cancellation reason is required')
        ) {
          return res.status(400).json({ error: error.message });
        }
      }
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }

  /**
   * @swagger
   * /api/orders/{id}/status-history:
   *   get:
   *     summary: Get status change history for an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Status history retrieved successfully
   */
  async getOrderStatusHistory(req: Request, res: Response) {
    try {
      const history = await this.orderService.getOrderStatusHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching order status history:", error);
      res.status(500).json({ error: "Failed to fetch order status history" });
    }
  }
}
