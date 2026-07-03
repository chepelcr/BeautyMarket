# Tsuru Ferias — Product Specification

**Date:** 2026-06-11
**Status:** Approved direction (user decision 2026-06-11). Product spec — implementation follows `tsuru_fairs_architecture.md`.
**Owner decisions encoded here:**
1. Public fairs application simulating a real fair with stands; orgs join 1+ fairs.
2. Stand is editable from the POS app as an **independent section** (images, colors, multiple stand types, preview modal); stand defaults to the org's store template theme.
3. Fairs get their **own backend service**; all BE apps share the one Postgres.
4. Fairs are managed from the **Tsuru admin** (the admin that manages the landing) **connected to the fairs BE** — hybrid model: the landing public site stays 100% static JSON DXP; only admin sections become BE-connected.
5. **Trueque (barter) MVP** is integrated: stands publish product-for-product offers with accept/decline and WhatsApp handoff. No ledger/credits in v1.

**Companion docs:** `docs/roadmap/tsuru_fairs_architecture.md` (technical design), `docs/roadmap/tsuru_rebrand_plan.md` (Tsuru rebrand — fairs copy moves to "in active development"), `docs/roadmap/rbac_express_contract.md` (RBAC workstream).

---

## 1. Why this product, and why now

The landing has been marketing fairs and barter for years with **zero implementation**:

- `docs/audit/tsuru/tsuru_reconciliation_report.md` row #12: *"Fairs as organized events… No fair/event entity, endpoint, or UI exists in any of the 7 systems. `Ferias.tsx` even shows an 'Active fairs' badge over static JSON."* — verdict **Not built**, honesty score **1/10** (the worst page on the site).
- Row #11: barter/trueque — *"Zero implementation… The flagship differentiator is pure marketing copy."*
- Row #13: fair registration — *"No registration/application feature anywhere."*

The promises already published in `landing-client/src/content/fairs.json` define the product surface the public expects: **virtual fairs**, **local/physical fairs**, **barter & exchange fairs**, and a 3-step join flow ("Configura tu tienda → Inscríbete en una feria → Vende y conecta"). This spec builds exactly that — and turns the reconciliation report's worst row into the rebranded Tsuru's flagship community feature.

Strategically (per the Tsuru rebrand plan), fairs are the **acquisition and engagement layer** on top of the daily-use anchor (POS + free e-invoicing). They are not a standalone bet — the Hopin lesson is that episodic-event value evaporates; recurring merchant value (always-on stand, barter exchanges, analytics inside the POS they already open daily) is what survives.

---

## 2. Concept

A **public fairs web app** that simulates a real Costa Rican feria:

```
Fair directory  →  Fair "floor" (hall of stands)  →  Stand page
(/                  /feria/:slug                      /feria/:slug/:standSlug)
```

