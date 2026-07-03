import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';
import * as schema from './server/src/entities/index.js';

config();

const AWS_PROFILE = 'J-CAMPOS';
const REGION = process.env.AWS_REGION || 'us-east-1';
const BASE_DOMAIN = 'tsuru.jcampos.dev';

const s3Client = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID 
    ? undefined
    : fromIni({ profile: AWS_PROFILE }),
});

const connectionString = process.env.NEW_DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log('🔧 Uploading config.json files to template buckets...\n');

  const allTemplates = await db.select().from(schema.templates);
  console.log(`📋 Found ${allTemplates.length} templates\n`);

  for (const template of allTemplates) {
    const subdomain = `${template.name}-example`;
    const bucketName = `${subdomain}-${BASE_DOMAIN.replace(/\./g, '-')}`;
    
    const configContent = JSON.stringify({ 
      templateId: template.id, 
      mode: 'demo' 
    }, null, 2);

    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: 'config.json',
        Body: configContent,
        ContentType: 'application/json',
        CacheControl: 'no-cache'
      }));
      console.log(`✅ ${subdomain}: config.json uploaded (templateId: ${template.id})`);
    } catch (error: any) {
      console.error(`❌ ${subdomain}: Failed - ${error.message}`);
    }
  }

  await client.end();
  console.log('\n✅ Config upload complete');
}

main().catch(console.error);
