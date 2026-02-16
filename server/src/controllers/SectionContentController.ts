import { Router, Request, Response } from 'express';
import type { SectionContentService } from '../services/SectionContentService';
import type { PageSectionService } from '../services/PageSectionService';
import { PreDeploymentService } from '../services';
import { z } from 'zod';

export class SectionContentController {
  constructor(
    private sectionContentService: SectionContentService,
    private pageSectionService: PageSectionService,
    private preDeploymentService: PreDeploymentService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getAllContent.bind(this));
    router.post('/bulk', this.bulkUpsertContent.bind(this));
    router.post('/bulk-all', this.bulkUpsertAllContent.bind(this));
    router.put('/:contentId', this.updateContent.bind(this));
    router.delete('/:contentId', this.deleteContent.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections/{sectionId}/content:
   *   get:
   *     summary: Get all content for a section
   *     tags: [Section Content]
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
   *         description: List of content items
   *       404:
   *         description: Section not found
   */
  async getAllContent(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;

      const section = await this.pageSectionService.getById(sectionId);
      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }

      const content = await this.sectionContentService.getBySectionId(sectionId);

      res.json(content);
    } catch (error) {
      console.error('Error getting section content:', error);
      res.status(500).json({ error: 'Failed to get section content' });
    }
  }

  async bulkUpsertAllContent(req: Request, res: Response) {
    try {
      console.log('🔵 [bulk-all] Request received');
      const { orgId } = req.params;
      const { updates } = req.body;

      console.log('🔵 [bulk-all] orgId:', orgId);
      console.log('🔵 [bulk-all] updates count:', updates?.length);

      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      const totalUpdated = await this.sectionContentService.bulkUpsertMultipleSections(updates);
      console.log('✓ [bulk-all] Content updated:', totalUpdated);

      // Trigger deployment asynchronously (don't wait)
      this.preDeploymentService.triggerPreDeployment(
        'cms',
        'update',
        orgId,
        'section_content',
        { count: totalUpdated, sections: updates.length },
        orgId
      ).catch(error => {
        console.error('❌ [bulk-all] Async deployment error:', error);
      });

      // Respond immediately
      res.json({ success: true, updated: totalUpdated });
    } catch (error) {
      console.error('❌ [bulk-all] Error:', error);
      res.status(500).json({ error: 'Failed to bulk upsert content' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections/{sectionId}/content/bulk:
   *   post:
   *     summary: Bulk upsert content for a section
   *     tags: [Section Content]
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
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - key
   *                     - value
   *                     - displayName
   *                     - valueType
   *                   properties:
   *                     key:
   *                       type: string
   *                     value:
   *                       type: string
   *                     displayName:
   *                       type: string
   *                     description:
   *                       type: string
   *                     valueType:
   *                       type: string
   *                       enum: [text, color, image, boolean, json, background]
   *                     componentId:
   *                       type: string
   *                     sortOrder:
   *                       type: integer
   *     responses:
   *       200:
   *         description: Content upserted successfully
   *       400:
   *         description: Invalid data
   *       404:
   *         description: Section not found
   */
  async bulkUpsertContent(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;
      const { content } = req.body;

      if (!content || !Array.isArray(content)) {
        return res.status(400).json({ error: 'Content array is required' });
      }

      const section = await this.pageSectionService.getById(sectionId);
      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }

      const contentWithSection = content.map((item: any) => ({
        ...item,
        sectionId,
      }));

      const upsertedContent = await this.sectionContentService.bulkUpsert(contentWithSection);

      await this.preDeploymentService.triggerPreDeployment(
        'cms',
        'update',
        sectionId,
        'section_content',
        { count: content.length, sectionId }
      );

      res.json(upsertedContent);
    } catch (error) {
      console.error('Error upserting section content:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to upsert section content' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections/{sectionId}/content/{contentId}:
   *   put:
   *     summary: Update a content item
   *     tags: [Section Content]
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
   *       - in: path
   *         name: contentId
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
   *               key:
   *                 type: string
   *               value:
   *                 type: string
   *               displayName:
   *                 type: string
   *               description:
   *                 type: string
   *               valueType:
   *                 type: string
   *               componentId:
   *                 type: string
   *               sortOrder:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Content updated successfully
   *       404:
   *         description: Content not found
   */
  async updateContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const data = req.body;

      const existingContent = await this.sectionContentService.getById(contentId);
      if (!existingContent) {
        return res.status(404).json({ error: 'Content not found' });
      }

      const updatedContent = await this.sectionContentService.update(contentId, data);

      await this.preDeploymentService.triggerPreDeployment(
        'cms',
        'update',
        contentId,
        'section_content',
        data
      );

      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating content:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update content' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{orgId}/pages/{pageId}/sections/{sectionId}/content/{contentId}:
   *   delete:
   *     summary: Delete a content item
   *     tags: [Section Content]
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
   *       - in: path
   *         name: contentId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Content deleted successfully
   *       404:
   *         description: Content not found
   */
  async deleteContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;

      const success = await this.sectionContentService.delete(contentId);

      if (!success) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: 'Failed to delete content' });
    }
  }
}
