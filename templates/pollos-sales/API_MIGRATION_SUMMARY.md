# API Migration Summary: Cross-App-BE Endpoints

## Overview
Updated pollos-sales template to use the correct API endpoints for cross-app-be services (sessions, assignments, branches, terminals, dashboard, closings, consecutives).

## Changes Made

### 1. Updated `src/lib/api.ts`

**Added:**
- `CROSS_APP_API_BASE` constant pointing to `VITE_ORDERS_API_URL`
- `crossAppApi` object with methods for cross-app-be API calls
- `crossAppOrgPath()` function to build cross-app-be organization-scoped paths
- Automatic `x-user-id` header extraction from JWT token

**New API Pattern:**
```typescript
// Old pattern (markets API)
api.get(orgPath(userId, orgId, "/members"))
// URL: /api/users/{userId}/organization/{orgId}/members

// New pattern (cross-app-be)
crossAppApi.get(crossAppOrgPath(orgId, "/sessions"))
// URL: /api/organization/{orgId}/sessions
// Header: x-user-id: {userId from JWT}
```

### 2. Updated Files

The following files were updated to use `crossAppApi` and `crossAppOrgPath`:

1. **src/pages/dashboard/SessionConfig.tsx**
   - Branches query
   - Session creation
   - Assignment creation

2. **src/pages/dashboard/DashboardPage.tsx**
   - Dashboard data query
   - Closings query
   - Sessions query
   - Session deactivation
   - Closing approval/rejection

3. **src/pages/dashboard/AssignmentsPage.tsx**
   - Assignments query
   - Sessions query
   - Branches query
   - Assignment creation
   - Assignment deactivation

4. **src/hooks/useAssignment.ts**
   - Active assignment query

5. **src/components/pos/ClosingFlow.tsx**
   - Closing creation

## API Endpoints Mapping

### Cross-App-BE Endpoints (use `crossAppApi` + `crossAppOrgPath`)
- `/api/organization/{orgId}/sessions`
- `/api/organization/{orgId}/assignments`
- `/api/organization/{orgId}/branches`
- `/api/organization/{orgId}/terminals`
- `/api/organization/{orgId}/dashboard`
- `/api/organization/{orgId}/closings`
- `/api/organization/{orgId}/consecutives`

### Markets API Endpoints (use `api` + `orgPath`)
- `/api/users/{userId}/organization/{orgId}/members`
- `/api/users/{userId}/organization/{orgId}/pages`
- `/api/users/{userId}/organization/{orgId}/content`
- `/api/users/{userId}/organization/{orgId}/deployments`
- `/api/users/{userId}/organization/{orgId}/settings`

## Authentication

The `x-user-id` header is now automatically added to all requests by extracting the `sub` claim from the JWT token:

```typescript
if (token) {
  try {
    const [, payloadB64] = token.split('.');
    const { sub } = JSON.parse(atob(payloadB64));
    if (sub) headers['x-user-id'] = sub;
  } catch (e) {
    console.warn('Failed to extract user ID from token');
  }
}
```

## Environment Variables

Ensure the following environment variable is set:

```env
VITE_ORDERS_API_URL=https://orders-api.jcampos.dev
```

## Testing Checklist

- [ ] Session creation works correctly
- [ ] Assignment creation works correctly
- [ ] Dashboard data loads correctly
- [ ] Closings can be approved/rejected
- [ ] Sessions can be deactivated
- [ ] Branches list loads correctly
- [ ] Active assignments display correctly
- [ ] POS closing flow works correctly

## Benefits

1. **Correct API Usage** - Now using the refactored cross-app-be endpoints
2. **Cleaner URLs** - Removed redundant `/users/{userId}` from URLs
3. **Better Security** - User ID passed via header instead of URL
4. **Consistency** - Aligns with backend API refactoring
5. **Maintainability** - Clear separation between markets API and cross-app-be API
