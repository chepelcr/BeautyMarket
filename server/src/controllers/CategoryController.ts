import { Router, Request, Response } from 'express';
import { CategoryService, ProductService, PreDeploymentService } from '../services';
import { insertCategorySchema } from '../models';
import { z } from 'zod';

export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private preDeploymentService: PreDeploymentService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getCategories.bind(this));
    router.get('/:id', this.getCategoryById.bind(this));
    router.get('/:slug/products', this.getCategoryProducts.bind(this));
    router.post('/', this.createCategory.bind(this));
    router.put('/:id', this.updateCategory.bind(this));
    router.delete('/:id', this.deleteCategory.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Get all categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: List of categories
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await this.categoryService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   get:
   *     summary: Get category by ID
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Category details
   */
  async getCategoryById(req: Request, res: Response) {
    try {
      const category = await this.categoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  /**
   * @swagger
   * /api/categories/{slug}/products:
   *   get:
   *     summary: Get products by category slug
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of products in category
   */
  async getCategoryProducts(req: Request, res: Response) {
    try {
      const category = await this.categoryService.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      const products = await this.productService.getProductsByCategory(category.slug);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  /**
   * @swagger
   * /api/categories:
   *   post:
   *     summary: Create a new category
   *     tags: [Categories]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       201:
   *         description: Category created successfully
   */
  async createCategory(req: Request, res: Response) {
    try {
      const categoryData = insertCategorySchema.parse(req.body);

      const category = await this.categoryService.createCategory(categoryData);

      // Trigger pre-deployment for new category
      await this.preDeploymentService.triggerPreDeployment('category', 'create', category.id, 'category', categoryData);

      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   put:
   *     summary: Update a category
   *     tags: [Categories]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Category updated successfully
   */
  async updateCategory(req: Request, res: Response) {
    try {
      const updates = insertCategorySchema.partial().parse(req.body);

      const category = await this.categoryService.updateCategory(req.params.id, updates);

      // Trigger pre-deployment for updated category
      await this.preDeploymentService.triggerPreDeployment('category', 'update', req.params.id, 'category', updates);

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      if (error instanceof Error && error.message === 'Category not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   delete:
   *     summary: Delete a category
   *     tags: [Categories]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Category deleted successfully
   */
  async deleteCategory(req: Request, res: Response) {
    try {
      const deleted = await this.categoryService.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Trigger pre-deployment for deleted category
      await this.preDeploymentService.triggerPreDeployment('category', 'delete', req.params.id, 'category', {});

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
}
