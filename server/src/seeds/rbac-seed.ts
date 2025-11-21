import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  modules,
  submodules,
  actions,
  roles,
  rolePermissions,
  type InsertModule,
  type InsertSubmodule,
  type InsertAction,
  type InsertRole,
  type InsertRolePermission,
} from '../entities';

// Default modules with lucide-react icons
const defaultModules: InsertModule[] = [
  {
    name: 'products',
    displayName: 'Products',
    description: 'Manage product catalog, inventory, and variants',
    icon: 'Package',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'orders',
    displayName: 'Orders',
    description: 'Process and manage customer orders',
    icon: 'ShoppingCart',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'customers',
    displayName: 'Customers',
    description: 'Manage customer profiles and segments',
    icon: 'Users',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'content',
    displayName: 'Content',
    description: 'Manage pages, banners, and navigation',
    icon: 'FileText',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'settings',
    displayName: 'Settings',
    description: 'Configure general, payment, shipping, and tax settings',
    icon: 'Settings',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'team',
    displayName: 'Team',
    description: 'Manage team members, roles, and invitations',
    icon: 'UserPlus',
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'analytics',
    displayName: 'Analytics',
    description: 'View dashboard and reports',
    icon: 'BarChart3',
    isActive: true,
    sortOrder: 7,
  },
];

// Submodules for each module
const defaultSubmodules: Record<string, Omit<InsertSubmodule, 'moduleId'>[]> = {
  products: [
    { name: 'inventory', displayName: 'Inventory', description: 'Manage stock levels', sortOrder: 1 },
    { name: 'pricing', displayName: 'Pricing', description: 'Manage product prices', sortOrder: 2 },
    { name: 'variants', displayName: 'Variants', description: 'Manage product variants', sortOrder: 3 },
  ],
  orders: [
    { name: 'processing', displayName: 'Processing', description: 'Process orders', sortOrder: 1 },
    { name: 'shipping', displayName: 'Shipping', description: 'Manage shipping', sortOrder: 2 },
    { name: 'returns', displayName: 'Returns', description: 'Handle returns', sortOrder: 3 },
  ],
  customers: [
    { name: 'profiles', displayName: 'Profiles', description: 'Customer profiles', sortOrder: 1 },
    { name: 'segments', displayName: 'Segments', description: 'Customer segments', sortOrder: 2 },
  ],
  content: [
    { name: 'pages', displayName: 'Pages', description: 'Manage pages', sortOrder: 1 },
    { name: 'banners', displayName: 'Banners', description: 'Manage banners', sortOrder: 2 },
    { name: 'navigation', displayName: 'Navigation', description: 'Manage navigation', sortOrder: 3 },
  ],
  settings: [
    { name: 'general', displayName: 'General', description: 'General settings', sortOrder: 1 },
    { name: 'payments', displayName: 'Payments', description: 'Payment settings', sortOrder: 2 },
    { name: 'shipping', displayName: 'Shipping', description: 'Shipping settings', sortOrder: 3 },
    { name: 'taxes', displayName: 'Taxes', description: 'Tax settings', sortOrder: 4 },
  ],
  team: [
    { name: 'members', displayName: 'Members', description: 'Team members', sortOrder: 1 },
    { name: 'roles', displayName: 'Roles', description: 'Role management', sortOrder: 2 },
    { name: 'invitations', displayName: 'Invitations', description: 'Manage invitations', sortOrder: 3 },
  ],
  analytics: [
    { name: 'dashboard', displayName: 'Dashboard', description: 'Analytics dashboard', sortOrder: 1 },
    { name: 'reports', displayName: 'Reports', description: 'Generate reports', sortOrder: 2 },
  ],
};

// Default actions
const defaultActions: InsertAction[] = [
  { name: 'create', displayName: 'Create', description: 'Create new items' },
  { name: 'read', displayName: 'Read', description: 'View items' },
  { name: 'update', displayName: 'Update', description: 'Edit existing items' },
  { name: 'delete', displayName: 'Delete', description: 'Remove items' },
  { name: 'export', displayName: 'Export', description: 'Export data' },
  { name: 'publish', displayName: 'Publish', description: 'Publish content' },
  { name: 'invite', displayName: 'Invite', description: 'Invite team members' },
  { name: 'remove', displayName: 'Remove', description: 'Remove team members' },
  { name: 'refund', displayName: 'Refund', description: 'Process refunds' },
  { name: 'cancel', displayName: 'Cancel', description: 'Cancel orders' },
];

