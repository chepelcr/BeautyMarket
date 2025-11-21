import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../entities';

// Use NEW_DATABASE_URL (Supabase) as primary, fallback to DATABASE_URL (Neon) for migration
const connectionString = process.env.NEW_DATABASE_URL || process.env.DATABASE_URL || '';

if (!connectionString) {
  throw new Error('DATABASE_URL or NEW_DATABASE_URL must be set');
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle({ client, schema });
