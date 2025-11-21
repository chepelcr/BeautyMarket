import { Router, Request, Response } from 'express';
import { HomePageContentRepository } from '../repositories';
import { PreDeploymentService } from '../services';
import { insertHomePageContentSchema } from '../models';
import { z } from 'zod';

export class HomePageContentController {
  constructor(
    private homePageContentRepository: HomePageContentRepository,
    private preDeploymentService: PreDeploymentService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getHomePageContent.bind(this));
    router.get('/:section', this.getHomePageContentBySection.bind(this));
    router.post('/', this.createHomePageContent.bind(this));
    router.post('/bulk', this.bulkUpsertHomePageContent.bind(this));
    router.put('/:id', this.updateHomePageContent.bind(this));
    router.delete('/:id', this.deleteHomePageContent.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/home-content:
   *   get:
   *     summary: Get all home page content
   *     tags: [CMS]
   *     responses:
   *       200:
   *         description: List of home page content
   */
  async getHomePageContent(req: Request, res: Response) {
    try {
      const content = await this.homePageContentRepository.getHomePageContent();
      res.json(content);
    } catch (error) {
      console.error("Error getting home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * @swagger
   * /api/home-content/{section}:
   *   get:
   *     summary: Get home page content by section
   *     tags: [CMS]
   *     parameters:
   *       - in: path
   *         name: section
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Content for the specified section
   */
  async getHomePageContentBySection(req: Request, res: Response) {
    try {
      const content = await this.homePageContentRepository.getHomePageContentBySection(req.params.section);
      res.json(content);
    } catch (error) {
      console.error("Error getting home content by section:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * @swagger
   * /api/home-content:
   *   post:
   *     summary: Create home page content
   *     tags: [CMS]
   *     responses:
   *       201:
   *         description: Content created successfully
   */
  async createHomePageContent(req: Request, res: Response) {
    try {
      const contentSchema = insertHomePageContentSchema;
      const validatedContent = contentSchema.parse(req.body);
      const content = await this.homePageContentRepository.createHomePageContent(validatedContent);
      res.status(201).json(content);
    } catch (error) {
      console.error("Error creating home content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * @swagger
   * /api/home-content/bulk:
   *   post:
   *     summary: Bulk upsert home page content
   *     tags: [CMS]
   *     responses:
   *       200:
   *         description: Content upserted successfully
   */
  async bulkUpsertHomePageContent(req: Request, res: Response) {
    try {
      const contentList = req.body;
      const results = await this.homePageContentRepository.bulkUpsertHomePageContent(contentList);

      // Trigger pre-deployment for bulk CMS updates
      await this.preDeploymentService.triggerPreDeployment('cms', 'update', 'bulk', 'homepage_content', { count: contentList.length });

      res.json(results);
    } catch (error) {
      console.error("Error bulk updating home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * @swagger
   * /api/home-content/{id}:
   *   put:
   *     summary: Update home page content
   *     tags: [CMS]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Content updated successfully
   */
  async updateHomePageContent(req: Request, res: Response) {
    try {
      const content = await this.homePageContentRepository.updateHomePageContent(req.params.id, req.body);
      if (!content) {
        return res.status(404).json({ error: "Contenido no encontrado" });
      }

      // Trigger pre-deployment for updated CMS content
      await this.preDeploymentService.triggerPreDeployment('cms', 'update', req.params.id, 'homepage_content', req.body);

      res.json(content);
    } catch (error) {
      console.error("Error updating home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * @swagger
   * /api/home-content/{id}:
   *   delete:
   *     summary: Delete home page content
   *     tags: [CMS]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Content deleted successfully
   */
  async deleteHomePageContent(req: Request, res: Response) {
    try {
      const success = await this.homePageContentRepository.deleteHomePageContent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Contenido no encontrado" });
      }
      res.status(200).json({ message: "Contenido eliminado correctamente" });
    } catch (error) {
      console.error("Error deleting home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