// System roles
const systemRoles: InsertRole[] = [
  {
    name: 'platform_admin',
    displayName: 'Platform Admin',
    description: 'Full platform access with all permissions',
    isSystem: true,
    organizationId: null,
  },
  {
    name: 'owner',
    displayName: 'Owner',
    description: 'Full organization access with all permissions',
    isSystem: true,
    organizationId: null,
  },
  {
    name: 'admin',
    displayName: 'Admin',
    description: 'Administrative access with most permissions except some team and settings',
    isSystem: true,
    organizationId: null,
  },
  {
    name: 'manager',
    displayName: 'Manager',
    description: 'Can manage products and content, view orders and customers',
    isSystem: true,
    organizationId: null,
  },
  {
    name: 'staff',
    displayName: 'Staff',
    description: 'Read-only access to products, orders, customers, and analytics',
    isSystem: true,
    organizationId: null,
  },
];

// Permission matrix for each role
// Format: { moduleName: [actionNames] }
type PermissionMatrix = Record<string, string[]>;

const rolePermissionMatrix: Record<string, PermissionMatrix> = {
  platform_admin: {
    products: ['create', 'read', 'update', 'delete', 'export', 'publish'],
    orders: ['create', 'read', 'update', 'delete', 'export', 'refund', 'cancel'],
    customers: ['create', 'read', 'update', 'delete', 'export'],
    content: ['create', 'read', 'update', 'delete', 'publish'],
    settings: ['create', 'read', 'update', 'delete'],
    team: ['create', 'read', 'update', 'delete', 'invite', 'remove'],
    analytics: ['read', 'export'],
  },
  owner: {
    products: ['create', 'read', 'update', 'delete', 'export', 'publish'],
    orders: ['create', 'read', 'update', 'delete', 'export', 'refund', 'cancel'],
    customers: ['create', 'read', 'update', 'delete', 'export'],
    content: ['create', 'read', 'update', 'delete', 'publish'],
    settings: ['create', 'read', 'update', 'delete'],
    team: ['create', 'read', 'update', 'delete', 'invite', 'remove'],
    analytics: ['read', 'export'],
  },
  admin: {
    products: ['create', 'read', 'update', 'delete', 'export', 'publish'],
    orders: ['create', 'read', 'update', 'delete', 'export', 'refund', 'cancel'],
    customers: ['create', 'read', 'update', 'delete', 'export'],
    content: ['create', 'read', 'update', 'delete', 'publish'],
    settings: ['read', 'update'], // Limited settings access
    team: ['read', 'invite'], // Limited team access
    analytics: ['read', 'export'],
  },
  manager: {
    products: ['create', 'read', 'update', 'delete'],
    orders: ['read', 'update'],
    customers: ['read'],
    content: ['create', 'read', 'update', 'delete', 'publish'],
    analytics: ['read'],
  },
  staff: {
    products: ['read'],
    orders: ['read'],
    customers: ['read'],
    analytics: ['read'],
  },
};

/**
 * Seed modules into the database
 */
export async function seedModules(db: PostgresJsDatabase): Promise<Map<string, string>> {
  const moduleIdMap = new Map<string, string>();

  for (const module of defaultModules) {
    // Check if module already exists
    const existing = await db
      .select()
      .from(modules)
      .where(eq(modules.name, module.name))
      .limit(1);

    if (existing.length > 0) {
      moduleIdMap.set(module.name, existing[0].id);
      console.log(`Module '${module.name}' already exists, skipping...`);
      continue;
    }

    // Insert new module
    const [inserted] = await db.insert(modules).values(module).returning();
    moduleIdMap.set(module.name, inserted.id);
    console.log(`Created module: ${module.name}`);
  }

  return moduleIdMap;
}

/**
 * Seed submodules into the database
 */
export async function seedSubmodules(
  db: PostgresJsDatabase,
  moduleIdMap: Map<string, string>
): Promise<void> {
  for (const [moduleName, subs] of Object.entries(defaultSubmodules)) {
    const moduleId = moduleIdMap.get(moduleName);
    if (!moduleId) {
      console.warn(`Module '${moduleName}' not found, skipping submodules...`);
      continue;
    }

    for (const sub of subs) {
      // Check if submodule already exists
      const existing = await db
        .select()
        .from(submodules)
        .where(eq(submodules.moduleId, moduleId))
        .limit(100);

      const exists = existing.some((s) => s.name === sub.name);
      if (exists) {
        console.log(`Submodule '${sub.name}' for module '${moduleName}' already exists, skipping...`);
        continue;
      }

      // Insert new submodule
      await db.insert(submodules).values({
        ...sub,
        moduleId,
        isActive: true,
      });
      console.log(`Created submodule: ${moduleName}/${sub.name}`);
    }
  }
}

