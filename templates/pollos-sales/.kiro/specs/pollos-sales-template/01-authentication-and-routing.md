# Authentication and Routing Requirements

## Requirement 1: User Authentication

**User Story:** As a user, I want to log in with my Cognito credentials, so that I can access the appropriate interface for my role.

### Acceptance Criteria

1. WHEN a user navigates to the System, THE System SHALL display a login form
2. WHEN a user submits valid Cognito credentials, THE System SHALL authenticate via the Cognito_Pool using AWS Amplify
3. WHEN authentication succeeds, THE System SHALL fetch the user profile from `/api/users/{userId}/profile`
4. WHEN authentication succeeds, THE System SHALL store the JWT_Token securely
5. WHEN authentication succeeds, THE System SHALL redirect to /organizations/select
6. WHEN authentication fails, THE System SHALL display an error message
7. WHEN a JWT_Token expires, THE System SHALL attempt to refresh the token automatically
8. IF token refresh fails, THE System SHALL redirect to /login
9. THE System SHALL use the same Cognito_Pool as the existing dashboard
10. THE System SHALL handle UserNotConfirmedException by redirecting to /verify-email

## Requirement 2: Organization Selection

**User Story:** As a user, I want to select my organization after login, so that I can access the correct business context.

### Acceptance Criteria

1. WHEN a user successfully authenticates, THE System SHALL redirect to /organizations/select
2. THE System SHALL fetch user organizations from `/api/users/{userId}/organizations`
3. WHEN a user has only one organization, THE System SHALL automatically select it and redirect to the appropriate interface
4. WHEN a user has multiple organizations, THE System SHALL display an organization selection screen
5. WHEN a user selects an organization, THE System SHALL store the organization ID in sessionStorage
6. WHEN a user has no organizations, THE System SHALL display an error message
7. THE System SHALL invalidate organization queries after selection to refresh context
8. WHEN an organization is selected, THE System SHALL redirect based on user role

## Requirement 3: Role-Based Routing

**User Story:** As the system, I want to enforce role-based access, so that users only access authorized interfaces.

### Acceptance Criteria

1. WHEN a Cashier (role="cajero") selects an organization, THE System SHALL redirect to /pos
2. WHEN a Manager (role="gerente") selects an organization, THE System SHALL redirect to /dashboard
3. WHEN an unauthenticated user attempts to access protected routes, THE System SHALL redirect to /login
4. THE System SHALL validate the JWT_Token on each route change
5. WHEN the JWT_Token is invalid, THE System SHALL redirect to /login
6. THE System SHALL store intended destination in sessionStorage during authentication redirects

## Requirement 41: Organization Template Validation

**User Story:** As the system, I want to validate that an organization has selected the pollos-sales template, so that only authorized organizations can access the POS system.

### Acceptance Criteria

1. WHEN a user selects an organization, THE System SHALL fetch organization details from `/api/users/{userId}/organization/{orgId}`
2. THE System SHALL verify the organization has `templateName: "pollos-sales"`
3. WHEN the organization does not have the pollos-sales template, THE System SHALL display an error message
4. WHEN the organization does not have the pollos-sales template, THE System SHALL redirect to organization selection
5. THE System SHALL cache template validation result for the session
6. THE System SHALL re-validate template on organization change
