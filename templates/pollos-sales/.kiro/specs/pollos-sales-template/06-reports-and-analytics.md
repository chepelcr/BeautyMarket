# Reports and Analytics Requirements

## Requirement 23: Match Report Generation

**User Story:** As a manager, I want to generate a match report, so that I can document session results.

### Acceptance Criteria

1. WHEN all closings are approved, THE System SHALL enable report generation
2. THE report SHALL include session details (date, rival/shift name, location)
3. THE report SHALL include per-stand sales breakdown
4. THE report SHALL include product sales summary
5. THE report SHALL include payment method totals
6. THE report SHALL include closing status and discrepancies
7. THE System SHALL provide PDF export functionality
8. THE System SHALL store the report immutably in the Backend
9. THE report SHALL be accessible in the history view

## Requirement 24: Report History

**User Story:** As a manager, I want to view past session reports, so that I can review historical performance.

### Acceptance Criteria

1. THE System SHALL display a report history list
2. EACH history item SHALL show session name, date, total revenue, and closing status
3. THE System SHALL allow filtering by date range
4. WHEN a Manager clicks a history item, THE System SHALL display the full report
5. THE System SHALL provide export functionality for historical reports

## Requirement 25: Analytics - Product Performance

**User Story:** As a manager, I want to analyze product sales over time, so that I can optimize inventory.

### Acceptance Criteria

1. THE Analytics module SHALL display product sales data
2. THE System SHALL allow filtering by date range (Hoy, Esta semana, Este mes, Temporada)
3. THE System SHALL display sortable table with product name, units sold, revenue, and sessions
4. THE System SHALL display KPI cards for total revenue, units sold, top product, and top category
5. WHEN a Manager clicks a product row, THE System SHALL display drill-down details
6. THE drill-down SHALL show breakdown by context, branch, and payment method
7. THE System SHALL display visual progress bars for relative performance

## Requirement 26: Analytics - Session Comparison

**User Story:** As a manager, I want to compare sessions, so that I can identify trends.

### Acceptance Criteria

1. THE Analytics module SHALL display session comparison data
2. THE System SHALL display a bar chart showing revenue trends over time
3. THE System SHALL display a sortable table with session name, type, branch, date, revenue, sales count, and status
4. THE System SHALL display KPI cards for total period revenue, session count, best session, and average per session
5. THE System SHALL allow filtering by session type (partido, turno)
6. THE System SHALL allow filtering by branch (Estadio, Restaurante)

## Requirement 27: Analytics - Vendor Performance

**User Story:** As a manager, I want to analyze cashier performance, so that I can recognize top performers.

### Acceptance Criteria

1. THE Analytics module SHALL display vendor performance data
2. THE System SHALL display a table with cashier name, role, transaction count, total revenue, average ticket, favorite payment method, and session count
3. THE System SHALL display KPI cards for active vendors, total generated, top vendor, and global average ticket
4. THE System SHALL rank vendors by total revenue
5. THE System SHALL display visual indicators for top performers

## Requirement 28: Analytics - Context and Branch Analysis

**User Story:** As a manager, I want to analyze sales by context and branch, so that I can optimize stand placement.

### Acceptance Criteria

1. THE Analytics module SHALL display context and branch analysis
2. THE System SHALL display branch totals (Estadio, Restaurante)
3. THE System SHALL display context totals (gradas, mesa, caja)
4. THE System SHALL display KPI cards for total global, best context, highest ticket, and active branches
5. THE System SHALL display visual progress bars for relative performance
6. THE System SHALL calculate and display percentage of total for each segment

## Requirement 29: Data Export

**User Story:** As a manager, I want to export analytics data, so that I can perform external analysis.

### Acceptance Criteria

1. THE Analytics module SHALL provide an "Export Excel" button
2. WHEN clicked, THE System SHALL generate an Excel file with current filtered data
3. THE System SHALL provide a "Export PDF" button
4. WHEN clicked, THE System SHALL generate a PDF report with current filtered data
5. THE exported data SHALL respect active filters
