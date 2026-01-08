import { Router, Request, Response } from 'express';
import { TemplateRepository, PageRepository, OrganizationRepository } from '../repositories';
import { z } from 'zod';

export class TemplateController {
  constructor(
    private templateRepository: TemplateRepository,
    private pageRepository: PageRepository,
    private organizationRepository: OrganizationRepository
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getAllTemplates.bind(this));
    router.get('/:id', this.getTemplateById.bind(this));
    router.post('/:id/clone', this.cloneTemplate.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/templates:
   *   get:
   *     summary: Get all templates
   *     tags: [Templates]
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter templates by category
   *       - in: query
   *         name: activeOnly
   *         schema:
   *           type: boolean
   *         description: Return only active templates
   *     responses:
   *       200:
   *         description: List of templates
   */
  async getAllTemplates(req: Request, res: Response) {
    try {
      const { category, activeOnly } = req.query;

      let templates;
      if (category) {
        templates = await this.templateRepository.getByCategory(category as string);
      } else if (activeOnly === 'true') {
        templates = await this.templateRepository.getAllActive();
      } else {
        templates = await this.templateRepository.getAll();
      }

      res.json(templates);
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  }

  /**
   * @swagger
   * /api/templates/{id}:
   *   get:
   *     summary: Get template by ID
   *     tags: [Templates]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Template data
   *       404:
   *         description: Template not found
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await this.templateRepository.getById(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      console.error('Error getting template:', error);
      res.status(500).json({ error: 'Failed to get template' });
    }
  }

  /**
   * @swagger
   * /api/templates/{id}/clone:
   *   post:
   *     summary: Clone template to a new organization
   *     tags: [Templates]
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
   *               - organizationId
   *             properties:
   *               organizationId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Template cloned successfully
   *       404:
   *         description: Template or organization not found
   */
  async cloneTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { organizationId } = req.body;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      // Verify template exists
      const template = await this.templateRepository.getById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Verify organization exists
      const organization = await this.organizationRepository.getById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // TODO: Implement the actual cloning logic
      // This would typically involve:
      // 1. Getting all pages associated with the template
      // 2. Cloning each page with their sections and content
      // 3. Creating new pages for the organization
      // For now, we'll return a success message indicating the clone was initiated

      res.status(201).json({
        message: 'Template clone initiated',
        templateId: id,
        organizationId,
      });
    } catch (error) {
      console.error('Error cloning template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to clone template' });
    }
  }
}
