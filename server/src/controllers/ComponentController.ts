import { Router, Request, Response } from 'express';
import { ComponentRepository } from '../repositories';
import { z } from 'zod';

export class ComponentController {
  constructor(
    private componentRepository: ComponentRepository
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getAllComponents.bind(this));
    router.get('/:id', this.getComponentById.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/components:
   *   get:
   *     summary: Get all components
   *     tags: [Components]
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [system, custom, all]
   *         description: Filter components by type (system/custom/all)
   *     responses:
   *       200:
   *         description: List of components
   */
  async getAllComponents(req: Request, res: Response) {
    try {
      const { type } = req.query;

      let components;
      if (type === 'system') {
        components = await this.componentRepository.getSystemComponents();
      } else if (type === 'custom') {
        components = await this.componentRepository.getCustomComponents();
      } else {
        components = await this.componentRepository.getAll();
      }

      res.json(components);
    } catch (error) {
      console.error('Error getting components:', error);
      res.status(500).json({ error: 'Failed to get components' });
    }
  }

  /**
   * @swagger
   * /api/components/{id}:
   *   get:
   *     summary: Get component by ID
   *     tags: [Components]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Component data
   *       404:
   *         description: Component not found
   */
  async getComponentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const component = await this.componentRepository.getById(id);

      if (!component) {
        return res.status(404).json({ error: 'Component not found' });
      }

      res.json(component);
    } catch (error) {
      console.error('Error getting component:', error);
      res.status(500).json({ error: 'Failed to get component' });
    }
  }
}
