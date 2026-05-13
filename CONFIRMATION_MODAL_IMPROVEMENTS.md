# Confirmation Modal Improvements

## Issues Fixed

### 1. Modal Z-Index Issue
**Problem:** Confirmation modal appeared behind the LineDetailDrawer on mobile, making it invisible.

**Root Cause:** Both Modal and Drawer used the same z-index (200).

**Solution:** Increased Modal z-index to 300.

**File:** `src/components/ui/Modal.tsx`
```typescript
// Before
zIndex: 200

// After
zIndex: 300 // Higher than Drawer (200)
```

### 2. Missing Confirmation on Minus Button
**Problem:** Clicking the minus (−) button when qty = 1 would delete the item without confirmation.

**Solution:** Added confirmation modal when qty will become 0.

**File:** `src/components/pos/CartSidebar.tsx`
```typescript
const handleRemove = (itemId: string) => {
  const item = items[itemId];
  if (!item) return;
  
  // If quantity is 1, confirm before removing
  if (item.qty <= 1) {
    confirm({
      title: "Eliminar producto",
      message: `¿Eliminar "${item.product.name}" del carrito?`,
      variant: "destructive",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      icon: "trash",
      onConfirm: () => onRemove(itemId),
    });
  } else {
    // Just decrement
    onRemove(itemId);
  }
};
```

### 3. Missing Confirmation on Cart Delete Button
**Problem:** Clicking the trash (🗑) button in cart would delete the item without confirmation.

**Solution:** Added confirmation modal before deleting.

**File:** `src/components/pos/CartSidebar.tsx`
```typescript
const handleDelete = (itemId: string) => {
  const item = items[itemId];
  if (!item) return;
  
  confirm({
    title: "Eliminar producto",
    message: `¿Eliminar "${item.product.name}" del carrito?`,
    variant: "destructive",
    confirmLabel: "Eliminar",
    cancelLabel: "Cancelar",
    icon: "trash",
    onConfirm: () => onUpdateLine(itemId, { qty: 0 }),
  });
};
```

## Z-Index Hierarchy

Now the z-index stack is properly ordered:

1. **Base UI**: z-index 0-99
2. **Drawer Backdrop**: z-index 200
3. **Drawer Content**: z-index 201
4. **Modal Backdrop**: z-index 300 ✅ (Higher than Drawer)
5. **Modal Content**: inherits from backdrop (300+)

This ensures modals always appear above drawers, even on mobile.

## User Experience Flow

### Minus Button (−):
1. **If qty > 1**: Decrements quantity immediately (no confirmation)
2. **If qty = 1**: Shows confirmation modal
   - **Confirmar**: Removes item from cart
   - **Cancelar**: Keeps item in cart

### Trash Button (🗑):
1. Always shows confirmation modal
2. **Confirmar**: Removes item from cart
3. **Cancelar**: Keeps item in cart

### LineDetailDrawer Delete Button:
1. Shows confirmation modal
2. **Confirmar**: Removes item and closes drawer
3. **Cancelar**: Keeps item and stays in drawer

## Confirmation Modal Messages

All delete confirmations now show:
- **Title**: "Eliminar producto"
- **Message**: "¿Eliminar "[Product Name]" del carrito?"
- **Confirm Button**: "Eliminar" (red/destructive)
- **Cancel Button**: "Cancelar" (outline)
- **Icon**: Trash icon

## Files Modified

1. `src/components/ui/Modal.tsx`
   - Increased z-index from 200 to 300

2. `src/components/pos/CartSidebar.tsx`
   - Added `useConfirmModal` hook
   - Added `handleRemove` function with conditional confirmation
   - Added `handleDelete` function with confirmation
   - Updated minus button to use `handleRemove`
   - Updated trash button to use `handleDelete`
   - Added `<ConfirmModal />` component

## Testing

### Test Modal Z-Index:
1. Add item to cart
2. Click "%" to open line detail drawer
3. Click "Eliminar" button
4. ✅ Confirmation modal should appear **above** the drawer
5. ✅ Modal should be fully visible on mobile

### Test Minus Button Confirmation:
1. Add item with qty = 1
2. Click minus (−) button
3. ✅ Confirmation modal should appear
4. Click "Cancelar"
5. ✅ Item should remain in cart
6. Click minus (−) button again
7. Click "Eliminar"
8. ✅ Item should be removed

### Test Minus Button Without Confirmation:
1. Add item with qty = 3
2. Click minus (−) button
3. ✅ Quantity should decrease to 2 (no modal)
4. Click minus (−) button
5. ✅ Quantity should decrease to 1 (no modal)
6. Click minus (−) button
7. ✅ Confirmation modal should appear

### Test Trash Button Confirmation:
1. Add item to cart (any quantity)
2. Click trash (🗑) button
3. ✅ Confirmation modal should appear
4. Click "Eliminar"
5. ✅ Item should be removed

## Summary

✅ **Modal z-index fixed** - Appears above drawer on all devices  
✅ **Minus button confirmation** - Shows modal when qty will become 0  
✅ **Trash button confirmation** - Always shows modal before deleting  
✅ **Consistent UX** - All delete actions now have confirmation  
✅ **Mobile-friendly** - Modals fully visible on small screens
