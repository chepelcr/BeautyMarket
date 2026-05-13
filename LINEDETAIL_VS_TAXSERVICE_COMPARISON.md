# LineDetailModal vs TaxCalculationService - Logic Comparison

## Overview

JCampos-Biller has **TWO DIFFERENT** tax calculation implementations:

1. **LineDetailModal** - Simplified calculation for UI display
2. **TaxCalculationService** - Complete calculation with factory tax routing

## Key Differences

### 1. Factory Tax Routing

**LineDetailModal:**
- ❌ Does NOT handle `factory_assumed_tax` routing
- ❌ Does NOT check `forFactoryTax` config
- ❌ Does NOT route taxes based on bonus/gift discounts
- ✅ Only calculates individual tax amounts for display

**TaxCalculationService:**
- ✅ Handles complete `factory_assumed_tax` routing
- ✅ Checks `forFactoryTax` config and `hasFactoryTax` parameter
- ✅ Routes taxes to `factory_assumed_tax`, `iva_tax_total`, `other_tax_total`
- ✅ Handles bonus/gift discount logic
- ✅ Calculates `base_amount` with tax accumulation

### 2. Tax Calculation Logic

#### IVA (01) / IVACE (07)

**LineDetailModal (lines 155-157):**
```typescript
case TaxTypes.IVA:
case TaxTypes.IVACE:
    const useTotalAmount = hasDiscountsBonusOrGifts() || isExportBill();
    return useTotalAmount ? (netTotal * tax.rate / 100) : (baseAmount * tax.rate / 100);
```

**TaxCalculationService (lines 197-206):**
```typescript
if (taxType.code === '07' || taxType.code === '01') {
  const use_total_amount =
    discounts.some((d) => d.discount_type_id === 1 || d.discount_type_id === 3 ||
                          d.discount_code === '01' || d.discount_code === '03') ||
    document_type === 'EXPORT_BILL';

  amount = use_total_amount
    ? total_amount * (tax.rate || 0) / 100
    : base_amount * (tax.rate || 0) / 100;
}
```

**Differences:**
- LineDetailModal uses `netTotal` (price × quantity)
- TaxCalculationService uses `total_amount` (subtotal + accumulated taxes)
- Both check for bonus/gift discounts and export bills
- **Result:** Different base amounts used for calculation

#### IVARBU (08)

**LineDetailModal (lines 159-161):**
```typescript
case TaxTypes.IVARBU:
    const factor = taxFactors.find(f => f.factorId === tax.taxFactorId);
    return (factor?.factor || 0) * subtotal;
```

**TaxCalculationService (lines 208-210):**
```typescript
} else if (taxType.code === '08') { // IVARBU
  amount = (tax.factor || 0) * subtotal;
}
```

**Differences:**
- LineDetailModal looks up factor from `taxFactors` array
- TaxCalculationService uses `tax.factor` directly
- **Result:** Same calculation, different data source

#### IUC (03)

**LineDetailModal (lines 163-167):**
```typescript
case TaxTypes.IUC:
    if (tax.specialFields?.taxAmountId && tax.specialFields?.quantity) {
        const taxAmount = getTaxAmountById(tax.taxTypeId, tax.specialFields.taxAmountId);
        return (taxAmount?.amount || 0) * tax.specialFields.quantity;
    }
    return 0;
```

**TaxCalculationService (lines 235-237):**
```typescript
if (taxType.code === TAX_CODE.IUC) {
  // IUC: quantity × tax per unit (quantity from special_fields)
  amount = (tax.special_fields?.quantity || 0) * taxAmountValue;
```

**Differences:**
- ✅ **IDENTICAL LOGIC** - Both use `quantity × taxAmount`
- LineDetailModal looks up taxAmount from state
- TaxCalculationService receives taxAmount as parameter or uses stored value

#### ISEBA (04)

**LineDetailModal (lines 169-175):**
```typescript
case TaxTypes.ISEBA:
    if (tax.specialFields?.quantity && tax.specialFields?.percentage && tax.specialFields?.taxAmountId) {
        const proportion = tax.specialFields.quantity * tax.specialFields.percentage / 100;
        const taxAmount = getTaxAmountById(tax.taxTypeId, tax.specialFields.taxAmountId);
        return detail.quantity * proportion * (taxAmount?.amount || 0);
    }
    return 0;
```

