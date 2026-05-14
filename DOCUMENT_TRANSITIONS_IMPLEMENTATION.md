# Document Transitions Implementation Summary

## Overview
Implemented smooth transitions between document views, fixed cart switching issues, and improved nav toggle UX with hover detection on desktop and a button on mobile.

## Changes Made

### 1. Fixed Cart Switching Logic (`POSIntegratedPage.tsx`)
**Problem**: Cart state wasn't properly syncing when switching between document tabs.

**Solution**: Split the cart save/restore logic into two separate `useEffect` hooks:
- **Restore Effect**: Runs when `tabId` changes, restores cart from the document tab's saved state
- **Save Effect**: Runs whenever `cartItems` changes, continuously saves cart state to the current tab

**Code Changes**:
```typescript
// Restore cart when tab changes
useEffect(() => {
  if (!tabId) return;
  const { open_documents } = useDocumentStore.getState();
  const currentTab = open_documents.find((d) => d.id === tabId);
  
  if (currentTab) {
    if (currentTab.cart_items) {
      setCartItems(currentTab.cart_items);
    } else {
      setCartItems({});
    }
  }
}, [tabId, setCartItems]);

// Save cart to current tab whenever cart changes
useEffect(() => {
  if (!tabId) return;
  const { updateDocumentTab } = useDocumentStore.getState();
  updateDocumentTab(tabId, { cart_items: cartItems });
}, [cartItems, tabId]);
```

### 2. Added Smooth Transitions Between Views

#### DocumentsPage.tsx
- Added `key` prop to both `DocumentEditor` and `DocumentsListView` components
- This forces React to unmount/remount components when switching, creating a clean transition
- Pattern follows JCampos Biller implementation

**Code Changes**:
```typescript
{editorTabId ? (
  <DocumentEditor key={editorTabId} orgId={org.id} tabId={editorTabId} />
) : (
  <DocumentsListView key="list-view" orgId={org.id} />
)}
```

#### DocumentEditor.tsx
- Added fade-in animation to the root container
- Animation duration: 0.2s with ease-in-out timing

**Code Changes**:
```typescript
<div 
  className="relative h-full w-full overflow-hidden"
  style={{
    animation: 'fadeIn 0.2s ease-in-out',
  }}
>
```

#### DocumentsListView.tsx
- Added matching fade-in animation to maintain consistency
- Same animation duration and timing as DocumentEditor

**Code Changes**:
```typescript
<div 
  className="flex flex-col h-full"
  style={{
    animation: 'fadeIn 0.2s ease-in-out',
  }}
>
```

### 3. Improved Nav Toggle UX

#### Desktop Behavior (≥768px)
- **Removed**: Corner triangle button
- **Added**: Hover detection on main nav area (top 56px of viewport)
- Nav automatically shows when mouse enters the main nav zone (top of page)
- Nav stays open while mouse is in:
  - Main dashboard nav area
  - Dashboard sidebar
  - Document editor nav
- Nav hides when clicking inside the editor space (but not on the nav itself)

**Implementation**:
```typescript
// Desktop: Show nav when hovering over top area (main nav zone)
useEffect(() => {
  if (!isDesktop) return;

  const handleMouseMove = (e: MouseEvent) => {
    // Show nav when mouse is in top 56px (main nav height)
    if (e.clientY <= 56) {
      setShowNav(true);
    }
  };

  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, [isDesktop]);

// Hide nav when clicking inside editor space
useEffect(() => {
  const handleClickEditor = (e: MouseEvent) => {
    if (showNav && editorRef.current && editorRef.current.contains(e.target as Node)) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setShowNav(false);
      }
    }
  };

  document.addEventListener('click', handleClickEditor);
  return () => document.removeEventListener('click', handleClickEditor);
}, [showNav]);
```

#### Mobile Behavior (<768px)
- **Added**: Toggle button next to "Online" status tag in POS header
- Button shows document icon (fileText)
- Button highlights when nav is open (primary color)
- Clicking inside editor space hides the nav

**Implementation**:
```typescript
{onToggleDocNav && (
  <button
    onClick={onToggleDocNav}
    className={cn(
      "inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors",
      showDocNav 
        ? "bg-primary text-primary-foreground" 
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    )}
  >
    <Icon name="fileText" size={16} />
  </button>
)}
```

## How It Works

### Cart Switching Flow
1. User switches from Document A to Document B
2. **Save Effect** saves Document A's cart state to its tab in the store
3. **Restore Effect** detects `tabId` change and loads Document B's cart state
4. If Document B has no saved cart, it starts with an empty cart
5. As user adds items to Document B, **Save Effect** continuously updates the tab's cart state

### Transition Flow
1. User navigates from list view to editor (or vice versa)
2. React detects `key` change on the component
3. Old component unmounts with fade-out (natural unmount)
4. New component mounts with fade-in animation (0.2s)
5. Nav automatically hides when entering editor mode

### Nav Toggle Flow

#### Desktop
1. User moves mouse to top of page (main nav area)
2. Document editor nav slides down automatically
3. Nav stays open while mouse is in dashboard layout areas (sidebar, main nav, or editor nav)
4. User clicks inside editor space → nav slides up
5. Nav also auto-hides when switching document tabs

#### Mobile
1. User clicks the document icon button next to "Online" tag
2. Document editor nav slides down
3. Button highlights to show nav is open
4. User clicks inside editor space → nav slides up
5. User can also click button again to toggle

## Files Modified
1. `e:\dev\BeautyMarket\templates\pos-system\src\pages\dashboard\POSIntegratedPage.tsx`
   - Added `showDocNav` and `onToggleDocNav` props
   - Added mobile toggle button in header
2. `e:\dev\BeautyMarket\templates\pos-system\src\pages\dashboard\DocumentsPage.tsx`
   - Added `key` props for smooth transitions
3. `e:\dev\BeautyMarket\templates\pos-system\src\components\documents\DocumentEditor.tsx`
   - Removed corner triangle button
   - Added hover detection for desktop
   - Added click-to-hide behavior
   - Pass toggle props to POSIntegratedPage
4. `e:\dev\BeautyMarket\templates\pos-system\src\components\documents\DocumentsListView.tsx`
   - Added fade-in animation

## Testing Checklist
- [ ] **Cart Switching**
  - [ ] Switch between different document tabs - cart should maintain separate state
  - [ ] Add items to cart in Document A, switch to Document B, verify cart is empty/different
  - [ ] Switch back to Document A, verify cart items are restored
- [ ] **Transitions**
  - [ ] Navigate from list view to editor - should see smooth fade transition
  - [ ] Navigate from editor back to list - should see smooth fade transition
  - [ ] Switch between different document tabs in editor - should see smooth fade transition
- [ ] **Desktop Nav Toggle (≥768px)**
  - [ ] Move mouse to top of page → nav should slide down
  - [ ] Keep mouse in main nav area → nav should stay open
  - [ ] Keep mouse in sidebar → nav should stay open
  - [ ] Keep mouse in editor nav → nav should stay open
  - [ ] Click inside editor space → nav should slide up
  - [ ] Switch document tabs → nav should auto-hide
- [ ] **Mobile Nav Toggle (<768px)**
  - [ ] Click document icon button → nav should slide down
  - [ ] Button should highlight when nav is open
  - [ ] Click inside editor space → nav should slide up
  - [ ] Click button again → nav should toggle

## Pattern Reference
This implementation follows the pattern used in JCampos Biller:
- File: `e:\dev\JCampos-Biller\client\src\components\invoices\DocumentTabs.tsx`
- Key-based conditional rendering for smooth transitions
- Separate state management per document tab
- Clean component unmount/remount on tab switch
