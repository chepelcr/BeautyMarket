# CABYS Search Fixes and Pagination Implementation

## Overview
Fixed CABYS search to properly pass parameters and implemented pagination in the CABYS modal.

## Issues Fixed

### 1. Incorrect Search Parameters
**Problem**: CABYS search was sending incorrect URL like `countries/almohada/cabys?search=20&size=20` where "almohada" (pillow) was being used as the ISO code instead of "188".

**Root Cause**: 
- The modal wasn't getting the ISO code from the organization context
- Product type ID wasn't being passed to filter results

**Solution**:
- Added `useAuth` and `useOrganization` hooks to get the correct ISO code
- Added `productTypeId` prop to CabysModal
- Pass product type from FiscalInformationSection to filter CABYS results

### 2. Missing Pagination
**Problem**: CABYS search only showed first 20 results with no way to see more.

**Solution**: Implemented full pagination with:
- Page navigation (Previous/Next buttons)
- Page counter display
- Total results count
- Proper state management for current page

## Changes Made

### 1. useHacienda Hook
**File**: `dashboard/src/hooks/useHacienda.ts`

**Added**:
- `searchCabys()` - Main search function with pagination support
  - Parameters: `iso_code`, `query`, `page`, `size`, `productTypeId`
  - Returns full `CabysSearchResponse` with pagination metadata

**Updated**:
- `searchCabysByName()` - Now uses `searchCabys()` internally
- `getCabysByCode()` - Now uses `searchCabys()` internally

### 2. CabysModal Component
**File**: `dashboard/src/components/products/CabysModal.tsx`

**Added Props**:
- `productTypeId?: number` - Filter results by product type (4=Producto, 5=Servicio, 6=Servicio Médico)

**Added State**:
- `currentPage` - Current page number (1-based)
- `totalPages` - Total number of pages
- `totalResults` - Total number of results
- `pageSize` - Items per page (20)

**Added Features**:
- ISO code from organization context
- Pagination controls (Previous/Next buttons)
- Results counter ("Showing X - Y of Z results")
- Page indicator ("Page X of Y")
- Product type display in results
- Proper data mapping from new API response format

**Data Mapping**:
```typescript
// Old format (from org API)
{
  codigo: string,
  descripcion: string,
  impuesto: number
}

// New format (from data API)
{
  code: string,
  description: string,
  tax_rate: { percentage: number },
  product_type: { description: string }
}
```

### 3. FiscalInformationSection Component
**File**: `dashboard/src/components/products/sections/FiscalInformationSection.tsx`

**Updated**:
- Pass `productTypeId` from form to CabysModal
- Uses `form.watch("productTypeId")` to get current selected product type

## API Endpoint

**Data API**: `GET /countries/{iso_code}/cabys`

**Parameters**:
- `search` (required): Search term (CABYS code or description keyword)
- `page` (optional): Page number (1-based, default: 1)
- `size` (optional): Items per page (default: 20, max: 100)
- `type` (optional): Product type ID filter (4=Producto, 5=Servicio, 6=Servicio Médico)

**Response**:
```typescript
{
  total: number,      // Total number of results
  page: number,       // Current page
  size: number,       // Items per page
  count: number,      // Items in current page
  items: CabysItem[]  // Array of CABYS items
}
```

## Benefits

1. **Correct ISO Code**: Uses organization's country code instead of search term
2. **Product Type Filtering**: Results filtered by selected product type
3. **Pagination**: Users can browse through all results, not just first 20
4. **Better UX**: Shows result counts and current page
5. **Consistent Data**: Uses data API format throughout

## Testing

Verify that:
1. CABYS search uses correct ISO code (e.g., "188" for Costa Rica)
2. Search results are filtered by selected product type
3. Pagination controls appear when results exceed 20 items
4. Previous/Next buttons work correctly
5. Page counter updates properly
6. Product type is displayed in search results
7. Tax rate percentage is correctly extracted from response
