import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../entities';
import { getDatabaseUrl } from './secrets';

// ---------------------------------------------------------------------------
// database.ts — Lazy-initialized Drizzle database instance.
//
// Call initializeDatabase() once at app startup (index.ts / lambda.cts).
// After initialization, import { db } works identically to before —
// no changes needed in repository files.
// ---------------------------------------------------------------------------

type DrizzleDb = ReturnType<typeof drizzle>;

let _db: DrizzleDb | undefined;

/**
 * Initialize the database connection.
 * Resolves credentials via: NEW_DATABASE_URL env → SSM → Secrets Manager.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initializeDatabase(): Promise<void> {
  if (_db) return;

  const url = await getDatabaseUrl();
  const client = postgres(url, { prepare: false });
  _db = drizzle({ client, schema });
}

/**
 * Direct accessor — throws if initializeDatabase() has not been called yet.
 */
export function getDb(): DrizzleDb {
  if (!_db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return _db;
}

/**
 * Backwards-compatible proxy export.
 * All existing `import { db }` in repositories continue to work unchanged.
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    if (!_db) throw new Error('Database not initialized. Call initializeDatabase() first.');
    return (_db as any)[prop];
  },
  set(_target, prop, value) {
    if (!_db) throw new Error('Database not initialized. Call initializeDatabase() first.');
    (_db as any)[prop] = value;
    return true;
  },
});
