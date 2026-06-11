# RBAC Port Mapping — facturacion → Tsuru (org-scoped roles + per-org modules)

**Goal**: Port the legacy roles system from `E:\dev\facturacion` (single-org PHP, MySQL `laura_seguridad`) into the Tsuru ecosystem, upgraded so that:

1. Roles are **scoped per organization**.
2. Each organization has an **assigned set of modules/submodules** (platform-managed). Special modules can be added to one org; modules can be disabled per org.
3. An org manages **its own roles**, but the permission matrix it can grant is limited to **its assigned modules/submodules**.
4. Platform-level assignment is managed from the future **Tsuru admin panel** (the landing admin panel will be promoted into the `dashboard/` folder; the current dashboard app is retired since its features migrated to the new POS).

---

## 1. Legacy schema (source of truth being ported)

Database `laura_seguridad` (`E:/dev/facturacion/SQL/laura_seguridad (4).sql`):

| Table | Purpose | Notes |
|---|---|---|
| `roles` | Role definitions | `estado`: 1 active / 2 disabled / 3 deleted (soft delete) |
| `modulos` | Top-level modules (menu + permission namespace) | name, view name, icon, url |
| `modulos_submodulos` | Submodules, composite PK (`id_modulo`,`id_submodulo`) | `objeto` = entity name used in permission checks |
| `acciones` | Action catalog (5: insertar, modificar, consultar, eliminar, subir) | static |
| `submodulos_acciones` | **Which actions are available per submodule** (composite PK module+submodule+action) | drives the matrix UI |
| `permisos_submodulos` | Role permission rows: (`id_rol`,`id_modulo`,`id_submodulo`,`id_accion`,`estado` 0/1) | one row per combo, granted = estado 1 |
| `usuarios` | Users; `id_rol` FK = **one role per user** | `id_empresa` exists but unused for scoping |
| `contrasenia_usuarios` | Password + lockout | replaced by Cognito |
| `auditoria` / `error` | Audit & error logs | optional later |

Enforcement (PHP): login hydrates session flags `"{modulo}_{submodulo}_{accion}" = 0/1` (`app/App/helper/modulos_helper.php:getModulos`), guards call `validar_permiso(modulo, objeto, accion)` at controller entry (`app/Core/Controller.php:183,230,303`; `app/App/Controllers/Seguridad.php`). Role matrix UI: `app/App/Views/seguridad/rol/elementos/permisos_modulo.php`.

Legacy seed taxonomy (for reference when defining the Tsuru POS catalog):
`empresa` (clientes, productos, ordenes) · `lotes` (compra, produccion) · `seguridad` (usuarios, roles, auditorias, empresas) · `documentos` (emitidos, recibidos, importar) · `walmart` (tiendas, departamentos, ordenes) · `configuracion` (empresa, documentos, modulos).
Note: `walmart` is the canonical example of a **special module** that should only be assigned to specific orgs in the new model (today its domain lives hardcoded in cross-app-be as the Modas Laura cross-docking feature).

---

## 2. What Tsuru already has (reuse, don't reinvent)

Drizzle entities in `E:/dev/BeautyMarket/server/src/entities/` already in the **shared Postgres**:

| Tsuru table | Shape | Status |
|---|---|---|
| `modules` (`Module.ts`) | id, name (unique), displayName, icon, isActive, sortOrder | seeded, platform-global |
| `submodules` (`Submodule.ts`) | id, moduleId FK, name, displayName, isActive, sortOrder | seeded |
| `actions` (`Action.ts`) | id, name (unique), displayName | seeded (10 actions) |
| `roles` (`Role.ts`) | id, name, displayName, isSystem, **organizationId nullable** | org-scoped roles already supported; NULL = system role |
| `role_permissions` (`RolePermission.ts`) | roleId, moduleId, submoduleId **nullable** (= all submodules), actionId | presence = granted |
| `organization_members` (`OrganizationMember.ts`) | orgId, userId, roleId, isDefault, invitedBy | one role per member per org (matches legacy 1-role model, but per-org) |

Also existing but **not enforced anywhere**:
- `server/src/middleware/permissions.ts` — `requirePermission(module, action, submodule?)` factory, never mounted on routes.
- `server/src/services/RBACService.ts` + `RBACRepository.ts` — full role/permission CRUD + `hasPermission`.
- `server/src/controllers/RBACController.ts` — REST endpoints under `/api/users/:userId/organization/:orgId/rbac/*`.
- Lambda authorizer membership/role lookup is a stub: `E:/dev/biller-apps/auth/app/lambda-authorizer/src/validators/organization_auth_checker.py` returns hardcoded `role="member"`, `permissions=[]` (TODO at ~line 73).
- cross-app-be has **no RBAC at all** — only `x-user-id` header extraction (`app/middleware/user_id_middleware.py`) and org-scoped WHERE clauses.

