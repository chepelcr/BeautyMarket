import { defineConfig } from "drizzle-kit";

if (!process.env.NEW_DATABASE_URL) {
  throw new Error("NEW_DATABASE_URL must be set. Add your Supabase connection string to .env");
}

export default defineConfig({
  out: "./migrations",
  schema: "./server/src/entities/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEW_DATABASE_URL,
  },
});
