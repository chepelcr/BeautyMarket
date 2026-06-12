import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  modules,
  submodules,
  actions,
  roles,
  rolePermissions,
  submoduleActions,
  type InsertModule,
  type InsertSubmodule,
  type InsertAction,
  type InsertRole,
  type InsertRolePermission,
} from '../entities';

// Default module set assigned to every new organization
// (hooked into OrganizationService.create + org-modules-backfill seed)
//
// The catalog mirrors the POS sidebar 1:1 (legacy facturacion model:
// modules = sidebar sections / standalone items, submodules = section items).
// See templates/pos-system DashboardSidebar.tsx SECTIONS.
export const DEFAULT_ORG_MODULE_NAMES = [
  'panel',
  'documents',
  'commercial',
  'admin',
  'organization',
  'storefront',
  'reports',
];

// Default modules with lucide-react icons — mirror of the POS sidebar
const defaultModules: InsertModule[] = [
  {
    name: 'panel',
    displayName: 'Panel',
    description: 'Dashboard / panel general',
    icon: 'BarChart3',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'documents',
    displayName: 'Documentos',
    description: 'Documentos electrónicos y punto de venta (facturación Hacienda)',
    icon: 'FileText',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'commercial',
    displayName: 'Comercial',
    description: 'Productos, categorías, clientes, órdenes y confirmaciones',
    icon: 'ShoppingCart',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'admin',
    displayName: 'Administración interna',
    description: 'Organización, puestos, miembros, roles y sesiones',
    icon: 'Users',
    isActive: true,
    sortOrder: 4,
  },
  {
    // Fine-grained twin of the `admin/organization` sidebar item: the org
    // settings page hosts 9 config sections (cards), each a submodule here so
    // roles can grant per-section read/update. The sidebar item itself stays
    // gated by admin/organization.
    name: 'organization',
    displayName: 'Organización (configuración)',
    description: 'Secciones de configuración de la organización (fiscal, Hacienda, tema, contacto, pagos, envíos…)',
    icon: 'Settings',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'storefront',
    displayName: 'Storefront',
    description: 'Contenido, galería, plantillas y despliegues de la tienda',
    icon: 'Store',
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'reports',
    displayName: 'Reportes',
    description: 'Reportería y analítica',
    icon: 'TrendingUp',
    isActive: true,
    sortOrder: 7,
  },
];

