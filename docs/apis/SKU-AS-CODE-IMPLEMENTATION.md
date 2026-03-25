# SKU as Code Type 03 Implementation

## Overview

Implemented SKU handling as code type 03 (Manufacturer/Barcode) in the inventory management section. The SKU field is now automatically converted to/from the codes array, keeping the UI simple while maintaining proper data structure for the API.

## Changes Made

### 1. Removed Code Type 03 from Codes Section

**File:** `dashboard/src/components/products/sections/CodesSection.tsx`

**Change:** Removed code type 03 from the CODE_TYPES array:
```typescript
const CODE_TYPES = [
  { codeTypeId: "01", code: "01", description: "Código del producto del vendedor" },
  { codeTypeId: "02", code: "02", description: "Código del producto del comprador" },
  // { codeTypeId: "03", ... } <- REMOVED
  { codeTypeId: "04", code: "04", description: "Código uso interno" },
  { codeTypeId: "99", code: "99", description: "Otros" },
];
```

**Result:** Users can no longer manually add code type 03 in the Codes section.

### 2. Updated Product Form Submission Logic

**File:** `dashboard/src/components/admin/product-form.tsx`

**Added SKU to Codes Conversion:**
```typescript
const onSubmit = (data: InsertProduct) => {
  // Handle SKU as code type 03 (Manufacturer/Barcode)
  const sku = data.sku;
  const codes = data.codes || [];
  
  // Remove any existing code type 03 from codes array
  const filteredCodes = codes.filter(code => code.codeTypeId !== "03");
  
  // If SKU is provided, add it as code type 03
  if (sku && sku.trim()) {
    filteredCodes.push({
      codeTypeId: "03",
      number: sku.trim(),
      description: "Código del producto asignado por el fabricante"
    });
  }
  
  // Update the data with the modified codes array
  const submissionData = {
    ...data,
    codes: filteredCodes.length > 0 ? filteredCodes : undefined
  };
  
  // Remove sku from submission data as it's now in codes
  delete submissionData.sku;
  
  // Submit to API
  if (product) {
    updateMutation.mutate(submissionData);
  } else {
    createMutation.mutate(submissionData);
  }
};
```

**How it works:**
1. Extracts SKU value from form data
2. Filters out any existing code type 03 from codes array
3. If SKU is provided, adds it as code type 03
4. Removes `sku` field from submission data
5. Submits to API with SKU in codes array

### 3. Updated Form Default Values

**Added SKU Extraction from Codes:**
```typescript
// Extract SKU from codes array (code type 03) and filter it out from codes
const extractSkuFromCodes = (codes?: any[]) => {
  if (!codes || codes.length === 0) return { sku: "", filteredCodes: [] };
  
  const skuCode = codes.find(code => code.codeTypeId === "03");
  const filteredCodes = codes.filter(code => code.codeTypeId !== "03");
  
  return {
    sku: skuCode?.number || "",
    filteredCodes
  };
};

const { sku: extractedSku, filteredCodes } = extractSkuFromCodes(product?.codes);
```

**How it works:**
1. When editing a product, extracts code type 03 from codes array
2. Sets it as the SKU field value
3. Filters it out from the codes array shown in Codes section
4. User sees SKU in Inventory section, other codes in Codes section

## Data Flow

### Creating a New Product

1. **User Input:**
   - Fills SKU field in Inventory section: "PROD-12345"
   - Adds other codes in Codes section: 01-VENDOR, 04-INTERNAL

2. **Form Submission:**
   ```json
   {
     "sku": "PROD-12345",
     "codes": [
       { "codeTypeId": "01", "number": "VENDOR" },
       { "codeTypeId": "04", "number": "INTERNAL" }
     ]
   }
   ```

3. **Transformed Data (sent to API):**
   ```json
   {
     "codes": [
       { "codeTypeId": "01", "number": "VENDOR" },
       { "codeTypeId": "03", "number": "PROD-12345", "description": "Código del producto asignado por el fabricante" },
       { "codeTypeId": "04", "number": "INTERNAL" }
     ]
   }
   ```

### Editing an Existing Product

1. **API Response:**
   ```json
   {
     "productId": "uuid",
     "name": "Product Name",
     "codes": [
       { "codeTypeId": "01", "number": "VENDOR" },
       { "codeTypeId": "03", "number": "PROD-12345" },
       { "codeTypeId": "04", "number": "INTERNAL" }
     ]
   }
   ```

2. **Form Display:**
   - SKU field shows: "PROD-12345" (extracted from code type 03)
   - Codes section shows: 01-VENDOR, 04-INTERNAL (code type 03 filtered out)

3. **User Updates:**
   - Changes SKU to: "PROD-67890"
   - Codes remain: 01-VENDOR, 04-INTERNAL

4. **Transformed Data (sent to API):**
   ```json
   {
     "codes": [
       { "codeTypeId": "01", "number": "VENDOR" },
       { "codeTypeId": "03", "number": "PROD-67890", "description": "Código del producto asignado por el fabricante" },
       { "codeTypeId": "04", "number": "INTERNAL" }
     ]
   }
   ```

## Benefits

### 1. Simplified UI
- ✅ Users see SKU in the familiar Inventory section
- ✅ No confusion about which code type to use for SKU/Barcode
- ✅ Cleaner Codes section (only vendor, buyer, internal, other codes)

### 2. Proper Data Structure
- ✅ SKU is stored as code type 03 in the API
- ✅ Follows Hacienda e-invoicing standards
- ✅ Consistent with backend expectations

### 3. Automatic Conversion
- ✅ Form handles conversion automatically
- ✅ No manual intervention needed
- ✅ Works for both create and update operations

### 4. Backward Compatibility
- ✅ Existing products with code type 03 are handled correctly
- ✅ SKU field still exists in Product interface for UI purposes
- ✅ Smooth migration path

## Code Type Reference

After this change, the available code types are:

| Code Type | Description | Where to Add |
|-----------|-------------|--------------|
| 01 | Código del producto del vendedor | Codes Section |
| 02 | Código del producto del comprador | Codes Section |
| 03 | Código del producto asignado por el fabricante (SKU/Barcode) | Inventory Section (SKU field) |
| 04 | Código uso interno | Codes Section |
| 99 | Otros | Codes Section |

## Testing Checklist

### Create Product
- [x] Enter SKU in Inventory section
- [x] Add other codes in Codes section
- [x] Submit form
- [x] Verify SKU is sent as code type 03
- [x] Verify other codes are preserved

### Edit Product
- [x] Open product with existing codes including type 03
- [x] Verify SKU field shows code type 03 value
- [x] Verify Codes section doesn't show code type 03
- [x] Update SKU value
- [x] Submit form
- [x] Verify updated SKU is sent as code type 03

### Edge Cases
- [x] Create product without SKU (codes array should not include type 03)
- [x] Create product with only SKU (codes array should only have type 03)
- [x] Update product to remove SKU (code type 03 should be removed)
- [x] Update product to add SKU (code type 03 should be added)

## Related Files

- `dashboard/src/components/admin/product-form.tsx` - Form submission logic
- `dashboard/src/components/products/sections/CodesSection.tsx` - Codes UI (removed type 03)
- `dashboard/src/components/products/sections/InventorySection.tsx` - SKU field UI
- `dashboard/src/models/Product.ts` - Product interface (kept sku field for UI)

## Notes

- The `sku` field is kept in the Product interface for UI purposes but is not sent to the API
- The form automatically converts between SKU field and code type 03
- Code type 03 is never shown in the Codes section UI
- This implementation maintains backward compatibility with existing products
