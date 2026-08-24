# Tsuru Plans — Implementation Spec (BE, org creation, POS)

**Status:** Design, not yet built. **Roadmap:** TSR-084 (published model), TSR-145 (this build-out).
**Companion:** the published, customer-facing model lives in `fe/landing/src/content/plans.json`
and renders at <https://tsuru.jcampos.dev/planes>. This document is how we make that real.

> **Read §1 before anything else.** Two of the four tiers' contents are legal
> constraints, not product decisions, and getting them wrong is a compliance
> problem rather than a bug.

---

## 1. The non-negotiables

These come from Costa Rican law and from promises already published on the public
site. They are inputs to the design, not things to trade off during it.

| Rule | Why | Consequence for the build |
|---|---|---|
| **Every receipt type (FE, TE, NC, ND, FC, FEX) works on the free tier** | Hacienda requires any taxpayer to be able to issue the full set. Paywalling a type would put a paying-customer-only path in front of a legal obligation. | `docTypes` is **not** an entitlement key. Never gate document type by plan. |
| **Contingency mode (ATV) works on the free tier** | Contingency is how a merchant stays compliant when *Hacienda's own* ATV is unreachable. Gating it means a free-tier merchant cannot comply during an outage they did not cause. | `contingency` is **not** an entitlement key. |
| **No commission on sales, on any tier** | Published 5× on the landing. | No revenue logic may read order totals. |
| **Data export is free on every tier** | Published. Also the honest exit path. | Export endpoints must never consult entitlements. |
| **The free tier never expires and needs no card** | Published. | No trial timer, no `trialEndsAt`, no card capture at signup. |

Anything **not** in this table is fair game to gate: volume, seats, branches,
terminals, custom domain, advanced reports, premium templates, support tier.

**Where the line falls:** gate *scale and convenience*, never *legal capability*.
When a new feature is proposed for gating, ask: "if a merchant can't do this, can
they still meet their obligations to Hacienda?" If no, it ships free.

---

## 2. The four tiers

