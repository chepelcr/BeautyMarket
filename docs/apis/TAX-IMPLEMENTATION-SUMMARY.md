# Tax Implementation Summary

## Overview

Implemented comprehensive tax handling system for BeautyMarket products based on Costa Rica's Hacienda fiscal requirements, reusing proven components from JCampos-Biller.

## Files Created/Updated

### 1. Constants
- **`dashboard/src/constants/taxTypes.ts`** - Tax type configurations and helper functions
  - TAX_TYPES enum with all Hacienda codes
  - TAX_TYPE_CONFIGS with behavior flags
  - Helper functions: getTaxConfig, isIvaTax, requiresSpecialFields, getRequiredSpecialFields

### 2. Components
- **`dashboard/src/components/products/sections/IvaTaxSection.tsx`** - IVA tax configuration (types 01, 07, 08)
  - Tax type selection (IVA, IVACE, IVARBU)
  - Rate/Factor selection
  - Rate warning vs CABYS suggested rate
  - Auto-expand when enabled

- **`dashboard/src/components/products/sections/OtherTaxSection.tsx`** - Specific taxes (types 02-06, 12, 99)
  - Dynamic tax addition
  - Special fields per tax type
  - Tax amount catalog loading
  - CABYS validation

- **`dashboard/src/components/products/sections/AdvancedTaxesSection.tsx`** - Main tax container
  - Combines IVA and Other tax sections
  - Fetches catalog data (tax types, rates, factors)
  - Implements calculation logic
  - Manages tax amounts loading

### 3. Documentation
- **`docs/apis/TAX-IMPLEMENTATION-GUIDE.md`** - Implementation guide
- **`docs/apis/BACKEND-FIELDS-REQUIRED.md`** - Backend requirements
- **`docs/CATALOGS.md`** - Updated with new catalog endpoints

## Tax Types Supported

| Code | Type | Description | Special Fields |
|------|------|-------------|----------------|
| 01 | IVA | Impuesto al Valor Agregado | Rate selection |
| 02 | ISC | Impuesto Selectivo de Consumo | Rate input |
| 03 | IUC | Impuesto Único a los Combustibles | Quantity + Tax Amount |
| 04 | ISEBA | Impuesto Específico Bebidas Alcohólicas | Quantity + Percentage + Tax Amount |
| 05 | ISEBEC | Impuesto Específico Bebidas Envasadas | Quantity + Volume + Tax Amount |
| 06 | IPT | Impuesto a los Productos de Tabaco | Quantity + Tax Amount |
| 07 | IVACE | IVA (cálculo especial) | Rate selection |
| 08 | IVARBU | IVA Régimen de Bienes Usados | Factor selection |
| 12 | ISEC | Impuesto Específico al Cemento | Fixed 5% rate |
| 99 | Others | Otros | Rate input |

## Calculation Formulas Implemented

### IVA Taxes (01, 07)
```typescript
amount = baseAmount × (rate / 100)
```

### IVARBU (08)
```typescript
amount = factor × subtotal
```

### IUC (03)
```typescript
amount = taxAmount × quantity
```

### ISEBA (04)
```typescript
proportion = (quantity × percentage) / 100
amount = detailQuantity × proportion × taxAmount
```

### ISEBEC (05)
```typescript
// Non-alcoholic beverages (CABYS 2202)
altAmount = taxAmount / volumeConsumption
amount = detailQuantity × quantity × altAmount

// Other products
amount = quantity × volumeConsumption × taxAmount
```

### IPT (06)
```typescript
amount = detailQuantity × quantity × taxAmount
```

### ISC, ISEC, Others (02, 12, 99)
```typescript
amount = baseAmount × (rate / 100)
```

## Features Implemented

### 1. CABYS Integration
- Tax types auto-suggested based on CABYS code
- CABYS validation for specific tax types (05, 06)
- Default IVA tax created with suggested rate

### 2. Dynamic UI
- Auto-expand/collapse sections
- Show/hide special fields based on tax type
- Disable sections when CABYS not selected (insert mode)
- Real-time calculation preview

### 3. Catalog Integration
- Tax types catalog
- Tax rates catalog (for IVA)
- Tax factors catalog (for type 08)
- Tax amounts catalog (for types 03-06)
- Dynamic loading of tax amounts per type

