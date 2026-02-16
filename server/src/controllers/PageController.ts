import { Router, Request, Response } from 'express';
import type { PageService } from '../services/PageService';
import { z } from 'zod';

export class PageController {
  constructor(private pageService: PageService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getAllPages.bind(this));
    router.get('/:pageId', this.getPageById.bind(this));
    router.post('/', this.createPage.bind(this));
    router.put('/:pageId', this.updatePage.bind(this));
    router.delete('/:pageId', this.deletePage.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages:
   *   get:
   *     summary: Get all pages for an organization
   *     tags: [Pages]
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
   *       - in: query
   *         name: activeOnly
   *         schema:
   *           type: boolean
   *         description: Return only active pages
   *     responses:
   *       200:
   *         description: List of pages
   */
  async getAllPages(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const { activeOnly, type, includeContent } = req.query;

      let pages;

      if (type) {
        const page = await this.pageService.getByOrganizationAndType(orgId, type as any);
        return res.json(page ? [page] : []);
      }

      if (includeContent === 'true') {
        pages = await this.pageService.getPagesWithContent(orgId, activeOnly === 'true');
        return res.json(pages);
      }

      if (activeOnly === 'true') {
        pages = await this.pageService.getActiveByOrganization(orgId);
      } else {
        pages = await this.pageService.getByOrganizationId(orgId);
      }

      res.json(pages);
    } catch (error) {
      console.error('Error getting pages:', error);
      res.status(500).json({ error: 'Failed to get pages' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}:
   *   get:
   *     summary: Get page by ID
   *     tags: [Pages]
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
   *       - in: path
   *         name: pageId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Page data
   *       404:
   *         description: Page not found
   */
  async getPageById(req: Request, res: Response) {
    try {
      const { pageId } = req.params;
      const page = await this.pageService.getById(pageId);

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    } catch (error) {
      console.error('Error getting page:', error);
      res.status(500).json({ error: 'Failed to get page' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages:
   *   post:
   *     summary: Create a new page
   *     tags: [Pages]
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
   *             required:
   *               - type
   *               - slug
   *               - title
   *             properties:
   *               type:
   *                 type: string
   *               slug:
   *                 type: string
   *               title:
   *                 type: string
   *               metaDescription:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *               sortOrder:
   *                 type: integer
   *               templateId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Page created successfully
   *       400:
   *         description: Invalid data
   */
  async createPage(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const data = req.body;

      if (!data.type || !data.slug || !data.title) {
        return res.status(400).json({ error: 'Type, slug, and title are required' });
      }

      const newPage = await this.pageService.create({
        organizationId: orgId,
        ...data,
      });

      res.status(201).json(newPage);
    } catch (error) {
      console.error('Error creating page:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create page' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}:
   *   put:
   *     summary: Update a page
   *     tags: [Pages]
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
   *       - in: path
   *         name: pageId
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
   *               type:
   *                 type: string
   *               slug:
   *                 type: string
   *               title:
   *                 type: string
   *               metaDescription:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *               sortOrder:
   *                 type: integer
   *               templateId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Page updated successfully
   *       404:
   *         description: Page not found
   */
  async updatePage(req: Request, res: Response) {
    try {
      const { pageId } = req.params;
      const data = req.body;

      const updatedPage = await this.pageService.update(pageId, data);

      res.json(updatedPage);
    } catch (error) {
      console.error('Error updating page:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update page' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}:
   *   delete:
   *     summary: Delete a page
   *     tags: [Pages]
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
   *       - in: path
   *         name: pageId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Page deleted successfully
   *       404:
   *         description: Page not found
   */
  async deletePage(req: Request, res: Response) {
    try {
      const { pageId } = req.params;

      const success = await this.pageService.delete(pageId);

      if (!success) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ message: 'Page deleted successfully' });
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  }
}
