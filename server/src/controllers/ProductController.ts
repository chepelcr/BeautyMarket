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
   *       - in: query
   *         name: isService
   *         schema:
   *           type: boolean
   *         description: Filter by service products
   *       - in: query
   *         name: onSale
   *         schema:
   *           type: boolean
   *         description: Filter by products on sale
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *         description: Filter by product type (product, service, program)
   *     responses:
   *       200:
   *         description: List of products
   */
  async getProducts(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const { category, isService, onSale, type } = req.query;
      
      const filters: any = {};
      if (category && typeof category === 'string') filters.category = category;
      if (isService !== undefined) filters.isService = isService === 'true';
      if (onSale !== undefined) filters.onSale = onSale === 'true';
      if (type && typeof type === 'string') filters.type = type;

      const products = await this.productService.getProducts(orgId, filters);
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
      const { orgId, id } = req.params;
      const product = await this.productService.getProductByIdAndOrgId(id, orgId);
      if (!product) {
        return res.status(404).json({ error: "Product not found or does not belong to this organization" });
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
      const { orgId, id } = req.params;
      const updates = insertProductSchema.partial().parse(req.body);

      // Verify product exists and belongs to this organization
      const existingProduct = await this.productService.getProductByIdAndOrgId(id, orgId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found or does not belong to this organization" });
      }

      const product = await this.productService.updateProduct(id, updates);

      // Trigger pre-deployment for updated product
      await this.preDeploymentService.triggerPreDeployment('product', 'update', id, 'product', updates);

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
      const { orgId, id } = req.params;

      // Verify product exists and belongs to this organization
      const existingProduct = await this.productService.getProductByIdAndOrgId(id, orgId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found or does not belong to this organization" });
      }

      const deleted = await this.productService.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Trigger pre-deployment for deleted product
      await this.preDeploymentService.triggerPreDeployment('product', 'delete', id, 'product', {});

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
}
