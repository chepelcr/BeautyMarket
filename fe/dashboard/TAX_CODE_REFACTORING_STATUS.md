# Tax Code Refactoring Status

## Goal
Refactor all tax-related components to use tax codes instead of IDs for better portability and stability.

## Completed ✅

### 1. FiscalInformationSection ✅
- Auto-creates IVA tax using `taxTypeCode: '01'` instead of ID
- File: `dashboard/src/components/products/sections/FiscalInformationSection.tsx`

### 2. IvaTaxSection ✅
- Updated Tax interface to use `taxTypeCode`, `taxRateCode`, `taxFactorCode`
- Updated TaxType, TaxRate, TaxFactor interfaces to remove `id` field
- All handlers use codes for lookups
- All Select components use codes as values
- Fixed duplicate code block (lines 208-220)
- File: `dashboard/src/components/products/sections/IvaTaxSection.tsx`

### 3. AdvancedTaxesSection ✅
- Updated filtering logic to use `taxTypeCode`
- Updated mapping to remove IDs from TaxTypeForComponent, TaxRateForComponent, TaxFactorForComponent
- Updated calculateTaxAmount to find by code
- Passes `taxTypeCode` to `loadTaxAmounts`
- File: `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx`

### 4. OtherTaxSection ✅
- **Status**: COMPLETED - Completely rewritten from scratch
- **Previous Issue**: File was empty/corrupted with 466 TypeScript errors
- **Resolution**: Created complete implementation based on JCampos-Biller reference
- Updated Tax interface to use `taxTypeCode` and `taxRateCode`
- Updated TaxType and TaxRate interfaces to use only `code` field (no IDs)
- Updated all `taxTypes.find()` to use codes
- Updated all Select components to use codes instead of IDs
- Updated `addOtherTax` to use code
- Updated `getAvailableTaxTypes` filtering logic to use codes
- Excludes IVA types (01, 07, 08) from selection
- Updated `taxAmounts` dictionary key from ID to code
- Updated `loadTaxAmounts` parameter from ID to code
- Handles special fields for complex taxes (03, 04, 05, 06, 12)
- Supports repeatable "Others" tax (99)
- File: `dashboard/src/components/products/sections/OtherTaxSection.tsx`

## Diagnostics Status

All components pass TypeScript validation:
- ✅ IvaTaxSection.tsx: No errors
- ✅ AdvancedTaxesSection.tsx: No errors
- ✅ OtherTaxSection.tsx: No errors (2 minor unused variable warnings)

## Benefits of Code-Based Approach

1. **Portability**: Codes are consistent across environments (dev, staging, prod)
2. **Stability**: IDs can change when databases are recreated; codes are fixed
3. **Readability**: Code '01' is more meaningful than ID 123
4. **Debugging**: Easier to trace issues with human-readable codes
5. **API Independence**: Not tied to specific database auto-increment sequences

## Tax Type Codes (from taxTypeConfig.ts)

- `'01'` - IVA (Value Added Tax)
- `'02'` - ISC (Selective Consumption Tax)
- `'03'` - IUC (Unique Fuel Tax)
- `'04'` - ISEBA (Specific Alcoholic Beverages Tax)
- `'05'` - ISEBEC (Specific Packaged Beverages Tax)
- `'06'` - IPT (Tobacco Products Tax)
- `'07'` - IVACE (IVA Special Calculation)
- `'08'` - IVARBU (IVA Used Goods Regime)
- `'12'` - Specific Cement Tax
- `'99'` - Others

## Data Structure

### Tax Object (Form)
```typescript
interface Tax {
  taxTypeCode: string;  // e.g., '01', '02', '03'
  taxRateCode?: string;
  taxFactorCode?: string;
  rate: number;
  specialFields?: {...};
}
```

### TaxType (Component Format)
```typescript
interface TaxType {
  code: string;  // e.g., '01', '02', '03'
  name: string;  // Display name
}
```

### Data API Response
```typescript
interface TaxResponse {
  id: number;           // Internal ID (not used in forms)
  code: string;         // Tax type code (used for lookups)
  description: string;  // Maps to 'name' in component
}
```

## Key Implementation Details

1. **DTO Field Naming**: Data API returns `code` field (not `taxTypeCode`)
2. **Form Field Naming**: Tax objects store `taxTypeCode` (the selected tax type's code)
3. **Mapping**: Components map DTO `code` → component `code`, DTO `description` → component `name`
4. **Filtering**: IVA taxes (01, 07, 08) go to IvaTaxSection, others go to OtherTaxSection
5. **Special Fields**: Taxes 03, 04, 05, 06 require additional fields (quantity, percentage, etc.)

## Testing Checklist

- [ ] IVA tax auto-created when CABYS selected
- [ ] IVA tax appears in IvaTaxSection (not OtherTaxSection)
- [ ] Tax names display correctly in all dropdowns
- [ ] Tax rates and factors load correctly
- [ ] Special fields work for complex taxes (03, 04, 05, 06)
- [ ] Tax calculations are accurate
- [ ] Can add/remove other taxes
- [ ] "Others" tax (99) can be added multiple times
- [ ] Other tax types cannot be duplicated
- [ ] No console errors related to undefined IDs
- [ ] Taxes save and load correctly from database

## Refactoring Complete! 🎉

All tax components have been successfully refactored to use codes instead of IDs. The system is now more portable, stable, and maintainable.
