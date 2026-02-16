# Authentication Flow Documentation

## Overview

The authentication system uses AWS Cognito for user management with automatic syncing to the local database. This document describes the complete authentication flow and validation logic.

## Architecture

```
User Login
    ↓
AWS Cognito Authentication
    ↓
Email Verification Check (Cognito)
    ↓
User Profile Fetch (Backend API)
    ↓
Database Sync (if needed)
    ↓
Authentication Complete
```

## Key Components

### Frontend (landing-client & client)
- **useAuth.ts**: Custom React hook managing authentication state and mutations
- **AWS Amplify**: Cognito SDK for authentication operations
- **React Query**: Server state management for user profiles

### Backend (server)
- **CognitoService**: AWS Cognito integration service
- **UserService**: Business logic for user management and validation
- **UserController**: HTTP endpoints for user operations

## Authentication Flow Details

### 1. Login Process

**Location**: `landing-client/src/hooks/useAuth.ts` & `client/src/hooks/useAuth.ts`

```typescript
// Step 1: Sign in with Cognito
const result = await signIn({ username: email, password });

// Step 2: Check if email verification is required (Cognito level)
if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
  return { needsVerification: true, email };
}

// Step 3: Fetch user profile from backend
const response = await authenticatedRequest('GET', `/api/user/${userId}/profile`);

// Step 4: Handle email not verified response
if (response.status === 403 && errorData.needsVerification) {
  return { needsVerification: true, email };
}
```

**Scenarios Handled**:
1. ✅ **User not registered in Cognito** → Authentication fails
2. ✅ **Email not verified in Cognito** → Redirect to verify page
3. ✅ **Email verified but user not in database** → Auto-sync from Cognito
4. ✅ **User exists and verified** → Login successful

### 2. Email Verification Validation

**Location**: `server/src/services/UserService.ts`

The `getUserProfile` method now performs validation in this order:

```typescript
async getUserProfile(userId: string): Promise<UserProfile | null> {
  // 1. Fetch user from Cognito
  const cognitoUser = await this.cognitoService.getUserById(userId);

  if (!cognitoUser) {
    return null; // User doesn't exist in Cognito
  }

  // 2. Verify email is verified in Cognito
  if (!cognitoUser.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  // 3. Check if user exists in database
  let user = await this.userRepository.getUser(userId);

  // 4. If not in DB, sync from Cognito
  if (!user) {
    user = await this.userRepository.createUser({
      id: cognitoUser.id,
      username: cognitoUser.username,
      email: cognitoUser.email,
      firstName: cognitoUser.firstName || null,
      lastName: cognitoUser.lastName || null,
      gender: cognitoUser.gender || null,
      role: 'customer',
      isActive: true,
    });
  }

  return this.mapUserToProfile(user);
}
```

**Why this approach?**
- **Single source of truth**: Cognito is the authoritative source for email verification status
- **Automatic sync**: Users verified in Cognito but missing from DB are automatically created
- **Clean separation**: Business logic in UserService, HTTP handling in UserController
- **Clear error handling**: Specific error types for different scenarios

### 3. Error Handling

**Location**: `server/src/controllers/UserController.ts`

```typescript
async getProfile(req: Request, res: Response) {
  try {
    const profile = await this.userService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error: any) {
    // Handle email not verified error
    if (error.name === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({
        error: 'Email not verified',
        needsVerification: true,
        email: error.email,
      });
    }

    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}
```

**Response Codes**:
- `200`: User profile retrieved successfully
- `403`: Email not verified (`needsVerification: true`)
- `404`: User not found in Cognito
- `500`: Server error

### 4. Frontend Response Handling

**Login Flow** (`useAuth.ts` - loginMutation):
```typescript
// Handle 403 email not verified
if (response.status === 403) {
  const errorData = await response.json();
  if (errorData.needsVerification) {
    return {
      needsVerification: true,
      email: errorData.email || data.email,
    };
  }
}
```

**Profile Query** (`useAuth.ts` - user profile query):
```typescript
// Handle email not verified - force logout
if (response.status === 403) {
  const errorData = await response.json();
  if (errorData.needsVerification) {
    console.warn('Email not verified, logging out');
    await signOut();
    return null;
  }
}
```