/**
 * Seed actions into the database
 */
export async function seedActions(db: PostgresJsDatabase): Promise<Map<string, string>> {
  const actionIdMap = new Map<string, string>();

  for (const action of defaultActions) {
    // Check if action already exists
    const existing = await db
      .select()
      .from(actions)
      .where(eq(actions.name, action.name))
      .limit(1);

    if (existing.length > 0) {
      actionIdMap.set(action.name, existing[0].id);
      console.log(`Action '${action.name}' already exists, skipping...`);
      continue;
    }

    // Insert new action
    const [inserted] = await db.insert(actions).values(action).returning();
    actionIdMap.set(action.name, inserted.id);
    console.log(`Created action: ${action.name}`);
  }

  return actionIdMap;
}

/**
 * Seed system roles into the database
 */
export async function seedRoles(db: PostgresJsDatabase): Promise<Map<string, string>> {
  const roleIdMap = new Map<string, string>();

  for (const role of systemRoles) {
    // Check if role already exists
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, role.name))
      .limit(1);

    if (existing.length > 0) {
      roleIdMap.set(role.name, existing[0].id);
      console.log(`Role '${role.name}' already exists, skipping...`);
      continue;
    }

    // Insert new role
    const [inserted] = await db.insert(roles).values(role).returning();
    roleIdMap.set(role.name, inserted.id);
    console.log(`Created role: ${role.name}`);
  }

  return roleIdMap;
}

/**
 * Seed role permissions into the database
 */
export async function seedRolePermissions(
  db: PostgresJsDatabase,
  roleIdMap: Map<string, string>,
  moduleIdMap: Map<string, string>,
  actionIdMap: Map<string, string>
): Promise<void> {
  for (const [roleName, permissions] of Object.entries(rolePermissionMatrix)) {
    const roleId = roleIdMap.get(roleName);
    if (!roleId) {
      console.warn(`Role '${roleName}' not found, skipping permissions...`);
      continue;
    }

    // Check if role already has permissions
    const existingPermissions = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))
      .limit(1);

    if (existingPermissions.length > 0) {
      console.log(`Permissions for role '${roleName}' already exist, skipping...`);
      continue;
    }

    // Create permissions for this role
    const permissionsToInsert: InsertRolePermission[] = [];

    for (const [moduleName, actionNames] of Object.entries(permissions)) {
      const moduleId = moduleIdMap.get(moduleName);
      if (!moduleId) {
        console.warn(`Module '${moduleName}' not found, skipping...`);
        continue;
      }

      for (const actionName of actionNames) {
        const actionId = actionIdMap.get(actionName);
        if (!actionId) {
          console.warn(`Action '${actionName}' not found, skipping...`);
          continue;
        }

        permissionsToInsert.push({
          roleId,
          moduleId,
          actionId,
          submoduleId: null, // Applies to all submodules
        });
      }
    }

    if (permissionsToInsert.length > 0) {
      await db.insert(rolePermissions).values(permissionsToInsert);
      console.log(`Created ${permissionsToInsert.length} permissions for role: ${roleName}`);
    }
  }
}

/**
 * Main seed function for the RBAC system
 */
export async function seedRBAC(db: PostgresJsDatabase): Promise<void> {
  console.log('Starting RBAC seed...');

  try {
    // Seed modules
    console.log('\n--- Seeding Modules ---');
    const moduleIdMap = await seedModules(db);

    // Seed submodules
    console.log('\n--- Seeding Submodules ---');
    await seedSubmodules(db, moduleIdMap);

    // Seed actions
    console.log('\n--- Seeding Actions ---');
    const actionIdMap = await seedActions(db);

    // Seed roles
    console.log('\n--- Seeding Roles ---');
    const roleIdMap = await seedRoles(db);

    // Seed role permissions
    console.log('\n--- Seeding Role Permissions ---');
    await seedRolePermissions(db, roleIdMap, moduleIdMap, actionIdMap);

    console.log('\nRBAC seed completed successfully!');
  } catch (error) {
    console.error('Error seeding RBAC:', error);
    throw error;
  }
}

// Export individual seeders for granular control
export {
  defaultModules,
  defaultSubmodules,
  defaultActions,
  systemRoles,
  rolePermissionMatrix,
};
