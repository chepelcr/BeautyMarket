import 'dotenv/config';
import { db } from '../config/database';
import { organizations, organizationMembers, users, roles } from '../entities';
import { eq } from 'drizzle-orm';

async function checkOrgMembers() {
  try {
    const orgId = 'ff7e1bcb-0f19-4033-95a4-80eba6d731f7';

    console.log(`🔍 Checking organization: ${orgId}\n`);

    // Get org details
    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));

    if (!org) {
      console.log('❌ Organization not found');
      process.exit(1);
    }

    console.log(`Organization: ${org.name}`);
    console.log(`Owner ID: ${org.ownerId}`);
    console.log(`Onboarding Step: ${org.onboardingStep}\n`);

    // Check if owner exists
    const [owner] = await db.select().from(users).where(eq(users.id, org.ownerId));
    console.log(`Owner exists in users table: ${owner ? '✅ Yes' : '❌ No'}`);
    if (owner) {
      console.log(`Owner: ${owner.username} (${owner.email})`);
    }

    // Check memberships
    const members = await db
      .select({
        userId: organizationMembers.userId,
        roleId: organizationMembers.roleId,
        roleName: roles.name,
      })
      .from(organizationMembers)
      .leftJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(eq(organizationMembers.organizationId, orgId));

    console.log(`\nMemberships: ${members.length}`);
    members.forEach(m => {
      console.log(`  - User: ${m.userId}, Role: ${m.roleName || m.roleId}`);
    });

    if (members.length === 0) {
      console.log('\n⚠️  No membership records found - this is an orphan!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking organization:', error);
    process.exit(1);
  }
}

checkOrgMembers();
