import { Router, Request, Response } from 'express';
import type { PageSectionService } from '../services/PageSectionService';
import type { PageService } from '../services/PageService';
import { z } from 'zod';

export class SectionController {
  constructor(
    private pageSectionService: PageSectionService,
    private pageService: PageService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getAllSections.bind(this));
    router.post('/', this.createSection.bind(this));
    router.put('/:sectionId', this.updateSection.bind(this));
    router.delete('/:sectionId', this.deleteSection.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections:
   *   get:
   *     summary: Get all sections for a page
   *     tags: [Sections]
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
   *       - in: query
   *         name: activeOnly
   *         schema:
   *           type: boolean
   *         description: Return only active sections
   *     responses:
   *       200:
   *         description: List of sections
   *       404:
   *         description: Page not found
   */
  async getAllSections(req: Request, res: Response) {
    try {
      const { pageId } = req.params;
      const { activeOnly } = req.query;

      const page = await this.pageService.getById(pageId);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      let sections;
      if (activeOnly === 'true') {
        sections = await this.pageSectionService.getActiveByPageId(pageId);
      } else {
        sections = await this.pageSectionService.getByPageId(pageId);
      }

      res.json(sections);
    } catch (error) {
      console.error('Error getting sections:', error);
      res.status(500).json({ error: 'Failed to get sections' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections:
   *   post:
   *     summary: Create a new section
   *     tags: [Sections]
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
   *             required:
   *               - sectionType
   *               - name
   *             properties:
   *               sectionType:
   *                 type: string
   *               name:
   *                 type: string
   *               sortOrder:
   *                 type: integer
   *               isActive:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Section created successfully
   *       400:
   *         description: Invalid data
   *       404:
   *         description: Page not found
   */
  async createSection(req: Request, res: Response) {
    try {
      const { pageId } = req.params;
      const data = req.body;

      if (!data.sectionType || !data.name) {
        return res.status(400).json({ error: 'Section type and name are required' });
      }

      const page = await this.pageService.getById(pageId);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      const newSection = await this.pageSectionService.create({
        pageId,
        ...data,
      });

      res.status(201).json(newSection);
    } catch (error) {
      console.error('Error creating section:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create section' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections/{sectionId}:
   *   put:
   *     summary: Update a section
   *     tags: [Sections]
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
   *       - in: path
   *         name: sectionId
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
   *               sectionType:
   *                 type: string
   *               name:
   *                 type: string
   *               sortOrder:
   *                 type: integer
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Section updated successfully
   *       404:
   *         description: Section not found
   */
  async updateSection(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;
      const data = req.body;

      const existingSection = await this.pageSectionService.getById(sectionId);
      if (!existingSection) {
        return res.status(404).json({ error: 'Section not found' });
      }

      const updatedSection = await this.pageSectionService.update(sectionId, data);

      res.json(updatedSection);
    } catch (error) {
      console.error('Error updating section:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update section' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections/{sectionId}:
   *   delete:
   *     summary: Delete a section
   *     tags: [Sections]
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
   *       - in: path
   *         name: sectionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Section deleted successfully
   *       404:
   *         description: Section not found
   */
  async deleteSection(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;

      const success = await this.pageSectionService.delete(sectionId);

      if (!success) {
        return res.status(404).json({ error: 'Section not found' });
      }

      res.json({ message: 'Section deleted successfully' });
    } catch (error) {
      console.error('Error deleting section:', error);
      res.status(500).json({ error: 'Failed to delete section' });
    }
  }
}
