# Requirements Document

## Introduction

This document specifies the requirements for implementing missing backend services in the Pollos Porteños Sales system. The system requires backend endpoints for branches, terminals, sessions, assignments, closings, and real-time dashboard data. Additionally, existing branches/terminals functionality from the legacy biller-apps service must be migrated to cross-app-be with PostgreSQL.

## Glossary

- **System**: The Pollos Porteños Sales backend services (cross-app-be)
- **Markets_API**: The user authentication and organization management service (BeautyMarket/server)
- **Orders_API**: The products and orders management service (cross-app-be)
- **Frontend**: The Pollos Sales web application (BeautyMarket/templates/pollos-sales)
- **Branch**: A physical sales location (stand or restaurant)
- **Terminal**: A point-of-sale device registered to a branch
- **Session**: A time-bounded sales period (match or shift)
- **Assignment**: A link between a cashier, branch, and session
- **Closing**: End-of-session cash register reconciliation
- **Manager**: A user with administrative privileges for an organization
- **Cashier**: A user assigned to operate a terminal during a session
- **Organization**: A business entity that owns branches and manages sales
- **Active_Session**: A session where is_active is true and end_time is null
- **Active_Assignment**: An assignment where is_active is true and end_time is null

## Requirements

### Requirement 1: Branch Management

**User Story:** As a manager, I want to create and manage branches for my organization, so that I can organize sales locations and assign cashiers.

#### Acceptance Criteria

1. WHEN a manager creates a branch THEN THE System SHALL store the branch with organization_id, name, code, type, and created_by
2. WHEN a manager requests branches for their organization THEN THE System SHALL return all branches belonging to that organization
3. WHEN a manager updates a branch THEN THE System SHALL modify the branch and update the updated_at timestamp
4. WHEN a manager attempts to delete a branch with active terminals THEN THE System SHALL prevent deletion and return an error
5. WHEN a manager attempts to delete a branch with active sessions THEN THE System SHALL prevent deletion and return an error
6. THE System SHALL enforce unique branch codes within each organization
7. THE System SHALL validate branch type as either 'stand' or 'restaurant'

### Requirement 2: Terminal Management

**User Story:** As a manager, I want to register and manage terminals for my branches, so that I can track which devices are used for sales.

#### Acceptance Criteria

1. WHEN a manager registers a terminal THEN THE System SHALL store the terminal with branch_id, name, code, and device_id
2. WHEN a manager requests terminals for their organization THEN THE System SHALL return all terminals with optional branch_id filtering
3. WHEN a manager updates a terminal THEN THE System SHALL modify the terminal and update the updated_at timestamp
4. WHEN a manager attempts to delete a terminal with active assignments THEN THE System SHALL prevent deletion and return an error
5. THE System SHALL enforce unique terminal codes within each organization
6. THE System SHALL enforce unique device_id across all organizations
7. WHEN a terminal is registered THEN THE System SHALL validate that the branch_id exists and belongs to the organization

### Requirement 3: Session Management

**User Story:** As a manager, I want to create and manage sales sessions, so that I can track sales during specific time periods like matches or shifts.

#### Acceptance Criteria

1. WHEN a manager creates a session THEN THE System SHALL store the session with name, type, context, start_time, and created_by
2. WHEN a manager requests sessions for their organization THEN THE System SHALL return sessions with optional filtering by is_active, branch_id, and type
3. WHEN a manager ends a session THEN THE System SHALL set end_time, set is_active to false, and optionally record actual_revenue
4. THE System SHALL validate session type as either 'match' or 'shift'
5. THE System SHALL validate session context as 'gradas', 'mesa', or 'caja'
6. WHEN a session is created with a branch_id THEN THE System SHALL validate that the branch exists and belongs to the organization

### Requirement 4: Cashier Assignment Management

**User Story:** As a manager, I want to assign cashiers to branches and sessions, so that I can track who is responsible for sales at each location.

#### Acceptance Criteria

1. WHEN a manager creates an assignment THEN THE System SHALL store the assignment with session_id, user_id, branch_id, terminal_id, role, and start_time
2. WHEN a manager requests assignments THEN THE System SHALL return assignments with optional filtering by session_id, branch_id, and is_active
3. WHEN creating an assignment THEN THE System SHALL validate that the user exists and is a member of the organization
4. WHEN creating an assignment THEN THE System SHALL validate that the branch exists and belongs to the organization
5. WHEN creating an assignment THEN THE System SHALL validate that the session exists and is active
6. WHEN creating an assignment THEN THE System SHALL prevent the user from having multiple active assignments
7. THE System SHALL validate assignment role as either 'cashier' or 'supervisor'

### Requirement 5: Cash Register Closing Management

**User Story:** As a cashier, I want to submit my end-of-session cash register closing, so that I can reconcile my declared amounts with the system's expected amounts.

#### Acceptance Criteria

1. WHEN a cashier submits a closing THEN THE System SHALL calculate expected amounts from orders associated with the assignment
2. WHEN a cashier submits a closing THEN THE System SHALL calculate differences between declared and expected amounts for each payment method
3. WHEN a cashier submits a closing THEN THE System SHALL create a closing record with status 'pending'
4. WHEN a manager requests closings THEN THE System SHALL return closings with optional filtering by session_id, status, and branch_id
5. WHEN a manager approves a closing THEN THE System SHALL update status to 'approved', set reviewed_by, and set reviewed_at
6. WHEN a manager rejects a closing THEN THE System SHALL update status to 'rejected', set reviewed_by, and set reviewed_at
7. THE System SHALL enforce that only managers can approve or reject closings
8. THE System SHALL enforce one closing per assignment