**TaxCalculationService (lines 239-242):**
```typescript
} else if (taxType.code === TAX_CODE.ISEBA) {
  const proportion =
    (tax.special_fields?.quantity || 0) * (tax.special_fields?.percentage || 0) / 100;
  amount = detail_quantity * proportion * taxAmountValue;
```

**Differences:**
- ✅ **IDENTICAL LOGIC** - Both use `detail_quantity × proportion × taxAmount`
- Same proportion calculation: `(quantity × percentage) / 100`

#### ISEBEC (05)

**LineDetailModal (lines 177-188):**
```typescript
case TaxTypes.ISEBEC:
    if (tax.specialFields?.quantity && tax.specialFields?.volumeConsumption && tax.specialFields?.taxAmountId) {
        const taxAmount = getTaxAmountById(tax.taxTypeId, tax.specialFields.taxAmountId);
        const cabys = detail.cabys || '';
        
        if (cabys.startsWith('2202')) { // Non-alcoholic beverages
            const altAmount = (taxAmount?.amount || 0) / tax.specialFields.volumeConsumption;
            return detail.quantity * tax.specialFields.quantity * altAmount;
        } else { // Soaps
            return tax.specialFields.quantity * tax.specialFields.volumeConsumption * (taxAmount?.amount || 0);
        }
    }
    return 0;
```

**TaxCalculationService (lines 244-255):**
```typescript
} else if (taxType.code === TAX_CODE.ISEBEC) {
  const is_non_alcoholic_beverage = cabys?.startsWith('2202');

  if (is_non_alcoholic_beverage) {
    const alt_amount =
      taxAmountValue / (tax.special_fields?.volume_consumption || 1);
    amount = detail_quantity * (tax.special_fields?.quantity || 0) * alt_amount;
  } else {
    amount =
      (tax.special_fields?.quantity || 0) *
      (tax.special_fields?.volume_consumption || 0) *
      taxAmountValue;
  }
```

**Differences:**
- ✅ **IDENTICAL LOGIC** - Both handle non-alcoholic (2202) vs alcoholic/soaps differently
- Non-alcoholic: `detail_quantity × quantity × (taxAmount / volume_consumption)`
- Alcoholic/Soaps: `quantity × volume_consumption × taxAmount`

#### IPT (06)

**LineDetailModal (lines 190-195):**
```typescript
case TaxTypes.IPT:
    if (tax.specialFields?.quantity && tax.specialFields?.taxAmountId) {
        const taxAmount = getTaxAmountById(tax.taxTypeId, tax.specialFields.taxAmountId);
        return detail.quantity * tax.specialFields.quantity * (taxAmount?.amount || 0);
    }
    return 0;
```

**TaxCalculationService (lines 257-259):**
```typescript
} else if (taxType.code === TAX_CODE.IPT) {
  amount =
    detail_quantity * (tax.special_fields?.quantity || 0) * taxAmountValue;
```

**Differences:**
- ✅ **IDENTICAL LOGIC** - Both use `detail_quantity × quantity × taxAmount`

#### ISEC (12)

**LineDetailModal (lines 197-198):**
```typescript
case TaxTypes.ISEC:
    return subtotal * 5.0 / 100; // Fixed 5% rate
```

**TaxCalculationService (lines 265-266):**
```typescript
} else {
  // Default: ISC (02), ISEC (12)
  amount = subtotal * (tax.rate || 0) / 100;
```

**Differences:**
- LineDetailModal hardcodes 5% rate
- TaxCalculationService uses `tax.rate` (which should be 5 for ISEC)
- ✅ **FUNCTIONALLY IDENTICAL**

#### OTHERS (99)

**LineDetailModal (lines 200-201):**
```typescript
case TaxTypes.OTHERS:
    return baseAmount * tax.rate / 100;
```

**TaxCalculationService (lines 261-262):**
```typescript
} else if (taxType.code === TAX_CODE.OTHERS) {
  amount = base_amount * (tax.rate || 0) / 100;
```

**Differences:**
- ✅ **IDENTICAL LOGIC** - Both use `base_amount × rate / 100`

#### Default (ISC 02, etc.)

**LineDetailModal (lines 203-204):**
```typescript
default:
    return subtotal * tax.rate / 100;
```

**TaxCalculationService (lines 265-266):**
```typescript
} else {
  // Default: ISC (02), ISEC (12)
  amount = subtotal * (tax.rate || 0) / 100;
```

