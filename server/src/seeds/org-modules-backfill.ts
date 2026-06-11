import { eq, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { organizations, organizationModules, modules } from '../entities';
import { DEFAULT_ORG_MODULE_NAMES } from './rbac-seed';

/**
 * Backfill default organization_modules rows for every existing organization.
 *
 * Idempotent: only inserts rows that are missing (existing assignments are
 * never touched). Run ONCE after applying the migration that creates the
 * organization_modules table:
 *
 *   npm run db:seed:org-modules
 *
 * New organizations get their default set automatically via
 * OrganizationService.create — this script only covers pre-existing orgs.
 */
export async function backfillOrgModules(db: PostgresJsDatabase<any>): Promise<void> {
  console.log('Starting organization_modules backfill...');

  const defaultModules = await db
    .select()
    .from(modules)
    .where(inArray(modules.name, DEFAULT_ORG_MODULE_NAMES));

  const missingNames = DEFAULT_ORG_MODULE_NAMES.filter(
    (name) => !defaultModules.some((m) => m.name === name)
  );
  if (missingNames.length > 0) {
    console.warn(`Default modules not found (run "npm run db:seed" first): ${missingNames.join(', ')}`);
  }
  if (defaultModules.length === 0) {
    console.error('No default modules found — aborting backfill.');
    return;
  }

  const allOrganizations = await db.select().from(organizations);
  console.log(`Found ${allOrganizations.length} organizations`);

  let inserted = 0;
  for (const org of allOrganizations) {
    const existing = await db
      .select()
      .from(organizationModules)
      .where(eq(organizationModules.organizationId, org.id));
    const existingModuleIds = new Set(existing.map((row) => row.moduleId));

    const toInsert = defaultModules
      .filter((module) => !existingModuleIds.has(module.id))
      .map((module) => ({
        organizationId: org.id,
        moduleId: module.id,
        isEnabled: true,
        assignedBy: null, // seeded/backfilled rows carry no admin user
      }));

    if (toInsert.length > 0) {
      await db.insert(organizationModules).values(toInsert);
      inserted += toInsert.length;
      console.log(`  ${org.slug}: assigned ${toInsert.length} default modules`);
    }
  }

  console.log(`Backfill complete: ${inserted} organization_modules rows inserted.`);
}
