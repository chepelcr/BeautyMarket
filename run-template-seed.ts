import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './server/src/entities/index.js';
import { seedTemplatesMain } from './server/src/seeds/template-seed.js';

config(); // Load .env file

const connectionString = process.env.NEW_DATABASE_URL!;

if (!connectionString) {
  console.error('❌ NEW_DATABASE_URL not found in environment variables');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  try {
    await seedTemplatesMain(db);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