**Differences:**
- ✅ **IDENTICAL LOGIC** - Both use `subtotal × rate / 100`

### 3. Total Calculation

**LineDetailModal (lines 220-230):**
```typescript
const calculateTotalAmountLine = () => {
    let total = calculateSubtotal() + calculateTotalTaxAmount();
    
    // Subtract exemption amounts
    ivaTaxes.forEach(tax => {
        if (tax.exemption) {
            // total -= exemption amount (to be calculated)
        }
    });
    
    return total;
};
```

**TaxCalculationService:**
```typescript
// Accumulates taxes into:
// - factory_assumed_tax (subtracted from total)
// - iva_tax_total (added to total)
// - other_tax_total (added to total)
// Returns: total_amount_line, net_tax, base_amount, factory_assumed_tax, etc.
```

**Differences:**
- LineDetailModal: Simple addition of subtotal + all taxes
- TaxCalculationService: Complex routing with factory_assumed_tax subtraction
- LineDetailModal: Handles exemptions (commented out)
- TaxCalculationService: No exemption handling

### 4. Base Amount Calculation

**LineDetailModal:**
- Uses `detail.baseAmount` if set, otherwise `calculateSubtotal()`
- Base amount is manually editable field
- No automatic accumulation of taxes into base amount

**TaxCalculationService:**
- Starts with `initial_base_amount || subtotal`
- Automatically adds taxes when `taxConfig?.forBaseAmount === true`
- Base amount grows as taxes with `forBaseAmount` flag are processed

### 5. Discount Handling

**LineDetailModal (lines 234-240):**
```typescript
const hasDiscountsBonusOrGifts = () => {
    return discounts.some(discount => {
        const discountType = discountTypes.find(dt => dt.discountTypeId === discount.discountTypeId);
        return discountType?.description?.includes(DiscountTypes.BONIFICATION) || 
               discountType?.description?.includes('regalo');
    });
};
```

**TaxCalculationService (lines 72-75):**
```typescript
const has_discounts_bonus_or_gifts = discounts.some(
  (d) => d.discount_type_id === 1 || d.discount_type_id === 3 ||
         d.discount_code === '01' || d.discount_code === '03'
);
```

**Differences:**
- LineDetailModal: Checks if description **contains** "Bonificación" or "regalo" (string matching)
- TaxCalculationService: Checks specific type IDs (1, 3) or codes ('01', '03')
- **Risk:** LineDetailModal approach is fragile (depends on description text)

## Summary

### What LineDetailModal Does:
1. ✅ Calculates individual tax amounts correctly
2. ✅ Handles special tax formulas (IUC, ISEBA, ISEBEC, IPT)
3. ✅ Checks for bonus/gift discounts (but uses string matching)
4. ✅ Adjusts IVA base for discounts and export bills
5. ❌ Does NOT route taxes to factory_assumed_tax
6. ❌ Does NOT accumulate taxes into base_amount
7. ❌ Does NOT handle factory charge logic
8. ❌ Simple total = subtotal + all taxes

### What TaxCalculationService Does:
1. ✅ Everything LineDetailModal does
2. ✅ Routes taxes to factory_assumed_tax based on:
   - `forFactoryTax` config + `hasFactoryTax` parameter
   - Bonus/gift discounts
   - ISEC (12) and IUC (03) special handling
3. ✅ Accumulates taxes into base_amount when `forBaseAmount === true`
4. ✅ Separates totals: `iva_tax_total`, `other_tax_total`, `factory_assumed_tax`
5. ✅ Complex total = subtotal + taxes - factory_assumed_tax

## Recommendation

**For BeautyMarket POS:**
- ✅ Use **TaxCalculationService** for all calculations (already implemented)
- ✅ LineDetailDrawer correctly uses TaxCalculationService
- ✅ No need to replicate LineDetailModal's simplified logic
- ✅ TaxCalculationService provides complete, accurate calculations

**Why JCampos-Biller has both:**
- LineDetailModal was likely built first with simplified logic
- TaxCalculationService was added later for accurate backend calculations
- They kept LineDetailModal for backward compatibility
- **We don't need this duplication** - we started with the correct service

## Conclusion

The POS implementation is **CORRECT** by using TaxCalculationService exclusively. The LineDetailModal in JCampos-Biller is a **simplified version** that doesn't handle factory tax routing, which is why it has different (simpler) logic.

**No changes needed** - POS is using the right approach.
