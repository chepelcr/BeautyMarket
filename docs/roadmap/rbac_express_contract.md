# RBAC Express Implementation Contract

**Status**: APPROVED CONTRACT — implementation agents code against this verbatim.
**Owner backend**: the Express server at `E:/dev/BeautyMarket/server` (decision 2026-06-11; see `docs/RBAC_ORG_MODULES_PORT.md` §5).
**Design source**: `docs/RBAC_ORG_MODULES_PORT.md` (§3 entity mapping, §4 schema + rules, §6 seeding).

Hard rules for implementers:

- Three-tier pattern: Controller → Service → Repository (`server/src/controllers|services|repositories`), wired as manual singletons in `server/src/dependency_injection.ts`.
- Entities in `server/src/entities/`, exported from `server/src/entities/index.ts` (that is what `drizzle.config.ts` points at).
- Migrations: `npm run db:generate` then `npm run db:migrate`. **NEVER `npm run db:push`.**
- Never `git commit` / `git push`. Leave changes in the working tree.
- Do not touch files outside this workstream (the repo has unrelated uncommitted user changes).

---

## 1. Drizzle entities

All three new entities follow the existing house style exactly (compare `server/src/entities/RolePermission.ts`): `varchar` UUID PK with `default(sql\`gen_random_uuid()\`)`, `pgPolicy("<table>_authenticated_access", { as: "permissive", to: "authenticated", for: "all", using: sql\`true\`, withCheck: sql\`true\` })`, `.enableRLS()`, and `$inferSelect` / `$inferInsert` type exports. Add the unique constraints with `unique(...)` from `drizzle-orm/pg-core` in the table-extras array next to the policy.

### 1.1 `server/src/entities/SubmoduleAction.ts` — NEW table `submodule_actions`

Which actions are valid per submodule (port of legacy `submodulos_acciones`); drives the matrix UI and validates grants.

| Column | Drizzle definition |
|---|---|
| `id` | `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)` |
| `submoduleId` | `varchar("submodule_id").notNull().references(() => submodules.id, { onDelete: "cascade" })` |
| `actionId` | `varchar("action_id").notNull().references(() => actions.id, { onDelete: "cascade" })` |

Constraints: `unique("submodule_actions_submodule_action_uq").on(table.submoduleId, table.actionId)`.

Exports: `submoduleActions`, `type SubmoduleAction`, `type InsertSubmoduleAction`.

### 1.2 `server/src/entities/OrganizationModule.ts` — NEW table `organization_modules`

Platform-managed module assignment per org (Tsuru admin writes this).

| Column | Drizzle definition |
|---|---|
| `id` | `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)` |
| `organizationId` | `varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" })` |
| `moduleId` | `varchar("module_id").notNull().references(() => modules.id, { onDelete: "cascade" })` |
| `isEnabled` | `boolean("is_enabled").default(true).notNull()` — platform can disable without unassigning |
| `assignedBy` | `varchar("assigned_by").references(() => users.id, { onDelete: "set null" })` — nullable; platform-admin user id; null for seeded/backfilled rows |
| `assignedAt` | `timestamp("assigned_at").default(sql\`now()\`).notNull()` |

Constraints: `unique("organization_modules_org_module_uq").on(table.organizationId, table.moduleId)`.

Exports: `organizationModules`, `type OrganizationModule`, `type InsertOrganizationModule`.

### 1.3 `server/src/entities/OrganizationSubmodule.ts` — NEW table `organization_submodules`

Override-only fine grain: **no row = inherited enabled** (when the parent module is assigned+enabled). A row exists only to override.

| Column | Drizzle definition |
|---|---|
| `id` | `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)` |
| `organizationId` | `varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" })` |
| `submoduleId` | `varchar("submodule_id").notNull().references(() => submodules.id, { onDelete: "cascade" })` |
| `isEnabled` | `boolean("is_enabled").default(false).notNull()` |

Constraints: `unique("organization_submodules_org_submodule_uq").on(table.organizationId, table.submoduleId)`.

