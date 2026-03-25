import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from './server/src/entities/index.js';
import {
  templates,
  organizations,
  themeSettings,
  contactSettings,
  paymentSettings,
  shippingSettings,
  pages,
  categoriesTable,
} from './server/src/entities/index.js';

config(); // Load .env file

const connectionString = process.env.NEW_DATABASE_URL!;

if (!connectionString) {
  console.error('❌ NEW_DATABASE_URL not found in environment variables');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function cleanup() {
  console.log('🧹 Cleaning up template data...\n');

  try {
    // Delete template organizations (cascade will handle related data)
    const templateOrgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.isTemplate, true));

    console.log(`Found ${templateOrgs.length} template organizations to delete`);

    for (const org of templateOrgs) {
      console.log(`Deleting organization: ${org.name}`);
      await db.delete(organizations).where(eq(organizations.id, org.id));
    }

    // Delete all templates
    const allTemplates = await db.select().from(templates);
    console.log(`\nFound ${allTemplates.length} templates to delete`);

    for (const template of allTemplates) {
      console.log(`Deleting template: ${template.name}`);
      await db.delete(templates).where(eq(templates.id, template.id));
    }

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanup();
