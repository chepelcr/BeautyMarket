import { readFileSync } from 'fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: tsx scripts/run-migration.ts <migration-file>');
  process.exit(1);
}

if (!process.env.NEW_DATABASE_URL) {
  console.error('Error: NEW_DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  const client = postgres(process.env.NEW_DATABASE_URL!);
  const db = drizzle(client);
  
  try {
    const migrationSQL = readFileSync(migrationFile, 'utf-8');
    console.log(`Running migration: ${migrationFile}`);
    console.log(migrationSQL);
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