Exports: `organizationSubmodules`, `type OrganizationSubmodule`, `type InsertOrganizationSubmodule`.

### 1.4 CHANGED: `server/src/entities/Role.ts`

Add one column (the §3 `roles.estado` simplification — soft-disable):

```ts
isActive: boolean("is_active").default(true).notNull(),
```

### 1.5 `server/src/entities/index.ts`

Append to the RBAC block:

```ts
export { submoduleActions, type SubmoduleAction, type InsertSubmoduleAction } from "./SubmoduleAction";
export { organizationModules, type OrganizationModule, type InsertOrganizationModule } from "./OrganizationModule";
export { organizationSubmodules, type OrganizationSubmodule, type InsertOrganizationSubmodule } from "./OrganizationSubmodule";
```

Then `npm run db:generate` to produce the migration under `./migrations` (review the SQL by hand) and apply with `npm run db:migrate`.

---

## 2. Shared DTO vocabulary

```ts
// Permission grant row (request + response)
interface PermissionGrantDto {
  moduleId: string;
  submoduleId: string | null;   // null = module-wide grant (all submodules of the module)
  actionId: string;
}

// Available matrix (org-scoped, already intersected with the org's assignment)
interface AvailableMatrixDto {
  modules: Array<{
    id: string; name: string; displayName: string; icon: string | null; sortOrder: number;
    submodules: Array<{
      id: string; name: string; displayName: string; sortOrder: number;
      actions: Array<{ id: string; name: string; displayName: string }>; // from submodule_actions
    }>;
  }>;
}

// My-permissions (FE nav/action gating)
interface MyPermissionsDto {
  role: { id: string; name: string; displayName: string; isSystem: boolean; isActive: boolean };
  isOwner: boolean;            // role.name === 'owner'
  isAdmin: boolean;            // owner || admin
  modules: string[];           // module names available AND reachable by this role (nav gating)
  permissions: string[];       // flattened effective grants, format "module:submodule:action"
                               // module-wide grants are EXPANDED per available submodule
}

interface RoleDto {            // = Role $inferSelect
  id: string; name: string; displayName: string; description: string | null;
  isSystem: boolean; isActive: boolean; organizationId: string | null; createdAt: string;
}

interface ErrorDto { error: string; message?: string }
```

Status conventions (match existing controllers, e.g. `RBACController.ts`): 200/201 success, 400 validation, 401 no auth, 403 permission denied, 404 not found / not visible to org, 409 conflict, 500 unexpected.

---

## 3. Endpoints

### 3.0 Middleware fixes that gate everything (ship first)

1. **`requirePermission` org-param bug** — `server/src/middleware/permissions.ts:22` (and :72, :119) reads `req.params.organizationId`, but the org-scoped router is mounted at `app.use('/api/users/:userId/organization/:orgId', orgScopedRouter)` (`server/src/routes.ts:64`), so the param is **`orgId`**. Change all three to `req.params.orgId || req.params.organizationId || req.organization?.id`.
2. **`req.userId` population** — nothing sets it today. Add `attachUserId` middleware in `server/src/middleware/permissions.ts` (exported beside `requireAuth`): prefer `req.params.userId` (API Gateway already validates the path userId against the JWT `sub` — CLAUDE.md security model); fallback for `/api/admin` and local dev: decode the `Authorization: Bearer` JWT payload and use `sub` (signature already verified at the edge by API Gateway; local dev tolerates decode-only). Mount it on the org-scoped router (`routes.ts:64` group) and on the new `/api/admin` group.
3. **`requirePlatformAdmin`** — implement the placeholder at `server/src/middleware/permissions.ts:181-210` (`createRequirePlatformAdmin`): load the user via `UserRepository.findById(req.userId)` and require `user.role === 'platform_admin'` (`users.role` column exists, `server/src/entities/User.ts:14`). Inject `userRepository` via a new factory parameter; export the instance from `dependency_injection.ts` as `requirePlatformAdmin`.
4. **Rollout flag** — `RBAC_ENFORCEMENT=enforce|log|off` env var read inside `requirePermission`: `off` → next() always; `log` → evaluate, log denials, next(); `enforce` → 403 on deny. Default `log` until POS role UI ships (port doc §7.3).

