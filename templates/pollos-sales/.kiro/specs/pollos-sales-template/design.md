# Design Document — Pollos Porteños Sales Template

## Overview

A React PWA (Progressive Web App) for managing food and beverage sales at Pollos Porteños stands. Two distinct interfaces: a mobile-first POS for cashiers and a desktop-first dashboard for managers. Uses the same Cognito pool and API as the main BeautyMarket platform.

## Architecture

```
templates/pollos-sales/
├── src/
│   ├── App.tsx                    # Root router with auth guards
│   ├── main.tsx
│   ├── index.css
│   ├── lib/
│   │   ├── amplify.ts             # AWS Amplify config
│   │   ├── api.ts                 # Authenticated API client
│   │   ├── db.ts                  # Dexie.js IndexedDB schema
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── contexts/
│   │   └── AuthContext.tsx        # Auth state + org selection
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAssignment.ts       # Active cashier assignment
│   │   ├── useProducts.ts
│   │   ├── useSales.ts
│   │   └── useSync.ts             # Offline sync status
│   ├── store/
│   │   ├── cart.ts                # Zustand cart store
│   │   └── inventory.ts           # Local stock tracking
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── SelectOrganization.tsx
│   │   ├── pos/
│   │   │   ├── POSPage.tsx        # Main POS (cashier)
│   │   │   ├── PaymentScreen.tsx
│   │   │   ├── SuccessScreen.tsx
│   │   │   └── InventoryOpening.tsx
│   │   └── dashboard/
│   │       ├── DashboardPage.tsx  # Real-time overview (manager)
│   │       ├── SessionConfig.tsx  # 4-step session wizard
│   │       ├── ClosingsTab.tsx    # Approve/reject closings
│   │       ├── HistoryTab.tsx
│   │       ├── ProductsPage.tsx
│   │       └── AnalyticsPage.tsx
│   └── components/
│       ├── layout/
│       │   ├── POSLayout.tsx
│       │   └── DashboardLayout.tsx
│       ├── pos/
│       │   ├── ProductGrid.tsx
│       │   ├── CartBar.tsx
│       │   └── ClosingFlow.tsx    # 4-step closing stepper
│       ├── dashboard/
│       │   ├── StandCard.tsx
│       │   ├── ProductRanking.tsx
│       │   ├── PaymentBreakdown.tsx
│       │   └── KPICard.tsx
│       └── ui/                    # shadcn-style primitives
├── public/
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Color Palette

| Token       | Value     | Usage                        |
|-------------|-----------|------------------------------|
| primary     | #E8620A   | Buttons, headers, accents    |
| primaryDark | #C4500A   | Hover/pressed states         |
| bg          | #111111   | App background               |
| surface     | #1C1C1C   | Cards, panels                |
| success     | #2ECC71   | Confirmed sales, sync OK     |
| warning     | #F1C40F   | Low stock, slow sync         |
| error       | #E74C3C   | Out of stock, offline        |

Font: `Barlow Condensed` (Google Fonts) — bold, condensed, sporty feel.

## Key Design Decisions

### Offline-First
- All sales written to IndexedDB (Dexie.js) before API call
- Service Worker handles background sync when connectivity returns
- Sync status indicator always visible in POS header

### Role-Based Routing
- `cajero` → `/pos` (mobile-first, touch-optimized)
- `gerente` → `/dashboard` (desktop-first, data-dense)
- Route guards redirect unauthenticated users to `/login`

### State Management
- React Query for server state (products, assignments, dashboard data)
- Zustand for cart and local inventory
- Dexie.js for persistent offline storage

### API Integration
- Same pattern as other templates: `buildOrgApiUrl` from `apiUtils`
- JWT from Amplify included in all requests via interceptor
- 401 → redirect to login

## Data Flow

```
Login → SelectOrg → role check
  cajero → download assignment → inventory opening → POS loop
    tap product → add to cart → payment screen → confirm → 
      write IndexedDB → POST /sales → success screen → clear cart

  gerente → dashboard → real-time polling (30s)
    configure session → assign cashiers → monitor stands
    review closings → approve/reject → generate report
```