### 5. User Registration & Verification

**Registration Flow**:
1. User submits registration form
2. AWS Cognito creates user with unverified email
3. Cognito sends verification code via email
4. User enters verification code
5. `completeEmailVerification` syncs user data to database
6. User is redirected to organization selection

**Location**: `server/src/services/UserService.ts`

```typescript
async completeEmailVerification(request: VerifyEmailRequest): Promise<VerifyEmailResult> {
  const { userId } = request;

  // Check if user already exists in database
  let user = await this.userRepository.getUser(userId);

  if (user) {
    return { message: 'User already verified', user: this.mapUserToProfile(user) };
  }

  // Fetch user data from Cognito
  const cognitoUser = await this.cognitoService.getUserById(userId);

  if (!cognitoUser) {
    throw new Error('User not found in Cognito');
  }

  // Create user in database with data from Cognito
  user = await this.userRepository.createUser({
    id: cognitoUser.id,
    username: cognitoUser.username,
    email: cognitoUser.email,
    firstName: cognitoUser.firstName || null,
    lastName: cognitoUser.lastName || null,
    gender: cognitoUser.gender || null,
    role: 'customer',
    isActive: true,
  });

  return {
    message: 'Email verification completed successfully',
    user: this.mapUserToProfile(user),
  };
}
```

## Security Considerations

### 1. Email Verification Requirement
- Users MUST verify their email before accessing the system
- Verification status is checked on every profile fetch
- Unverified users are automatically logged out if they somehow bypass initial checks

### 2. Token Validation
- AWS Amplify handles JWT token validation
- Backend uses `fetchAuthSession()` to get valid tokens
- Automatic token refresh on 401/403 responses

### 3. Session Management
- Force logout on unverified email detection
- Clear session data after logout
- No persistent sessions for unverified users

## Data Flow Diagrams

### Successful Login (Verified User)
```
Frontend                 Cognito                Backend DB
   |                        |                       |
   |--signIn(email,pwd)---->|                       |
   |<------JWT token--------|                       |
   |                        |                       |
   |--getUserProfile(id)------------------->|       |
   |                        |               |       |
   |                        |<--check user--|       |
   |                        |               |       |
   |<------user profile---------------------|       |
   |                        |                       |
```

### Login with Unverified Email
```
Frontend                 Cognito                Backend DB
   |                        |                       |
   |--signIn(email,pwd)---->|                       |
   |<-nextStep:CONFIRM_SIGN_UP-|                   |
   |                        |                       |
   |--redirect to /verify-email                    |
   |                        |                       |
```

### Login - Verified but Not in DB
```
Frontend                 Cognito                Backend DB
   |                        |                       |
   |--signIn(email,pwd)---->|                       |
   |<------JWT token--------|                       |
   |                        |                       |
   |--getUserProfile(id)------------------->|       |
   |                        |               |       |
   |                        |<--user not found      |
   |                        |               |       |
   |                        |<--getUserById-|       |
   |                        |---user data-->|       |
   |                        |               |       |
   |                        |               |--create user-->DB
   |<------user profile---------------------|       |
   |                        |                       |
```

## Files Modified

### Backend
1. **server/src/services/UserService.ts**
   - Added email verification check in `getUserProfile()`
   - Added automatic user sync from Cognito
   - Throws `EMAIL_NOT_VERIFIED` error for unverified users

2. **server/src/controllers/UserController.ts**
   - Added error handling for `EMAIL_NOT_VERIFIED`
   - Returns 403 with `needsVerification: true` flag

### Frontend (landing-client)
3. **landing-client/src/hooks/useAuth.ts**
   - Added 403 response handling in `loginMutation`
   - Added email verification check in user profile query
   - Auto-logout on unverified email detection

### Frontend (client)
4. **client/src/hooks/useAuth.ts**
   - Added 403 response handling in `loginMutation`
   - Added email verification check in user profile query
   - Auto-logout on unverified email detection

## Testing Scenarios

### Test Case 1: New User Registration
1. User registers with email/password
2. Email verification code sent
3. User verifies email with code
4. User data synced from Cognito to database
5. User redirected to organization creation

