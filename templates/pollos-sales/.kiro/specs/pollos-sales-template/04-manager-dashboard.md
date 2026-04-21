# Manager Dashboard Requirements

## Requirement 16: Manager Dashboard Real-Time View

**User Story:** As a manager, I want to see real-time sales data from all stands, so that I can monitor operations during a match.

### Acceptance Criteria

1. THE Dashboard SHALL display summary cards for each active Stand
2. EACH summary card SHALL display total revenue, sales count, and payment method breakdown
3. THE Dashboard SHALL display connection status for each Stand (active, slow, offline)
4. WHEN a Stand has not synced in > 5 minutes, THE System SHALL display "slow" status
5. WHEN a Stand has not synced in > 15 minutes, THE System SHALL display "offline" status
6. THE Dashboard SHALL display last sync time for each Stand
7. THE Dashboard SHALL auto-refresh data every 30 seconds
8. THE Dashboard SHALL provide a manual refresh button
9. THE Dashboard SHALL display global KPIs (total revenue, total sales, average ticket)

## Requirement 17: Product Sales Ranking

**User Story:** As a manager, I want to see which products are selling best, so that I can make inventory decisions.

### Acceptance Criteria

1. THE Dashboard SHALL display a product ranking table
2. THE ranking SHALL show product name, units sold, and revenue
3. THE ranking SHALL be sorted by units sold in descending order
4. THE System SHALL display visual indicators for top 3 products
5. THE System SHALL display progress bars showing relative sales volume

## Requirement 18: Payment Method Breakdown

**User Story:** As a manager, I want to see payment method distribution, so that I understand customer payment preferences.

### Acceptance Criteria

1. THE Dashboard SHALL display payment method totals (Efectivo, SINPE, Tarjeta)
2. THE System SHALL display percentage of total for each payment method
3. THE System SHALL display visual progress bars for each payment method
4. THE System SHALL calculate global payment method totals across all stands

## Requirement 22: Closing Approval

**User Story:** As a manager, I want to review and approve cashier closings, so that I can verify accuracy.

### Acceptance Criteria

1. THE Dashboard SHALL display pending closings in a dedicated tab
2. EACH closing SHALL display expected vs declared amounts per payment method
3. THE System SHALL calculate and display differences
4. WHEN differences exist, THE System SHALL display cashier notes
5. THE System SHALL provide "Approve" and "Reject" buttons
6. WHEN approved, THE System SHALL mark the closing as approved in the Backend
7. WHEN rejected, THE System SHALL notify the Cashier
8. THE System SHALL require double confirmation for approval
