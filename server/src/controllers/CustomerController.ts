import { Router, Request, Response } from 'express';
import { CustomerService } from '../services';
import { insertCustomerSchema } from '../models';
import { z } from 'zod';
import { permissionMiddleware } from '../dependency_injection';

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // Read operations (auth and org context applied at router level)
    router.get('/', this.getCustomers.bind(this));
    router.get('/export', this.exportCustomers.bind(this));
    router.get('/count', this.getCustomerCount.bind(this));
    router.get('/:id', this.getCustomerById.bind(this));

    // Write operations require permissions
    router.post(
      '/',
      permissionMiddleware.requirePermission('customers', 'create'),
      this.createCustomer.bind(this)
    );
    router.put(
      '/:id',
      permissionMiddleware.requirePermission('customers', 'update'),
      this.updateCustomer.bind(this)
    );
    router.delete(
      '/:id',
      permissionMiddleware.requirePermission('customers', 'delete'),
      this.deleteCustomer.bind(this)
    );

    return router;
  }

  /**
   * Get all customers with optional filters
   * Query params: search, minSpent, maxSpent, minOrders, maxOrders, limit, offset
   */
  async getCustomers(req: Request, res: Response) {
    try {
      const organizationId = req.params.orgId;
      const { search, minSpent, maxSpent, minOrders, maxOrders, limit, offset } = req.query;

      const filters = {
        search: search as string | undefined,
        minSpent: minSpent ? parseFloat(minSpent as string) : undefined,
        maxSpent: maxSpent ? parseFloat(maxSpent as string) : undefined,
        minOrders: minOrders ? parseInt(minOrders as string) : undefined,
        maxOrders: maxOrders ? parseInt(maxOrders as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      };

      const result = await this.customerService.getCustomers(organizationId, filters);
      res.json(result);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(req: Request, res: Response) {
    try {
      const organizationId = req.params.orgId;
      const customer = await this.customerService.getCustomerById(req.params.id, organizationId);
      res.json(customer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error fetching customer:', error);
      res.status(500).json({ error: 'Failed to fetch customer' });
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(req: Request, res: Response) {
    try {
      const organizationId = req.params.orgId;
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        organizationId,
      });

      const customer = await this.customerService.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      if (error instanceof Error && error.message === 'A customer with this email already exists') {
        return res.status(409).json({ error: error.message });
      }
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }

  /**
   * Update a customer
   */
  async updateCustomer(req: Request, res: Response) {
    try {
      const organizationId = req.params.orgId;
      const updates = insertCustomerSchema.partial().parse(req.body);

      const customer = await this.customerService.updateCustomer(
        req.params.id,
        organizationId,
        updates
      );

      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      if (error instanceof Error && error.message === 'Customer not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof Error && error.message === 'A customer with this email already exists') {
        return res.status(409).json({ error: error.message });
      }
      console.error('Error updating customer:', error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(req: Request, res: Response) {
    try {
      const organizationId = req.params.orgId;
      await this.customerService.deleteCustomer(req.params.id, organizationId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error deleting customer:', error);
      res.status(500).json({ error: 'Failed to delete customer' });
    }
  }

  /**
   * Export customers as CSV
   */
  async exportCustomers(req: Request, res: Response) {
    try {
      const organizationId = req.params.orgId;
      const csv = await this.customerService.exportCustomersCSV(organizationId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting customers:', error);
      res.status(500).json({ error: 'Failed to export customers' });
    }
  }

  /**
   * Get customer count for organization
   */
  async getCustomerCount(req: Request, res: Response) {
    try {
      const organizationId = req.params.orgId;
      const count = await this.customerService.getCustomerCount(organizationId);
      res.json({ count });
    } catch (error) {
      console.error('Error getting customer count:', error);
      res.status(500).json({ error: 'Failed to get customer count' });
    }
  }
}
