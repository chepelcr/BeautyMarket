import { db } from '../config/database';
import { deploymentHistory, type DeploymentHistory } from '../entities';
import type { InsertDeploymentHistory } from '../models';
import { eq, desc } from 'drizzle-orm';
import type { IDeploymentRepository } from '../types';

export class DeploymentRepository implements IDeploymentRepository {
  async getDeploymentHistory(): Promise<DeploymentHistory[]> {
    return await db
      .select()
      .from(deploymentHistory)
      .orderBy(desc(deploymentHistory.startedAt));
  }

  async getDeploymentHistoryByOrganization(organizationId: string): Promise<DeploymentHistory[]> {
    return await db
      .select()
      .from(deploymentHistory)
      .where(eq(deploymentHistory.organizationId, organizationId))
      .orderBy(desc(deploymentHistory.startedAt));
  }

  async getDeploymentById(id: string): Promise<DeploymentHistory | undefined> {
    const [deployment] = await db
      .select()
      .from(deploymentHistory)
      .where(eq(deploymentHistory.id, id));
    return deployment;
  }

  async createDeployment(deployment: InsertDeploymentHistory): Promise<DeploymentHistory> {
    const [newDeployment] = await db
      .insert(deploymentHistory)
      .values(deployment)
      .returning();
    return newDeployment;
  }

  async updateDeployment(
    id: string,
    deployment: Partial<InsertDeploymentHistory>
  ): Promise<DeploymentHistory | undefined> {
    const [updatedDeployment] = await db
      .update(deploymentHistory)
      .set(deployment)
      .where(eq(deploymentHistory.id, id))
      .returning();
    return updatedDeployment;
  }
}
