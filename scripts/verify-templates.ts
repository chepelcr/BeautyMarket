import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './server/src/entities/index.js';

config(); // Load .env file

const connectionString = process.env.NEW_DATABASE_URL!;

if (!connectionString) {
  console.error('❌ NEW_DATABASE_URL not found in environment variables');
  process.exit(1);
}
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function verifyTemplates() {
  console.log('📋 Verifying templates in database...\n');

  const templates = await db.query.templates.findMany({
    orderBy: (templates, { asc }) => [asc(templates.sortOrder)],
  });

  console.log(`Found ${templates.length} templates:\n`);

  templates.forEach((template) => {
    console.log(`${template.sortOrder}. ${template.displayName} (${template.name})`);
    console.log(`   Category: ${template.category}`);
    console.log(`   Active: ${template.isActive}`);
    console.log();
  });

  // Also check template organizations
  const templateOrgs = await db.query.organizations.findMany({
    where: (orgs, { eq }) => eq(orgs.isTemplate, true),
    orderBy: (orgs, { asc }) => [asc(orgs.name)],
  });

  console.log(`\n📦 Found ${templateOrgs.length} template organizations:\n`);

  templateOrgs.forEach((org) => {
    console.log(`- ${org.name} (${org.subdomain})`);
    console.log(`  Template ID: ${org.templateId}`);
  });

  await client.end();
}

verifyTemplates().catch(console.error);
