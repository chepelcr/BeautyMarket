import { db } from '../config/database';
import { paymentSettings, type PaymentSettings, type InsertPaymentSettings } from '../entities';
import { eq } from 'drizzle-orm';

export class PaymentSettingsRepository {
  async getAll(): Promise<PaymentSettings[]> {
    return await db
      .select()
      .from(paymentSettings);
  }

  async getById(id: string): Promise<PaymentSettings | undefined> {
    const [result] = await db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.id, id));
    return result;
  }

  async getByOrganizationId(organizationId: string): Promise<PaymentSettings | undefined> {
    const [result] = await db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.organizationId, organizationId));
    return result;
  }

  async create(data: InsertPaymentSettings): Promise<PaymentSettings> {
    const [newPaymentSettings] = await db
      .insert(paymentSettings)
      .values(data)
      .returning();
    return newPaymentSettings;
  }

  async update(
    id: string,
    data: Partial<InsertPaymentSettings>
  ): Promise<PaymentSettings | undefined> {
    const [updatedPaymentSettings] = await db
      .update(paymentSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentSettings.id, id))
      .returning();
    return updatedPaymentSettings;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(paymentSettings)
      .where(eq(paymentSettings.id, id))
      .returning();
    return result.length > 0;
  }
}
