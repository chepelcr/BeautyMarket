import 'dotenv/config';
import { db } from '../config/database';
import { organizations } from '../entities';
import { eq } from 'drizzle-orm';

async function deleteOrganization(orgId: string) {
  try {
    console.log(`🗑️  Deleting organization: ${orgId}`);

    const deleted = await db
      .delete(organizations)
      .where(eq(organizations.id, orgId))
      .returning();

    if (deleted.length > 0) {
      console.log(`✅ Deleted organization: ${deleted[0].name} (${deleted[0].slug})`);
    } else {
      console.log(`⚠️  Organization not found: ${orgId}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting organization:', error);
    process.exit(1);
  }
}

const orgId = process.argv[2];
if (!orgId) {
  console.error('❌ Please provide organization ID as argument');
  console.log('Usage: tsx server/src/scripts/delete-org.ts <org-id>');
  process.exit(1);
}

deleteOrganization(orgId);
