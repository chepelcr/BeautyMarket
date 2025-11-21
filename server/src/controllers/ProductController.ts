import { Router, Request, Response } from 'express';
import { ProductService, PreDeploymentService } from '../services';
import { insertProductSchema } from '../models';
import { z } from 'zod';
import { permissionMiddleware } from '../dependency_injection';

export class ProductController {
  constructor(
    private productService: ProductService,
    private preDeploymentService: PreDeploymentService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // Read operations (auth and org context applied at router level)
    router.get('/', this.getProducts.bind(this));
    router.get('/:id', this.getProductById.bind(this));

    // Write operations require permissions
    router.post('/',
      permissionMiddleware.requirePermission('products', 'create'),
      this.createProduct.bind(this)
    );
    router.put('/:id',
      permissionMiddleware.requirePermission('products', 'update'),
      this.updateProduct.bind(this)
    );
    router.delete('/:id',
      permissionMiddleware.requirePermission('products', 'delete'),
      this.deleteProduct.bind(this)
    );

    return router;
  }

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get all products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category slug
   *     responses:
   *       200:
   *         description: List of products
   */
  async getProducts(req: Request, res: Response) {
    try {
      const { category } = req.query;
      let products;

      if (category && typeof category === 'string') {
        products = await this.productService.getProductsByCategory(category);
      } else {
        products = await this.productService.getProducts();
      }

      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  /**
   * @swagger
   * /api/products/{id}:
   *   get:
   *     summary: Get product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product details
   *       404:
   *         description: Product not found
   */
  async getProductById(req: Request, res: Response) {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }

  /**
   * @swagger
   * /api/products:
   *   post:
   *     summary: Create a new product
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Product'
   *     responses:
   *       201:
   *         description: Product created successfully
   */
  async createProduct(req: Request, res: Response) {
    try {
      const productData = insertProductSchema.parse(req.body);

      const product = await this.productService.createProduct(productData);

      // Trigger pre-deployment for new product
      await this.preDeploymentService.triggerPreDeployment('product', 'create', product.id, 'product', productData);

      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  }

  /**
   * @swagger
   * /api/products/{id}:
   *   put:
   *     summary: Update a product
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product updated successfully
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const updates = insertProductSchema.partial().parse(req.body);

      const product = await this.productService.updateProduct(req.params.id, updates);

      // Trigger pre-deployment for updated product
      await this.preDeploymentService.triggerPreDeployment('product', 'update', req.params.id, 'product', updates);

      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  }

  /**
   * @swagger
   * /api/products/{id}:
   *   delete:
   *     summary: Delete a product
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Product deleted successfully
   */
  async deleteProduct(req: Request, res: Response) {
    try {
      const deleted = await this.productService.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Trigger pre-deployment for deleted product
      await this.preDeploymentService.triggerPreDeployment('product', 'delete', req.params.id, 'product', {});

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
}