### Test Case 2: Login with Unverified Email
1. User attempts to login without verifying email
2. Cognito returns `CONFIRM_SIGN_UP` step
3. Frontend redirects to `/verify-email`
4. User verifies email
5. Login successful after verification

### Test Case 3: Verified User Not in Database
1. User exists and verified in Cognito
2. User not in local database (edge case)
3. Backend fetches user from Cognito
4. Backend creates user in database
5. Login successful, user profile returned

### Test Case 4: Unverified User Bypasses Initial Check
1. User somehow gets past Cognito check
2. Backend profile fetch detects unverified email
3. Backend returns 403 with `needsVerification: true`
4. Frontend logs user out immediately
5. User redirected to verify page

### Test Case 5: Already Verified Email - Seamless Flow

**Scenario A: Page Load/Refresh on /verify-email**
1. User navigates to or refreshes `/verify-email` page
2. Page automatically checks verification status on mount
3. Attempts sign-in with stored credentials
4. Possible outcomes:
   - **Already signed in** (error: "There is already a signed in user"):
     - User is authenticated and verified
     - Gets current user from session
     - Syncs to database via backend
     - Clears session storage
     - Redirects to organization creation
   - **Email already verified** (no CONFIRM_SIGN_UP step):
     - Shows info message: "Email already verified. You can now login."
     - Automatically signs in user
     - Syncs user to database via backend
     - Clears session storage
     - Redirects to organization creation
   - **Not verified yet**:
     - Shows verification code input form normally

**Scenario B: User Clicks "Resend Code" for Already Verified Email**
1. User clicks "Resend code" button
2. Cognito returns error: "User cannot be confirmed. Current status is CONFIRMED"
3. Frontend shows info message: "Email already verified. You can now login."
4. **Automatic completion of verification flow**:
   - Signs in user with stored credentials
   - Calls backend to sync user to database
   - Clears session storage
   - Redirects to organization creation (normal flow)

**Error Handled**: `NotAuthorizedException` with message "User cannot be confirmed. Current status is CONFIRMED"

**User Experience**:
- ✅ Automatic verification check on page load
- ✅ No error shown - instead shows informative success message
- ✅ Clear message that email is already verified
- ✅ Seamlessly continues with normal registration flow
- ✅ User synced to database automatically
- ✅ No need to manually login - taken directly to organization creation
- ✅ Prevents confusion and provides smooth experience
- ✅ Works on page refresh/navigation and on resend button click

## Environment Variables

Required environment variables for authentication:

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_AWS_REGION=us-east-1
VITE_AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxx
VITE_AWS_COGNITO_CLIENT_ID=xxxxx
VITE_AWS_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxx
```

### Backend (.env)
```bash
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxx
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

## Troubleshooting

### Issue: User stuck on login despite verified email
**Solution**: Check if user exists in Cognito with `getUserById`. If exists and verified, check database for user record. User should be auto-synced.

### Issue: Email verification not working
**Solution**:
1. Check Cognito email configuration
2. Verify email sending is enabled in Cognito
3. Check spam folder for verification emails

### Issue: 403 errors on valid login
**Solution**:
1. Verify email is marked as verified in Cognito
2. Check backend logs for `EMAIL_NOT_VERIFIED` errors
3. Confirm user pool ID matches between frontend and backend

### Issue: "User cannot be confirmed" error when resending verification code
**This is expected behavior**: The user's email is already verified in Cognito.

**Automatic handling**:
1. Frontend detects "Current status is CONFIRMED" error
2. Shows info message: "Email already verified"
3. Automatically signs in user with stored credentials
4. Syncs user to database via backend
5. Continues with normal flow (organization creation)

**No action needed** - the system handles this gracefully and completes the registration flow.

## Best Practices

1. **Always check Cognito first**: Cognito is the source of truth for authentication
2. **Auto-sync verified users**: Don't require manual database entry for verified Cognito users
3. **Clean error handling**: Use specific error types for different scenarios
4. **Security first**: Force logout on any verification issues
5. **User experience**: Clear error messages and automatic redirects to verify page
