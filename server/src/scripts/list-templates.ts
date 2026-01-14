import 'dotenv/config';
import { db } from '../config/database';
import { templates } from '../entities';

async function listTemplates() {
  try {
    console.log('📋 All Templates:\n');

    const allTemplates = await db.select().from(templates);

    if (allTemplates.length === 0) {
      console.log('No templates found.');
      process.exit(0);
    }

    console.log(`Total templates: ${allTemplates.length}\n`);

    allTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   Organization ID: ${template.organizationId}`);
      console.log(`   Active: ${template.isActive ? '✅' : '❌'}`);
      console.log(`   Category: ${template.category || 'N/A'}`);
      console.log('---');
    });

    const activeTemplates = allTemplates.filter(t => t.isActive);
    console.log(`\n✅ Active templates: ${activeTemplates.length}`);
    console.log(`❌ Inactive templates: ${allTemplates.length - activeTemplates.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing templates:', error);
    process.exit(1);
  }
}

listTemplates();
