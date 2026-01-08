import { db } from '../config/database';
import { shippingSettings, type ShippingSettings, type InsertShippingSettings } from '../entities';
import { eq } from 'drizzle-orm';

export class ShippingSettingsRepository {
  async getAll(): Promise<ShippingSettings[]> {
    return await db
      .select()
      .from(shippingSettings);
  }

  async getById(id: string): Promise<ShippingSettings | undefined> {
    const [result] = await db
      .select()
      .from(shippingSettings)
      .where(eq(shippingSettings.id, id));
    return result;
  }

  async getByOrganizationId(organizationId: string): Promise<ShippingSettings | undefined> {
    const [result] = await db
      .select()
      .from(shippingSettings)
      .where(eq(shippingSettings.organizationId, organizationId));
    return result;
  }

  async create(data: InsertShippingSettings): Promise<ShippingSettings> {
    const [newShippingSettings] = await db
      .insert(shippingSettings)
      .values(data)
      .returning();
    return newShippingSettings;
  }

  async update(
    id: string,
    data: Partial<InsertShippingSettings>
  ): Promise<ShippingSettings | undefined> {
    const [updatedShippingSettings] = await db
      .update(shippingSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shippingSettings.id, id))
      .returning();
    return updatedShippingSettings;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(shippingSettings)
      .where(eq(shippingSettings.id, id))
      .returning();
    return result.length > 0;
  }
}
