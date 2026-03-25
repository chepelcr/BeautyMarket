import { Router, Request, Response } from 'express';
import type { ThemeSettingsService } from '../services/ThemeSettingsService';
import { z } from 'zod';

export class ThemeSettingsController {
  constructor(private themeSettingsService: ThemeSettingsService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getThemeSettings.bind(this));
    router.put('/', this.updateThemeSettings.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/settings/theme:
   *   get:
   *     summary: Get theme settings for an organization
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
   *         description: Theme settings
   *       404:
   *         description: Theme settings not found
   */
  async getThemeSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const themeSettings = await this.themeSettingsService.getByOrganizationId(orgId);

      if (!themeSettings) {
        return res.status(404).json({ error: 'Theme settings not found' });
      }

      res.json(themeSettings);
    } catch (error) {
      console.error('Error getting theme settings:', error);
      res.status(500).json({ error: 'Failed to get theme settings' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/settings/theme:
   *   put:
   *     summary: Update theme settings for an organization
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
   *               primaryColor:
   *                 type: string
   *               secondaryColor:
   *                 type: string
   *               logoUrl:
   *                 type: string
   *               faviconUrl:
   *                 type: string
   *               fontFamily:
   *                 type: string
   *     responses:
   *       200:
   *         description: Theme settings updated successfully
   *       404:
   *         description: Theme settings not found
   */
  async updateThemeSettings(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const data = req.body;

      // First check if settings exist
      const existingSettings = await this.themeSettingsService.getByOrganizationId(orgId);

      let updatedSettings;
      if (!existingSettings) {
        updatedSettings = await this.themeSettingsService.create({
          organizationId: orgId,
          ...data,
        });
      } else {
        updatedSettings = await this.themeSettingsService.update(existingSettings.id, data);
      }

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating theme settings:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update theme settings' });
    }
  }
}
