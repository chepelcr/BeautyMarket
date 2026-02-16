import { Router, Request, Response } from 'express';
import { PublicOrgService } from '../services/PublicOrgService';

export class PublicOrgController {
  constructor(private publicOrgService: PublicOrgService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/:orgId', this.getOrg.bind(this));
    router.get('/:orgId/theme', this.getTheme.bind(this));
    router.get('/:orgId/contact', this.getContact.bind(this));
    router.get('/:orgId/categories', this.getCategories.bind(this));
    router.get('/:orgId/products', this.getProducts.bind(this));
    router.get('/:orgId/pages', this.getPages.bind(this));
    router.get('/:orgId/pages/:slug', this.getPageBySlug.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/public/organizations/{orgId}:
   *   get:
   *     summary: Get organization details
   *     tags: [Public]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Organization details
   *       404:
   *         description: Organization not found
   */
  async getOrg(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const org = await this.publicOrgService.getOrganization(orgId);
      
      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(org);
    } catch (error) {
      console.error('Error getting organization:', error);
      res.status(500).json({ error: 'Failed to get organization' });
    }
  }

  /**
   * @swagger
   * /api/public/organizations/{orgId}/theme:
   *   get:
   *     summary: Get organization theme settings
   *     tags: [Public]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Theme settings
   *       404:
   *         description: Theme not found
   */
  async getTheme(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const theme = await this.publicOrgService.getTheme(orgId);
      
      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      res.json(theme);
    } catch (error) {
      console.error('Error getting theme:', error);
      res.status(500).json({ error: 'Failed to get theme' });
    }
  }

  /**
   * @swagger
   * /api/public/organizations/{orgId}/contact:
   *   get:
   *     summary: Get organization contact information
   *     tags: [Public]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Contact information
   *       404:
   *         description: Contact not found
   */
  async getContact(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const contact = await this.publicOrgService.getContact(orgId);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json(contact);
    } catch (error) {
      console.error('Error getting contact:', error);
      res.status(500).json({ error: 'Failed to get contact' });
    }
  }

  /**
   * @swagger
   * /api/public/organizations/{orgId}/categories:
   *   get:
   *     summary: Get organization categories
   *     tags: [Public]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of categories
   */
  async getCategories(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const cats = await this.publicOrgService.getCategories(orgId);
      res.json(cats);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  }

  /**
   * @swagger
   * /api/public/organizations/{orgId}/products:
   *   get:
   *     summary: Get organization products
   *     tags: [Public]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: isService
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: onSale
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [product, service, program]
   *     responses:
   *       200:
   *         description: List of products
   */
  async getProducts(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const { isService, onSale, type } = req.query;
      
      const prods = await this.publicOrgService.getProducts(orgId, {
        isService: isService === 'true' ? true : isService === 'false' ? false : undefined,
        onSale: onSale === 'true' ? true : onSale === 'false' ? false : undefined,
        type: typeof type === 'string' ? type : undefined,
      });
      
      res.json(prods);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  }

  async getPages(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const pages = await this.publicOrgService.getPages(orgId);
      res.json(pages);
    } catch (error) {
      console.error('Error getting pages:', error);
      res.status(500).json({ error: 'Failed to get pages' });
    }
  }

  /**
   * @swagger
   * /api/public/organizations/{orgId}/pages/{slug}:
   *   get:
   *     summary: Get organization page by slug
   *     tags: [Public]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Page with sections and content
   *       404:
   *         description: Page not found
   */
  async getPageBySlug(req: Request, res: Response) {
    try {
      const { orgId, slug } = req.params;
      const page = await this.publicOrgService.getPageBySlug(orgId, slug);

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    } catch (error) {
      console.error('Error getting page:', error);
      res.status(500).json({ error: 'Failed to get page' });
    }
  }
}
