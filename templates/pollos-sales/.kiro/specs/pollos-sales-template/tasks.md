# Tasks — Pollos Porteños Sales Template

## Phase 1: Project Scaffold ✅
- [x] requirements.md
- [x] design.md
- [x] package.json, vite.config.ts, tailwind.config.js, tsconfig.json, index.html
- [x] src/main.tsx, src/index.css, src/vite-env.d.ts
- [x] public/manifest.json, public/sw.js

## Phase 2: Core Infrastructure ✅
- [x] src/lib/amplify.ts
- [x] src/lib/api.ts
- [x] src/lib/db.ts — Dexie.js schema
- [x] src/lib/queryClient.ts
- [x] src/lib/utils.ts
- [x] src/contexts/AuthContext.tsx
- [x] src/hooks/useSync.ts
- [x] src/hooks/useAssignment.ts
- [x] src/hooks/useProducts.ts

## Phase 3: Authentication Pages ✅
- [x] src/pages/Login.tsx
- [x] src/pages/SelectOrganization.tsx
- [x] src/App.tsx — role-based routing

## Phase 4: POS (Cashier Interface) ✅
- [x] src/store/cart.ts
- [x] src/store/inventory.ts
- [x] src/components/layout/POSLayout.tsx
- [x] src/components/pos/ProductGrid.tsx
- [x] src/components/pos/CartBar.tsx
- [x] src/pages/pos/POSPage.tsx
- [x] src/pages/pos/PaymentScreen.tsx
- [x] src/pages/pos/SuccessScreen.tsx
- [ ] src/components/pos/ClosingFlow.tsx — 4-step closing stepper
- [ ] src/pages/pos/InventoryOpening.tsx

## Phase 5: Manager Dashboard (partial) ✅
- [x] src/pages/dashboard/DashboardPage.tsx — real-time + closings tabs (inline)
- [ ] src/pages/dashboard/SessionConfig.tsx — 4-step wizard
- [ ] src/pages/dashboard/HistoryTab.tsx — full history view
- [ ] src/pages/dashboard/ProductsPage.tsx — inline price editing
- [ ] src/pages/dashboard/AnalyticsPage.tsx — 4 tabs

## Phase 6: PWA ✅
- [x] public/manifest.json
- [x] public/sw.js — background sync
- [x] SW registered in main.tsx

## Remaining Work
- ClosingFlow (4-step stepper for cashier end-of-session)
- InventoryOpening (stock count before session)
- SessionConfig wizard (manager creates sessions)
- ProductsPage (inline price editing)
- AnalyticsPage (product/session/vendor/context tabs)
- HistoryTab (past sessions)
