# Product Form Analysis - POS System vs Backend

## Summary
The POS product form has been significantly enhanced with comprehensive fiscal information collection. Most fields are properly mapped, but there are several gaps that need to be addressed.

## Form Sections & Data Collection

### ✅ 1. General Information Section
**Collects:**
- `name` ✅ (mapped to backend)
- `description` ✅ (mapped to backend)
- `category_id` ✅ (mapped to backend)
- `track_inventory` ✅ (mapped to backend)
- `has_fiscal_info` ⚠️ (UI toggle only, not sent to backend)
- `has_package_info` ⚠️ (UI toggle only, not sent to backend)
- Unit of measure (UI only, not stored)

**Issues:**
- `sku` field removed from form but still referenced in ProductFormState type
- Unit of measure selection not being sent to backend

### ✅ 2. Image Upload Section
**Collects:**
- Image file ✅ (converted to base64 and sent as `image.data`)

### ✅ 3. Codes Section
**Collects:**
- `codes` array with:
  - `codeTypeId` (number)
  - `codeTypeCode` (string)
  - `codeTypeDescription` (string)
  - `value` (string)
  - `reason` (string, required for code type "99")

**Issues:**
- ❌ **NOT BEING SENT TO BACKEND** - Form collects codes but ProductsPage.tsx doesn't include them in the API request body

### ✅ 4. Packaging Section
**Collects:**
- `unitsPerBox` (local state only)

**Issues:**
- ❌ **NOT BEING SENT TO BACKEND** - Stored in local state but not included in form submission

### ✅ 5. Inventory Section
**Collects:**
- `low_stock_threshold` ✅ (mapped to backend)

### ✅ 6. Fiscal Information Section
**Collects:**
- `cabys` ✅ (13-digit code, mapped to backend)
- `cabysDescription` ⚠️ (UI only, not sent)
- `productTypeId` ⚠️ (UI only, not sent)

**Issues:**
- CABYS is sent as string, but backend expects `CabysInputDTO` object with `code`, `name`, and `type`

### ✅ 7. IVA Tax Section
**Collects:**
- IVA taxes (codes: 01, 07, 08)
- `taxTypeId`, `taxCode`, `taxDescription`, `rate`, `taxRateId`, `taxFactorId`
- `factoryTaxChargeId` ⚠️ (collected but not sent)
- `hasFactoryTax` ⚠️ (collected but not sent)
- Special fields for IVARBU (08)

**Issues:**
- Factory tax charge information not being sent to backend

### ✅ 8. Other Tax Section
**Collects:**
- Non-IVA taxes with special fields
- Special handling for ISEBEC (05), ISEBA (04), etc.
- `specialFields`: `quantity`, `percentage`, `taxAmountId`, `volumeConsumption`

### ✅ 9. Discounts Section
**Collects:**
- Multiple discounts per type
- `discountTypeId`, `discountCode`, `description`, `rate`, `reason`

**Issues:**
- Form uses `id` (UUID) for tracking, but backend expects `discount_type_id`
- `reason` field not being sent to backend

### ✅ 10. Commercial Value Section
**Collects:**
- `price` ✅ (base price, mapped to backend)
- Displays calculated sale price (not sent, backend computes)

## Backend DTO Comparison

### ProductRequestDTO (Backend Expects)
```python
# Basic fields
name: Optional[str]
description: Optional[str]
units_per_box: Optional[int]  # ❌ NOT SENT FROM FORM
price: Optional[int]
category_id: Optional[str]
image: Optional[ImageDTO]

# Inventory fields
stock_quantity: Optional[int]  # ❌ NOT SENT FROM FORM
low_stock_threshold: Optional[int]  # ✅ SENT
track_inventory: Optional[bool]  # ✅ SENT
is_service: Optional[bool]  # ❌ NOT SENT FROM FORM
type: Optional[str]  # ❌ NOT SENT FROM FORM
on_sale: Optional[bool]  # ❌ NOT SENT FROM FORM
original_price: Optional[int]  # ❌ NOT SENT FROM FORM
discount: Optional[int]  # ❌ NOT SENT FROM FORM

# Fiscal fields
cabys: Optional[CabysInputDTO]  # ⚠️ SENT AS STRING, NEEDS OBJECT
unit_id: Optional[int]  # ❌ NOT SENT FROM FORM
commercial_unit_measure: Optional[str]  # ❌ NOT SENT FROM FORM
is_packaged: Optional[bool]  # ❌ NOT SENT FROM FORM
quantity: Optional[float]  # ❌ NOT SENT FROM FORM
unit_price: Optional[float]  # ❌ NOT SENT FROM FORM
customs_part: Optional[str]  # ❌ NOT SENT FROM FORM
codes: Optional[List[ProductCodeDTO]]  # ❌ NOT SENT FROM FORM
discounts: Optional[List[ProductDiscountDTO]]  # ⚠️ PARTIAL (missing reason)
taxes: Optional[List[ProductTaxDTO]]  # ⚠️ PARTIAL (missing special fields)
base_amount: Optional[float]  # ❌ NOT SENT (backend computes)
```

