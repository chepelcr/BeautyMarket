import { db } from '../config/database';
import { themeSettings, type ThemeSettings, type InsertThemeSettings } from '../entities';
import { eq } from 'drizzle-orm';

export class ThemeSettingsRepository {
  async getAll(): Promise<ThemeSettings[]> {
    return await db
      .select()
      .from(themeSettings);
  }

  async getById(id: string): Promise<ThemeSettings | undefined> {
    const [result] = await db
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.id, id));
    return result;
  }

  async getByOrganizationId(organizationId: string): Promise<ThemeSettings | undefined> {
    const [result] = await db
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.organizationId, organizationId));
    return result;
  }

  async create(data: InsertThemeSettings): Promise<ThemeSettings> {
    const [newThemeSettings] = await db
      .insert(themeSettings)
      .values(data)
      .returning();
    return newThemeSettings;
  }

  async update(
    id: string,
    data: Partial<InsertThemeSettings>
  ): Promise<ThemeSettings | undefined> {
    const [updatedThemeSettings] = await db
      .update(themeSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(themeSettings.id, id))
      .returning();
    return updatedThemeSettings;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(themeSettings)
      .where(eq(themeSettings.id, id))
      .returning();
    return result.length > 0;
  }
}
