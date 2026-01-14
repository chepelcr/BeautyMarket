import 'dotenv/config';
import { db } from '../config/database';
import { organizations } from '../entities';

async function listOrganizations() {
  try {
    console.log('📋 All Organizations:\n');

    const orgs = await db.select().from(organizations);

    if (orgs.length === 0) {
      console.log('No organizations found.');
      process.exit(0);
    }

    orgs.forEach(org => {
      console.log(`ID: ${org.id}`);
      console.log(`Name: ${org.name}`);
      console.log(`Slug: ${org.slug}`);
      console.log(`Subdomain: ${org.subdomain || 'N/A'}`);
      console.log(`Owner ID: ${org.ownerId || '❌ NULL (ORPHAN)'}`);
      console.log(`Onboarding Step: ${org.onboardingStep || 0}`);
      console.log(`Created: ${org.createdAt}`);
      console.log('---\n');
    });

    const orphans = orgs.filter(org => !org.ownerId);
    if (orphans.length > 0) {
      console.log(`\n⚠️  Found ${orphans.length} orphan organization(s):`);
      orphans.forEach(org => {
        console.log(`   - ${org.name} (${org.id})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing organizations:', error);
    process.exit(1);
  }
}

listOrganizations();
