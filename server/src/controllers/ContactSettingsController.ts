import { Router, Request, Response } from 'express';
import { ContactSettingsRepository } from '../repositories';
import { z } from 'zod';

export class ContactSettingsController {
  constructor(
    private contactSettingsRepository: ContactSettingsRepository
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getContactSettings.bind(this));
    router.put('/', this.updateContactSettings.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/contact:
   *   get:
   *     summary: Get contact settings for an organization
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
   *         description: Contact settings
   *       404:
   *         description: Contact settings not found
   */
  async getContactSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const contactSettings = await this.contactSettingsRepository.getByOrganizationId(orgId);

      if (!contactSettings) {
        return res.status(404).json({ error: 'Contact settings not found' });
      }

      res.json(contactSettings);
    } catch (error) {
      console.error('Error getting contact settings:', error);
      res.status(500).json({ error: 'Failed to get contact settings' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/contact:
   *   put:
   *     summary: Update contact settings for an organization
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
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               address:
   *                 type: string
   *               facebookUrl:
   *                 type: string
   *               instagramUrl:
   *                 type: string
   *               twitterUrl:
   *                 type: string
   *               whatsappNumber:
   *                 type: string
   *               businessHours:
   *                 type: string
   *     responses:
   *       200:
   *         description: Contact settings updated successfully
   *       404:
   *         description: Contact settings not found
   */
  async updateContactSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const data = req.body;

      // First check if settings exist
      const existingSettings = await this.contactSettingsRepository.getByOrganizationId(orgId);

      let updatedSettings;
      if (!existingSettings) {
        // Create new settings if they don't exist
        updatedSettings = await this.contactSettingsRepository.create({
          organizationId: orgId,
          ...data,
        });
      } else {
        // Update existing settings
        updatedSettings = await this.contactSettingsRepository.update(existingSettings.id, data);
      }

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating contact settings:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update contact settings' });
    }
  }
}
