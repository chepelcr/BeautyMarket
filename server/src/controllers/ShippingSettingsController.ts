import { Router, Request, Response } from 'express';
import { ShippingSettingsRepository } from '../repositories';
import { z } from 'zod';

export class ShippingSettingsController {
  constructor(
    private shippingSettingsRepository: ShippingSettingsRepository
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getShippingSettings.bind(this));
    router.put('/', this.updateShippingSettings.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/shipping:
   *   get:
   *     summary: Get shipping settings for an organization
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
   *         description: Shipping settings
   *       404:
   *         description: Shipping settings not found
   */
  async getShippingSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const shippingSettings = await this.shippingSettingsRepository.getByOrganizationId(orgId);

      if (!shippingSettings) {
        return res.status(404).json({ error: 'Shipping settings not found' });
      }

      res.json(shippingSettings);
    } catch (error) {
      console.error('Error getting shipping settings:', error);
      res.status(500).json({ error: 'Failed to get shipping settings' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/shipping:
   *   put:
   *     summary: Update shipping settings for an organization
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
   *               freeShippingThreshold:
   *                 type: integer
   *               defaultShippingCost:
   *                 type: integer
   *               enableLocalPickup:
   *                 type: boolean
   *               enableCorreosShipping:
   *                 type: boolean
   *               enableUberFlash:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Shipping settings updated successfully
   *       404:
   *         description: Shipping settings not found
   */
  async updateShippingSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const data = req.body;

      // First check if settings exist
      const existingSettings = await this.shippingSettingsRepository.getByOrganizationId(orgId);

      let updatedSettings;
      if (!existingSettings) {
        // Create new settings if they don't exist
        updatedSettings = await this.shippingSettingsRepository.create({
          organizationId: orgId,
          ...data,
        });
      } else {
        // Update existing settings
        updatedSettings = await this.shippingSettingsRepository.update(existingSettings.id, data);
      }

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating shipping settings:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update shipping settings' });
    }
  }
}
