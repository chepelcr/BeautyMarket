import { db } from '../config/database';
import { categoriesTable, type Category } from '../entities';
import type { InsertCategory } from '../models';
import { eq } from 'drizzle-orm';
import type { ICategoryRepository } from '../types';

export class CategoryRepository implements ICategoryRepository {
  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categoriesTable)
      .orderBy(categoriesTable.sortOrder);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categoriesTable)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(
    id: string,
    category: Partial<InsertCategory>
  ): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categoriesTable)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .returning();
    return result.length > 0;
  }
}
