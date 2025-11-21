import { ProductRepository, CategoryRepository } from '../repositories';
import type { Product } from '../entities';
import type { InsertProduct } from '../models';

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.getProducts();
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return await this.productRepository.getProductById(id);
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    // First, verify category exists
    const category = await this.categoryRepository.getCategoryBySlug(categorySlug);
    if (!category) {
      throw new Error('Category not found');
    }

    // Get all products and filter by categoryId
    const allProducts = await this.productRepository.getProducts();
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
}
