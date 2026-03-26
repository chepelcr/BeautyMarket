import { Router, Request, Response } from 'express';
import { TemplateRepository } from '../repositories';
import { TemplateContentService } from '../services/TemplateContentService';

export class TemplateController {
  constructor(
    private templateRepository: TemplateRepository,
    private templateContentService: TemplateContentService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    /**
     * @openapi
     * /api/templates:
     *   get:
     *     tags: [Templates]
     *     summary: List all templates
     *     parameters:
     *       - in: query
     *         name: activeOnly
     *         schema:
     *           type: boolean
     *         description: Return only active templates
     *       - in: query
     *         name: category
     *         schema:
     *           type: string
     *         description: Filter by category
     *     responses:
     *       200:
     *         description: Array of templates
     */
    router.get('/', this.getAllTemplates.bind(this));

    /**
     * @openapi
     * /api/templates/{id}:
     *   get:
     *     tags: [Templates]
     *     summary: Get template by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Template object
     *       404:
     *         description: Not found
     */
    router.get('/:id', this.getTemplateById.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/content:
     *   get:
     *     tags: [Templates]
     *     summary: Get full content for a template
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Template content
     */
    router.get('/:id/content', this.getTemplateContent.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/theme:
     *   get:
     *     tags: [Templates]
     *     summary: Get theme settings for a template
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Theme settings
     */
    router.get('/:id/theme', this.getTemplateTheme.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/contact:
     *   get:
     *     tags: [Templates]
     *     summary: Get contact settings for a template
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Contact settings
     */
    router.get('/:id/contact', this.getTemplateContact.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/payment:
     *   get:
     *     tags: [Templates]
     *     summary: Get payment settings for a template
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Payment settings
     */
    router.get('/:id/payment', this.getTemplatePayment.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/shipping:
     *   get:
     *     tags: [Templates]
     *     summary: Get shipping settings for a template
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Shipping settings
     */
    router.get('/:id/shipping', this.getTemplateShipping.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/pages:
     *   get:
     *     tags: [Templates]
     *     summary: Get pages for a template
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of pages
     */
    router.get('/:id/pages', this.getTemplatePages.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/pages/{slug}:
     *   get:
     *     tags: [Templates]
     *     summary: Get a template page by slug
     *     parameters:
     *       - in: path
     *         name: id
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
     *         description: Page with sections
     *       404:
     *         description: Not found
     */
    router.get('/:id/pages/:slug', this.getTemplatePageBySlug.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/categories:
     *   get:
     *     tags: [Templates]
     *     summary: Get categories for a template
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of categories
     */
    router.get('/:id/categories', this.getTemplateCategories.bind(this));

    /**
     * @openapi
     * /api/templates/{id}/products:
     *   get:
     *     tags: [Templates]
     *     summary: Get products for a template
     *     parameters:
     *       - in: path
     *         name: id
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
     *     responses:
     *       200:
     *         description: Array of products
     */
    router.get('/:id/products', this.getTemplateProducts.bind(this));

    return router;
  }

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

  async getTemplateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const template = await this.templateRepository.getById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const content = await this.templateContentService.getAllContent(id);
      res.json(content);
    } catch (error) {
      console.error('Error getting template content:', error);
      res.status(500).json({ error: 'Failed to get template content' });
    }
  }

  async getTemplateTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const theme = await this.templateContentService.getTheme(id);
      
      if (!theme) {
        return res.status(404).json({ error: 'Template theme not found' });
      }

      res.json(theme);
    } catch (error) {
      console.error('Error getting template theme:', error);
      res.status(500).json({ error: 'Failed to get template theme' });
    }
  }

  async getTemplateContact(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contact = await this.templateContentService.getContact(id);
      
      if (!contact) {
        return res.status(404).json({ error: 'Template contact not found' });
      }

      res.json(contact);
    } catch (error) {
      console.error('Error getting template contact:', error);
      res.status(500).json({ error: 'Failed to get template contact' });
    }
  }

  async getTemplatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await this.templateContentService.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ error: 'Template payment not found' });
      }

      res.json(payment);
    } catch (error) {
      console.error('Error getting template payment:', error);
      res.status(500).json({ error: 'Failed to get template payment' });
    }
  }

  async getTemplateShipping(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shipping = await this.templateContentService.getShipping(id);
      
      if (!shipping) {
        return res.status(404).json({ error: 'Template shipping not found' });
      }

      res.json(shipping);
    } catch (error) {
      console.error('Error getting template shipping:', error);
      res.status(500).json({ error: 'Failed to get template shipping' });
    }
  }

  async getTemplatePages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pages = await this.templateContentService.getPages(id);
      res.json(pages);
    } catch (error) {
      console.error('Error getting template pages:', error);
      res.status(500).json({ error: 'Failed to get template pages' });
    }
  }

  async getTemplatePageBySlug(req: Request, res: Response) {
    try {
      const { id, slug } = req.params;
      const page = await this.templateContentService.getPageWithSections(id, slug);
      
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    } catch (error) {
      console.error('Error getting template page:', error);
      res.status(500).json({ error: 'Failed to get template page' });
    }
  }

  async getTemplateCategories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categories = await this.templateContentService.getCategories(id);
      res.json(categories);
    } catch (error) {
      console.error('Error getting template categories:', error);
      res.status(500).json({ error: 'Failed to get template categories' });
    }
  }

  async getTemplateProducts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isService, onSale, type } = req.query;
      
      const filters: any = {};
      if (isService !== undefined) filters.isService = isService === 'true';
      if (onSale !== undefined) filters.onSale = onSale === 'true';
      if (type && typeof type === 'string') filters.type = type;

      const products = await this.templateContentService.getProducts(id, filters);
      res.json(products);
    } catch (error) {
      console.error('Error getting template products:', error);
      res.status(500).json({ error: 'Failed to get template products' });
    }
  }
}
