import { db } from '../config/database';
import { components, type Component, type InsertComponent } from '../entities';
import { eq } from 'drizzle-orm';

export class ComponentRepository {
  async getAll(): Promise<Component[]> {
    return await db
      .select()
      .from(components);
  }

  async getById(id: string): Promise<Component | undefined> {
    const [result] = await db
      .select()
      .from(components)
      .where(eq(components.id, id));
    return result;
  }

  async getByType(type: string): Promise<Component | undefined> {
    const [result] = await db
      .select()
      .from(components)
      .where(eq(components.type, type));
    return result;
  }

  async getSystemComponents(): Promise<Component[]> {
    return await db
      .select()
      .from(components)
      .where(eq(components.isSystem, true));
  }

  async getCustomComponents(): Promise<Component[]> {
    return await db
      .select()
      .from(components)
      .where(eq(components.isSystem, false));
  }

  async create(data: InsertComponent): Promise<Component> {
    const [newComponent] = await db
      .insert(components)
      .values(data)
      .returning();
    return newComponent;
  }

  async update(
    id: string,
    data: Partial<InsertComponent>
  ): Promise<Component | undefined> {
    const [updatedComponent] = await db
      .update(components)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(components.id, id))
      .returning();
    return updatedComponent;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(components)
      .where(eq(components.id, id))
      .returning();
    return result.length > 0;
  }
}
