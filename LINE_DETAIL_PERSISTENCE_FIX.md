# Line Detail Persistence Fix

## Problem
When users edited line details (taxes, CABYS, unit, factory charge, etc.) and clicked Save, the changes were not persisted. When reopening the line detail drawer, all changes were lost.

## Root Cause
The cart store only saved basic fields:
- `qty` (quantity)
- `lineDiscount` (total discount percentage)
- `lineNote` (description)

All detailed line information (taxes, CABYS, unit, factory charge, base amount, customs part, individual discounts) was **NOT being saved**.

## Solution

### 1. Extended CartItem Interface
**File:** `src/store/cart.ts`

Added `lineDetail` field to store complete line information:
```typescript
interface CartItem {
  product: Product;
  qty: number;
  lineDiscount?: number;
  lineNote?: string;
  lineDetail?: Partial<LineDetail>; // NEW: Full line detail
}
```

### 2. Updated updateLine Function
**File:** `src/store/cart.ts`

Added support for updating `lineDetail`:
```typescript
updateLine: (productId, patch) => {
  // ... existing code ...
  if (patch.lineDetail !== undefined) updated.lineDetail = patch.lineDetail;
  // ...
}
```

### 3. Updated LineDetailDrawer Props
**File:** `src/components/pos/line-detail/LineDetailDrawer.tsx`

Added `lineDetail` prop to receive existing line detail:
```typescript
interface LineDetailDrawerProps {
  // ... existing props ...
  lineDetail?: Partial<LineDetail>; // NEW: Existing line detail from cart
  onSave: (patch: { 
    qty?: number; 
    lineDiscount?: number; 
    lineNote?: string;
    lineDetail?: Partial<LineDetail>; // NEW: Save complete detail
  }) => void;
}
```

### 4. Updated handleSave Function
**File:** `src/components/pos/line-detail/LineDetailDrawer.tsx`

Now saves the complete line detail:
```typescript
const handleSave = () => {
  if (!product) return;
  
  onSave({
    qty: detail.quantity,
    lineDiscount: detail.discounts.reduce((s, d) => s + (d.percentage || 0), 0) || undefined,
    lineNote: detail.description !== product.name ? detail.description : undefined,
    lineDetail: detail, // NEW: Save the complete detail
  });
};
```

### 5. Updated Initial State Logic
**File:** `src/components/pos/line-detail/LineDetailDrawer.tsx`

Now checks for existing line detail and uses it if available:
```typescript
const [detail, setDetail] = useState<LineDetail>(() => {
  if (!product) return { /* empty state */ };
  
  // NEW: If we have existing line detail, use it
  if (existingLineDetail) {
    return {
      product_id: product.product_id,
      description: existingLineDetail.description ?? lineNote ?? product.name,
      quantity: existingLineDetail.quantity ?? qty,
      net_price: existingLineDetail.net_price ?? product.price ?? 0,
      base_amount: existingLineDetail.base_amount,
      unit_id: existingLineDetail.unit_id,
      commercial_unit_measure: existingLineDetail.commercial_unit_measure,
      customs_part: existingLineDetail.customs_part,
      factory_tax_charge_id: existingLineDetail.factory_tax_charge_id,
      cabys: existingLineDetail.cabys ?? product.cabys ?? undefined,
      taxes: existingLineDetail.taxes ?? [],
      discounts: existingLineDetail.discounts ?? [],
    };
  }
  
  // Otherwise, build from product defaults
  return { /* default state from product */ };
});
```

### 6. Updated useEffect Reset Logic
**File:** `src/components/pos/line-detail/LineDetailDrawer.tsx`

Added `existingLineDetail` to dependency array and checks for it:
```typescript
useEffect(() => {
  if (!product) return;
  
  // If we have existing line detail, use it
  if (existingLineDetail) {
    setDetail({ /* from existingLineDetail */ });
    return;
  }
  
  // Otherwise, build from product defaults
  setDetail({ /* from product */ });
}, [product?.product_id, qty, lineDiscount, lineNote, existingLineDetail]);
```

### 7. Updated CartSidebar
**File:** `src/components/pos/CartSidebar.tsx`

- Updated `onUpdateLine` prop type to accept `lineDetail`
- Passed `lineDetail` prop to `LineDetailDrawer`

## What Now Persists

After this fix, the following information is now saved and restored:

✅ **Taxes:**
- IVA taxes with rates
- Other taxes (ISC, IUC, ISEBA, ISEBEC, IPT, ISEC, OTHERS)
- Tax special fields (quantity, percentage, volume_consumption, tax_amount_id, amount)

✅ **Discounts:**
- Multiple discounts with types and percentages
- Discount codes

✅ **Fiscal Information:**
- CABYS code
- Product type (unit_id)
- Commercial unit measure
- Customs part (for export invoices)

✅ **Factory Charge:**
- Factory tax charge ID
- Base amount

✅ **Basic Fields:**
- Quantity
- Net price
- Description

## Testing

To verify the fix works:

1. Add a product to cart
2. Click "Editar" to open line detail
3. Make changes:
   - Add/modify taxes
   - Change CABYS
   - Select factory charge
   - Add discounts
   - Change unit information
4. Click "Guardar"
5. Click "Editar" again
6. ✅ All changes should be preserved

## Files Modified

1. `src/store/cart.ts` - Extended CartItem and updateLine
2. `src/components/pos/line-detail/LineDetailDrawer.tsx` - Added lineDetail prop, updated save/load logic
3. `src/components/pos/CartSidebar.tsx` - Updated prop types and passed lineDetail

## Backward Compatibility

✅ The changes are backward compatible:
- Existing cart items without `lineDetail` will work normally
- New cart items will have `lineDetail` saved
- The `lineDetail` field is optional (`Partial<LineDetail>`)
