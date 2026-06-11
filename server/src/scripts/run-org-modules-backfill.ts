import 'dotenv/config';
import { initializeDatabase, db } from '../config/database';
import { backfillOrgModules } from '../seeds/org-modules-backfill';

async function main() {
  try {
    console.log('🌱 Running organization_modules backfill...\n');
    await initializeDatabase();
    await backfillOrgModules(db as any);
    console.log('\n✅ organization_modules backfill completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running organization_modules backfill:', error);
    process.exit(1);
  }
}

main();