### 3.1 Org-scoped group (POS consumes)

Mount: existing `orgScopedRouter.use('/rbac', rbacController.getRouter())` at `server/src/routes.ts:37`, under `/api/users/:userId/organization/:orgId` (`routes.ts:64`). Controller: extend `server/src/controllers/RBACController.ts`. `mergeParams: true` is already set.

| # | METHOD + path | Purpose | Request → Response | Guard |
|---|---|---|---|---|
| O1 | `GET /api/users/:userId/organization/:orgId/rbac/my-permissions` | NEW. FE nav/action gating; resolves the caller's effective permissions (role grants ∩ org module assignment) | — → `MyPermissionsDto`; 403 if caller not a member of `:orgId` | membership only (`attachUserId` + service returns 403 when `organization_members(userId, orgId)` absent) — every member may read their own |
| O2 | `GET /api/users/:userId/organization/:orgId/rbac/available-matrix` | NEW. Modules → submodules → grantable actions **for this org** (drives the role-matrix UI; direct port of legacy `permisos_modulo.php` data) | — → `AvailableMatrixDto` (only module rows with `modules.isActive` ∧ assigned ∧ enabled; submodules filtered by override rule; actions from `submodule_actions`) | `requirePermission('team','read','roles')` |
| O3 | `GET .../rbac/roles` | EXISTING. System role templates (`isSystem=true`, excluding `platform_admin` from the response — it is never org-assignable) | — → `RoleDto[]` | `requirePermission('team','read','roles')` |
| O4 | `GET .../rbac/roles/organization` | EXISTING. Org roles + system templates | — → `RoleDto[]` (service called with `:orgId` from path — fix `RBACController.getOrganizationRoles` at `RBACController.ts:76` which reads `req.params.organizationId`; the mount param is `orgId`) | `requirePermission('team','read','roles')` |
| O5 | `GET .../rbac/roles/:id` | EXISTING. Role detail | — → `RoleDto`; **404 unless `role.organizationId === orgId` or `role.isSystem`** (cross-org read fix) | `requirePermission('team','read','roles')` |
| O6 | `POST .../rbac/roles` | EXISTING, hardened. Create org role | `{ name: string; displayName?: string; description?: string }` → 201 `RoleDto`. `organizationId` **forced from `:orgId` path** (current controller takes it from body — `RBACController.ts:148` — that is an org-spoof hole; remove), `isSystem: false`, `isActive: true`. 400 on duplicate name in org | `requirePermission('team','create','roles')` |
| O7 | `PUT .../rbac/roles/:id` | EXISTING, hardened. Update org role | `{ name?; displayName?; description?; isActive?: boolean }` → `RoleDto`. 404 if role not owned by `:orgId`; 400 if `isSystem` | `requirePermission('team','update','roles')` |
| O8 | `DELETE .../rbac/roles/:id` | EXISTING, hardened. Delete org role | — → `{ message }`. 404 if not owned by `:orgId`; 400 if `isSystem`; **409 if any `organization_members.roleId` references it** (suggest reassign first) | `requirePermission('team','delete','roles')` |
| O9 | `GET .../rbac/roles/:id/permissions` | EXISTING. Role grant rows | — → `PermissionGrantDto[]` (404 scope rule as O5; system-template grants readable) | `requirePermission('team','read','roles')` |
| O10 | `PUT .../rbac/roles/:id/permissions` | EXISTING, hardened. **Bulk permission set, subset-validated** | `{ permissions: PermissionGrantDto[] }` (also accept legacy bare array for back-compat) → `{ message, count }`. Validations: role owned by `:orgId` (404), not `isSystem` (400), **every grant ∈ org available matrix** (V2 below; 400 with the offending tuples listed in `message`). Replace-all semantics via `RBACRepository.setRolePermissions` | `requirePermission('team','update','roles')` |
| O11 | `PUT .../rbac/members/:memberId/role` | NEW. Assign role to a member (org-scoped home for the same-org rule) | `{ roleId: string }` → updated `OrganizationMember`. Validations: member belongs to `:orgId` (404); **same-org role rule V3**; `role.isActive` (400); last-owner protection (reuse `MembershipService.updateMemberRole` logic, `MembershipService.ts:89-117`, and ADD V3 there too since `PUT /api/users/:userId/memberships/:memberId/role` stays mounted — `MembershipController.ts:23`) | `requirePermission('team','update','members')` |
| O12 | `GET .../rbac/modules` | EXISTING. Global active catalog (kept for back-compat; POS role UI must use O2 instead) | — → `ModuleWithSubmodules[]` | `requirePermission('team','read','roles')` |
| O13 | `GET .../rbac/actions` | EXISTING. Global action catalog | — → `Action[]` | `requirePermission('team','read','roles')` |
| O14 | `POST .../rbac/check-permission` | EXISTING, hardened. Ad-hoc check | `{ module: string; action: string; submodule?: string }` → `{ hasPermission: boolean }`. **`userId`/`organizationId` forced from path params** (current body-driven version — `RBACController.ts:407` — lets any caller probe other users/orgs) | membership only (self-check) |
| O15 | `GET .../rbac/user-role` | EXISTING. Caller's role in org | — → `RoleDto`; 404 if not a member (fix param read: `orgId`, not `organizationId` — `RBACController.ts:453`) | membership only |

