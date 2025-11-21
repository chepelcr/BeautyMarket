import { CategoryRepository } from '../repositories';
import type { Category } from '../entities';
import type { InsertCategory } from '../models';

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getCategories(): Promise<Category[]> {
    return await this.categoryRepository.getCategories();
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return await this.categoryRepository.getCategoryById(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return await this.categoryRepository.getCategoryBySlug(slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    // Validate slug is unique
    const existing = await this.categoryRepository.getCategoryBySlug(category.slug);
    if (existing) {
      throw new Error('Category slug already exists');
    }

    return await this.categoryRepository.createCategory(category);
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    // If slug is being updated, validate it's unique
    if (category.slug) {
      const existing = await this.categoryRepository.getCategoryBySlug(category.slug);
      if (existing && existing.id !== id) {
        throw new Error('Category slug already exists');
      }
    }

    const updated = await this.categoryRepository.updateCategory(id, category);
    if (!updated) {
      throw new Error('Category not found');
    }

    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return await this.categoryRepository.deleteCategory(id);
  }
}