### Requirement 6: Real-Time Dashboard Data

**User Story:** As a manager, I want to view real-time sales data across all active stands, so that I can monitor performance during matches or shifts.

#### Acceptance Criteria

1. WHEN a manager requests dashboard data THEN THE System SHALL return data for all active sessions in the organization
2. WHEN a manager requests dashboard data with a session_id filter THEN THE System SHALL return data only for that specific session
3. FOR ALL active assignments in the session THEN THE System SHALL aggregate sales count, total revenue, and payment method breakdown
4. FOR ALL active assignments in the session THEN THE System SHALL include branch name, cashier name, and context
5. FOR ALL active assignments in the session THEN THE System SHALL include the last_sync_at timestamp from the most recent order
6. WHEN calculating product ranking THEN THE System SHALL aggregate units sold and revenue for each product across all orders in the session
7. WHEN calculating global KPIs THEN THE System SHALL compute total_revenue, total_sales, and avg_ticket across all assignments

### Requirement 7: Data Migration from biller-apps

**User Story:** As a system administrator, I want to migrate branches and terminals functionality from biller-apps to cross-app-be, so that all sales-related services are consolidated.

#### Acceptance Criteria

1. WHEN migrating data models THEN THE System SHALL use PostgreSQL instead of DynamoDB
2. WHEN migrating data models THEN THE System SHALL use snake_case field naming convention
3. WHEN migrating API endpoints THEN THE System SHALL adapt routes to match the pattern `/api/users/{userId}/organization/{orgId}/...`
4. WHEN migrating functionality THEN THE System SHALL maintain backward compatibility if biller-apps still requires access
5. THE System SHALL preserve all existing branch and terminal data during migration

### Requirement 8: Authorization and Security

**User Story:** As a system administrator, I want all endpoints to enforce organization-scoped authorization, so that users can only access data for organizations they belong to.

#### Acceptance Criteria

1. WHEN a user requests data THEN THE System SHALL verify the user is a member of the specified organization
2. WHEN a user attempts to create or modify data THEN THE System SHALL verify the user has appropriate permissions for the organization
3. WHEN a manager-only operation is requested THEN THE System SHALL verify the user has manager role for the organization
4. THE System SHALL return 403 Forbidden when authorization checks fail

### Requirement 9: Database Schema and Constraints

**User Story:** As a developer, I want a well-designed PostgreSQL schema with proper constraints, so that data integrity is maintained.

#### Acceptance Criteria

1. THE System SHALL enforce foreign key constraints for all relationships (organization_id, branch_id, session_id, user_id, etc.)
2. THE System SHALL enforce unique constraints for branch codes and terminal codes within organizations
3. THE System SHALL enforce unique constraint for device_id across all terminals
4. THE System SHALL enforce check constraints for enumerated types (branch type, session type, session context, assignment role, closing status)
5. THE System SHALL use generated columns for calculated fields (closing differences)
6. THE System SHALL use partial unique indexes to enforce single active assignment per user
7. THE System SHALL create indexes for common query patterns (organization lookups, active status filters, time-based queries)
8. THE System SHALL use triggers to automatically update updated_at timestamps

### Requirement 10: API Response Format and Error Handling

**User Story:** As a frontend developer, I want consistent API response formats and error handling, so that I can reliably integrate with backend services.

#### Acceptance Criteria

1. WHEN an API request succeeds THEN THE System SHALL return the requested data with appropriate HTTP status code (200, 201)
2. WHEN an API request fails validation THEN THE System SHALL return a 400 Bad Request with descriptive error messages
3. WHEN an API request fails authorization THEN THE System SHALL return a 403 Forbidden with an error message
4. WHEN a requested resource is not found THEN THE System SHALL return a 404 Not Found with an error message
5. WHEN an API request causes a server error THEN THE System SHALL return a 500 Internal Server Error and log the error details
6. THE System SHALL use snake_case for all field names in request and response bodies
7. THE System SHALL include timestamps in ISO 8601 format with timezone information

### Requirement 11: Query Performance and Optimization

**User Story:** As a system operator, I want efficient database queries, so that the dashboard loads quickly even with large amounts of sales data.

#### Acceptance Criteria

1. WHEN aggregating dashboard data THEN THE System SHALL use indexed columns for filtering and joining
2. WHEN querying active sessions or assignments THEN THE System SHALL use indexes on is_active flags
3. WHEN querying by organization THEN THE System SHALL use indexes on organization_id
4. WHEN querying sessions by time THEN THE System SHALL use indexes on start_time
5. WHEN calculating product rankings THEN THE System SHALL limit results to top 10 products

### Requirement 12: Integration with Existing Services

**User Story:** As a system architect, I want the new backend services to integrate seamlessly with existing Markets API and Orders API, so that the system functions as a cohesive whole.

#### Acceptance Criteria

1. WHEN creating assignments THEN THE System SHALL validate user_id against Markets_API user records
2. WHEN creating assignments THEN THE System SHALL validate organization membership against Markets_API
3. WHEN calculating expected closing amounts THEN THE System SHALL query orders from Orders_API
4. WHEN calculating product rankings THEN THE System SHALL join with product data from Orders_API
5. THE System SHALL use consistent organization_id format across all services
