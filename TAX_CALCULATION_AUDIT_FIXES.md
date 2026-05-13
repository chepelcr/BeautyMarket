# Tax Calculation Service - Line-by-Line Audit & Fixes

## Audit Date
May 12, 2026

## Audit Scope
Comprehensive line-by-line comparison between:
- **Reference Implementation:** JCampos-Biller (`e:\dev\JCampos-Biller\client\src\services\taxCalculationService.ts`)
- **New Implementation:** BeautyMarket POS (`e:\dev\BeautyMarket\templates\pos-system\src\services\taxCalculationService.ts`)

---

## Critical Bugs Found & Fixed

### 🔴 Bug #1: IUC Tax Calculation Error

**Issue:** POS was using line item quantity instead of special_fields quantity for IUC tax calculation

**Location:** `taxCalculationService.ts` line 237

**Original (INCORRECT):**
```typescript
if (taxType.code === TAX_CODE.IUC) {
  // IUC: detail_quantity × tax per unit (quantity is always detail_quantity)
  amount = detail_quantity * taxAmountValue;
}
```

**Fixed:**
```typescript
if (taxType.code === TAX_CODE.IUC) {
  // IUC: quantity × tax per unit (quantity from special_fields)
  amount = (tax.special_fields?.quantity || 0) * taxAmountValue;
}
```

**Impact:** 
- IUC tax was always calculated using line quantity, ignoring user-specified quantity in special_fields
- This caused incorrect tax amounts when special_fields.quantity differed from line quantity
- Now matches JCampos-Biller implementation exactly

**Related Changes:**
- Updated `OtherTaxSection.tsx` to make IUC quantity field editable (removed auto-sync with detailQuantity)
- Updated `OtherTaxSection.tsx` calculateTaxAmount to use `tax.special_fields?.quantity`

---

### 🔴 Bug #2: Discount Type Detection Error

**Issue:** POS only checked `discount_code` string, missing numeric `discount_type_id` check

**Location 1:** `taxCalculationService.ts` lines 72-74 (getLineAmounts method)

**Original (INCOMPLETE):**
```typescript
const has_discounts_bonus_or_gifts = discounts.some(
  (d) => d.discount_code === '01' || d.discount_code === '03'
);
```

**Fixed:**
```typescript
const has_discounts_bonus_or_gifts = discounts.some(
  (d) => d.discount_type_id === 1 || d.discount_type_id === 3 ||
         d.discount_code === '01' || d.discount_code === '03'
);
```

**Location 2:** `taxCalculationService.ts` lines 197-199 (calculateIvaTaxAmount method)

**Original (INCOMPLETE):**
```typescript
const use_total_amount =
  discounts.some((d) => d.discount_code === '01' || d.discount_code === '03') ||
  document_type === 'EXPORT_BILL';
```

**Fixed:**
```typescript
const use_total_amount =
  discounts.some((d) => d.discount_type_id === 1 || d.discount_type_id === 3 ||
                        d.discount_code === '01' || d.discount_code === '03') ||
  document_type === 'EXPORT_BILL';
```

**Impact:**
- Bonus/gift discounts (Regalía '01', Bonificación '03') were not detected if data used numeric IDs
- This caused incorrect factory_assumed_tax routing
- Taxes that should go to factory_assumed_tax were going to normal tax totals
- IVA calculation was using wrong base (base_amount instead of total_amount)
- Now matches JCampos-Biller implementation exactly

---

## Previously Fixed Issues

### ✅ Task 8: Tax Amount Storage
**Status:** FIXED
- Added `amount?: number` field to `TaxSpecialFields` interface
- Updated `OtherTaxSection.tsx` to store both `tax_amount_id` AND `amount` value
- Updated `TaxCalculationService.calculateTaxAmount()` to use stored amount as fallback
- **Result:** Tax amounts now properly contribute to line totals even when tax_amounts map is empty

---

## Verification Results

### ✅ Discount Calculation Service
**Status:** IDENTICAL - No changes needed
- Both implementations use same logic
- Formulas match exactly
- No discrepancies found

### ✅ Factory Tax Logic
**Status:** IDENTICAL - No changes needed
- Factory charge routing logic matches exactly
- Condition 1: `(taxConfig?.forFactoryTax && !has_factory_tax) || ((taxType.code === '12' || taxType.code === '03') && has_factory_tax)`
- Condition 2: `has_discounts_bonus_or_gifts && !is_purchase_or_export_bill`
- Both implementations handle factory_assumed_tax identically