- **Mobile-first, 2D card-grid hall.** No 3D. Industry evidence: most "3D booths" are decorative 2D overlays starting at $25k+, and "the simplest interfaces are the most powerful" (PheedLoop). The fair *feeling* comes from the stand-type visual frame (toldo/awning illustration, counter graphic), applied as a skin — progressive enhancement, never the engine. Target audience browses on low-end Android over mobile data.
- **WhatsApp-first contact.** The single conversion action on every stand is a one-click WhatsApp CTA (prefilled `wa.me` link with fair + stand context). No visitor accounts, no forms between visitor and merchant — registration walls have documented drop-off, and the Feria Emprendedora Peru model (commission-free, direct WhatsApp) is the regional pattern that works.
- **Public browsing requires no auth.** Visitors browse fairs, stands, products, and barter offers anonymously. Merchants act from the POS; platform admins act from the Tsuru admin.
- **Stands are branded micro-pages with fixed slots, not freeform HTML**: logo, banner, brand colors, short description, image gallery, featured products (from the org's existing POS catalog), contact CTA, optional barter offers. Slot-based content is the canonical pattern across vFairs/BigMarker/meetyoo and prevents the broken-stand failure mode.
- **Permanent + event fairs.** `fair.type = 'event' | 'permanent'`. The LATAM "feria online" pattern (Feria de Emprendedores) is a permanent directory; time-boxed fairs map to real CR commercial moments (Día de la Madre, ferias del agricultor, Navidad). Both run on the same model. Anchoring to permanent fairs is the primary mitigation against the ghost-town effect.

### 2.1 Product principles

| Principle | Consequence |
|---|---|
| The POS catalog is the unfair advantage | Stand products are a **picker over the existing catalog** (shared `products` table — see `E:/dev/cross-app-be/app/models/product.py`), never re-entry. Prices/photos already exist. |
| Defaults beat blank canvases | Stand inherits the org's store template theme (`templates/pos-system/src/theme/themes.ts`) + logo + products → first edit session is curation, not creation. Target: stand presentable in <10 minutes. |
| Never show an empty hall | A fair is not publishable below a minimum stand count (configurable, default 6 published stands). |
| Quality control without friction | Minimum-content gate to publish a stand (logo + banner/1 image + contact) + organizer approve/hide controls in the Tsuru admin (the vFairs organizer-lock pattern). |
| Analytics from day one | Stand views, product clicks, and WhatsApp taps tracked and surfaced in the POS Ferias section. This is the exhibitor-retention lever and the future premium-tier justification. |

---

## 3. Domain model (product view)

```
Fair (event or permanent, themed, dated)
 ├── offers StandTypes (tiered, data-defined, optional per-type caps)
 ├── FairParticipation (org ⇄ fair: applied/approved/rejected/withdrawn)
 │     └── Stand (the org's presence in THIS fair; per-fair instance)
 │           ├── inherits from the org's StandProfile (master defaults)
 │           ├── StandAssets (banner, gallery images — fixed slots)
 │           ├── featured products (references to shared products table)
 │           └── BarterOffers (trueque MVP)
 └── zone/category tags on stands (food, beauty, crafts…) — filtering, NOT a hall entity
```

Zones are a string tag on the stand (plus fair-level category list), not a modeled "hall" entity — vFairs' halls/floors are unnecessary at MVP scale; a filter bar achieves the same discovery.

**Master profile + per-fair instance.** Each org has ONE `StandProfile` (default content: theme, logo, description, contact, default featured products). Joining a fair creates a `Stand` that **inherits** the profile but allows per-fair overrides (swap banner, swap featured products, fair-specific blurb). This mirrors how exhibitors reuse a booth across events on vFairs and means joining a second fair is one click, not a second setup.

---

## 4. Fair lifecycle

```
draft ──publish──▶ published ──(startsAt reached / permanent)──▶ live ──(endsAt)──▶ ended ──▶ archived
  ▲                    │
  └────unpublish───────┘
```

| State | Visible publicly? | Merchants can join? | Stands editable? | Barter offers |
|---|---|---|---|---|
| `draft` | No | By invitation only (admin pre-seeds) | Yes (setup window) | No |
| `published` (pre-live, event type) | Yes — "próximamente" page with countdown + participating stands teaser | Yes | Yes | Visible but not actionable until live (optional flag) |
| `live` | Yes — full hall | Yes (if `allowLateJoin`) | Yes | Fully active |
| `ended` | Yes — read-only archive ("feria finalizada" banner), CTAs disabled per fair setting | No | No | Auto-expired |
| `archived` | No (admin only) | No | No | — |

- **Permanent fairs** skip the date machinery: `published` ⇒ `live` immediately, no `ended` until an admin closes them.
- **Dates:** `startsAt`/`endsAt` (nullable for permanent), plus `setupOpensAt` (exhibitor setup window before go-live — the standard pre-event setup phase).
- **Fair branding:** name, slug, bilingual description (ES/EN like all Tsuru content), cover image, accent color, category tags, and which stand types it offers (with optional per-type count caps — the tiered-package pattern).

---

## 5. Participation: how an org joins a fair

**Recommendation: application with per-fair auto-approve.** A single flow covers both worlds:

- `fair.joinPolicy = 'open' | 'apply' | 'invite'`
  - `open` → application auto-approved (permanent directory fairs; lowest friction; matches "Inscríbete en una feria" copy).
  - `apply` → platform admin approves in the Tsuru admin (curated/seasonal fairs; the approval step is the quality-control lever vFairs organizers rely on).
  - `invite` → admin pre-seeds participations (launch fairs, flagship events).

Participation lifecycle: `applied → approved | rejected`, plus `withdrawn` (merchant exits) and `removed` (admin moderation). On `approved`, a `Stand` is created in `draft`, pre-filled from the org's StandProfile, and the merchant is pointed at the setup checklist in the POS.

**Stand allocation:** the merchant picks a stand type from those the fair offers (subject to remaining caps). Tier upgrades/downgrades allowed while the fair is not `ended`. Ordering within the hall: featured placement first (admin-controlled `sortOrder` + tier `sortPriority`), then recency.

---

## 6. Stand types

Stand types are **data, not code** (same mental model as the existing `templates` table: a metadata row, content elsewhere — `server/src/entities/Template.ts`). Definition shape:

```
StandType {
  name, displayName(es/en), tier,
  cardSize: 'sm' | 'md' | 'lg',        // hall card footprint
  maxGalleryImages, maxProducts,
  allowsVideo, allowsBarter, featuredPlacement,
  frameAssets (skin: awning/counter/banner illustration set),
  sortPriority, isActive
}
```

### 6.1 The v1 catalog (4 types: 3 tiers + 1 layout variant)

| | **Toldo** (tier 1, default) | **Stand** (tier 2) | **Galería** (tier 2 — layout variant) | **Pabellón** (tier 3) |
|---|---|---|---|---|
| Hall card | `sm` | `md` | `md`, image-forward card | `lg` + featured placement at top of hall |
| Logo + banner | ✔ logo, 1 banner | ✔ | ✔ | ✔ + custom accent color override |
| Gallery | — | up to 8 images | up to 12 images, gallery-first layout | unlimited (soft cap 24) |
| Featured products | 4 | 12 | 6 (gallery dominates) | unlimited (soft cap 48) |
| Video embed | — | ✔ | ✔ | ✔ |
| **Barter offers (trueque)** | — | ✔ | ✔ | ✔ |
| Placement | standard | standard | standard | priority (top rows) |
| Frame/skin | simple toldo (awning) graphic | market-stall frame | frame minimized, images dominate | pavilion frame, larger header |

Notes:
- Tier = bigger hall card + more slots + placement priority, **not different tech** (vFairs tiered-package pattern).
- **Galería** is the layout-variant proof point (image-forward for artisans/beauty — Virtuloc templates differ mainly in size and media-area count). A service-first "Mostrador" variant goes to backlog.
- Seasonal skins ("Feria del Agricultor" produce stall, Christmas) are `frameAssets` sets an admin enables per fair — assets only, no new code paths.
- All types are free in v1 (no billing exists — reconciliation #8). The tier structure is the future monetization surface; do not promise paid tiers in copy yet.
- A fair declares which types it offers via a join table with optional `maxCount` per type.

### 6.2 Stand content slots

Fixed slots with upload-time specs (sized-to-fit assets are the #1 self-serve failure point — validate at upload with built-in crop):

| Slot | Spec | Required to publish |
|---|---|---|
| Logo | 200×200 square (defaults from org `logo_url`) | ✔ |
| Banner | 1200×400 | ✔ (or 1 gallery image) |
| Short description | max 280 chars (content-restraint cap — no 10-page decks) | ✔ |
| Brand colors | inherited from org store template theme; accent override from a **curated palette** with automatic contrast check (no free CSS) | auto |
| Gallery | 4:3 images, count capped by stand type | — |
| Featured products | picker over the org's POS catalog, capped by type; shows name/photo/price from `products` | recommended (≥1 for hall card richness) |
| Contact | WhatsApp number (required — the only CTA), optional IG/FB/store-subdomain links | ✔ |
| Zone/category tag | one of the fair's category list | ✔ |
| Video embed | YouTube/Vimeo URL (types that allow it); never autoplay (mobile data) | — |
| Barter offers | see §9 | — |

Stand status: `draft → pending_review → published → hidden` (admin can hide; merchant can unpublish back to draft). Fairs with `joinPolicy='open'` may set `standReview=false` so `draft → published` directly once the minimum-content gate passes.

### 6.3 Theme inheritance (decision 2)

The stand's default look = the org's store template theme. Mechanism (full detail in architecture doc §7):

- The POS already resolves a per-org theme: `org.theme` → `org.template_name` → default, in `templates/pos-system/src/contexts/ThemeContext.tsx` (lines 105–112), against the registry in `templates/pos-system/src/theme/themes.ts` (`THEMES`, `THEME_TOKENS`, light/dark HSL token maps + fonts + radius).
- `StandProfile.themeRef` stores the same theme id (e.g. `beauty-essentials`); the public fairs SPA ships the same token registry and applies the stand's theme tokens **scoped to the stand page/card** (not `:root`).
- An org with the beauty-essentials store template gets a rose stand; artisan-crafts gets warm orange — instant brand consistency with zero setup. The Pabellón tier may override the accent token from the curated palette.

---

## 7. POS integration — the "Ferias" section (decision 2)

A new **independent dashboard section** in the POS app (standalone repo `chepelcr/tsuru-pos-system`), following the documented section conventions (POS `CLAUDE.md` §5: route constant in `src/routePaths.ts`, registration in `src/Routes.tsx`, `NAV_ITEMS` entry in `components/layout/DashboardSidebar.tsx`; §9 page-header/drawer/section-form patterns; §10 all strings through `t()` in both ES and EN).

### 7.1 Pages

| Route | Page | Content |
|---|---|---|
| `/dashboard/fairs` | FairsPage | Two zones: **Mis ferias** (participation cards: fair name, dates, status badge, stand completeness meter, stand metrics summary) and **Ferias disponibles** (joinable fairs with "Participar" CTA). |
| `/dashboard/fairs/stand` | StandProfilePage | The org's **master stand profile** editor (default content reused across fairs). |
| `/dashboard/fairs/:fairId` | FairParticipationPage | Per-fair stand editor (inherits profile, per-fair overrides), participation status, barter offers tab, metrics tab. |

### 7.2 Stand editor

Built from the existing **section-based form pattern** (`<SectionWrapper>` collapsible sections, parent owning state + expansion map — POS `CLAUDE.md` §4.1) and the `<Drawer>` pattern for sub-flows:

Sections: **Tipo de stand** (type picker with tier comparison) · **Identidad** (logo, banner, colors — theme default shown, curated accent picker) · **Descripción y zona** · **Galería** (slot grid with crop, per-type cap) · **Productos destacados** (catalog picker reusing the products list UI) · **Contacto** (WhatsApp required) · **Trueque** (offers — §9).

**Setup checklist with completeness meter** (BigMarker booth-status pattern): 1) choose stand type → 2) confirm colors/logo → 3) pick products → 4) add gallery images → 5) set WhatsApp. "Publicar stand" is gated on the minimum-content rule (§6.2). Every field beyond the gate is optional — onboarding friction kills exhibitor supply.

