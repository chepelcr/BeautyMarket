# Architecture Cleanup - 2026-01-09

## Summary

Cleaned up the multi-app architecture to establish clear boundaries between landing site and admin dashboard.

## Changes Made

### 1. Consolidated Organization Flows to Dashboard

**Copied from landing-client to dashboard:**
- `CreateOrganization.tsx` - 3-step onboarding flow with draft functionality
- `useOrganization.ts` - Updated hook with `completeOnboardingStep2` and `completeOnboardingStep3` mutations
- `SelectOrganization.tsx` - Updated to handle incomplete organizations (onboardingStep < 3)

### 2. Removed Duplicate Pages from Landing-Client

**Deleted organization management pages** (belong in dashboard, not landing):
- `CreateOrganization.tsx`
- `SelectOrganization.tsx`

**Deleted authentication pages** (duplicates, dashboard has these):
- `Login.tsx`
- `Register.tsx`
- `ForgotPassword.tsx`
- `ResetPassword.tsx`
- `VerifyEmail.tsx`

### 3. Final Architecture

#### landing-client/ (Marketing Site)
**Purpose**: Public-facing marketing website
**Deployment**: `j-markets.jcampos.dev`
**Pages**:
- Landing.tsx - Homepage with hero, features, pricing
- Examples.tsx - Template gallery
- About.tsx - About page
- Blog.tsx - Blog listing
- Contact.tsx - Contact form
- Terms.tsx - Terms of service
- Privacy.tsx - Privacy policy
- Cookies.tsx - Cookie policy

#### dashboard/ (Admin Application)
**Purpose**: Store management and administration
**Deployment**: `admin.j-markets.jcampos.dev` and organization subdomains
**Pages**:

**Auth Routes:**
- Login.tsx
- Register.tsx
- VerifyEmail.tsx
- ForgotPassword.tsx
- ResetPassword.tsx

**Organization Routes:**
- CreateOrganization.tsx (3-step: basic info → contact → template)
- SelectOrganization.tsx (handles incomplete orgs)
- OrganizationSettings.tsx
- AcceptInvitation.tsx

**Admin Routes:**
- Dashboard.tsx
- ProductsPage.tsx
- CategoriesPage.tsx
- OrdersPage.tsx / OrderDetailsPage.tsx
- CustomersPage.tsx / CustomerDetailsPage.tsx
- ContentPage.tsx (CMS)
- Settings: General, Theme, Contact, Payment, Shipping
- TeamMembersPage.tsx
- Profile.tsx
- DeploymentHistory.tsx

#### client/ (DEPRECATED)
**Status**: Marked as deprecated
**Note**: All functionality migrated to dashboard/
**File**: `DEPRECATED.md` created with migration notes

## Multi-Step Organization Onboarding Flow

The organization creation now uses a draft/progressive flow:

1. **Step 1 (Basic Info)**: Creates organization immediately with `onboardingStep = 1`
   - POST `/api/users/:userId/organizations`
   - Saves: name, slug, subdomain, ownerId

2. **Step 2 (Contact Info)**: Updates contact settings with `onboardingStep = 2`
   - POST `/api/users/:userId/organizations/:id/onboarding/step2`
   - Saves: email, phone, address

3. **Step 3 (Template)**: Applies template and marks complete with `onboardingStep = 3`
   - POST `/api/users/:userId/organizations/:id/onboarding/step3`
   - Clones template content to organization
   - Organization now ready to use

## Benefits

1. **Clear Separation**: Landing site only has marketing, dashboard has admin functionality
2. **No Duplication**: Auth flows exist only in dashboard
3. **Progressive Onboarding**: Organizations save data at each step (no data loss if user abandons)
4. **Better UX**: SelectOrganization shows incomplete orgs and allows continuing setup

## Migration Path

If you need to fully remove the deprecated `client/` folder:

```bash
# After verifying dashboard is fully functional
rm -rf client/
```

Update build scripts in `package.json` if needed to remove client references.
