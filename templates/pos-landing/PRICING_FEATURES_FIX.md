# Pricing Features Fix - Complete Implementation

## Problem
When adding a feature from the master list to a plan, if you changed the feature's description (label), the feature would reappear in the "Add feature" dropdown as if it hadn't been added yet.

## Root Cause
The system was tracking which features were already added by comparing **labels** instead of **IDs**. When you changed a feature's label, it no longer matched the master feature's label, so the system thought it was available again.

## Solution
Changed the tracking mechanism to use **IDs** instead of labels:

### 1. Updated Type Definition (`src/types/config.ts`)
Added an optional `id` field to `PlanFeature`:
```typescript
export interface PlanFeature {
  id?:     string;  // Optional reference to master feature ID
  label:   string;
  enabled: boolean;
  color?:  FeatureColor;
}
```

### 2. Updated PricingTab Component (`src/dashboard/PricingTab.tsx`)

**Changed `addFeatureFromMaster`** to include the ID:
```typescript
const addFeatureFromMaster = (def: FeatureDef) => onChange({
  ...plan,
  features: [...plan.features, { id: def.id, label: def.label, enabled: true, color: 'success' }],
});
```

**Updated `FeatureAddDropdown`** to filter by ID:
```typescript
const existingIds = existingFeatures.filter(f => f.id).map(f => f.id);
const available = masterFeatures.filter(f => !existingIds.includes(f.id));
```

### 3. Linked Existing Plan Features to Master Features (`public/config.json`)

**Master Features:**
```json
"features": [
  { "id": "products",       "label": "Productos" },
  { "id": "customers",      "label": "Clientes" },
  { "id": "docs",           "label": "Documentos electrónicos" },
  { "id": "branches",       "label": "Sucursales y terminales" },
  { "id": "docTypes",       "label": "Tipos de documento" },
  { "id": "contingency",    "label": "Modo contingencia" },
  { "id": "reports",        "label": "Reportes" },
  { "id": "acceptDocs",     "label": "Aceptación de documentos recibidos" },
  { "id": "futureFeatures", "label": "Próximas funciones de cumplimiento" },
  { "id": "support",        "label": "Soporte" }
]
```

**Free Plan Features (now with IDs):**
- `products` → "Hasta 50 productos"
- `customers` → "Hasta 30 clientes"
- `docs` → "{{freeDocs}} documentos electrónicos / mes"
- `branches` → "1 sucursal · 1 terminal" / "Multi-sucursal" (disabled)
- `docTypes` → "Tiquete y factura electrónica" / "Notas de crédito y débito" (disabled)
- `reports` → "Reportes básicos de ventas"
- `support` → "Soporte por correo"
- `contingency` → "Modo contingencia" (disabled)

**Pro Plan Features (now with IDs):**
- `products` → "Productos ilimitados"
- `customers` → "Clientes ilimitados"
- `docs` → "Documentos electrónicos ilimitados"
- `branches` → "Multi-sucursal y multi-terminal"
- `docTypes` → "Todos los tipos de documento (FE, TE, NC, ND, FC, FEX)"
- `contingency` → "Modo contingencia ATV"
- `reports` → "Reportes avanzados y exportación"
- `acceptDocs` → "Aceptación de documentos recibidos"
- `futureFeatures` → "Próximas funciones de cumplimiento incluidas"
- `support` → "Soporte prioritario por WhatsApp"

## How It Works Now

1. **Master Features** (in `pricing.features`) have unique IDs like "products", "customers", "docs", etc.

2. **Plan Features** can be:
   - **Linked to master**: Have an `id` field that references a master feature
   - **Custom**: No `id` field, completely independent

3. **Adding Features**:
   - When you add from master list → feature gets the master's ID
   - When you add blank/custom → feature has no ID

4. **Dropdown Filtering**:
   - Only shows master features whose IDs aren't already in the plan
   - Changing a feature's label doesn't affect its ID
   - Custom features (without IDs) don't interfere with master features

5. **Multiple Uses of Same Master Feature**:
   - Notice in the Free plan, `branches` and `docTypes` are used twice with different labels
   - This is intentional: one enabled, one disabled to show what's NOT included
   - The dropdown will hide a master feature once ANY instance with that ID exists in the plan

## Benefits

✅ You can now freely edit feature descriptions without them reappearing in the dropdown
✅ Master features are properly tracked by their unique IDs
✅ Custom features and master features coexist without conflicts
✅ All existing plan features are now linked to their master definitions
✅ Backward compatible: existing features without IDs work as custom features

## Usage in Dashboard

### Adding a Master Feature
1. Click "Add feature" button
2. Select from "From master" section
3. Feature is added with its ID and default label
4. You can now edit the label freely without it reappearing

### Adding a Custom Feature
1. Click "Add feature" button
2. Select "Custom (blank)"
3. Feature is added without an ID
4. Completely independent from master features

### Editing Features
- ✅ Change labels freely - features stay linked by ID
- ✅ Change colors, enabled state
- ✅ Delete features - they become available again in dropdown
- ✅ Features with IDs remain linked to their master definition
- ✅ Custom features remain independent

### Managing Master Features
- Edit master feature labels in the "Master Features" panel
- Changes to master labels don't affect existing plan features
- Master features serve as templates for new additions
- Delete from master list to remove from dropdown options
