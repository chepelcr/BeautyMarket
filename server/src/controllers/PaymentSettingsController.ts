import { Router, Request, Response } from 'express';
import type { PaymentSettingsService } from '../services/PaymentSettingsService';
import { z } from 'zod';

export class PaymentSettingsController {
  constructor(private paymentSettingsService: PaymentSettingsService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getPaymentSettings.bind(this));
    router.put('/', this.updatePaymentSettings.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/settings/payment:
   *   get:
   *     summary: Get payment settings for an organization
   *     tags: [Settings]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Payment settings
   *       404:
   *         description: Payment settings not found
   */
  async getPaymentSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const paymentSettings = await this.paymentSettingsService.getByOrganizationId(orgId);

      if (!paymentSettings) {
        return res.status(404).json({ error: 'Payment settings not found' });
      }

      res.json(paymentSettings);
    } catch (error) {
      console.error('Error getting payment settings:', error);
      res.status(500).json({ error: 'Failed to get payment settings' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/settings/payment:
   *   put:
   *     summary: Update payment settings for an organization
   *     tags: [Settings]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: orgId
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
   *               currency:
   *                 type: string
   *               stripeEnabled:
   *                 type: boolean
   *               stripePublishableKey:
   *                 type: string
   *               stripeSecretKey:
   *                 type: string
   *               cashOnDeliveryEnabled:
   *                 type: boolean
   *               bankTransferEnabled:
   *                 type: boolean
   *               bankAccountDetails:
   *                 type: string
   *     responses:
   *       200:
   *         description: Payment settings updated successfully
   *       404:
   *         description: Payment settings not found
   */
  async updatePaymentSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const data = req.body;

      // First check if settings exist
      const existingSettings = await this.paymentSettingsService.getByOrganizationId(orgId);

      let updatedSettings;
      if (!existingSettings) {
        updatedSettings = await this.paymentSettingsService.create({
          organizationId: orgId,
          ...data,
        });
      } else {
        updatedSettings = await this.paymentSettingsService.update(existingSettings.id, data);
      }

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating payment settings:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update payment settings' });
    }
  }
}
