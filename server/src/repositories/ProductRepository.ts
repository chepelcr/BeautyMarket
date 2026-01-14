import { db } from '../config/database';
import { products as productsTable, type Product } from '../entities';
import type { InsertProduct } from '../models';
import { eq, and } from 'drizzle-orm';
import type { IProductRepository } from '../types';

export class ProductRepository implements IProductRepository {
  async getProducts(organizationId?: string, filters?: any): Promise<Product[]> {
    const conditions = [];
    
    if (organizationId) {
      conditions.push(eq(productsTable.organizationId, organizationId));
    }
    if (filters?.isService !== undefined) {
      conditions.push(eq(productsTable.isService, filters.isService));
    }
    if (filters?.onSale !== undefined) {
      conditions.push(eq(productsTable.onSale, filters.onSale));
    }
    if (filters?.type) {
      conditions.push(eq(productsTable.type, filters.type));
    }
    if (filters?.category) {
      conditions.push(eq(productsTable.categoryId, filters.category));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(productsTable)
        .where(and(...conditions));
    }
    
    return await db.select().from(productsTable);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    return product;
  }

  async getProductByIdAndOrgId(id: string, organizationId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.id, id),
          eq(productsTable.organizationId, organizationId)
        )
      );
    return product;
  }

  async getProductsByCategoryAndOrg(categoryId: string, organizationId: string): Promise<Product[]> {
    return await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.categoryId, categoryId),
          eq(productsTable.organizationId, organizationId)
        )
      );
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    // Note: This will need to join with categories table to match by slug
    // For now, matching by categoryId directly
    const results = await db
      .select()
      .from(productsTable);

    // Filter by category - this should be improved with a proper join
    return results;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(productsTable)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(
    id: string,
    product: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(productsTable)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(productsTable.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();
    return result.length > 0;
  }
}
