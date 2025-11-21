import { Router, Request, Response } from 'express';
import { OrderService } from '../services';
import { insertOrderSchema } from '../models';
import { z } from 'zod';

export class OrderController {
  constructor(private orderService: OrderService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getOrders.bind(this));
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
   *     summary: Update order status
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
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, processing, completed, cancelled]
   *     responses:
   *       200:
   *         description: Order status updated successfully
   */
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: "Status is required" });
      }

      const order = await this.orderService.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      if (error instanceof Error && error.message === 'Order not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof Error && error.message === 'Invalid order status') {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
}
