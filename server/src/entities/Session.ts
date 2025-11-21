import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [
    index("IDX_session_expire").on(table.expire),
    pgPolicy("sessions_authenticated_access", {
      as: "permissive",
      to: "authenticated",
      for: "all",
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
).enableRLS();