// Submodules for each module — mirror of the POS sidebar section items.
// Standalone sidebar items get a single submodule so the role matrix can
// always render at least one grantable row per module.
const defaultSubmodules: Record<string, Omit<InsertSubmodule, 'moduleId'>[]> = {
  panel: [
    { name: 'overview', displayName: 'Panel', description: 'Vista general', sortOrder: 1 },
  ],
  documents: [
    { name: 'emitted', displayName: 'Emitidos', description: 'Documentos emitidos', sortOrder: 1 },
    { name: 'received', displayName: 'Recibidos', description: 'Documentos recibidos', sortOrder: 2 },
    // Per-doc-type create gates (mirror POS DOCUMENT_TYPES; submodule name =
    // short code lowercase). Sensitive types (NC/ND) are NOT granted to staff.
    { name: 'fe', displayName: 'Factura Electrónica', description: 'Crear facturas electrónicas (01)', sortOrder: 3 },
    { name: 'te', displayName: 'Tiquete Electrónico', description: 'Crear tiquetes electrónicos (04)', sortOrder: 4 },
    { name: 'nc', displayName: 'Nota de Crédito', description: 'Crear notas de crédito (03)', sortOrder: 5 },
    { name: 'nd', displayName: 'Nota de Débito', description: 'Crear notas de débito (02)', sortOrder: 6 },
    { name: 'fc', displayName: 'Factura de Compra', description: 'Crear facturas de compra (08)', sortOrder: 7 },
    { name: 'fexp', displayName: 'Factura Exportación', description: 'Crear facturas de exportación (09)', sortOrder: 8 },
  ],
  commercial: [
    { name: 'products', displayName: 'Productos', description: 'Catálogo de productos', sortOrder: 1 },
    { name: 'categories', displayName: 'Categorías', description: 'Categorías de productos', sortOrder: 2 },
    { name: 'clients', displayName: 'Clientes', description: 'Clientes', sortOrder: 3 },
    { name: 'orders', displayName: 'Órdenes', description: 'Órdenes / pedidos', sortOrder: 4 },
    { name: 'confirmations', displayName: 'Confirmaciones', description: 'Confirmaciones', sortOrder: 5 },
  ],
  admin: [
    { name: 'organization', displayName: 'Organización', description: 'Configuración de la organización', sortOrder: 1 },
    { name: 'stations', displayName: 'Puestos', description: 'Puestos / estaciones', sortOrder: 2 },
    { name: 'members', displayName: 'Miembros', description: 'Miembros del equipo', sortOrder: 3 },
    { name: 'roles', displayName: 'Roles', description: 'Gestión de roles y permisos', sortOrder: 4 },
    { name: 'sessions', displayName: 'Sesiones', description: 'Sesiones de caja', sortOrder: 5 },
  ],
  // Mirrors the OrgSettingsPage card grid 1:1 (card ids in tsuru-pos-system).
  organization: [
    { name: 'fiscal-info', displayName: 'Información fiscal', description: 'Identidad fiscal registrada (Hacienda)', sortOrder: 1 },
    { name: 'hacienda', displayName: 'Hacienda', description: 'Credenciales y conexión con Hacienda (ATV)', sortOrder: 2 },
    { name: 'notifications', displayName: 'Notificaciones', description: 'Notificaciones de la organización', sortOrder: 3 },
    { name: 'theme', displayName: 'Tema', description: 'Tema del panel POS', sortOrder: 4 },
    { name: 'general', displayName: 'General', description: 'Información general de la organización', sortOrder: 5 },
    { name: 'branding', displayName: 'Branding', description: 'Identidad visual de la tienda', sortOrder: 6 },
    { name: 'contact', displayName: 'Contacto', description: 'Datos de contacto y redes', sortOrder: 7 },
    { name: 'payment', displayName: 'Pagos', description: 'Configuración de métodos de pago', sortOrder: 8 },
    { name: 'shipping', displayName: 'Envíos', description: 'Configuración de envíos', sortOrder: 9 },
  ],
  storefront: [
    { name: 'content', displayName: 'Contenido', description: 'Contenido de la tienda', sortOrder: 1 },
    { name: 'gallery', displayName: 'Galería', description: 'Galería de imágenes', sortOrder: 2 },
    { name: 'templates', displayName: 'Plantillas', description: 'Plantillas de la tienda', sortOrder: 3 },
    { name: 'deployments', displayName: 'Despliegues', description: 'Publicaciones de la tienda', sortOrder: 4 },
  ],
  reports: [
    { name: 'general', displayName: 'Reportes', description: 'Reportes y analítica', sortOrder: 1 },
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
  { name: 'upload', displayName: 'Upload', description: 'Upload or import files' }, // legacy 'subir'
];

// Which actions are grantable per submodule (submodule_actions matrix).
// Format: 'module/submodule' → action names. '*' = baseline CRUD for every
// submodule of every module unless an explicit override entry exists.
const BASELINE_SUBMODULE_ACTIONS = ['create', 'read', 'update', 'delete'];

const submoduleActionMatrix: Record<string, string[]> = {
  // Extras on top of baseline CRUD
  'commercial/products': [...BASELINE_SUBMODULE_ACTIONS, 'upload', 'export'],
  'commercial/clients': [...BASELINE_SUBMODULE_ACTIONS, 'upload', 'export'],
  'commercial/orders': [...BASELINE_SUBMODULE_ACTIONS, 'cancel', 'export'],
  'admin/members': [...BASELINE_SUBMODULE_ACTIONS, 'invite', 'remove'],
  'storefront/content': [...BASELINE_SUBMODULE_ACTIONS, 'publish'],
  'storefront/gallery': [...BASELINE_SUBMODULE_ACTIONS, 'upload'],
  // Restricted sets (override the baseline entirely)
  'panel/overview': ['read'],
  'documents/emitted': ['create', 'read', 'update', 'cancel', 'export', 'upload'],
  'documents/received': ['read', 'export'],
  // Doc-type submodules are pure create-gates (viewing happens via emitted)
  'documents/fe': ['create'],
  'documents/te': ['create'],
  'documents/nc': ['create'],
  'documents/nd': ['create'],
  'documents/fc': ['create'],
  'documents/fexp': ['create'],
  'commercial/confirmations': ['create', 'read', 'update'], // create: POS CreateConfirmationDialog
  'admin/organization': ['read', 'update'],
  'admin/sessions': ['create', 'read', 'update'],
  // Org config sections are read/update-only (config pages — nothing to create/delete)
  'organization/fiscal-info': ['read', 'update'],
  'organization/hacienda': ['read', 'update'],
  'organization/notifications': ['read', 'update'],
  'organization/theme': ['read', 'update'],
  'organization/general': ['read', 'update'],
  'organization/branding': ['read', 'update'],
  'organization/contact': ['read', 'update'],
  'organization/payment': ['read', 'update'],
  'organization/shipping': ['read', 'update'],
  'storefront/templates': ['read', 'update'],
  'storefront/deployments': ['create', 'read'],
  'reports/general': ['read', 'export'],
};

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
// Format: { moduleName: [actionNames] } — module-wide grant (submodule_id NULL,
// expands to every submodule where the action is grantable), or
// { 'moduleName/submoduleName': [actionNames] } — submodule-specific grant
// (used to restrict sensitive submodules, e.g. staff can create FE/TE but not
// NC/ND credit/debit notes).
type PermissionMatrix = Record<string, string[]>;

const rolePermissionMatrix: Record<string, PermissionMatrix> = {
  platform_admin: {
    panel: ['read'],
    documents: ['create', 'read', 'update', 'cancel', 'export', 'upload'],
    commercial: ['create', 'read', 'update', 'delete', 'cancel', 'export', 'upload'],
    admin: ['create', 'read', 'update', 'delete', 'invite', 'remove'],
    organization: ['read', 'update'],
    storefront: ['create', 'read', 'update', 'delete', 'publish', 'upload'],
    reports: ['read', 'export'],
  },
  owner: {
    panel: ['read'],
    documents: ['create', 'read', 'update', 'cancel', 'export', 'upload'],
    commercial: ['create', 'read', 'update', 'delete', 'cancel', 'export', 'upload'],
    admin: ['create', 'read', 'update', 'delete', 'invite', 'remove'],
    organization: ['read', 'update'],
    storefront: ['create', 'read', 'update', 'delete', 'publish', 'upload'],
    reports: ['read', 'export'],
  },
  admin: {
    panel: ['read'],
    documents: ['create', 'read', 'update', 'cancel', 'export', 'upload'],
    commercial: ['create', 'read', 'update', 'delete', 'cancel', 'export', 'upload'],
    admin: ['create', 'read', 'update', 'invite'], // no delete (roles/members), no remove
    organization: ['read', 'update'],
    storefront: ['create', 'read', 'update', 'delete', 'publish', 'upload'],
    reports: ['read', 'export'],
  },
  manager: {
    panel: ['read'],
    documents: ['create', 'read', 'update'],
    commercial: ['create', 'read', 'update', 'delete'],
    storefront: ['create', 'read', 'update', 'publish'],
    reports: ['read'],
  },
  staff: {
    panel: ['read'],
    // Cashier: sells via POS (emitted documents) and may only create the
    // non-sensitive doc types — invoices and tickets. NO credit/debit notes
    // (nc/nd), purchase (fc) or export (fexp) invoices.
    'documents/emitted': ['create', 'read'],
    'documents/fe': ['create'],
    'documents/te': ['create'],
    commercial: ['read'],
    reports: ['read'],
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
 * Seed the submodule_actions matrix (which actions are grantable per
 * submodule). Idempotent: skips existing (submoduleId, actionId) pairs.
 */
export async function seedSubmoduleActions(
  db: PostgresJsDatabase,
  moduleIdMap: Map<string, string>,
  actionIdMap: Map<string, string>
): Promise<void> {
  const allSubmodules = await db.select().from(submodules);
  const existingPairs = await db.select().from(submoduleActions);
  const existingSet = new Set(existingPairs.map((row) => `${row.submoduleId}|${row.actionId}`));

  // moduleId → module name reverse lookup
  const moduleNameById = new Map<string, string>();
  moduleIdMap.forEach((id, name) => {
    moduleNameById.set(id, name);
  });

  const toInsert: { submoduleId: string; actionId: string }[] = [];

  for (const submodule of allSubmodules) {
    const moduleName = moduleNameById.get(submodule.moduleId);
    if (!moduleName) continue;

    const key = `${moduleName}/${submodule.name}`;
    const actionNames = submoduleActionMatrix[key] ?? BASELINE_SUBMODULE_ACTIONS;

    for (const actionName of actionNames) {
      const actionId = actionIdMap.get(actionName);
      if (!actionId) {
        console.warn(`Action '${actionName}' not found, skipping for ${key}...`);
        continue;
      }

      if (existingSet.has(`${submodule.id}|${actionId}`)) continue;

      toInsert.push({ submoduleId: submodule.id, actionId });
      existingSet.add(`${submodule.id}|${actionId}`);
    }
  }

  if (toInsert.length > 0) {
    await db.insert(submoduleActions).values(toInsert);
    console.log(`Created ${toInsert.length} submodule_actions rows`);
  } else {
    console.log('submodule_actions matrix already up to date, skipping...');
  }
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
  // 'module/submodule' lookup for submodule-specific matrix keys
  const allSubmodules = await db.select().from(submodules);
  const moduleNameById = new Map<string, string>();
  moduleIdMap.forEach((id, name) => moduleNameById.set(id, name));
  const submoduleIdByPath = new Map<string, string>();
  for (const sub of allSubmodules) {
    const moduleName = moduleNameById.get(sub.moduleId);
    if (moduleName) submoduleIdByPath.set(`${moduleName}/${sub.name}`, sub.id);
  }

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

    for (const [matrixKey, actionNames] of Object.entries(permissions)) {
      // 'module' → module-wide grant; 'module/submodule' → specific grant
      const [moduleName, submoduleName] = matrixKey.split('/');
      const moduleId = moduleIdMap.get(moduleName);
      if (!moduleId) {
        console.warn(`Module '${moduleName}' not found, skipping...`);
        continue;
      }

      let submoduleId: string | null = null;
      if (submoduleName) {
        submoduleId = submoduleIdByPath.get(matrixKey) ?? null;
        if (!submoduleId) {
          console.warn(`Submodule '${matrixKey}' not found, skipping...`);
          continue;
        }
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
          submoduleId, // null = applies to all submodules of the module
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
export async function seedRBAC(db: PostgresJsDatabase<any>): Promise<void> {
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

    // Seed submodule_actions matrix
    console.log('\n--- Seeding Submodule Actions ---');
    await seedSubmoduleActions(db, moduleIdMap, actionIdMap);

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
