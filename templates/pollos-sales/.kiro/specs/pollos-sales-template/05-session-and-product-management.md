# Session and Product Management Requirements

## Requirement 19: Session Configuration

**User Story:** As a manager, I want to configure a new session, so that cashiers can start selling.

### Acceptance Criteria

1. THE System SHALL provide a 4-step session configuration wizard
2. Step 1 SHALL allow selection of session type (partido or turno)
3. IF session type is "partido", THE System SHALL require rival name, date, and start time
4. IF session type is "turno", THE System SHALL require shift name, date, start time, and end time
5. Step 2 SHALL display available stands and allow activation selection
6. Step 3 SHALL allow assignment of a Cashier and Context to each active Stand
7. Step 4 SHALL display a confirmation summary
8. WHEN configuration is confirmed, THE System SHALL create session and assignment records
9. THE System SHALL sync session configuration to the Backend
10. THE System SHALL make assignments available for cashier download

## Requirement 20: Product Management

**User Story:** As a manager, I want to manage products, so that I can update prices and availability.

### Acceptance Criteria

1. THE System SHALL display a product management table
2. THE table SHALL show product name, category, price, and active status
3. THE System SHALL allow filtering by category (Todos, Comida, Bebida)
4. WHEN a Manager clicks a price, THE System SHALL display an inline edit field
5. WHEN a price is updated, THE System SHALL save the change to the Backend
6. THE System SHALL allow toggling product active/inactive status
7. THE System SHALL allow creating new products with name, emoji, category, and price
8. WHEN a session is active, THE System SHALL prevent price changes
9. THE System SHALL display a success indicator after saving changes

## Requirement 48: Branch-Scoped Sessions

**User Story:** As a manager, I want sessions to be scoped to branches, so that I can manage multiple locations independently.

### Acceptance Criteria

1. WHEN creating a session, THE System SHALL require branch selection
2. THE System SHALL fetch active sessions per branch from `/api/users/{userId}/organization/{orgId}/branches/{branchId}/sessions`
3. THE System SHALL allow multiple concurrent sessions across different branches
4. THE System SHALL prevent multiple active sessions in the same branch
5. THE System SHALL display branch name in session details
6. THE System SHALL filter reports by branch