### 3.2 Platform-admin group (landing admin / Tsuru admin consumes)

Mount: NEW in `server/src/routes.ts`:

```ts
const adminRouter = Router({ mergeParams: true });
adminRouter.use(attachUserId, requirePlatformAdmin);
adminRouter.use('/', platformAdminController.getRouter());
app.use('/api/admin', adminRouter);
```

New `server/src/controllers/PlatformAdminController.ts` + `server/src/services/PlatformRBACService.ts` + `server/src/repositories/OrganizationModuleRepository.ts` (org_modules + org_submodules + submodule_actions data access; catalog writes can extend `RBACRepository`). Wire all in `dependency_injection.ts` following the existing singleton pattern.

**Every endpoint below is guarded by `requirePlatformAdmin` (users.role === 'platform_admin')** — applied once at the router mount; per-row guard column omitted.

Org assignment + org search:

| # | METHOD + path | Purpose | Request → Response |
|---|---|---|---|
| P1 | `GET /api/admin/organizations?search=&page=1&pageSize=20&isActive=` | Org search/list for the admin UI | → `{ items: Array<{ id, name, slug, subdomain, plan, isActive, onboardingStep, createdAt, moduleCount: number }>, total, page, pageSize }`. `search` matches `name ILIKE` / `slug ILIKE` / `subdomain ILIKE` |
| P2 | `GET /api/admin/organizations/:orgId/modules` | Assignment state for one org (admin module-toggle screen) | → `Array<{ module: Module; assigned: boolean; isEnabled: boolean; assignedBy: string \| null; assignedAt: string \| null; submodules: Array<{ submodule: Submodule; effectiveEnabled: boolean; override: boolean \| null }> }>` — lists the FULL catalog (incl. unassigned and inactive modules) so the admin can toggle; `override` = raw `organization_submodules.is_enabled` or `null` when no row |
| P3 | `PUT /api/admin/organizations/:orgId/modules/:moduleId` | Assign / unassign / enable / disable a module for an org (upsert) | `{ assigned: boolean; isEnabled?: boolean }` → P2 row for this module. `assigned:true` upserts `organization_modules` (sets `assignedBy = req.userId`, `isEnabled` default `true`); `assigned:false` **deletes** the row (its `organization_submodules` overrides for that module's submodules are also deleted); `isEnabled:false` keeps the row but disables (kill-switch — takes effect immediately via V4) |
| P4 | `PUT /api/admin/organizations/:orgId/submodules/:submoduleId` | Per-org submodule override | `{ isEnabled: boolean \| null }` → P2 submodule row. `true`/`false` upserts the override row; `null` deletes it (back to inherit). 400 if the parent module is not assigned to the org |
| P5 | `POST /api/admin/organizations/:orgId/modules/apply-defaults` | Apply the default module set to one org (manual backfill helper) | — → `{ added: string[] }` (module names inserted; idempotent — existing rows untouched) |

Catalog CRUD (port of legacy `configuracion → modulos`):

| # | METHOD + path | Purpose | Request → Response |
|---|---|---|---|
| P6 | `GET /api/admin/rbac/modules?includeInactive=true` | Full module catalog with submodules and each submodule's available actions | → `Array<Module & { submodules: Array<Submodule & { actions: Action[] }> }>` |
| P7 | `POST /api/admin/rbac/modules` | Create module | `{ name; displayName; description?; icon?; isActive?; sortOrder? }` → 201 `Module`; 400 on duplicate `name` |
| P8 | `PUT /api/admin/rbac/modules/:moduleId` | Update module (incl. `isActive` soft-disable — preferred over delete) | partial of P7 body → `Module`; 404 |
| P9 | `DELETE /api/admin/rbac/modules/:moduleId` | Delete module | → `{ message }`. **409 if any `role_permissions` or `organization_modules` rows reference it** — force explicit cleanup; never rely on silent cascade for catalog deletes |
| P10 | `POST /api/admin/rbac/modules/:moduleId/submodules` | Create submodule | `{ name; displayName; description?; isActive?; sortOrder? }` → 201 `Submodule`; 400 duplicate name within module |
| P11 | `PUT /api/admin/rbac/submodules/:submoduleId` | Update submodule | partial → `Submodule`; 404 |
| P12 | `DELETE /api/admin/rbac/submodules/:submoduleId` | Delete submodule | → `{ message }`; 409 if referenced by `role_permissions` or `organization_submodules` |
| P13 | `GET /api/admin/rbac/actions` | Action catalog | → `Action[]` |
| P14 | `POST /api/admin/rbac/actions` | Create action | `{ name; displayName; description? }` → 201 `Action`; 400 duplicate |
| P15 | `PUT /api/admin/rbac/actions/:actionId` | Update action | partial → `Action`; 404 |
| P16 | `DELETE /api/admin/rbac/actions/:actionId` | Delete action | → `{ message }`; 409 if referenced by `role_permissions` or `submodule_actions` |
| P17 | `GET /api/admin/rbac/submodules/:submoduleId/actions` | Available actions of a submodule (`submodule_actions`) | → `Action[]` |
| P18 | `PUT /api/admin/rbac/submodules/:submoduleId/actions` | **Bulk replace** a submodule's available-action set | `{ actionIds: string[] }` → `{ message, count }`. Replace-all semantics (delete rows for the submodule, insert the new set). 400 on unknown `actionId`. Note in response when removed actions orphan existing `role_permissions` grants (grants stay but become non-grantable — runtime rule V4 already nullifies them) |

---

## 4. Validation rules (service layer — single source of truth)

- **V1 — Effective availability** (define ONCE in `PlatformRBACService`/`RBACService`, reuse everywhere; port doc §4):
  `submoduleAvailable(org, submodule) = module.isActive AND organization_modules(org, module).is_enabled AND COALESCE(organization_submodules(org, submodule).is_enabled, true)`
  `actionGrantable(org, submodule, action) = submoduleAvailable AND (submodule_id, action_id) ∈ submodule_actions`
- **V2 — Subset rule** (O10 write-time): every `PermissionGrantDto` saved on an **org role** must satisfy `actionGrantable` per V1. A `submoduleId: null` (module-wide) grant is valid only when the module is assigned+enabled for the org AND the action is available on **at least one** of the module's available submodules; at runtime it only takes effect per-submodule via V4. Reject the whole batch with 400 listing offending tuples — no partial writes.
- **V3 — Same-org role rule** (O11 + `MembershipService.addMember`/`updateMemberRole`, and `InvitationService` role selection): assignable `roleId` must satisfy `role.organizationId === orgId OR (role.isSystem AND role.organizationId IS NULL)`, AND `role.isActive === true`, AND `role.name !== 'platform_admin'`. Today nothing prevents cross-org role assignment (`MembershipService.ts:74,96` only checks existence) — close this in the service so both the legacy memberships route and O11 are covered.
- **V4 — Effective permission formula** (runtime; replaces `RBACService.hasPermission`, `RBACService.ts:124-138`):
  ```
  allowed(user, org, module, submodule?, action) =
    member = organization_members(user, org)                      // absent → deny (403)
    role   = roles[member.roleId]; role.isActive must be true     // disabled role → deny
    role must satisfy V3 scope (same org or system)               // stale cross-org role → deny
    availability: V1 must hold for (module, submodule)            // platform disable wins instantly
      — when submodule omitted: at least one available submodule of the module
    grant: ∃ role_permissions(role, module, submodule|NULL, action)
      — EXCEPT role.name === 'owner': owner resolves as ALL grantable actions of the
        org's available matrix (no static grant rows needed; port doc §6)
    user-level bypass: users.role === 'platform_admin' → allow (still log)
  ```
  Drop the current membership-role-name `platform_admin` bypass (`RBACService.ts:129-130`); platform admin is a **user** attribute (`users.role`), not an org role.
- **V5 — Deny-by-default**: no membership → 403; no grant row → 403; module unassigned/disabled or submodule overridden off → 403 even when stale grant rows exist (no cleanup required — V4 re-intersects every check). Subject to the `RBAC_ENFORCEMENT` rollout flag (§3.0.4).
- **V6 — Role CRUD scoping**: org endpoints (O5–O10) operate only on roles where `organizationId === :orgId`; system roles are read-only there (mutations 400, as `RBACService.ts:69,80,109` already enforces); `platform_admin` is hidden from O3.
- **V7 — Caching**: per-request resolution with optional in-process TTL cache (60s) keyed `(roleId, orgId)`; bust on O10/P3/P4/P18 writes in the same process. No login-time session flags (improvement over legacy).

---

## 5. Seed plan

All seed changes go in `server/src/seeds/rbac-seed.ts` (idempotent check-then-insert style already used there) plus one new backfill script.

1. **New action `upload`** — append to `defaultActions` (`rbac-seed.ts:115-126`): `{ name: 'upload', displayName: 'Upload', description: 'Upload or import files' }` (legacy `subir`).
2. **`submodule_actions` matrix** — new `seedSubmoduleActions(db, moduleIdMap, actionIdMap)` called from `seedRBAC`. Default matrix (submodule → action names):
   - Baseline for EVERY submodule: `create, read, update, delete`.
   - Extras: `orders/processing`: `+refund, +cancel, +export` · `orders/shipping`: `+export` · `orders/returns`: `+refund` · `products/inventory`: `+upload, +export` · `products/pricing`: `+export` · `customers/profiles`: `+export, +upload` · `customers/segments`: `+export` · `content/pages`: `+publish` · `content/banners`: `+publish, +upload` · `team/members`: `+invite, +remove` · `team/invitations`: `+invite` · `analytics/dashboard`: `read` only (no CUD) · `analytics/reports`: `read, export` only · `settings/*`: `read, update` only.
   - Idempotent: skip existing `(submoduleId, actionId)` pairs.
3. **Default org module set** — export `DEFAULT_ORG_MODULE_NAMES = ['products','orders','customers','content','settings','team','analytics']` from `rbac-seed.ts`. Hook into `OrganizationService.create` (`server/src/services/OrganizationService.ts:56`, right after the owner-membership insert): insert `organization_modules` rows for the default set via the new `OrganizationModuleRepository` (inject it in `dependency_injection.ts`). `assignedBy: null`.
4. **Backfill script** — new `server/src/seeds/org-modules-backfill.ts` + npm script `db:seed:org-modules` in root `package.json`: for every row in `organizations`, insert missing default `organization_modules` rows (idempotent, `ON CONFLICT DO NOTHING` semantics via pre-check). Run once after migration. **Do not run automatically; never `db:push`.**
5. **System role templates unchanged** (`owner`, `admin`, `manager`, `staff`, `platform_admin` keep `organizationId = NULL`, `isSystem = true`). `owner` needs no new grant rows — V4 resolves it dynamically against each org's matrix. `roles.isActive` backfills to `true` via the column default in the generated migration.
6. **Seed runner**: existing `npm run db:seed` (RBAC seed entry) picks up the new steps; safe to re-run.

---

## 6. FE integration notes

### POS (`templates/pos-system` → repo `chepelcr/tsuru-pos-system`) — org-scoped side

- **Client + auth**: use the existing `api` helper (`templates/pos-system/src/lib/api.ts:106`), markets-api base (`VITE_API_URL` → `https://api.tsuru.jcampos.dev`), Cognito ID token auto-injected by `getToken()` (`api.ts:20-23`). No `x-user-id` header for markets-api.
- **Path builder**: add `orgRbacPath(userId, orgId, endpoint)` returning `` `/api/users/${userId}/organization/${orgId}/rbac${endpoint}` `` next to `orgSettingsPath`/`orgContentPath` (`api.ts:172-202`). **Do NOT reuse `orgPath`** — it injects `/memberships/` and will 404 against the `routes.ts:64` mount.
- **Hooks**: new `src/hooks/useRbac.ts` following the React Query conventions (keys `["rbac","my-permissions",orgId]`, `["rbac","matrix",orgId]`, `["rbac","roles",orgId]`, `["rbac","role-permissions",orgId,roleId]`; mutations invalidate those keys). `userId` from `useAuthContext()`, `orgId` from `OrgContext`.
- **Nav/action gating**: fetch O1 `my-permissions` once at dashboard mount; filter `DashboardSidebar` `NAV_ITEMS` by `MyPermissionsDto.modules`; expose a `can(module, action, submodule?)` helper over the flattened `permissions` strings (`"module:submodule:action"`).
- **Roles UI** (Settings/Team): role list from O4, matrix form driven by O2 `available-matrix` (render ONLY what it returns — it is already org-filtered), save via O10 `{ permissions: [...] }`, member role select via O11 restricted to O4 results. All strings through `t()` with keys in both `es`/`en` blocks of `LanguageContext.tsx` (POS CLAUDE.md §10); design-system classes only (§3).

### Landing admin (`landing-client` → repo `chepelcr/tsuru-landing`) — platform side

- **Hybrid model**: the public site stays 100% static JSON DXP; ONLY the new admin sections are BE-connected.
- **Auth**: Cognito via `landing-client/src/lib/amplify.ts` (configures Amplify from `VITE_AWS_COGNITO_USER_POOL_ID` / `VITE_AWS_COGNITO_CLIENT_ID` / `VITE_AWS_REGION` — same user pool as the platform; skips configure when unset so static deploys keep working). Sign in with a Cognito user whose `users.role = 'platform_admin'` in the shared Postgres; get the ID token via `fetchAuthSession()` and send `Authorization: Bearer <idToken>` (mirror the POS `request()` helper in `templates/pos-system/src/lib/api.ts:25-94` — landing has no API client yet, so add a small `adminApi` module with base `VITE_API_URL` = markets-api).
- **Authorization**: `/api/admin/*` is NOT under `/api/users/:userId`, so the API Gateway path-userId match does not apply there; the JWT is still signature-validated at the gateway, and `requirePlatformAdmin` (server-side `users.role` check, §3.0.3) is the real gate. Verify the API Gateway stack (`cloudformation/api-gateway.yml`) proxies `/api/admin/*` with the authorizer attached before exposing the UI.
- **Screens**: org list (P1, debounced `search`) → org detail module-assignment (P2 + P3/P4 toggles, expand module to override submodules) → catalog CRUD pages (P6–P18). Local dev points `VITE_API_URL` at `http://localhost:5000`.

### Out of scope here (later follow-ups, port doc §9)

Lambda-authorizer membership/role fill (`organization_auth_checker.py` TODO), cross-app-be/jbiller route enforcement, audit log.
