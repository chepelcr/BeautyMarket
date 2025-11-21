import { db } from '../config/database';
import { preDeployments, type PreDeployment } from '../entities';
import type { InsertPreDeployment } from '../models';
import { eq } from 'drizzle-orm';
import type { IPreDeploymentRepository } from '../types';

export class PreDeploymentRepository implements IPreDeploymentRepository {
  async getPreDeployments(): Promise<PreDeployment[]> {
    return await db
      .select()
      .from(preDeployments)
      .orderBy(preDeployments.createdAt);
  }

  async getActivePreDeployment(): Promise<PreDeployment | undefined> {
    const [preDeployment] = await db
      .select()
      .from(preDeployments)
      .where(eq(preDeployments.status, 'pending'))
      .orderBy(preDeployments.createdAt)
      .limit(1);
    return preDeployment;
  }

  async createPreDeployment(preDeployment: InsertPreDeployment): Promise<PreDeployment> {
    const [newPreDeployment] = await db
      .insert(preDeployments)
      .values(preDeployment)
      .returning();
    return newPreDeployment;
  }

  async updatePreDeployment(
    id: string,
    preDeployment: Partial<InsertPreDeployment>
  ): Promise<PreDeployment | undefined> {
    const [updatedPreDeployment] = await db
      .update(preDeployments)
      .set({ ...preDeployment, updatedAt: new Date() })
      .where(eq(preDeployments.id, id))
      .returning();
    return updatedPreDeployment;
  }

  async deletePreDeployment(id: string): Promise<boolean> {
    const result = await db
      .delete(preDeployments)
      .where(eq(preDeployments.id, id))
      .returning();
    return result.length > 0;
  }
}
