import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';

// Source database (current Neon)
const sourceConnectionString = process.env.DATABASE_URL;
if (!sourceConnectionString) {
  throw new Error('DATABASE_URL (source) must be set');
}

// Target database (new Supabase)
const targetConnectionString = process.env.NEW_DATABASE_URL;
if (!targetConnectionString) {
  throw new Error('NEW_DATABASE_URL (target) must be set');
}

console.log('🔄 Starting database migration from Neon to Supabase...');

// Create database connections
const sourceClient = postgres(sourceConnectionString, { prepare: false });
const sourceDb = drizzle({ client: sourceClient, schema });

const targetClient = postgres(targetConnectionString, { prepare: false });
const targetDb = drizzle({ client: targetClient, schema });

async function migrateData() {
  try {
    console.log('📋 Step 1: Creating tables in Supabase database...');
    
    // First, push the schema to the new database
    console.log('⚠️  Run "npm run db:push:new" to create tables in Supabase first!');
    console.log('   This will use the NEW_DATABASE_URL to create the schema.');
    
    console.log('\n📊 Step 2: Checking source data...');
    
    // Helper function to safely fetch data from a table that might not exist
    async function safeSelect(tableName: string, query: any) {
      try {
        const result = await query;
        console.log(`   ✅ Table "${tableName}" found: ${result.length} records`);
        return result;
      } catch (error: any) {
        if (error.code === '42P01') { // Table does not exist
          console.log(`   ⚠️  Table "${tableName}" does not exist in source database - skipping`);
          return [];
        }
        throw error;
      }
    }

    // Get all data from source database (only from tables that exist)
    const categoriesData = await safeSelect('categories', sourceDb.select().from(schema.categoriesTable));
    const productsData = await safeSelect('products', sourceDb.select().from(schema.products));
    const ordersData = await safeSelect('orders', sourceDb.select().from(schema.orders));
    const usersData = await safeSelect('users', sourceDb.select().from(schema.users));
    const userSessionsData = await safeSelect('user_sessions', sourceDb.select().from(schema.userSessions));
    const apiKeysData = await safeSelect('api_keys', sourceDb.select().from(schema.apiKeys));
    const homePageContentData = await safeSelect('home_page_content', sourceDb.select().from(schema.homePageContent));
    const preDeploymentsData = await safeSelect('pre_deployments', sourceDb.select().from(schema.preDeployments));
    const deploymentHistoryData = await safeSelect('deployment_history', sourceDb.select().from(schema.deploymentHistory));
    const passwordResetTokensData = await safeSelect('password_reset_tokens', sourceDb.select().from(schema.passwordResetTokens));
    const emailVerificationTokensData = await safeSelect('email_verification_tokens', sourceDb.select().from(schema.emailVerificationTokens));
    const provincesData = await safeSelect('provinces', sourceDb.select().from(schema.provinces));
    const cantonsData = await safeSelect('cantons', sourceDb.select().from(schema.cantons));
    const districtsData = await safeSelect('districts', sourceDb.select().from(schema.districts));

    console.log(`\n📈 Summary - Total records to migrate:`);
    const totalRecords = categoriesData.length + productsData.length + ordersData.length + 
                        usersData.length + userSessionsData.length + apiKeysData.length + 
                        homePageContentData.length + preDeploymentsData.length + 
                        deploymentHistoryData.length + passwordResetTokensData.length + 
                        emailVerificationTokensData.length + provincesData.length + 
                        cantonsData.length + districtsData.length;
    console.log(`   🎯 Total: ${totalRecords} records across all tables`);

    console.log('\n🚀 Step 3: Migrating data to Supabase...');
    
    // Migrate data in order (respecting foreign key dependencies)
    
    // 1. Categories first (referenced by products)
    if (categoriesData.length > 0) {
      console.log(`   Migrating ${categoriesData.length} categories...`);
      await targetDb.insert(schema.categoriesTable).values(categoriesData).onConflictDoNothing();
    }

    // 2. Users (referenced by user sessions)
    if (usersData.length > 0) {
      console.log(`   Migrating ${usersData.length} users...`);
      await targetDb.insert(schema.users).values(usersData).onConflictDoNothing();
    }

    // 3. Products (references categories)
    if (productsData.length > 0) {
      console.log(`   Migrating ${productsData.length} products...`);
      await targetDb.insert(schema.products).values(productsData).onConflictDoNothing();
    }

    // 4. Orders (independent)
    if (ordersData.length > 0) {
      console.log(`   Migrating ${ordersData.length} orders...`);
      await targetDb.insert(schema.orders).values(ordersData).onConflictDoNothing();
    }

    // 5. User Sessions (references users) - only migrate sessions for users that exist
    if (userSessionsData.length > 0) {
      console.log(`   Migrating ${userSessionsData.length} user sessions...`);
      
      // Get the list of successfully migrated user IDs
      const migratedUsers = await targetDb.select({ id: schema.users.id }).from(schema.users);
      const migratedUserIds = new Set(migratedUsers.map(u => u.id));
      
      // Filter user sessions to only include those for existing users
      const validUserSessions = userSessionsData.filter(session => migratedUserIds.has(session.userId));
      const invalidSessionsCount = userSessionsData.length - validUserSessions.length;
      
      if (invalidSessionsCount > 0) {
        console.log(`   ⚠️  Skipping ${invalidSessionsCount} sessions with non-existent user references`);
      }
      
      if (validUserSessions.length > 0) {
        await targetDb.insert(schema.userSessions).values(validUserSessions).onConflictDoNothing();
        console.log(`   ✅ Successfully migrated ${validUserSessions.length} valid user sessions`);
      }
    }

    // 6. API Keys (independent)
    if (apiKeysData.length > 0) {
      console.log(`   Migrating ${apiKeysData.length} API keys...`);
      await targetDb.insert(schema.apiKeys).values(apiKeysData).onConflictDoNothing();
    }

    // 7. Home Page Content (independent)
    if (homePageContentData.length > 0) {
      console.log(`   Migrating ${homePageContentData.length} home page content entries...`);
      await targetDb.insert(schema.homePageContent).values(homePageContentData).onConflictDoNothing();
    }

    // 8. Pre-deployments (independent)
    if (preDeploymentsData.length > 0) {
      console.log(`   Migrating ${preDeploymentsData.length} pre-deployments...`);
      await targetDb.insert(schema.preDeployments).values(preDeploymentsData).onConflictDoNothing();
    }

    // 9. Deployment History (independent)
    if (deploymentHistoryData.length > 0) {
      console.log(`   Migrating ${deploymentHistoryData.length} deployment history entries...`);
      await targetDb.insert(schema.deploymentHistory).values(deploymentHistoryData).onConflictDoNothing();
    }

    // 10. Password Reset Tokens (references users) - only migrate tokens for existing users
    if (passwordResetTokensData.length > 0) {
      console.log(`   Migrating ${passwordResetTokensData.length} password reset tokens...`);
      
      // Get the list of successfully migrated user IDs
      const migratedUsers = await targetDb.select({ id: schema.users.id }).from(schema.users);
      const migratedUserIds = new Set(migratedUsers.map(u => u.id));
      
      // Filter tokens to only include those for existing users
      const validTokens = passwordResetTokensData.filter(token => migratedUserIds.has(token.userId));
      const invalidTokensCount = passwordResetTokensData.length - validTokens.length;
      
      if (invalidTokensCount > 0) {
        console.log(`   ⚠️  Skipping ${invalidTokensCount} tokens with non-existent user references`);
      }
      
      if (validTokens.length > 0) {
        await targetDb.insert(schema.passwordResetTokens).values(validTokens).onConflictDoNothing();
        console.log(`   ✅ Successfully migrated ${validTokens.length} valid password reset tokens`);
      }
    }

    // 10b. Email Verification Tokens (references users) - only migrate tokens for existing users
    if (emailVerificationTokensData.length > 0) {
      console.log(`   Migrating ${emailVerificationTokensData.length} email verification tokens...`);
      
      // Get the list of successfully migrated user IDs
      const migratedUsers = await targetDb.select({ id: schema.users.id }).from(schema.users);
      const migratedUserIds = new Set(migratedUsers.map(u => u.id));
      
      // Filter tokens to only include those for existing users
      const validTokens = emailVerificationTokensData.filter(token => migratedUserIds.has(token.userId));
      const invalidTokensCount = emailVerificationTokensData.length - validTokens.length;
      
      if (invalidTokensCount > 0) {
        console.log(`   ⚠️  Skipping ${invalidTokensCount} tokens with non-existent user references`);
      }
      
      if (validTokens.length > 0) {
        await targetDb.insert(schema.emailVerificationTokens).values(validTokens).onConflictDoNothing();
        console.log(`   ✅ Successfully migrated ${validTokens.length} valid email verification tokens`);
      }
    }

    // 11. Provinces (independent)
    if (provincesData.length > 0) {
      console.log(`   Migrating ${provincesData.length} provinces...`);
      await targetDb.insert(schema.provinces).values(provincesData).onConflictDoNothing();
    }

    // 12. Cantons (references provinces)
    if (cantonsData.length > 0) {
      console.log(`   Migrating ${cantonsData.length} cantons...`);
      await targetDb.insert(schema.cantons).values(cantonsData).onConflictDoNothing();
    }

    // 13. Districts (references provinces and cantons)
    if (districtsData.length > 0) {
      console.log(`   Migrating ${districtsData.length} districts...`);
      await targetDb.insert(schema.districts).values(districtsData).onConflictDoNothing();
    }

    console.log('\n✅ Migration completed successfully!');
    
    console.log('\n📝 Next steps:');
    console.log('   1. Update your DATABASE_URL environment variable to point to Supabase');
    console.log('   2. Test the application with the new database');
    console.log('   3. Remove the old Neon database when confirmed working');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    await sourceClient.end();
    await targetClient.end();
  }
}

// Run migration
migrateData().catch(console.error);