### 4. Validation
- CABYS-based tax type availability
- Required special fields per tax type
- Rate warning when different from suggested
- Prevent duplicate tax types (except type 99)

### 5. User Experience
- Collapsible sections
- Visual feedback (warnings, disabled states)
- Clear labels and placeholders
- Responsive grid layouts
- Remove buttons for each tax

## Backend Requirements

### Database Tables Needed
1. `tax_types` - Tax type catalog
2. `tax_rates` - Tax rate catalog
3. `tax_factors` - Tax factor catalog
4. `tax_amounts` - Tax amount catalog
5. `product_types` - Product type catalog
6. `measurement_units` - Measurement unit catalog

### API Endpoints Needed
```
GET /catalogs/tax-types
GET /catalogs/tax-rates
GET /catalogs/tax-factors
GET /catalogs/tax-amounts?taxTypeId={id}
GET /catalogs/product-types
GET /catalogs/measurement-units
```

### Product Model Updates
```typescript
interface Product {
  // ... existing fields ...
  taxes?: ProductTax[];
}

interface ProductTax {
  taxId?: number;
  taxTypeId: string;
  code?: string;
  taxRateId?: string;
  taxFactorId?: string;
  rate: number;
  amount?: number;
  isAmount?: boolean;
  specialFields?: {
    quantity?: number;
    percentage?: number;
    volumeConsumption?: number;
    taxAmountId?: string;
  };
}
```

## Translation Keys Needed

Add to `LanguageContext.tsx`:

```typescript
// Tax types
'taxes.valueAddedTax': 'Impuesto al Valor Agregado (IVA)'
'taxes.selectiveConsumptionTax': 'Impuesto Selectivo de Consumo'
'taxes.uniqueFuelTax': 'Impuesto Único a los Combustibles'
'taxes.specificAlcoholicBeveragesTax': 'Impuesto Específico de Bebidas Alcohólicas'
'taxes.specificPackagedBeveragesTax': 'Impuesto Específico sobre Bebidas Envasadas'
'taxes.tobaccoProductsTax': 'Impuesto a los Productos de Tabaco'
'taxes.ivaSpecialCalculation': 'IVA (cálculo especial)'
'taxes.ivaUsedGoodsRegime': 'IVA Régimen de Bienes Usados'
'taxes.specificCementTax': 'Impuesto Específico al Cemento'
'taxes.others': 'Otros'

// UI labels
'taxes.specificTaxes': 'Impuestos Específicos'
'taxes.addTax': 'Agregar impuesto'
'taxes.tax': 'Impuesto'
'taxes.ivaType': 'Tipo de IVA'
'taxes.rate': 'Tarifa'
'taxes.selectRate': 'Seleccionar tarifa'
'taxes.selectFactor': 'Seleccionar factor'
'taxes.selectAmount': 'Seleccionar monto'
'taxes.amount': 'Monto'
'taxes.calculatedAmount': 'Monto calculado'
'taxes.suggestedRate': 'Tarifa sugerida'
'taxes.selectCabysForTaxes': 'Seleccione un código CABYS para configurar impuestos'
'taxes.selectIVA': 'Seleccionar IVA'

// Special fields
'taxes.taxAmount': 'Monto de impuesto'
'taxes.quantity': 'Cantidad'
'taxes.percentage': 'Porcentaje'
'taxes.volumeConsumption': 'Consumo volumétrico'

// Products
'products.advancedTaxes': 'Impuestos Avanzados'
```

## Next Steps

1. **Backend Implementation:**
   - Create catalog tables and seed data
   - Implement catalog API endpoints
   - Update Product model to support taxes array
   - Add validation logic

2. **Translation Keys:**
   - Add all tax-related translations to LanguageContext
   - Add Spanish translations

3. **Testing:**
   - Test all tax type calculations
   - Test CABYS validation
   - Test special fields for each tax type
   - Test catalog loading

4. **Integration:**
   - Connect to actual backend endpoints
   - Test with real catalog data
   - Verify calculations match backend logic

## Notes

- Implementation follows JCampos-Biller proven approach
- All Hacienda codes match official catalog
- Calculations are preview-only (actual calculations at invoice time)
- Tax configuration is stored with product for reuse
- Special fields are dynamic based on tax type
- CABYS validation ensures correct tax type usage