### Current Form Submission (ProductsPage.tsx lines 135-154)
```typescript
const body: Record<string, unknown> = {
  name: form.name.trim(),
  description: form.description.trim() || undefined,
  price: Number(form.price),
  category_id: form.category_id || undefined,
  sku: form.sku.trim() || undefined,  // ❌ REMOVED FROM DB
  track_inventory: form.track_inventory,
  low_stock_threshold: form.track_inventory && form.low_stock_threshold 
    ? Number(form.low_stock_threshold) 
    : undefined,
  cabys: form.cabys.trim() || undefined,  // ⚠️ WRONG FORMAT
  taxes: form.taxes.length > 0 ? form.taxes.map(t => ({
    tax_type_id: t.taxTypeId,
    rate: t.rate,
    special_fields: t.specialFields ?? null,  // ⚠️ PARTIAL
  })) : undefined,
  discounts: form.discounts.length > 0 ? form.discounts.map(d => ({
    discount_type_id: d.discountTypeId,
    rate: d.rate,  // ❌ MISSING reason
  })) : undefined,
};
```

## Required Changes

### 1. Update ProductsPage.tsx Form Submission
```typescript
const body: Record<string, unknown> = {
  // Basic fields
  name: form.name.trim(),
  description: form.description.trim() || undefined,
  price: Number(form.price),
  category_id: form.category_id || undefined,
  track_inventory: form.track_inventory,
  low_stock_threshold: form.track_inventory && form.low_stock_threshold 
    ? Number(form.low_stock_threshold) 
    : undefined,
  
  // Packaging
  units_per_box: unitsPerBox ? Number(unitsPerBox) : undefined,
  
  // Fiscal - CABYS
  cabys: form.cabys && form.productTypeId ? {
    code: form.cabys,
    name: form.cabysDescription,
    type: form.productTypeId,
  } : undefined,
  
  // Codes
  codes: form.codes.length > 0 ? form.codes.map(c => ({
    code_type_id: String(c.codeTypeId).padStart(2, '0'),
    number: c.value,
    description: c.reason || undefined,
  })) : undefined,
  
  // Taxes with full special fields
  taxes: form.taxes.length > 0 ? form.taxes.map(t => ({
    tax_type_id: String(t.taxTypeId).padStart(2, '0'),
    tax_rate: t.taxRateId ? {
      id: String(t.taxRateId),
      percentage: t.rate,
    } : undefined,
    tax_factor: t.taxFactorId ? {
      id: String(t.taxFactorId),
      factor: 0, // Would need to be looked up
    } : undefined,
    special_fields: t.specialFields ? {
      quantity: t.specialFields.quantity,
      percentage: t.specialFields.percentage,
      tax_amount: t.specialFields.taxAmountId ? {
        id: String(t.specialFields.taxAmountId),
        amount: 0, // Would need to be looked up
      } : undefined,
      volume_consumption: t.specialFields.volumeConsumption,
    } : undefined,
  })) : undefined,
  
  // Discounts with reason
  discounts: form.discounts.length > 0 ? form.discounts.map(d => ({
    discount_type_id: String(d.discountTypeId).padStart(2, '0'),
    percentage: d.rate,
    reason: d.reason || undefined,
  })) : undefined,
};
```

### 2. Remove SKU from ProductFormState Type
File: `e:\dev\BeautyMarket\templates\pos-system\src\types\productForm.ts`

Remove:
```typescript
sku: string;
```

### 3. Update Backend Product Model (if needed)
The model already has all necessary fields. No changes needed.

### 4. Backend DTO Updates Needed
None - DTOs already support all fields being collected.

### 5. Database Migration Needed?
No - The `sku` column was already removed in migration `g7b8c9d0e1f2_remove_sku_column.py`.

## Fields Not Currently Used (Future Enhancement)

These fields exist in the backend but are not collected by the POS form:
- `stock_quantity` - Could be added to inventory section
- `is_service` - Could be added as a product type toggle
- `type` - Could be used for product categorization
- `on_sale` - Could be added for promotional pricing
- `original_price` - Could be used with on_sale
- `discount` - Could be a quick discount field
- `unit_id` - Unit of measure (UI exists but not sent)
- `commercial_unit_measure` - Custom unit description
- `is_packaged` - Packaging flag
- `quantity` - Package quantity
- `unit_price` - Price per unit in package
- `customs_part` - Customs information

## Testing Checklist

- [ ] Create product with basic info only
- [ ] Create product with image
- [ ] Create product with codes (all types)
- [ ] Create product with packaging info
- [ ] Create product with inventory tracking
- [ ] Create product with CABYS and IVA
- [ ] Create product with other taxes (ISEBEC, ISEBA, etc.)
- [ ] Create product with discounts
- [ ] Create product with factory tax charge
- [ ] Edit existing product
- [ ] Verify all fields are saved correctly
- [ ] Verify calculated prices match backend
