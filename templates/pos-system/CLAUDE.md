# POS System — Agent Working Guide

This document gives Claude (or any agent) the context needed to navigate and modify the POS system **without re-reading the whole codebase**. Read this first, then dive into specific files.

> Living document. When you add a new pattern, new shared class, new hook, or new API surface — update the relevant section here so the next agent doesn't reinvent it.

---

## 1. What this is

A Vite + React 18 + TypeScript single-page app that is **one of several store-front templates** in `BeautyMarket/templates/`. It serves as both:
- **POS workstation** (`/dashboard/pos`, `/pos/*`) — cashier-facing checkout flow
- **Admin dashboard** (`/dashboard/*`) — products, clients, sessions, stations, electronic invoicing (documents), assignments, reports

It is deployed independently per organization to its own subdomain (`{org}.j-markets.jcampos.dev`).

**Stack** (versions are intentional — don't bump without checking):
- React 18.3, TypeScript 5.6, Vite 5.4
- **Routing**: `wouter` (NOT react-router) — single-file in `src/Routes.tsx`, paths centralized in `src/routePaths.ts`
- **Server state**: `@tanstack/react-query` v5
- **Client state**: `zustand` v4 (cart, inventory, sessionContext, documentStore) + React Context (auth, org, language, dark mode, doc version)
- **Forms**: `react-hook-form` + `zod`
- **Auth**: `aws-amplify/auth` (Cognito) — token injected into every request via `getToken()` in `src/lib/api.ts`
- **Local DB**: `dexie` (IndexedDB) for offline inventory cache (`src/lib/db.ts`)
- **Icons**: `lucide-react` directly, OR the project's `<Icon name="..." />` wrapper in `src/components/ui/Icon.tsx` (custom curated set with `IconName` union)
- **Styling**: Tailwind CSS 3.4 + custom design-system CSS in `src/index.css`. See §3.

---

## 2. Three backend APIs

Requests are split across **three independent API Gateways**. Always use the helper from `src/lib/api.ts` — never hardcode URLs.

| Helper | Base | Purpose | Path builder |
|---|---|---|---|
| `api` | `VITE_API_URL` (markets-api) | User profile, org membership | `orgPath(userId, orgId, endpoint)` → `/api/users/{u}/memberships/organization/{o}{e}`, `userPath(userId, endpoint)` |
| `crossAppApi` | `VITE_ORDERS_API_URL` (cross-app-be) | Sessions, assignments, branches, terminals, dashboard, closings, clients, dataApi | `crossAppOrgPath(orgId, endpoint)` → `/api/organizations/{o}{e}`, `crossAppUserOrgPath(userId, orgId, endpoint)` |
| `ordersApi` | same base as crossApp | Products, categories | `ordersOrgPath(orgId, endpoint)` |
| `salesApi` | `VITE_SALES_API_URL` (sales-api) | Electronic invoices, validation, XML, notifications | `salesOrgPath(orgId, suffix)`, `validationPath`, `xmlPath`, `notifyPath` |

**Important quirk**: `crossAppApi` requests automatically include `x-user-id` header extracted from the Cognito JWT `sub` claim. The markets-api does not.

**Data API** (`/api/data/*` under `crossAppApi`, served by `src/services/data-api/`): catalogs from Hacienda — CABYS codes, tax types/rates/factors, identifications, countries, states/counties/districts, discount types, etc. **All data-api hooks live in `src/hooks/useDataApi.ts`** — check there before adding a new fetch.

The `document_version_id` param is auto-injected by `DocumentVersionContext` for many data-api calls (sale conditions, factory charges, reference codes). Don't pass it manually.

---

## 3. Design System — READ THIS BEFORE STYLING

**The system has zero hardcoded styles.** Every color, font, shadow, z-index is design-system-driven via CSS variables. When adding UI, **never** use:
- ❌ Hex literals (`#D4A874`, `#fff`)
- ❌ rgba literals (except inside `:root`/`.dark` blocks in index.css)
- ❌ Hardcoded font stacks (`"'DM Sans', ..."`)
- ❌ Magic z-index numbers (`z-[110]`, `zIndex: 100`)
- ❌ Inline `style={{...}}` with `hsl(var(...))` strings — use the className instead

### 3.1 CSS variables (defined in `src/index.css`, light + dark)

```
Colors:  --background --foreground --card --primary --secondary
         --muted --accent --destructive --success --warning --info
         --border --input --ring --sidebar (+ sidebar-* variants)
         --accent-rose (+ -soft -dim -border)  ← rose theme color
Fonts:   --font-sans (Barlow) --font-display (Barlow Condensed) --font-mono (JetBrains Mono)
Radius:  --radius (0.5rem)
Z-index: --z-dropdown(30) --z-overlay(40) --z-modal(50) --z-tooltip(100)
Shadows: --shadow-card --shadow-card-hover --shadow-dropdown --shadow-dropdown-up --shadow-modal
```

### 3.2 How to apply them

| You want | Use |
|---|---|
| Color text | Tailwind `text-foreground / text-muted-foreground / text-primary / text-destructive / text-success / text-warning / text-info / text-accent-rose` |
| Color bg | `bg-card / bg-background / bg-muted / bg-primary / bg-success / bg-accent-rose-soft` etc. With opacity: `bg-muted/30`, `bg-primary/[0.06]` |
| Border | `border border-border`, `border-primary/30`, `border-accent-rose-border` |
| Shadow | `shadow-card / shadow-card-hover / shadow-dropdown / shadow-dropdown-up / shadow-modal` |
| Z-index | `z-dropdown / z-overlay / z-modal / z-tooltip` |
| Fonts | `font-sans / font-display / font-mono` |

### 3.3 Component classes (defined in `src/index.css` — prefer these over recomposing)

- **Typography**: `.t-h1 .t-h2 .t-h3 .t-h4 .t-body .t-sm .t-xs .t-label .t-num .t-stat .t-stat-xl`
- **Buttons**: `.btn` (base) + variant `.btn-primary/secondary/outline/ghost/destructive/success` + size `.btn-sm/xs/lg/xl` + `.btn-icon`. Soft variants: `.btn-primary-soft / .btn-success-soft / .btn-warning-soft / .btn-destructive-soft`. Icon aliases: `.btn-icon-ghost / .btn-icon-ghost-sm / .btn-icon-ghost-xs`
- **Cards**: `.card .card-hover .card-muted .card-primary .card-stat .card-surface-muted`
- **Inputs**: `.pp-input` (+ `.pp-input-sm .pp-input-lg`), `.input` (+ sizes), `.client-input` (muted-bg variant used in client forms), `.input-search`, `.pp-label`, `.label`
- **Badges**: `.badge` + `.badge-default/secondary/outline/success/warning/destructive/info/primary-soft`. Mini: `.badge-mini` + `-success/-warning/-destructive/-info/-primary/-rose`
- **Icon pills**: `.icon-pill .icon-pill-lg` + `-success/-warning/-info/-muted` (+ `-primary-soft / -rose-soft`)
- **Tabs**: `.tabs .tab` (toggle active via `aria-selected="true"`)
- **Sidebar**: `.sidebar .sidebar-item` (active via `.active` class)
- **Status dots**: `.status-dot` + `-success/-warning/-destructive/-live` (live has pulse animation)
- **Progress**: `.progress .progress-bar .progress-thin`
- **Tables**: `.pp-th` (header) `.pp-td` (cell)
- **Dropdowns/Overlays**: `.dropdown-menu` (+ `.dropdown-menu-up` for upward shadow), `.overlay-backdrop` (+ `.overlay-backdrop-dim`)
- **Empty state**: `.empty-state` (use the `<EmptyState/>` component when possible)
- **Section labels**: `.label-section` (11px uppercase muted — the repeated section header pattern)
- **Skeletons**: `.skeleton-block .skeleton-block-dim`. Animation: Tailwind `animate-pulse`
- **Animations**: `.fade-up .fade-in .slide-up .docs-fade-in`. Drawer slide animations: `.drawer-overlay-enter/exit .drawer-panel-enter/exit .drawer-panel-left-enter/exit .drawer-panel-right-enter/exit`

### 3.4 Layout helpers (in index.css)

- `.session-page` — page wrapper (`max-w-1280` + responsive padding)
- `.grid-session`, `.grid-form`, `.grid-member` — common grid templates with responsive breakpoints
- `.tabs-container` — scroll-overflow wrapper for tab bars
- `.docs-toolbar` — container-query toolbar for the documents page
- `.dashboard-sidebar-toggle` — the slim peek handle behind the sidebar
- `.inv-desktop / .inv-mobile` — inventory table dual layout (desktop table, mobile cards)

### 3.5 Dark mode

Toggled via `class="dark"` on `<html>` (managed by `useDarkMode` hook). Every CSS var has a `.dark` override. Never write color logic that branches on `dark` in JS — let the CSS vars do it.

### 3.6 Legitimate remaining inline styles

A few cases still use inline `style={{}}`:
1. **Dynamic widths** computed from data (e.g. `style={{ width: \`${pct}%\` }}` for progress bars)
2. **SVG attributes** in `SalesChart.tsx` — `stroke`, `fill`, `stopColor` require actual values
3. **Prop fallback defaults** in `Drawer`, `DrawerHeader`, `StatCard`, `IconPill` — these accept caller-supplied colors and fall back to CSS var defaults
4. **Dynamic CSS-var name interpolation** — `` style={{ background: `hsl(var(--${color}))` }} `` where `color` is data-driven

These are OK because they're still design-system-driven. **Do not** add new inline styles for static values.

### 3.7 Theme tokens object

`src/theme/pos.ts` exports a `POS` token object (also re-exported as `T` in some files). It now resolves entirely to CSS variables. Prefer Tailwind classNames over `POS.*` references when writing new code; `POS.*` exists for legacy components.

---

## 4. Component structure

```
src/components/
├── ui/             ← Generic primitives (Button, Card, Drawer, Modal, Input, Icon, Badge,
│                     EmptyState, FadeIn, FormLabel, Logo, Menu, Pagination, ProductImage,
│                     Spinner, SyncPill, LocationSelect, PageTransition, ImagePicker)
│                     Always export from `index.ts`. Always accept `className` prop.
├── common/         ← Reusable composites: IconPill, InfoRow, SectionWrapper, StatCard, PageHeader
├── forms/          ← FormField, SearchInput
├── feedback/       ← ErrorBox, LoadingSkeleton
├── layout/         ← AuthNavbar, POSLayout, DashboardShell, DashboardSidebar, DashboardHeader,
│                     DashboardMobileDrawer, DashboardToggleButton, DocumentsMobileDrawer,
│                     DrawerHeader
├── analytics/      ← Analytics page bits (AnalyticsTable, charts)
├── assignments/    ← AssignmentSkeletonCard
├── clients/        ← ClientCard, ClientSkeletonCard, ClientFormBody, ClientDrawerForm,
│                     sections/{IdentitySection, ContactSection, AddressSection}
├── dashboard/      ← Dashboard widgets: SalesChart, LiveStationsPanel, TopProductsPanel,
│                     QuickDocActionsCard, ChartSkeleton, DashboardStatSkeleton
├── documents/      ← Electronic invoice list/editor: DocumentsListView, DocumentsToolbar,
│                     DocumentTypesFilter, DocumentCard, DocumentCardSkeleton,
│                     DocumentActionModal, ComplexSearchModal, NewDocumentButton,
│                     IssuedReceivedToggle
├── pos/            ← POS checkout UI: ProductGrid, ProductsPanel, ProductGridSkeleton,
│                     CartBar, CartRow, CartLineEditor, CartSidebar, ClientSelector,
│                     ClientListSkeleton, PaymentFlow, PayTab, ClosingFlow, POSPageSkeleton,
│                     SaleSuccessOverlay,
│                     line-detail/ ← (LineDetailDrawer, GeneralTab, DiscountsTab,
│                                    IvaTaxSection, OtherTaxSection, FiscalInfoSection,
│                                    CommercialValueSection, TaxesTab)
│                     checkout/    ← (DocumentTab, ReceiverTab, ReferencesTab, etc.)
├── products/       ← ProductTableView, ProductGridView, ProductSkeletonCard,
│                     ProductPriceEditor, ProductBulkBar, ProductDrawerForm,
│                     sections/{GeneralInfoSection, CommercialValueSection, CodesSection,
│                               InventorySection, FiscalInformationSection, IvaTaxSection,
│                               OtherTaxSection, DiscountsSection, ImageUploadSection,
│                               PackagingSection}
├── puestos/        ← Stations: BranchCard, BranchForm, BranchSkeletonCard, TerminalRow,
│                     TerminalForm, sections/{BranchGeneralSection, BranchContactSection,
│                                              BranchLocationSection, TerminalGeneralSection}
├── session/        ← Session-creation flow widgets: SessionTypeSelector, SessionPreview,
│                     StationAssignments, InventoryTable
└── sessions/       ← Session-list/detail widgets (plural): SessionCard, SessionDetailDrawer,
                      SessionSkeletonCard, StandBreakdown, PaymentBreakdown,
                      tabs/{SessionOverviewTab, SessionAssignmentsTab, SessionSalesTab,
                            SessionReportTab}
```

Note: `session/` (singular) and `sessions/` (plural) are distinct. **session/** = the multi-step "create a session" UI. **sessions/** = list, detail drawer, breakdown widgets.

### 4.1 Section-based form pattern

Big forms (product, client, branch, line-detail) are composed of `<SectionWrapper>` (in `src/components/common/`) — a collapsible card with an icon, title, optional badge/loading/error, and `isExpanded`/`onToggle` controlled by the parent. Each "section" lives in its own file under `sections/`. The parent owns:
- The form state (a single `useState` object + a `patch` updater)
- The expansion map (one boolean per section)
- The cross-section validation logic

Use this pattern for any new multi-step form.

### 4.2 Drawer pattern

Most edit/create flows use `<Drawer>` from `components/ui/Drawer.tsx` (right-side, 450ms slide animation). It accepts `title`, `subtitle`, `icon`, `iconBg`, `iconColor`, `width`, `footer`, and `children`. The drawer locks body scroll while open.

Mobile-specific drawers: `DashboardMobileDrawer` (left, main nav) and `DocumentsMobileDrawer` (right, doc tabs). They share the animation keyframes defined in `index.css` — never re-declare keyframes inside `<style>` blocks in components.

---

## 5. Pages and routing

Routes are wired in `src/Routes.tsx` (one file). All paths come from `src/routePaths.ts`:

```
LOGIN              /login
SELECT_ORG         /organizations/select
DASHBOARD          /dashboard          → DashboardPage
DASHBOARD_SESSIONS /dashboard/sessions → SessionsPage
DASHBOARD_STATIONS /dashboard/stations → PuestosPage
DASHBOARD_PRODUCTS /dashboard/products → ProductsPage (+ /:id ProductDetailPage)
DASHBOARD_REPORTS  /dashboard/reports  → ReportePage
DASHBOARD_POS      /dashboard/pos      → POSIntegratedPage
DASHBOARD_DOCUMENTS /dashboard/documents → DocumentsPage (+ documentEditorPath(tabId))
DASHBOARD_CLIENTS  /dashboard/clients  → ClientsPage (+ /:id ClientDetailPage)

POS standalone flow (cashier device):
/pos/setup     → SessionSetupScreen   (pick branch + terminal)
/pos/opening   → InventoryOpening     (count starting inventory + cash)
/pos/payment   → PaymentScreen
/pos/success   → SuccessScreen
```

**Adding a new page**: define route constant in `routePaths.ts`, register it in `Routes.tsx`, and add the navigation entry in `DashboardSidebar.tsx` (the `NAV_ITEMS` array) if it belongs to the dashboard.

---

## 6. State management

| Concern | Where |
|---|---|
| Auth (user, token, login/logout) | `AuthContext` in `src/contexts/AuthContext.tsx` — wraps Cognito |
| Current org | `OrgContext` (provides `orgId`) — and `useOrganization()` hook for full org data |
| Language (EN/ES) | `LanguageContext` + `useLanguage()` — `t(key, params?)` function |
| Dark mode | `useDarkMode()` hook |
| Document version (electronic invoicing version) | `DocumentVersionContext` — auto-injects `document_version_id` into data-api params |
| Cart (POS) | `zustand` store `src/store/cart.ts` |
| Local inventory | `zustand` `src/store/inventory.ts` (mirrors Dexie DB) |
| POS session context (branch+terminal) | `zustand` `src/store/sessionContext.ts` |
| Document editor tabs | `zustand` `src/store/documentStore.ts` (`open_documents`, `is_received`, `addDocumentTab`, `removeDocumentTab`, `newDocTabId`) |
| Confirm modals | `useConfirmModal()` hook → returns `{ confirm, ConfirmModal }`. Always render `<ConfirmModal/>` at the end of the page |
| Server state | React Query (`@tanstack/react-query`). Query keys convention: `[resource, orgId, ...filters]` |

---

## 7. Key hooks (`src/hooks/`)

| Hook | Returns |
|---|---|
| `useAuthContext()` | `{ user, login, logout }` (from AuthContext) |
| `useOrganization()` | `{ useDefaultOrganization(userId) }` — call the inner hook |
| `useIsDesktop(breakpoint=768)` | boolean — `window.innerWidth >= breakpoint` |
| `useDarkMode()` | `{ dark, toggle }` |
| `useLanguageSwitch()` | `{ language, toggle }` |
| `useProducts(params?)` | paginated products |
| `useCategories(orgId)` | categories list |
| `useClients(orgId, params)` / `useClient(orgId, id)` / `useCreateClient` / `useUpdateClient` / `useUpdateClientStatus` | client CRUD |
| `useClientSearch(query)` | client autocomplete |
| `useSales(params)` / `useSale(saleId)` / `useDeleteSale` / `useUpdateSale` | document/invoice list+detail |
| `useGenerateXml` / `useXmlFiles` / `useInvoiceValidation` / `useResendNotification` / `useValidationAction` | electronic invoice operations (Hacienda) |
| `useDataApi.ts` | **all** catalog hooks: `useAllCountries`, `useAllIdentifications`, `useAllCustomerTypes`, `useAllTaxes`, `useAllTaxRates`, `useAllTaxFactors`, `useAllFactoryTaxCharges`, `useAllDiscountTypes`, `useAllCodes`, `useAllMeasurementUnits`, `useAllProductTypes`, `useAllTaxAmounts`, `useStates`, `useCounties`, `useDistricts`, `useNeighborhoods`, `useCabysSearch` |
| `useCartFlow()` | full POS checkout state machine |
| `useAssignment()` | current cashier assignment |
| `useSync()` | online/offline sync status (for SyncPill) |
| `useConfirmModal()` | `{ confirm({title,message,variant,onConfirm,...}), ConfirmModal }` |

---

## 8. Tax & discount calculation

Business-critical engine lives in `src/services/`:
- `taxCalculationService.ts` — `TaxCalculationService.getLineAmounts({ subtotal, taxes, discounts, detail_quantity, cabys, tax_types, tax_amounts, has_factory_tax, base_amount })` returns `LineAmountsResult` with snake_case fields: `total_amount_line`, `net_tax`, `factory_assumed_tax`, `base_amount`, `iva_tax_total`, `other_tax_total`
- `discountCalculationService.ts` — `DiscountCalculationService.calculateSubtotal(amount, discounts)`

**Tax codes** (Costa Rica Hacienda):
- IVA: `01` (general IVA), `07` (IVACE — IVA Cobro Especial, requires manual base), `08` (IVARBU — requires tax factor)
- Other: `02` (ISC), `03` (IUC), `04` (ISEBA), `05` (ISEBEC — beverages, CABYS-driven), `06` (IPT), `12` (ISEC fixed 5%), `99` (other)

Special-amount codes (`03/04/05/06`) need `tax_amount_id` + `quantity` + sometimes `percentage`/`volume_consumption` in `special_fields`. Tax amounts come from `useAllTaxAmounts({ iso_code, tax_id })`.

CABYS-driven IVA: `useCabysSearch` returns items with `tax_rate.percentage` — auto-applied to IVA on selection. See `FiscalInformationSection` (products) and `FiscalInfoSection` (line-detail) for the search UX.

ISEBEC variants by CABYS prefix: `3401*` = alcoholic (auto-pick rate by alcohol %), `2202*` = non-alcoholic (manual amount select).

See `TAX_CALCULATION_FLOW.md` and `TAX_TYPES_REFERENCE.md` in this folder for deeper detail.

---

## 9. Common patterns — copy these

### Pagination
```tsx
<Pagination
  page={pagination.page} totalPages={pagination.total_pages}
  totalElements={pagination.total_elements} pageSize={pagination.page_size}
  onPageChange={setPage} onPageSizeChange={setPageSize}
  itemName="productos" pageSizeOptions={[12, 24, 48, 96]}
/>
```

### Confirm modal
```tsx
const { confirm, ConfirmModal } = useConfirmModal();
confirm({
  title: "Eliminar",
  message: `¿Eliminar "${name}"?`,
  variant: "destructive",                  // default | success | warning | destructive
  confirmLabel: t("common.delete"),
  cancelLabel: t("common.cancel"),
  onConfirm: async () => { await mutation.mutateAsync(id); },
});
// ...
<ConfirmModal />
```

### Drawer with footer
```tsx
<Drawer
  open={open} onClose={onClose}
  title="Editar X" subtitle={name}
  icon="user" width={480}
  footer={
    <div className="flex gap-2.5 px-6 py-4 justify-end">
      <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
      <Button variant="primary" size="sm" onClick={handleSave}>Guardar</Button>
    </div>
  }
>
  ...body...
</Drawer>
```

### Section in a form
```tsx
<SectionWrapper title="Identidad" icon={User} isExpanded={expanded.identity}
                onToggle={() => toggle('identity')} badge={count} disabled={disabled}>
  ...fields...
</SectionWrapper>
```

### React Query mutation that refetches
```tsx
const qc = useQueryClient();
const updateMutation = useMutation({
  mutationFn: ({ id, body }) => ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), body),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["products", org?.id] }),
});
```

### Page header
```tsx
<div className="px-6 pt-6 pb-10 max-w-[1400px] mx-auto">
  <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
    <div>
      <h1 className="t-h1 mb-1.5">{t("page.title")}</h1>
      <p className="t-body text-muted-foreground">{t("page.subtitle")}</p>
    </div>
    <Button variant="primary" icon="plus" onClick={openNew}>{t("page.new")}</Button>
  </div>
  {/* ... */}
