import { db } from '../config/database';
import { contactSettings, type ContactSettings, type InsertContactSettings } from '../entities';
import { eq } from 'drizzle-orm';

export class ContactSettingsRepository {
  async getAll(): Promise<ContactSettings[]> {
    return await db
      .select()
      .from(contactSettings);
  }

  async getById(id: string): Promise<ContactSettings | undefined> {
    const [result] = await db
      .select()
      .from(contactSettings)
      .where(eq(contactSettings.id, id));
    return result;
  }

  async getByOrganizationId(organizationId: string): Promise<ContactSettings | undefined> {
    const [result] = await db
      .select()
      .from(contactSettings)
      .where(eq(contactSettings.organizationId, organizationId));
    return result;
  }

  async create(data: InsertContactSettings): Promise<ContactSettings> {
    const [newContactSettings] = await db
      .insert(contactSettings)
      .values(data)
      .returning();
    return newContactSettings;
  }

  async update(
    id: string,
    data: Partial<InsertContactSettings>
  ): Promise<ContactSettings | undefined> {
    const [updatedContactSettings] = await db
      .update(contactSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contactSettings.id, id))
      .returning();
    return updatedContactSettings;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(contactSettings)
      .where(eq(contactSettings.id, id))
      .returning();
    return result.length > 0;
  }
}
