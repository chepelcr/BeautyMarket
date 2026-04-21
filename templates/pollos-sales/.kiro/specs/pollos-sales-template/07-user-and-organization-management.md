# User and Organization Management Requirements

## Requirement 21: User Management

**User Story:** As a manager, I want to create and manage cashier accounts, so that I can control system access.

### Acceptance Criteria

1. THE System SHALL display a user management interface
2. THE System SHALL allow creating new users with email, name, and role
3. THE System SHALL create users in the Cognito_Pool
4. THE System SHALL allow assigning users to stands
5. THE System SHALL display a list of existing users with their roles
6. THE System SHALL allow deactivating user accounts

## Requirement 42: Organization Role Management

**User Story:** As a manager, I want to manage user roles within my organization, so that I can control access levels.

### Acceptance Criteria

1. THE Dashboard SHALL display a roles management page at /admin/roles
2. THE System SHALL fetch roles from `/api/users/{userId}/organization/{orgId}/roles`
3. THE System SHALL support creating custom roles with name and permissions
4. THE System SHALL provide default roles: "gerente" (manager), "cajero" (cashier), "supervisor"
5. THE System SHALL allow assigning permissions to roles (view_sales, create_sales, manage_products, manage_users, view_reports, manage_sessions)
6. THE System SHALL allow editing role names and permissions
7. THE System SHALL prevent deletion of roles that are assigned to users
8. THE System SHALL display role assignment count per role

## Requirement 43: User Invitation System

**User Story:** As a manager, I want to invite users to my organization, so that I can add team members.

### Acceptance Criteria

1. THE Dashboard SHALL display a user invitation interface at /admin/team
2. THE System SHALL allow sending invitations via POST to `/api/users/{userId}/organization/{orgId}/invitations`
3. THE invitation SHALL include email, role, and optional message
4. THE System SHALL send invitation email via Cognito
5. THE invited user SHALL receive an email with invitation link
6. THE invitation link SHALL include organization ID and invitation token
7. WHEN an invited user clicks the link, THE System SHALL redirect to /join?token={token}&orgId={orgId}
8. THE System SHALL validate invitation token before allowing acceptance
9. WHEN invitation is accepted, THE System SHALL add user to organization with specified role
10. THE System SHALL display pending invitations with status (pending, accepted, expired)
11. THE System SHALL allow canceling pending invitations

## Requirement 44: Organization Member Management

**User Story:** As a manager, I want to manage organization members, so that I can control team access.

### Acceptance Criteria

1. THE Dashboard SHALL display organization members at /admin/team
2. THE System SHALL fetch members from `/api/users/{userId}/organization/{orgId}/members`
3. THE System SHALL display member name, email, role, and status
4. THE System SHALL allow changing member roles via PATCH `/api/users/{userId}/organization/{orgId}/members/{memberId}/role`
5. THE System SHALL allow deactivating members via PATCH `/api/users/{userId}/organization/{orgId}/members/{memberId}/status`
6. THE System SHALL prevent removing the organization owner
7. THE System SHALL display member activity (last login, last sale)

## Requirement 45: Branch Management

**User Story:** As a manager, I want to manage branches, so that I can organize multiple sales locations.

### Acceptance Criteria

1. THE Dashboard SHALL display branch management at /admin/branches
2. THE System SHALL fetch branches from `/api/users/{userId}/organization/{orgId}/branches`
3. THE System SHALL allow creating branches with name, address, phone, and status
4. THE System SHALL allow editing branch details via PATCH `/api/users/{userId}/organization/{orgId}/branches/{branchId}`
5. THE System SHALL allow activating/deactivating branches
6. THE System SHALL display branch statistics (total sales, active terminals, active sessions)
7. THE System SHALL prevent deleting branches with active sessions
8. THE System SHALL support branch-level reporting

## Requirement 46: Terminal Management

**User Story:** As a manager, I want to manage terminals (POS devices), so that I can control which devices can process sales.

### Acceptance Criteria

1. THE Dashboard SHALL display terminal management at /admin/terminals
2. THE System SHALL fetch terminals from `/api/users/{userId}/organization/{orgId}/terminals`
3. THE System SHALL allow creating terminals with name, branch assignment, and device identifier
4. THE System SHALL allow editing terminal details via PATCH `/api/users/{userId}/organization/{orgId}/terminals/{terminalId}`
5. THE System SHALL allow activating/deactivating terminals
6. THE System SHALL display terminal status (online, offline, last activity)
7. THE System SHALL allow assigning terminals to branches
8. THE System SHALL allow assigning cashiers to terminals
9. THE System SHALL prevent deleting terminals with active sessions
10. THE System SHALL generate unique device identifiers for terminal registration

## Requirement 47: Terminal Registration

**User Story:** As a cashier, I want to register my device as a terminal, so that I can process sales.

### Acceptance Criteria

1. WHEN a Cashier first accesses the POS, THE System SHALL check for terminal registration
2. WHEN no terminal is registered, THE System SHALL display a registration screen
3. THE System SHALL allow entering a terminal code provided by the manager
4. THE System SHALL validate the terminal code via POST `/api/users/{userId}/organization/{orgId}/terminals/register`
5. WHEN validation succeeds, THE System SHALL store terminal ID in local storage
6. WHEN validation fails, THE System SHALL display an error message
7. THE System SHALL associate all sales with the registered terminal
8. THE System SHALL allow re-registering a terminal if needed