---

## 3. Entity mapping (legacy → Tsuru target)

| Legacy (`laura_seguridad`) | Tsuru target | Action |
|---|---|---|
| `empresas` | `organizations` | exists |
| `usuarios` (+ `contrasenia_usuarios`) | Cognito + `users` table | exists; drop password/lockout tables (Cognito owns this) |
| `usuarios.id_rol` (global, 1:1) | `organization_members.roleId` (**per-org**, 1 role per membership) | exists — this is the multi-org upgrade of the same idea |
| `roles` | `roles` with `organizationId NOT NULL` for org roles | exists; keep `isSystem` templates (owner/admin/…) with NULL org |
| `modulos` | `modules` | exists |
| `modulos_submodulos` | `submodules` | exists |
| `acciones` | `actions` | exists (superset of the legacy 5) |
| `submodulos_acciones` | **`submodule_actions` — MISSING, must be created** | new table: defines which actions are valid per submodule; drives the matrix UI and validates grants |
| `permisos_submodulos` (rows with estado 0/1 for every combo) | `role_permissions` (presence = granted) | exists; keep presence-based model (don't port the all-rows-with-flag pattern) |
| *(none — legacy is single-org)* | **`organization_modules` — NEW** | per-org module assignment (the feature you're adding) |
| *(none)* | **`organization_submodules` — NEW** | optional per-org submodule disable within an assigned module |
| `roles.estado` 1/2/3 | `roles.isActive` boolean + delete | simplify; soft-disable via isActive |
| `auditoria` | (later) audit log | out of scope for the port; note as follow-up |

---

## 4. New schema (the per-org module layer)

```sql
-- Which actions are available on each submodule (ported from legacy submodulos_acciones)
CREATE TABLE submodule_actions (
  id            varchar PRIMARY KEY,
  submodule_id  varchar NOT NULL REFERENCES submodules(id) ON DELETE CASCADE,
  action_id     varchar NOT NULL REFERENCES actions(id)    ON DELETE CASCADE,
  UNIQUE (submodule_id, action_id)
);

-- Platform-managed: which modules an org has (Tsuru admin panel writes this)
CREATE TABLE organization_modules (
  id              varchar PRIMARY KEY,
  organization_id varchar NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_id       varchar NOT NULL REFERENCES modules(id)       ON DELETE CASCADE,
  is_enabled      boolean NOT NULL DEFAULT true,   -- platform can disable without unassigning
  assigned_by     varchar,                          -- platform admin user id
  assigned_at     timestamp NOT NULL DEFAULT now(),
  UNIQUE (organization_id, module_id)
);

-- Optional fine grain: disable specific submodules of an assigned module for an org.
-- Convention: NO row = inherited enabled (if the module is assigned). A row exists only to override.
CREATE TABLE organization_submodules (
  id              varchar PRIMARY KEY,
  organization_id varchar NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submodule_id    varchar NOT NULL REFERENCES submodules(id)    ON DELETE CASCADE,
  is_enabled      boolean NOT NULL DEFAULT false,
  UNIQUE (organization_id, submodule_id)
);
```

**Effective availability rule** (single definition, used everywhere):

```
submodule available to org  =  module.isActive
                            AND organization_modules(org, module).is_enabled
                            AND COALESCE(organization_submodules(org, submodule).is_enabled, true)
action grantable            =  submodule available AND (submodule_id, action_id) ∈ submodule_actions
```

**Effective permission at runtime** (deny-by-default, platform disable wins instantly):

```
allowed(user, org, module, submodule, action) =
  member  = organization_members(user, org)            -- 404/403 if absent  ← fixes the IDOR gap
  role    = member.role (must satisfy role.organization_id = org OR role.isSystem)
  grant   ∈ role_permissions(role, module, submodule|NULL, action)
  AND submodule available to org (rule above)
```

Two integrity rules enforced at the service layer (Postgres can't express them as plain FKs):
1. `organization_members.roleId` must point to a role of the **same org** or a system role — validate on member create/update (today nothing prevents cross-org role assignment).
2. `role_permissions` writes for an org role must be a **subset of the org's available matrix** — validate on save; additionally the runtime check re-intersects with `organization_modules`, so revoking a module instantly nullifies stale grants without cleanup.

---

## 5. Where it lives (target architecture)

> **DECISION UPDATE (2026-06-11)** — this section supersedes the earlier cross-app-be recommendation. The user decided the **Express server** (`E:/dev/BeautyMarket/server`) is the RBAC owner because **users + main organization management already live there** (the `organizations`/`users`/`organization_members`/`roles`/`role_permissions`/`modules`/`submodules`/`actions` Drizzle entities in `server/src/entities/` are the source of truth in the shared Postgres). cross-app-be keeps consuming the same tables later via its existing shared-table mapping pattern; nothing new is built in cross-app-be for this port.

**Backend owner: the Express server (`E:/dev/BeautyMarket/server`)** — Drizzle ORM, three-tier controller/service/repository, wired in `server/src/dependency_injection.ts`. Concretely:

- **New Drizzle entities instead of alembic**: `SubmoduleAction.ts`, `OrganizationModule.ts`, `OrganizationSubmodule.ts` in `server/src/entities/` (exported from `entities/index.ts`, which `drizzle.config.ts` points at), plus an `isActive` column added to `Role.ts` (the §3 `roles.estado` simplification). Migrations are produced with `npm run db:generate` and applied with `npm run db:migrate` — **never** `npm run db:push`.
- **Enforcement** via the existing `requirePermission(module, action, submodule?)` factory in `server/src/middleware/permissions.ts` (already exported as `permissionMiddleware` from `dependency_injection.ts`, never mounted until now), finally mounted route-by-route on the Express routers in `server/src/routes.ts` / controller `getRouter()`s. `RBACService.hasPermission` is extended with the org-modules intersection (the runtime rule in §4). Two fixes ship with it: the middleware must read `req.params.orgId` (the actual mount param at `routes.ts:64`; it currently reads `organizationId`, which is never set), and `req.userId` must be populated (from the `:userId` path param that API Gateway already validates against the JWT `sub`, with a bearer-token decode fallback for local dev / `/api/admin`).
- **New platform-admin route group** `/api/admin/...` guarded by a real `requirePlatformAdmin` (the placeholder at `permissions.ts:181-210` is implemented as `users.role === 'platform_admin'` — the column already exists in `User.ts`).
- **Org-scoped endpoints** (POS consumes): available-matrix, role CRUD + bulk permission set (subset-validated), member role assignment (same-org-role validated), my-permissions — under the existing `/api/users/:userId/organization/:orgId/rbac` mount (`routes.ts:37`).
- **Platform endpoints** (landing admin / Tsuru admin consumes): catalog CRUD (modules, submodules, actions, submodule_actions), per-org module assignment (assign/enable/disable + submodule overrides), org search/list — under `/api/admin/...`.
- **Full implementation contract** (entities, every endpoint + DTO + guard, validation rules, seed plan, FE integration): `docs/roadmap/rbac_express_contract.md`.
- The **lambda-authorizer fill** (`organization_auth_checker.py` TODO — resolve membership + role name and put `role`, `org_id` in the authorizer context) **stays a later follow-up**; until then the Express service layer is the enforcement point, which mirrors legacy's "guard at controller entry" placement anyway.

**Permission caching**: legacy cached flags in session at login (stale until re-login). Port improvement: resolve per-request via one indexed query (role_permissions ∩ org_modules), with optional short-TTL (60s) in-process cache keyed `(role_id, org_id)`. No re-login needed for permission changes; platform module disable takes effect within TTL.

**Frontends / management UIs**:
- **POS (`tsuru-pos-system`)** — the **org-scoped side**: roles UI under Settings/Team: role list + role form with the module→submodule→action **matrix filtered to the org's available matrix** (the `GET .../rbac/available-matrix` endpoint). This is the direct port of `permisos_modulo.php` (buttons toggling grants). Members page assigns one role per member (same model as legacy, now per-org). Orgs create their own roles limited to their assigned modules/submodules, or use the system role templates. Nav/action gating driven by `GET .../rbac/my-permissions`.
- **Landing admin (Tsuru admin)** — the **platform side**: org list → org detail → module assignment screen (toggle modules, expand to override submodules), plus platform catalog CRUD (modules/submodules/actions/submodule_actions — the port of legacy `configuracion → modulos`). These are BE-connected hybrid sections of the otherwise-static landing admin, authenticated via Cognito (`landing-client/src/lib/amplify.ts`) with a `platform_admin` user.

---

## 6. Seeding & defaults

- **Default module set**: on org creation (onboarding step 1), auto-insert `organization_modules` rows for the standard POS module set, so existing behavior is unchanged. Special modules (e.g. a future `cross-docking`/`walmart`-style module) are assigned manually via the admin panel.
- **Backfill migration**: insert the default set for every existing org.
- **Catalog seed**: define the Tsuru POS taxonomy informed by the legacy one — suggested starting point: `clients`, `catalog` (products), `documents` (e-invoicing: emitted/received/import), `sales` (POS sessions/cash closing), `stores` (stores/departments — the generalized walmart module), `team` (members/roles), `settings` (org/fiscal config), `reports`. Seed `submodule_actions` for each (legacy actions map: insertar→create, modificar→update, consultar→read, eliminar→delete, subir→upload/import — `upload` may need adding to `actions`).
- **System role templates** (`owner`, `admin`, plus seeds ported from useful legacy roles like Cajero) remain `organizationId = NULL`, `isSystem = true`; when checked against a given org their effective permissions are still intersected with that org's module assignment, so templates work safely across orgs with different module sets. `owner` should resolve as "all available actions for the org's matrix" rather than a static grant list.

---

## 7. Port plan (phases)

1. **Schema (Express/Drizzle)**: new entities `SubmoduleAction.ts`, `OrganizationModule.ts`, `OrganizationSubmodule.ts` (+ `roles.isActive`) in `server/src/entities/`, exported from `entities/index.ts`; generate migration with `npm run db:generate` (never `db:push`); extend `server/src/seeds/rbac-seed.ts` with the `upload` action + `submodule_actions` matrix; backfill script for default modules per existing org.
2. **Backend (Express server)**: extend `RBACRepository`/`RBACService`/`RBACController` + new `OrganizationModuleRepository`, `PlatformRBACService`, `PlatformAdminController` for catalogs, org assignments, org roles, member-role; extend `requirePermission` runtime rule with the org-modules intersection; implement `requirePlatformAdmin`; subset + same-org-role validations; default module set hooked into `OrganizationService.create`. Wire everything in `dependency_injection.ts` and `routes.ts`. Contract: `docs/roadmap/rbac_express_contract.md`.
3. **Enforcement rollout**: mount `permissionMiddleware.requirePermission` on the Express org-scoped routes module-by-module (start with `team` — the `/rbac`, memberships and invitations routes — then `settings`, `content`, …) — feature-flag (`RBAC_ENFORCEMENT=enforce|log|off`) or default-allow during rollout to avoid locking out existing users before roles are configured.
4. **POS UI**: roles management pages (matrix UI port), member role assignment, and hide nav/actions the member lacks (port of the sidebar/session-flag behavior, but driven by the `GET .../rbac/my-permissions` endpoint).
5. **Landing admin (Tsuru admin)**: org search/list + module-assignment screen + catalog CRUD as BE-connected admin sections (Cognito auth via `landing-client/src/lib/amplify.ts`, `platform_admin` user); until built, assignments can be managed by seed/SQL or `curl` against `/api/admin/...`.
6. **Authorizer (later follow-up, unchanged scope)**: implement the membership/role lookup TODO in `organization_auth_checker.py` (coarse gate; the Express service keeps doing fine-grained) — plus replicating `require_permission` in cross-app-be when its routes need enforcement.

## 8. Decisions taken (flag if you disagree)

- **Presence-based grants** (`role_permissions` row exists = granted) instead of legacy's all-rows-with-estado-flag.
- **One role per member per org** (matches both legacy and `organization_members`); multi-role left out deliberately.
- **Reuse the existing shared-DB RBAC tables** rather than creating a parallel set — avoids a second source of truth. *(2026-06-11 update: the Express server stays the owner of these tables and of the new per-org module layer; cross-app-be consumes them via its shared-table mapping pattern when it later needs enforcement.)*
- **Authorizer = membership only; service = fine-grained** — keeps authorizer fast/cacheable and mirrors legacy guard placement.
- **`organization_submodules` is override-only** (no row = enabled if module assigned) — keeps the common case zero-config.

## 9. Follow-ups not in scope

- Audit log (`auditoria` port) — worth doing once enforcement exists.
- Lambda-authorizer membership/role fill (`organization_auth_checker.py` TODO) — coarse gate at the edge; the Express service layer enforces fine-grained checks in the meantime.
- cross-app-be route enforcement — replicate the `require_permission` pattern there (reading the same shared tables) once the Express implementation is live.
- jbiller/data-services route enforcement — same pattern can be replicated later via the shared-layer.
