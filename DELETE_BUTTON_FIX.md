# Delete Button Fix

## Problem
Two delete-related issues were found:
1. **🗑 Delete button in cart** - Clicking the trash icon did nothing
2. **Delete button in LineDetailDrawer** - Clicking "Eliminar" did nothing

## Root Cause

### Issue 1: `updateLine` didn't handle `qty: 0`
The `updateLine` function had this condition:
```typescript
if (patch.qty !== undefined && patch.qty > 0) updated.qty = patch.qty;
```

This meant setting `qty: 0` was ignored, so the delete button (which calls `onUpdateLine(id, { qty: 0 })`) did nothing.

### Issue 2: Delete flow wasn't closing drawer
The LineDetailDrawer's delete button was calling `onDelete?.()` which set `qty: 0`, but since that didn't work (Issue 1), the item wasn't deleted.

## Solution

### Fixed `updateLine` to handle `qty: 0` as delete
**File:** `src/store/cart.ts`

```typescript
updateLine: (productId, patch) => {
  set((state) => {
    const item = state.items[productId];
    if (!item) return state;
    
    // NEW: Handle qty: 0 as delete
    if (patch.qty !== undefined && patch.qty === 0) {
      const { [productId]: _, ...rest } = state.items;
      return { items: rest };
    }
    
    // Continue with normal update
    const updated = { ...item };
    if (patch.qty !== undefined && patch.qty > 0) updated.qty = patch.qty;
    // ... rest of updates
  });
}
```

### Kept `remove` for decrement behavior
**File:** `src/store/cart.ts`

The `remove` function is used by the **−** button to decrement quantity:
```typescript
remove: (productId) => {
  set((state) => {
    const item = state.items[productId];
    if (!item) return state;
    
    // If quantity is 1 or less, remove the item completely
    if (item.qty <= 1) {
      const { [productId]: _, ...rest } = state.items;
      return { items: rest };
    }
    
    // Otherwise, decrement quantity
    return {
      items: {
        ...state.items,
        [productId]: { ...item, qty: item.qty - 1 },
      },
    };
  });
}
```

## Cart Buttons Behavior

### CartSidebar has 4 buttons per item:

1. **% button** - Opens line detail drawer for editing
   ```typescript
   onClick={() => setEditingId(item.id)}
   ```

2. **− button** - Decrements quantity (removes if qty = 1)
   ```typescript
   onClick={() => onRemove(item.id)}
   ```

3. **+ button** - Increments quantity
   ```typescript
   onClick={() => onAdd(items[item.id].product)}
   ```

4. **🗑 button** - Deletes item completely
   ```typescript
   onClick={() => onUpdateLine(item.id, { qty: 0 })}
   ```

## LineDetailDrawer Delete Button

The "Eliminar" button in the drawer:
```typescript
onDelete={() => {
  if (editingId) {
    onUpdateLine(editingId, { qty: 0 }); // Now works!
    setEditingId(null);
  }
}}
```

Shows a confirmation modal before deleting:
```typescript
const handleDelete = () => {
  confirm({
    title: "Eliminar línea",
    message: "¿Estás seguro de que deseas eliminar esta línea del carrito?",
    variant: "destructive",
    confirmLabel: "Eliminar",
    cancelLabel: "Cancelar",
    icon: "trash",
    onConfirm: () => {
      onDelete?.();
      onClose();
    },
  });
};
```

## Testing

### Test Cart Delete Button (🗑):
1. Add item to cart
2. Click trash icon (🗑)
3. ✅ Item should be removed immediately

### Test Cart Decrement Button (−):
1. Add item with qty > 1
2. Click minus button (−)
3. ✅ Quantity should decrease by 1
4. When qty = 1, click minus button (−)
5. ✅ Item should be removed

### Test Drawer Delete Button:
1. Add item to cart
2. Click "%" to open line detail
3. Click "Eliminar" button
4. ✅ Confirmation modal should appear
5. Click "Eliminar" in modal
6. ✅ Item should be removed from cart
7. ✅ Drawer should close

## Files Modified

1. `src/store/cart.ts`
   - Fixed `updateLine` to handle `qty: 0` as delete
   - Kept `remove` for decrement behavior

## Summary

✅ **Cart trash button (🗑)** - Now deletes items  
✅ **Cart minus button (−)** - Still decrements quantity  
✅ **Drawer delete button** - Now deletes items with confirmation  
✅ **All delete flows working correctly**