</div>
```

### POS-specific: lock body scroll
Drawer components manage `document.body.style.overflow` themselves. Don't duplicate.

---

## 10. Internationalization

- `LanguageContext` provides `t(key, params?)`. Spanish and English keys; default ES.
- All user-facing strings should go through `t()`. Examples: `t("common.cancel")`, `t("products.searchPlaceholder")`, `t("session.assignedCount", { n, total })`.
- Toggle via `useLanguageSwitch().toggle()`.

---

## 11. Things NOT to do

- ❌ Don't bypass `getToken()` — always use `api/crossAppApi/ordersApi/salesApi` from `src/lib/api.ts`
- ❌ Don't hardcode org IDs, user IDs, terminal/branch codes — pull them from contexts/stores
- ❌ Don't write `style={{ color: "hsl(var(--muted-foreground))" }}` — use `className="text-muted-foreground"`. See §3.
- ❌ Don't introduce new color hex literals. If you need a new accent, add a CSS variable in `index.css` and a Tailwind color in `tailwind.config.js`.
- ❌ Don't redefine animation keyframes inline in components — add them to `index.css`
- ❌ Don't pass `document_version_id` manually to data-api hooks — `DocumentVersionContext` injects it
- ❌ Don't bump major package versions casually; the stack is locked for compatibility with the cross-app-be APIs
- ❌ Don't create new `*.md` files at the repo root for incidental changes — there are already 28+ planning docs. If you must, prefer updating this CLAUDE.md instead

---

## 12. When making styling changes

1. Look in `src/index.css` for an existing class first.
2. If multiple components would benefit, add a new `@layer components` class in `index.css` rather than copy-pasting Tailwind in each component.
3. If it's a color, derive it from a CSS variable. If a new variable is needed, add it to **both** `:root` and `.dark` blocks.
4. If it's a font/shadow/z-index, extend `tailwind.config.js` to map to the CSS variable.
5. Skeletons use `animate-pulse` + `bg-muted/40` (or `/30 / /25 / /20` for layered placeholders). See `ChartSkeleton`, `DashboardStatSkeleton` for reference.

---

## 13. Folder pointers when you need to dig in

| Want to | Look at |
|---|---|
| Add a new dashboard widget | `pages/dashboard/DashboardPage.tsx` + `components/dashboard/` |
| Modify the POS checkout flow | `pages/dashboard/POSIntegratedPage.tsx` + `components/pos/` + `hooks/useCartFlow.ts` |
| Edit a product/client/branch form section | `components/{products,clients,puestos}/sections/` |
| Change electronic-invoice line behavior | `components/pos/line-detail/` + `services/taxCalculationService.ts` |
| Adjust documents list/editor | `components/documents/` + `store/documentStore.ts` |
| Tweak sidebar nav | `components/layout/DashboardSidebar.tsx` (NAV_ITEMS) |
| Add a new data-api catalog | `hooks/useDataApi.ts` + `services/data-api/` |
| Add a new CSS variable / utility | `src/index.css` (+ `tailwind.config.js` if exposing as Tailwind class) |
| Add a translation | `LanguageContext` — find the key map |

---

## 14. Where the historical context lives

The folder has many planning/migration `.md` files (CLIENT_FORM_*, FORMLABEL_MIGRATION_*, LINE_DETAIL_*, TAX_*, POS_PRODUCT_FORM_*, etc.). Treat them as historical — what was tried, decided, or migrated. **This CLAUDE.md is the canonical current-state doc**; the others are point-in-time records. Don't trust them over the live code, but they explain *why* something is the way it is.
