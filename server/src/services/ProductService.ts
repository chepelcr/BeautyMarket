import { ProductRepository, CategoryRepository } from '../repositories';
import type { Product } from '../entities';
import type { InsertProduct } from '../models';

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getProducts(organizationId?: string, filters?: any): Promise<Product[]> {
    return await this.productRepository.getProducts(organizationId, filters);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return await this.productRepository.getProductById(id);
  }

  async getProductByIdAndOrgId(id: string, organizationId: string): Promise<Product | undefined> {
    return await this.productRepository.getProductByIdAndOrgId(id, organizationId);
  }

  async getProductsByCategoryAndOrg(categoryId: string, organizationId: string): Promise<Product[]> {
    return await this.productRepository.getProductsByCategoryAndOrg(categoryId, organizationId);
  }

  async getProductsByCategory(categorySlug: string, organizationId?: string): Promise<Product[]> {
    // First, verify category exists
    const category = await this.categoryRepository.getCategoryBySlug(categorySlug);
    if (!category) {
      throw new Error('Category not found');
    }

    // Get all products (filtered by org if provided) and filter by categoryId
    const allProducts = await this.productRepository.getProducts(organizationId);
    return allProducts.filter(p => p.categoryId === category.id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Validate category exists
    const category = await this.categoryRepository.getCategoryById(product.categoryId);
    if (!category) {
      throw new Error('Invalid category ID');
    }

    return await this.productRepository.createProduct(product);
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    // If categoryId is being updated, validate it exists
    if (product.categoryId) {
      const category = await this.categoryRepository.getCategoryById(product.categoryId);
      if (!category) {
        throw new Error('Invalid category ID');
      }
    }

    const updated = await this.productRepository.updateProduct(id, product);
    if (!updated) {
      throw new Error('Product not found');
    }

    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return await this.productRepository.deleteProduct(id);
  }

  // Inventory tracking methods
  async checkStockAvailability(productId: string, quantity: number): Promise<boolean> {
    const product = await this.productRepository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // If inventory tracking is disabled, stock is always available
    if (!product.trackInventory) {
      return true;
    }

    return (product.stockQuantity ?? 0) >= quantity;
  }

  async reduceStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.productRepository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // If inventory tracking is disabled, don't reduce stock
    if (!product.trackInventory) {
      return product;
    }

    const currentStock = product.stockQuantity ?? 0;
    if (currentStock < quantity) {
      throw new Error('Insufficient stock');
    }

    const newStock = currentStock - quantity;
    return await this.productRepository.updateProduct(productId, {
      stockQuantity: newStock,
    });
  }

  async getLowStockProducts(organizationId?: string): Promise<Product[]> {
    const allProducts = await this.productRepository.getProducts(organizationId);
    return allProducts.filter(p => {
      const isLowStock = p.trackInventory &&
                        (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 10);
      return isLowStock;
    });
  }

  async getOutOfStockProducts(organizationId?: string): Promise<Product[]> {
    const allProducts = await this.productRepository.getProducts(organizationId);
    return allProducts.filter(p => {
      const isOutOfStock = p.trackInventory && (p.stockQuantity ?? 0) === 0;
      return isOutOfStock;
    });
  }
}
