import { db } from '../config/database';
import { templates, type Template, type InsertTemplate } from '../entities';
import { eq } from 'drizzle-orm';

export class TemplateRepository {
  async getAll(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .orderBy(templates.sortOrder);
  }

  async getById(id: string): Promise<Template | undefined> {
    const [result] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return result;
  }

  async getByName(name: string): Promise<Template | undefined> {
    const [result] = await db
      .select()
      .from(templates)
      .where(eq(templates.name, name));
    return result;
  }

  async getAllActive(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(templates.sortOrder);
  }

  async getByCategory(category: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.category, category))
      .orderBy(templates.sortOrder);
  }

  async create(data: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(data)
      .returning();
    return newTemplate;
  }

  async update(
    id: string,
    data: Partial<InsertTemplate>
  ): Promise<Template | undefined> {
    const [updatedTemplate] = await db
      .update(templates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updatedTemplate;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(eq(templates.id, id))
      .returning();
    return result.length > 0;
  }
}
