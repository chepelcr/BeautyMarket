import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { organizationSettingsTable, type OrganizationSettingsRecord } from "../entities/OrganizationSettings";

/**
 * Read-only repository for the organization_settings table.
 *
 * The table is owned by the infrastructure microservice — this service
 * only queries it to validate infrastructure readiness before deployments.
 */
export class OrganizationSettingsRepository {
  async findByOrganizationId(organizationId: string): Promise<OrganizationSettingsRecord | null> {
    const result = await db
      .select()
      .from(organizationSettingsTable)
      .where(eq(organizationSettingsTable.organizationId, organizationId))
      .limit(1);
    return result[0] ?? null;
  }
}