Names are fixed (they carry the brand's harvest metaphor). Amounts are **preliminary** —
`plans.json.config.draftPricing` is `true` and the site shows an "under review" notice.

| Tier | id | Price (draft) | Shape |
|---|---|---|---|
| **Semilla** | `semilla` | ₡0 — forever | The compliance floor. Everything legally required, capped on volume. |
| **Cosecha** | `cosecha` | ₡20.000/mes · ₡200.000/año | The single business that outgrew the caps. Custom domain, 5 seats. |
| **Cooperativa** | `cooperativa` | ₡45.000/mes · ₡450.000/año | Multi-branch, unlimited seats, fine-grained RBAC. |
| **Feria** | `feria` | Custom ("a conversar") | Organizers of *other* sellers. Often ₡0 for community projects. |

Annual = pay 10 months, get 12 (`annualDiscountMonths: 2`).

`feria` has **no self-serve price**. It must not be purchasable; it routes to
contact and is provisioned by a platform admin.

---

## 3. Architecture: entitlements are a second axis, not more RBAC

The single most important decision in this document.

The platform already has RBAC: `Role → Module → Submodule → Action`, resolved per
user per org, exposed at `GET /api/users/:userId/organizations/:orgId/rbac/my-permissions`,
enforced by `be/management-be/src/middleware/permissions.ts`.

**RBAC answers:** *is this **user** allowed to do X in this org?*
**Entitlements answer:** *is this **org** allowed to do X at all, at what it pays?*

They are orthogonal and both must pass:

```
allowed = rbac.can(user, module, submodule, action)   // who you are
        AND entitlements.allows(org, capability)      // what the org bought
        AND entitlements.withinLimit(org, counter)    // and how much it has used
```

**Do not model plans as roles or as RBAC modules.** They look similar and it is
tempting, but they fail differently and the failure modes must stay distinct:

- RBAC denial → **403, "you don't have permission"** → resolved by an *admin in the org*
  changing your role. Terminal for the user.
- Entitlement denial → **402, "your plan doesn't include this"** → resolved by *upgrading*.
  It is a sales moment, not an error, and needs completely different UI.

Collapsing them produces "permission denied" where the honest answer is "you've hit
your plan's limit", which reads as a bug and costs an upgrade.

### 3.1 Relationship to `organization_modules`

`be/management-be/src/entities/OrganizationModule.ts` already models *"which modules
does this org have"*, platform-written, with `isEnabled` so the platform can switch a
module off without unassigning it. That is plan-shaped already.

**Make the plan the writer, not a parallel system.** Activating a plan reconciles
`organization_modules` to that plan's module set. `organization_modules` stays the
runtime source for module availability (RBAC's `getAvailableMatrix` already reads it),
and the plan becomes the *reason* a row is there.

This avoids two systems disagreeing about whether an org has `reports`, and it means
the existing RBAC availability logic needs no changes.

Capability and counter limits (seats, branches, docs/month) live in the new plan
tables — `organization_modules` is not granular enough for those and should not be
stretched to hold them.

---

## 4. Data model

New tables in `be/management-be` (Drizzle, `src/entities/`). Existing
`organizations.plan` (varchar, default `'free'`) and `organizations.stripeCustomerId`
stay and are reused.

### 4.1 `plans` — the machine-readable catalog

```ts
// src/entities/Plan.ts
export const plans = pgTable("plans", {
  id:            varchar("id").primaryKey(),            // 'semilla' | 'cosecha' | 'cooperativa' | 'feria'
  displayName:   varchar("display_name", { length: 100 }).notNull(),
  sortOrder:     integer("sort_order").notNull(),
  priceMonthly:  integer("price_monthly").notNull(),    // CRC minor-unit-free (colones have no cents)
  priceAnnual:   integer("price_annual").notNull(),
  currency:      varchar("currency", { length: 3 }).default("CRC").notNull(),
  isCustomPrice: boolean("is_custom_price").default(false).notNull(),  // feria
  isSelfServe:   boolean("is_self_serve").default(true).notNull(),     // feria = false
  isActive:      boolean("is_active").default(true).notNull(),
  createdAt:     timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt:     timestamp("updated_at").default(sql`now()`).notNull(),
});
```

### 4.2 `plan_entitlements` — limits and capabilities per plan

One row per (plan, key). Two kinds of key, distinguished by which column is set.

```ts
// src/entities/PlanEntitlement.ts
export const planEntitlements = pgTable("plan_entitlements", {
  id:       varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId:   varchar("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  key:      varchar("key", { length: 60 }).notNull(),   // see §4.4
  // Numeric limit. NULL = unlimited. Use NULL, never -1 or a huge sentinel.
  limitValue: integer("limit_value"),
  // Boolean capability. NULL for counter-type keys.
  enabled:    boolean("enabled"),
}, (t) => [unique("plan_entitlements_plan_key_uq").on(t.planId, t.key)]);
```

**`NULL` means unlimited** for `limitValue`. This is the one modelling detail most
likely to cause a production incident: a sentinel like `-1` or `999999` silently
becomes a real ceiling the day someone writes `count >= limit` without a null guard.
The check helper in §5.1 is the only place allowed to interpret it.

### 4.3 `organization_subscriptions` — what an org actually has

```ts
// src/entities/OrganizationSubscription.ts
export const organizationSubscriptions = pgTable("organization_subscriptions", {
  id:             varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().unique()
                    .references(() => organizations.id, { onDelete: "cascade" }),
  planId:         varchar("plan_id").notNull().references(() => plans.id),
  billingCycle:   varchar("billing_cycle", { length: 10 }).default("annual").notNull(), // monthly | annual
  status:         varchar("status", { length: 20 }).default("active").notNull(),
                  // active | past_due | cancelled | grace
  // Per-org entitlement overrides (feria deals, grandfathering, goodwill).
  // Shape: { "team.seats": 25, "branches": null }  — same semantics as plan_entitlements.
  overrides:      jsonb("overrides"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd:   timestamp("current_period_end"),
  cancelAtPeriodEnd:  boolean("cancel_at_period_end").default(false).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
  createdAt:      timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt:      timestamp("updated_at").default(sql`now()`).notNull(),
});
```

`overrides` is what makes **Feria** implementable without inventing a tier per
community project, and what lets us grandfather an existing org without a migration.

`organizations.plan` becomes a **denormalized cache** of `planId` for cheap reads.
The subscription row is authoritative. Keep them in sync in one service method or
drop the column — do not let two writers touch it.

### 4.4 Entitlement keys

Counters (`limitValue`, NULL = unlimited):

| Key | Semilla | Cosecha | Cooperativa | Feria |
|---|---|---|---|---|
| `docs.perMonth` | 30 | NULL | NULL | NULL |
| `products` | 50 | NULL | NULL | NULL |
| `customers` | 30 | NULL | NULL | NULL |
| `branches` | 1 | 1 | NULL | NULL |
| `terminals` | 1 | 3 | NULL | NULL |
| `team.seats` | 1 | 5 | NULL | NULL |

Capabilities (`enabled`):

| Key | Semilla | Cosecha | Cooperativa | Feria |
|---|---|---|---|---|
| `domain.custom` | false | true | true | true |
| `reports.advanced` | false | true | true | true |
| `reports.consolidated` | false | false | true | true |
| `docs.acceptReceived` | false | true | true | true |
| `templates.premium` | false | true | true | true |
| `rbac.fineGrained` | false | false | true | true |
| `inventory.transfers` | false | false | true | true |
| `fair.multiOrg` | false | false | false | true |

**Deliberately absent, and must stay absent** (§1): `docTypes`, `contingency`,
`data.export`, anything commission-related.

---

## 5. Backend

### 5.1 EntitlementService

New service in `be/management-be/src/services/EntitlementService.ts`, wired in
`dependency_injection.ts` like every other service.

```ts
interface ResolvedEntitlements {
  planId: string;
  status: SubscriptionStatus;
  limits: Record<string, number | null>;   // null = unlimited
  capabilities: Record<string, boolean>;
}

interface IEntitlementService {
  /** Plan defaults merged with the org's overrides. Cached per org. */
  resolve(orgId: string): Promise<ResolvedEntitlements>;

  /** Boolean capability check. */
  allows(orgId: string, capability: string): Promise<boolean>;

  /** Counter check. Returns the decision AND the numbers, so callers can
   *  render "12 of 50 used" without a second round trip. */
  checkLimit(orgId: string, key: string, delta?: number): Promise<LimitCheck>;
}

interface LimitCheck {
  allowed:   boolean;
  limit:     number | null;   // null = unlimited
  current:   number;
  remaining: number | null;
}
```

The **only** place `limitValue === null` is interpreted:

```ts
function withinLimit(current: number, limit: number | null, delta = 1): boolean {
  if (limit === null) return true;          // unlimited — the whole point
  return current + delta <= limit;
}
```

**Caching:** `resolve()` is called on nearly every mutating request. Cache per org
with a short TTL (60s) and invalidate on subscription change. Do not cache the
*counts* — those change constantly and a stale count either blocks a legitimate
write or lets an org past its ceiling.

### 5.2 Enforcement middleware

Mirror `permissions.ts` exactly, including its rollout flag — that pattern is already
proven in this codebase and the team knows how to operate it.

```ts
// src/middleware/entitlements.ts
type EnforcementMode = 'enforce' | 'log' | 'off';

/**
 * PLAN_ENFORCEMENT rollout flag, mirroring RBAC_ENFORCEMENT:
 *  - 'off'     → skip entirely
 *  - 'log'     → evaluate, log the denial, allow the request (DEFAULT until
 *                the POS upgrade UI ships and existing orgs are backfilled)
 *  - 'enforce' → 402 on deny
 */
export function requireCapability(capability: string) { /* … */ }
export function requireLimit(key: string, delta = 1)  { /* … */ }
```

Ship in `log` first and **read the logs before flipping to `enforce`**. Any org
that would have been blocked is either a real overage (talk to them) or a bug in a
counter (fix before it becomes a 402 in production). This is the same sequencing
RBAC used.

**402, not 403.** Body shape:

```json
{
  "error": "plan_limit_exceeded",
  "capability": "products",
  "limit": 50,
  "current": 50,
  "currentPlan": "semilla",
  "requiredPlan": "cosecha",
  "upgradeUrl": "https://tsuru.jcampos.dev/planes"
}
```

`requiredPlan` is what lets the POS say *"Cosecha lifts this"* instead of a generic
"upgrade". Compute it as the cheapest active plan whose entitlement satisfies the
failed check.

### 5.3 Enforcement points

| Check | Where | Notes |
|---|---|---|
| `products` | product create | Count active products for the org. |
| `customers` | customer create | |
| `branches` / `terminals` | branch + terminal create | Lives in `be/sales-be` (registered-organizations) — see §5.4. |
| `team.seats` | **invitation send**, not accept | Fail early. Also re-check on accept, since seats can fill between the two. |
| `docs.perMonth` | document emission, `be/sales-be` | See §5.4 — the hard one. |
| `domain.custom` | custom-domain save | |
| `reports.advanced` / `.consolidated` | report endpoints | |
| `docs.acceptReceived` | received-document acceptance | |

### 5.4 The cross-service problem

Entitlements live in `be/management-be`. Document emission and branches/terminals
live in `be/sales-be` (Python/FastAPI). Two services, one source of truth needed.

Do **not** replicate the plan tables into `sales-be`; they will drift.

Recommended: `management-be` exposes an internal, service-to-service endpoint

```
GET /internal/organizations/:orgId/entitlements  →  ResolvedEntitlements
```

and `sales-be` calls it with a short-lived cache (60s, same TTL as §5.1) plus a
**fail-open** default if `management-be` is unreachable.

**Fail-open is deliberate here and worth stating plainly:** if the entitlement
service is down, a merchant must still be able to invoice. Blocking emission on
our own infrastructure failure would create exactly the compliance gap §1 exists to
prevent. Log the fail-open, alert on it, reconcile overage after the fact — but let
the document through.

For `docs.perMonth`, the counter is a monthly aggregate that `sales-be` already has
the data for. Compute it there (`COUNT` of emitted docs for the org in the current
billing period), and ask `management-be` only for the *limit*. That keeps the hot
path local and the policy central.

**Billing period, not calendar month.** `docs.perMonth` must reset on
`currentPeriodStart`, not on the 1st, or an org that subscribes on the 20th gets a
10-day first month. For free-tier orgs with no subscription period, use the calendar
month from `createdAt`.

### 5.5 API surface

```
GET   /api/plans                                              # public catalog
GET   /api/users/:userId/organizations/:orgId/subscription    # current + usage
POST  /api/users/:userId/organizations/:orgId/subscription    # change plan (owner only)
GET   /api/users/:userId/organizations/:orgId/entitlements    # for the POS, see §6.1
```

`GET …/entitlements` intentionally mirrors `…/rbac/my-permissions`: one call, the
whole resolved picture, cached client-side. Include live usage counts so the POS can
render meters without N calls:

```json
{
  "planId": "semilla",
  "status": "active",
  "capabilities": { "domain.custom": false, "reports.advanced": false },
  "limits":  { "products": 50, "customers": 30, "docs.perMonth": 30 },
  "usage":   { "products": 12, "customers": 4,  "docs.perMonth": 18 }
}
```

Plan change is **owner-only** — reuse `requireOrganizationOwner()`. An admin who can
manage products should not be able to commit the org to a bill.

---

## 6. POS app (`fe/pos-system`)

### 6.1 `useEntitlements()` — mirror `usePermissions()`

The POS already has the shape to copy: `usePermissions()` in `src/hooks/useRbac.ts`
returns `{ can, isReady, isLoading, isError, refetch }` and `PermissionBoundary`
resolves route access before lazy-loading the page.

```ts
// src/hooks/useEntitlements.ts
export function useEntitlements(): {
  allows:  (capability: string) => boolean;
  limitOf: (key: string) => { limit: number | null; used: number; remaining: number | null };
  atLimit: (key: string) => boolean;
  planId:  string | undefined;
  isReady: boolean;
};
```

**Fail-open while unresolved**, matching the RBAC nav gate and for the same reason:
during `PLAN_ENFORCEMENT=log` the backend is the authority and the UI must not
invent restrictions the server would allow. (Contrast `useProgramsEnabled()`, which
fails *closed* — that is correct there because showing a section the org doesn't
have is worse than hiding one it does. Here, hiding a control the org is entitled to
looks like the product is broken.)

### 6.2 Where it surfaces

| Surface | Behaviour |
|---|---|
| **Sidebar** | Gated items combine RBAC *and* entitlement, exactly like the existing `programsEnabled && can(...)` pattern in `DashboardSidebar.tsx`. Entitlement-locked items stay **visible with a lock badge** rather than hidden — a hidden feature can't be sold. |
| **Create buttons** | At limit → button stays enabled, opens the upgrade sheet instead of the form. Never a dead control. |
| **Usage meters** | Products / customers / docs pages show "12 de 50" when a limit exists, nothing when unlimited. |
| **402 handling** | Central interceptor in the API client maps 402 → upgrade sheet, using `requiredPlan` from the body. One place, not per-call. |
| **Upgrade sheet** | Names the specific limit hit, the plan that lifts it, and the price. Links to `/planes` while self-serve checkout doesn't exist. |

### 6.3 Never gate these in the UI

Per §1: document type selection, contingency mode, and export must have **no**
entitlement check anywhere in the POS — not even a cosmetic badge. A lock icon on a
legally required function is its own kind of wrong, regardless of what the backend
would allow.

---

## 7. Org creation

Current onboarding (`fe/pos-system` + `OrganizationController`) is 3 steps:
basic info → contact → template, with `onboardingStep` tracking progress.

**Do not add a plan-selection step.** Every new org starts on **Semilla**, silently:

1. Step 1 creates the org → also create `organization_subscriptions` with
   `planId: 'semilla'`, `status: 'active'`, no period bounds.
2. Steps 2 and 3 unchanged.
3. Reconcile `organization_modules` to Semilla's module set on activation (§3.1).

Rationale: asking someone to choose a plan before they have seen the product costs
signups, and the free tier is the honest default. Upgrade is a *later* moment,
triggered by hitting a limit — which is exactly when the value is legible.

The one exception: **Feria** orgs are provisioned by a platform admin (set `planId`
+ `overrides` directly), because Feria is a conversation, not a checkout.

### 7.1 Backfill

Every existing org gets a Semilla subscription row. Then, before flipping
`PLAN_ENFORCEMENT=enforce`, find orgs already over a Semilla limit:

```sql
-- orgs that would be blocked the moment enforcement turns on
SELECT o.id, o.name, COUNT(p.id) AS products
FROM organizations o LEFT JOIN products p ON p.organization_id = o.id
GROUP BY o.id, o.name HAVING COUNT(p.id) > 50;
```

Grandfather them via `overrides` rather than silently breaking them. An org that has
been using the product happily must not wake up locked out because we shipped
billing. This is the step most likely to be skipped and most likely to hurt.

---

## 8. Stripe

Currently schema-only: `organizations.stripeCustomerId` exists, no SDK, no keys.
**Everything above works with zero Stripe** — plan assignment, entitlements, and
enforcement are independent of payment collection, and `feria` never touches it.

Build and ship §4–§7 first. Payment collection is a separate milestone (TSR-146),
and the guardrail from TSR-084 still stands: **the pricing model must be published
before Stripe activates.** It now is.

When it does land: Stripe is the source of truth for *payment state only*.
`organization_subscriptions.status` is updated from webhooks; entitlement resolution
never calls Stripe on the request path.

`past_due` must **not** immediately downgrade. Use a grace period (`status: 'grace'`,
entitlements unchanged) — a failed card is usually an expired card, not a churn
decision, and cutting off a merchant's POS mid-sale over it is indefensible.

---

## 9. Keeping the landing and the backend honest

Two representations of the same model now exist:

- `fe/landing/src/content/plans.json` — **marketing copy**, bilingual, admin-editable.
- `plans` + `plan_entitlements` — **machine-readable truth**, enforced.

They will drift. A tier that says "hasta 5 personas" while the backend allows 3 is a
support incident and a trust problem.

Mitigation, cheapest first:

1. **A test that asserts the numbers match.** Parse `plans.json` in a
   `management-be` test and compare the tier ids and every numeric limit against the
   seed. Fails CI on drift. Start here.
2. Longer term, generate the landing's limit strings from the seed.

Tier ids are the join key: `semilla` / `cosecha` / `cooperativa` / `feria` must be
identical in both, and in `plans.json.comparison.rows[].values`.

---

## 10. Build order

| # | Step | Blocks |
|---|---|---|
| 1 | `plans`, `plan_entitlements`, `organization_subscriptions` + seed (§4) | everything |
| 2 | Backfill every existing org to Semilla (§7.1) | enforcement |
| 3 | `EntitlementService` + `GET …/entitlements` (§5.1, §5.5) | POS work |
| 4 | Middleware at `PLAN_ENFORCEMENT=log` (§5.2) | — |
| 5 | `useEntitlements()` + usage meters + upgrade sheet (§6) | enforce |
| 6 | Drift test between `plans.json` and the seed (§9) | — |
| 7 | Review `log` denials, grandfather overages, flip to `enforce` | — |
| 8 | `sales-be` integration for `docs.perMonth` (§5.4) | — |
| 9 | Flip `plans.json.config.ctaComingSoon` → `false` in the admin | — |
| 10 | Stripe (TSR-146) — separate milestone | — |

Steps 1–7 deliver a working, enforceable plan system with no payment integration at
all. That is the useful checkpoint: at step 7 the product genuinely has tiers, and
the only thing missing is collecting money.

---

## 11. Open questions

1. **`docs.perMonth: 30` on Semilla** — a volume cap on a legally required function
   is the same *kind* of exposure §1 exists to prevent, just softer. A merchant who
   hits 30 on the 20th cannot legally invoice for 10 days. Options: raise it, make
   it a soft cap (warn, never block), or accept it. **Recommend soft-cap** — warn at
   80%, never return 402 on emission. Needs an owner decision.
2. **Cooperativa's ₡45.000 / ₡450.000 is invented.** Cosecha's numbers came from
   `fe/pos-landing`'s real config; Cooperativa's did not. Confirm before
   `draftPricing` is turned off.
3. **Terminals on Cosecha** — the landing comparison says `1 · 3` (1 branch, 3
   terminals) while the tier card says "1 sucursal · 1 terminal" for Semilla only.
   Confirm Cosecha's terminal count.
4. **Does `fe/pos-landing` stay?** It carries its own Free/Pro pricing in
   `public/config.json`, which is now a third representation of the model. Either
   retire it, point it at the same tiers, or scope it explicitly as a different
   product's marketing.
