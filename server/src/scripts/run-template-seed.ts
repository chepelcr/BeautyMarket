import 'dotenv/config';
import { db, initializeDatabase } from '../config/database';
import { seedTemplates } from '../seeds/template-seed';

async function main() {
  try {
    console.log('🌱 Running template seed...\n');
    await initializeDatabase();
    await seedTemplates(db);
    console.log('\n✅ Template seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running template seed:', error);
    process.exit(1);
  }
}

main();