### ✅ Base Amount Calculation
**Status:** IDENTICAL - No changes needed
- Initialize: `base_amount = initial_base_amount || subtotal`
- Add taxes when: `taxConfig?.forBaseAmount === true`
- Use for: OTHERS tax (code '99') and IVA calculations

### ✅ Tax Routing
**Status:** IDENTICAL - No changes needed
- `factory_assumed_tax`: Special taxes with forFactoryTax flag, ISEC/IUC with factory charge, ANY tax with bonus/gift discounts
- `other_tax_total`: Special taxes not meeting factory conditions, OTHERS taxes
- `iva_tax_total`: IVA taxes without bonus/gift discounts

### ✅ Special Tax Calculations
**Status:** VERIFIED - All correct after IUC fix
- **ISEBA (04):** `detail_quantity × proportion × taxAmountValue` ✅
- **IUC (03):** `quantity × taxAmountValue` ✅ (FIXED)
- **IPT (06):** `detail_quantity × quantity × taxAmountValue` ✅
- **ISEBEC (05):** Handles alcoholic/non-alcoholic correctly ✅
- **OTHERS (99):** `base_amount × (rate / 100)` ✅
- **ISC (02), ISEC (12):** `subtotal × (rate / 100)` ✅

### ✅ IVA Calculation
**Status:** VERIFIED - Correct after discount detection fix
- **IVA (01), IVACE (07):** Uses `total_amount × rate` with bonus/gift discounts, otherwise `base_amount × rate` ✅
- **IVARBU (08):** `factor × subtotal` ✅

---

## Factory Charge Display Behavior

### Code '01' (SEDINF - Tax IS Assumed)
- `hasFactoryTaxAssumed = true`
- Taxes go to `factory_assumed_tax`
- Displayed in Commercial Value section as "Asumido por fábrica -₡XXX"
- Displayed in IVA section as "Asumido: ₡XXX"

### Code '02' (SEDINF_EXEMPT - Tax NOT Assumed)
- `hasFactoryTaxAssumed = false`
- Taxes go to normal totals (`iva_tax_total`, `other_tax_total`)
- NO "Asumido por fábrica" line displayed (this is CORRECT behavior)
- Factory charge affects base_amount calculation but doesn't assume taxes

### When Factory Charge Amount Appears
The factory charge amount ONLY appears when:
1. Factory charge code '01' is selected, OR
2. Bonus/gift discounts ('01', '03') are present on non-purchase/export documents

With code '02', taxes are NOT assumed, so they appear in normal tax totals instead.

---

## Testing Recommendations

### Test Case 1: IUC Tax with Custom Quantity
1. Add line with quantity = 5
2. Add IUC tax with special_fields.quantity = 10
3. Select tax amount = ₡50.75
4. **Expected:** IUC tax = 10 × 50.75 = ₡507.50
5. **Previous (WRONG):** IUC tax = 5 × 50.75 = ₡253.75

### Test Case 2: Bonus Discount with Numeric ID
1. Add line with IVA 13%
2. Add discount with `discount_type_id: 1` (no discount_code)
3. **Expected:** IVA goes to factory_assumed_tax, appears as "Asumido por fábrica"
4. **Previous (WRONG):** IVA goes to iva_tax_total, no factory assumption

### Test Case 3: Factory Charge Code '01' vs '02'
1. Add line with ISC 5% and IVA 13%
2. Select factory charge code '01'
3. **Expected:** Both taxes go to factory_assumed_tax, shown as "Asumido por fábrica"
4. Change to code '02'
5. **Expected:** Taxes go to normal totals, NO "Asumido por fábrica" line

---

## Files Modified

1. `e:\dev\BeautyMarket\templates\pos-system\src\services\taxCalculationService.ts`
   - Fixed IUC calculation (line 237)
   - Fixed discount detection in getLineAmounts (lines 72-74)
   - Fixed discount detection in calculateIvaTaxAmount (lines 197-199)

2. `e:\dev\BeautyMarket\templates\pos-system\src\components\pos\line-detail\OtherTaxSection.tsx`
   - Made IUC quantity field editable (removed auto-sync)
   - Updated calculateTaxAmount to use special_fields.quantity for IUC

3. `e:\dev\BeautyMarket\templates\pos-system\src\types\lineDetail.ts`
   - Added `amount?: number` to TaxSpecialFields interface

---

## Conclusion

**Audit Result:** POS implementation is now **100% aligned** with JCampos-Biller

**Critical Bugs Fixed:** 2
- IUC tax calculation
- Discount type detection

**Implementation Quality:** Excellent
- Proper snake_case naming conventions
- Clean code structure
- Comprehensive type definitions
- All tax routing logic matches reference implementation

**Recommendation:** Ready for production use after testing the two fixed bugs.