### 7.3 Preview modal

A modal (design-system `.overlay-backdrop` + modal classes, `z-modal`) with:

- **Two tabs:** *"Mi stand"* (full stand page render) and *"En la feria"* (the hall card exactly as visitors see it) — previewing both renders is the table-stakes builder pattern (BigMarker).
- **Viewport toggle:** mobile (default — CR visitors browse on phones) / desktop.
- Renders from the **local unsaved editor state** mapped through the same stand-rendering components the public SPA uses (shared rendering package — architecture doc §7.3), with theme tokens applied scoped to the preview container.

### 7.4 Metrics in the POS

Per stand: views, product clicks, WhatsApp taps, barter proposals received/completed — daily series + totals. Surfaced on the participation card and a metrics tab. This is the retention lever: exhibitors return when they can prove contacts happened.

---

## 8. Tsuru admin — fairs management (decision 2 second half, hybrid model)

Fairs are managed from the admin that manages the landing (`landing-client/src/admin/`), **connected to the fairs BE**. Hybrid rule:

- The **public landing site stays 100% static JSON DXP** (no runtime backend — `landing-client/CLAUDE.md`: "deploys 100% static"). The public `/ferias` marketing page keeps reading `src/content/fairs.json`, updated per the rebrand plan to "in active development" then to live links.
- **Only admin sections become BE-connected.** The manifest already supports API-backed admin pages via `online: true` (the read-only Templates page precedent — `landing-client/src/admin/manifest.ts` lines 15–30, 128–133). Fairs admin pages extend this from read-only to read-write against the fairs BE.
- **Auth prerequisite:** today the admin is dev-only/tree-shaken with NO authentication (`landing-client/CLAUDE.md` "Admin tree-shake gate"). BE-connected write sections require real auth: Cognito login (platform-admin group) for the admin app, with the fairs BE enforcing the admin claim server-side on every request regardless of any client gate. See architecture doc §8.

