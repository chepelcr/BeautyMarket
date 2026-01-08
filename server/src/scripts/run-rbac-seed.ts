import 'dotenv/config';
import { db } from '../config/database';
import { seedRBAC } from '../seeds/rbac-seed';

async function main() {
  try {
    console.log('🌱 Running RBAC seed...\n');
    await seedRBAC(db);
    console.log('\n✅ RBAC seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running RBAC seed:', error);
    process.exit(1);
  }
}

main();
