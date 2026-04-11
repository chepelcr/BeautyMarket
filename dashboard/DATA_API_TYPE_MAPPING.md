# Data API Type Mapping

## Overview
Proper TypeScript type usage for data API responses with mapping to component-expected formats.

## Problem
Components were using `any[]` types and manually mapping fields without proper type safety. The data API returns objects with `description` field (from DTOs), but components expected `name` field.

## Solution
1. Import proper DTO types from `@/services/data-api`
2. Create component-specific interfaces for normalized data
3. Map API responses to component format with type safety

## Type Mapping

### Tax Types
**API Response**: `TaxResponse` (from `dtos/taxes.ts`)
```typescript
interface TaxResponse extends HaciendaBase {
  id: number;
  code: string;
  description: string;  // ← API field
  required_iva: boolean;
  percentage: number;
  special_fields_required: boolean;
}
```

**Component Format**: `TaxTypeForComponent`
```typescript
interface TaxTypeForComponent {
  id: string;           // Converted to string
  code: string;
  name: string;         // ← Mapped from description
}
```

**Mapping**:
```typescript
const taxTypes: TaxTypeForComponent[] = (dataApiTaxTypes || []).map((t: TaxResponse) => ({
  id: String(t.id),
  code: t.code,
  name: t.description  // description → name
}));
```

### Tax Rates
**API Response**: `TaxRateResponse` (from `dtos/taxes.ts`)
```typescript
interface TaxRateResponse extends HaciendaBase {
  id: number;
  code: string;
  description: string;  // ← API field
  rate_type_id: number;
  percentage: number;   // ← API field
}
```

**Component Format**: `TaxRateForComponent`
```typescript
interface TaxRateForComponent {
  id: string;           // Converted to string
  code: string;
  name: string;         // ← Mapped from description
  rate: number;         // ← Mapped from percentage
}
```

**Mapping**:
```typescript
const taxRates: TaxRateForComponent[] = (dataApiTaxRates || []).map((r: TaxRateResponse) => ({
  id: String(r.id),
  code: r.code,
  name: r.description,  // description → name
  rate: r.percentage    // percentage → rate
}));
```

### Tax Factors
**API Response**: `TaxFactorResponse` (from `dtos/tax-factors.ts`)
```typescript
interface TaxFactorResponse extends CatalogBase {
  id: number;
  description: string;  // ← API field
  // Note: percentage field may exist but not in base type
}
```

**Component Format**: `TaxFactorForComponent`
```typescript
interface TaxFactorForComponent {
  id: string;           // Converted to string
  name: string;         // ← Mapped from description
  factor: number;       // ← Mapped from percentage
}
```

**Mapping**:
```typescript
const taxFactors: TaxFactorForComponent[] = (dataApiTaxFactors || []).map((f: TaxFactorResponse) => ({
  id: String(f.id),
  name: f.description,  // description → name
  factor: f.percentage  // percentage → factor
}));
```

## Benefits

1. **Type Safety**: Proper TypeScript types catch errors at compile time
2. **Maintainability**: Clear mapping between API and component formats
3. **Documentation**: Types serve as documentation for data structure
4. **Refactoring**: Easier to update when API changes
5. **IDE Support**: Better autocomplete and type checking

## Files Updated

- `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx`
  - Added type imports from `@/services/data-api`
  - Created component-specific interfaces
  - Added explicit type annotations to mapped data

## Related DTOs

- `dashboard/src/services/data-api/dtos/taxes.ts` - TaxResponse, TaxRateResponse
- `dashboard/src/services/data-api/dtos/tax-factors.ts` - TaxFactorResponse
- `dashboard/src/services/data-api/dtos/base/hacienda-base.ts` - HaciendaBase
- `dashboard/src/services/data-api/dtos/base/catalog-base.ts` - CatalogBase

## Field Name Conventions

### API (Data Service)
- Uses snake_case: `document_version_id`, `rate_type_id`
- Uses `description` for human-readable names
- Uses `percentage` for rate values
- IDs are numbers

### Components (Frontend)
- Uses camelCase: `documentVersionId`, `rateTypeId`
- Uses `name` for human-readable names
- Uses `rate` or `factor` for percentage values
- IDs are strings (for Select component compatibility)

## Future Improvements

Consider creating a shared mapping utility:
```typescript
// utils/dataApiMappers.ts
export const mapTaxResponse = (tax: TaxResponse): TaxTypeForComponent => ({
  id: String(tax.id),
  code: tax.code,
  name: tax.description
});

export const mapTaxRateResponse = (rate: TaxRateResponse): TaxRateForComponent => ({
  id: String(rate.id),
  code: rate.code,
  name: rate.description,
  rate: rate.percentage
});
```