New admin group **"Ferias (online)"** with pages:

| Page | Capabilities |
|---|---|
| Fairs CRUD | Create/edit fairs (name, slug, bilingual copy, cover, accent, dates, type, joinPolicy, categories, offered stand types + caps, minimum-stand threshold), lifecycle transitions (publish/end/archive). |
| Stand-type catalog | CRUD over `stand_types` (the data-defined catalog of §6), activate/deactivate, frame-asset upload. |
| Participation moderation | Approve/reject applications, remove participations, review `pending_review` stands, hide/unhide published stands. |
| Featured ordering | Drag-order featured stands per fair (writes `sortOrder`); pin Pabellón placements. |
| Trueque moderation | Reported-offers queue: hide offer, warn stand, remove stand from barter (§9.5). |
| Fair analytics | Per-fair totals: visits, stand views, WhatsApp taps, barter activity. |

---

## 9. Trueque (barter) MVP (decision 4)

Barter fairs are a published promise (`fairs.json` types[2]: "intercambio de productos o servicios sin dinero — Economía Social Solidaria pura") with zero implementation (reconciliation #11). The MVP makes it real with the smallest defensible scope.

### 9.1 Scope: direct swaps, no credits

**Direct product-for-product swaps only.** No ledger, no credits, no platform currency in v1. The Argentine Red Global de Trueque is the cautionary tale: its "crédito" social currency collapsed through uncontrolled emission, mass counterfeiting, and internal hyperinflation — a currency is a monetary-governance problem, not a CRUD feature. v1 records agreements; money-like mechanics are explicitly deferred (§9.6).

### 9.2 The offer object

```
BarterOffer {
  standId,                       // the offering stand (org identified — fairs are curated, no anonymity problem)
  offeredProductIds[1..3],       // CONCRETE products from the org's POS catalog (photos + reference prices shown)
  wantedDescription,             // free-text "lo que busco a cambio" (the demand signal that raises match rates)
  wantedProductHint?,            // optional structured category tag
  status: open → accepted | declined | expired | cancelled | completed,
  settlementType: 'direct'       // forward-compat column for the v2 credit path — no migration pain later
}
BarterProposal {                 // counterparty response; explicit two-sided accept required
  offerId, proposerStandId, proposedProductIds[1..3], message?(280),
  status: proposed → accepted | declined | withdrawn
}
```

Catalog-backed specificity is deliberate: "vague agreements create vague outcomes" — naming concrete products with photos and the POS reference price gives both sides an implicit fairness anchor without building fair-value automation.

### 9.3 Lifecycle and WhatsApp handoff

```
Stand A publishes offer (open, "Ofrezco X / Busco …")
  → Stand B proposes (proposed, concrete products)
    → A accepts → offer 'accepted', proposal 'accepted'
        → both sides get a prefilled wa.me link with full context
          (fair name, both stand names, offered/proposed products)
        → negotiation + logistics happen ON WHATSAPP (no in-app chat/escrow/disputes in v1)
        → either side later marks 'completed' (optional, increments the stand's completed-trades count)
    → A declines → proposal 'declined', offer stays open
Offer auto-expires when the fair ends (event fairs) or after 60 days (permanent fairs).
```

Only state transitions and the handoff timestamp are recorded. Requiring explicit two-sided accept before anything is "agreed" is the core barter-platform lesson (Barter.vg), and the WhatsApp handoff mirrors the model already core to Tsuru's storefronts.

### 9.4 Visibility & liquidity rules

- Offers live **inside fairs** — concentrated, discoverable liquidity (the reason physical ferias de trueque and Argentine "nodos" worked: everyone shows up in the same place). No global barter marketplace in v1.
- The fair floor gets a **"Trueque" filter/section**; stands with active offers get a "Trueque" badge on their hall card (the seasonal-badge mechanism of §6.1).
- Offers are visible to the public (browsing is anonymous) but **proposing requires a participating stand in the same fair** (merchant acts from the POS Trueque tab).
- Only stand types with `allowsBarter` can publish offers (Toldo excluded — a soft upgrade incentive).
- Active-offer cap per stand (default 5) to prevent catalog-dumping.

### 9.5 Abuse basics (built BEFORE launch)

Scams appeared within one week of Barter.vg launching offers — report + moderate ships with the MVP, ratings/reviews wait:

- Every offer shows the stand/org behind it (orgs are already platform-identified).
- Public **"Reportar"** action on offers (reason enum + free text, no account needed, rate-limited).
- Tsuru admin moderation queue: hide offer, warn stand, disable barter for a stand, remove participation (§8).
- Completed-trades count per stand as the v1 trust signal.

### 9.6 Future path: mutual credit (v2+, OUT of scope)

Documented so v1 schema decisions don't block it: `settlementType` column from day one; if credits ever come, the Argentine lessons are strict emission control, issuance transparency, non-convertibility to cash, and central anti-fraud governance — and complementary currencies historically work as a *complement* to the formal economy, never a replacement. A future `barter_ledger` would be a new fairs-BE-owned table; nothing in v1 needs migration.

---

## 10. User journeys

### 10.1 Visitor (no account)

1. Opens the fairs SPA (link from landing `/ferias`, WhatsApp share, or social) on a phone.
2. Fair directory: live + upcoming fairs (cover, dates, stand count). Taps "Feria Navideña".
3. Fair floor: 2D card grid of stands (logo, name, zone badge, 1–3 product thumbnails, trueque badge), search + zone filter + trueque filter. Pabellón stands on top.
4. Taps a stand → stand page in the org's theme: banner, description, gallery, featured products with prices, barter offers.
5. Taps **"Escribir por WhatsApp"** → wa.me opens prefilled ("Hola, vi tu stand en la Feria Navideña de Tsuru…"). *Conversion complete — view + tap recorded.*

### 10.2 Participating merchant

1. In the POS sees the "Ferias" nav item → FairsPage shows "Ferias disponibles".
2. Taps "Participar" on an open fair → picks stand type (Toldo default) → participation approved (open policy) → stand drafted from her profile: theme, logo, products already in place.
3. Checklist says 3/5 done. Adds 2 gallery photos, confirms WhatsApp number → opens **preview modal**, checks "En la feria" tab on mobile viewport → publishes. Under 10 minutes.
4. During the fair: metrics tab shows 240 views, 18 WhatsApp taps. Publishes a trueque offer ("Ofrezco 2 jabones artesanales / Busco miel"). Accepts a proposal from another stand → WhatsApp handoff → marks completed.
5. Next fair: joins in one click — stand profile carries over, swaps the banner only.

### 10.3 Platform admin

1. Logs into the Tsuru admin (Cognito, platform-admin group) → "Ferias (online)" group.
2. Creates "Feria del Día de la Madre" (event, apply policy, categories, offers Toldo/Stand/Galería + 3 Pabellón slots, setup window 2 weeks before).
3. Reviews applications; approves 14, rejects 1 incomplete. Reviews `pending_review` stands; hides one off-brand stand with a note.
4. Orders featured stands, publishes the fair when 6+ stands are live-ready.
5. During the fair: handles 1 reported barter offer (hides it). After `endsAt`: fair auto-ends, archive page stays, reviews fair analytics.

---

## 11. MVP cut vs backlog

### MVP (v1)

- Fairs BE service + schema (fairs, stand types, participations, stands, assets, barter, metrics).
- Public fairs SPA: directory, fair floor (search/zone/trueque filters), stand page, WhatsApp CTA, ended-fair archive. Mobile-first; ES first, EN structure-ready.
- Fair lifecycle (draft/published/live/ended/archived), event + permanent types, joinPolicy open/apply/invite.
- 4 stand types as data; minimum-content publish gate; `pending_review` flow.
- POS Ferias section: join, master profile + per-fair stand editor (sections + checklist), preview modal (two tabs + viewport toggle), participation status, metrics tab.
- Theme inheritance from org store template + curated accent override.
- Tsuru admin "Ferias (online)": fairs CRUD, stand-type catalog, moderation, featured ordering, trueque moderation queue. (Requires the admin-auth prerequisite — architecture §8.)
- Trueque MVP: offers + proposals, accept/decline, WhatsApp handoff, trueque filter/badge, report + moderation, auto-expiry.
- Analytics: stand views, product clicks, WhatsApp taps, barter counters; POS + admin surfacing.

### Backlog (explicitly NOT v1)

- Visitor accounts, favorites, follows, notifications; in-app chat/inbox.
- In-fair checkout/orders (contact stays WhatsApp); commissions of any kind.
- Mutual-credit / ledger trueque (§9.6); barter ratings & reviews.
- 3D/illustrated hall renderers beyond frame skins; hall/zone as modeled entities.
- "Mostrador" service-first stand variant; per-stand custom domains; stand video calls / live demos ("rep seats").
- Self-serve fair creation by orgs (community-organized fairs) — admin-curated only in v1.
- Paid stand tiers / billing integration; multi-org cooperative stands.
- Matching algorithm for barter (wish-list matching); cross-fair global barter board.

---

## 12. Risks & mitigations (research-grounded)

| Risk | Mitigation in this spec |
|---|---|
| Ghost-town effect (Hopin collapse; 41% of registrants no-show) | Permanent fairs as the backbone; event fairs anchored to real CR commercial moments; minimum-stand publish threshold; never an empty hall. |
| Exhibitor onboarding friction kills supply | Theme + catalog inheritance, <10-min setup target, checklist, only 3 required fields beyond defaults. |
| Half-finished public stands | Minimum-content gate + organizer review/hide (vFairs lock pattern). |
| Episodic value evaporates | Fairs are the engagement layer on the POS/e-invoicing anchor; always-on stand + metrics in the app merchants open daily. |
| Barter scams / disputes | Catalog-backed concrete offers, two-sided accept, report+moderate at launch, identified orgs only, no money/credits. |
| Over-engineering visuals | 2D card grid engine; frames are skins; no autoplay; low-end Android budget. |
| Visitor friction | No accounts, no forms; WhatsApp is the only conversion step. |
| Marketing-reality gap repeats | Landing fairs copy stays roadmap-framed until the SPA is live (rebrand plan rule); the "Active fairs" badge only returns when it reads from the live public API. |

---

## 13. Open questions (for the implementation workflow)

1. Public hostname: `ferias.tsuru.jcampos.dev` now vs waiting for the Tsuru domain workstream (architecture doc recommends deploying under the current domain and treating the rename as the existing separate infra workstream).
2. Whether `completed` barter trades require both parties to confirm or one-side mark (spec default: one-side mark, counter visible to both).
3. Per-fair vs global category taxonomy (spec default: global list curated in admin, fairs select a subset).
4. Stand slug collision policy across fairs (default: org slug reused per fair, `/feria/:fairSlug/:orgSlug`).
