# CABYS Tax Auto-Initialization

## Overview
Implemented automatic IVA tax initialization when a CABYS code is selected, matching the behavior from JCampos-Biller client.

## Problem
When creating a new product and selecting a CABYS code:
1. The AdvancedTaxesSection was hidden because no taxes existed yet
2. Users had to manually add the IVA tax after selecting CABYS
3. The suggested tax rate from CABYS was not being used

## Solution
Following the JCampos-Biller implementation, when a CABYS code is selected:
1. Automatically create a default IVA tax (type 01) with the suggested rate from CABYS
2. Only auto-create if the taxes array is empty (don't override existing taxes)
3. Show the AdvancedTaxesSection as soon as CABYS is selected

## Changes Made

### 1. FiscalInformationSection Component
**File**: `dashboard/src/components/products/sections/FiscalInformationSection.tsx`

**Added Imports**:
- `useAllTaxes` - To fetch tax types and get IVA tax type ID
- `useAuth` and `useOrganization` - To get ISO code for tax types

**Updated `handleCabysSelect`**:
```typescript
const handleCabysSelect = (cabys: { codigo: string; descripcion: string; impuesto: number }) => {
  form.setValue("cabys", cabys.codigo);
  form.setValue("cabysDescription", cabys.descripcion);
  
  // Store suggested tax rate
  const suggestedTaxRate = cabys.impuesto || 13;
  
  // Auto-create IVA tax if no taxes exist
  const currentTaxes = form.getValues("taxes") || [];
  if (currentTaxes.length === 0 && taxTypes) {
    // Find IVA tax type (code '01')
    const ivaTaxType = taxTypes.find(t => t.code === '01');
    if (ivaTaxType) {
      // Create default IVA tax with suggested rate from CABYS
      form.setValue("taxes", [{
        taxTypeId: ivaTaxType.id,
        rate: suggestedTaxRate
      }]);
    }
  }
  
  setSearchTerm("");
  onCabysSelect?.();
};
```

### 2. Product Form Visibility Logic
**File**: `dashboard/src/components/admin/product-form.tsx`

**Changed**:
```typescript
// Before
forceCollapsed={isInsertMode && taxesValue.length === 0}

// After
forceCollapsed={isInsertMode && !hasCabysSelected}
```

This ensures the AdvancedTaxesSection is visible as soon as a CABYS is selected, even if it's empty initially.

## Behavior

### Before
1. User selects CABYS code
2. AdvancedTaxesSection remains hidden (no taxes yet)
3. User must manually navigate to add taxes
4. User must manually select IVA type and enter rate

### After
1. User selects CABYS code
2. System automatically creates IVA tax (type 01) with suggested rate from CABYS
3. AdvancedTaxesSection becomes visible immediately
4. User can see and modify the auto-created tax

## Tax Structure

The auto-created tax has:
- `taxTypeId`: ID of IVA tax type (code '01') from data API
- `rate`: Suggested tax rate from CABYS (e.g., 13, 4, 2, 1, or 0)

Example:
```typescript
{
  taxTypeId: 123,  // ID of tax type with code '01'
  rate: 13         // From CABYS tax_rate.percentage
}
```

## Benefits

1. **Better UX**: Users don't need to manually add the IVA tax
2. **Consistency**: Matches JCampos-Biller behavior
3. **Accuracy**: Uses the suggested tax rate from CABYS
4. **Efficiency**: Reduces steps in product creation workflow
5. **Visibility**: Tax section appears immediately after CABYS selection

## Testing

Verify that:
1. Selecting a CABYS code auto-creates an IVA tax
2. The tax rate matches the CABYS suggested rate
3. AdvancedTaxesSection becomes visible after CABYS selection
4. Existing taxes are not overridden (only creates if taxes array is empty)
5. Tax type ID is correctly fetched from data API
6. Works with different CABYS codes (different tax rates: 0%, 1%, 2%, 4%, 13%)

## Related Files

- `dashboard/src/components/products/sections/FiscalInformationSection.tsx` - Auto-creates tax
- `dashboard/src/components/admin/product-form.tsx` - Visibility logic
- `dashboard/src/components/products/sections/AdvancedTaxesSection.tsx` - Displays taxes
- `JCampos-Biller/client/src/components/products/sections/FiscalInformationSection.tsx` - Reference implementation
