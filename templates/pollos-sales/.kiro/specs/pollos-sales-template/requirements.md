# Requirements Document

## Introduction

The Pollos Porteños Sales React App is a complete web-based sales control system for managing food and beverage sales at Pollos Porteños stands during Puntarenas FC matches and restaurant shifts. The system provides real-time sales tracking, offline-first POS capabilities for cashiers, and comprehensive management tools for supervisors.

This application is part of a larger ecosystem that includes a Flutter mobile app for cashiers and an AWS Lambda backend. The React app serves two primary user roles: cashiers (using mobile devices) and managers (using desktop computers), with distinct interfaces optimized for each use case.

## Glossary

- **System**: The Pollos Porteños Sales React Application
- **POS**: Point of Sale interface for cashiers
- **Backend**: AWS Lambda + DynamoDB + Cognito backend services at E:\dev\cross-app-be
- **Cashier**: User with role "cajero" who operates the POS
- **Manager**: User with role "gerente" who supervises operations
- **Session**: A time-bound sales period (match or restaurant shift)
- **Stand**: A physical sales location (Puesto 1, Puesto 2, etc.)
- **Assignment**: The linking of a cashier to a specific stand for a session
- **Context**: The sales environment type (gradas, mesa, caja)
- **Closing**: The end-of-session reconciliation process
- **Sync**: The process of uploading offline sales data to the Backend
- **IndexedDB**: Browser-based local storage for offline data
- **Service_Worker**: Background process managing offline capabilities
- **Cognito_Pool**: AWS Cognito user pool for authentication
- **JWT_Token**: JSON Web Token for authenticated API requests
- **Product**: An item available for sale (food or beverage)
- **Cart**: Collection of products selected for purchase
- **Payment_Method**: Cash (Efectivo), SINPE, or Card (Tarjeta)
- **Inventory**: Stock count of products at a stand
- **Report**: Immutable record of a completed session
- **Dashboard**: Real-time view of active sales operations
- **Analytics**: Historical data analysis and reporting module

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to log in with my Cognito credentials, so that I can access the appropriate interface for my role.

#### Acceptance Criteria

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

### Requirement 2: Organization Selection

**User Story:** As a user, I want to select my organization after login, so that I can access the correct business context.

#### Acceptance Criteria

1. WHEN a user successfully authenticates, THE System SHALL redirect to /organizations/select
2. THE System SHALL fetch user organizations from `/api/users/{userId}/organizations`
3. WHEN a user has only one organization, THE System SHALL automatically select it and redirect to the appropriate interface
4. WHEN a user has multiple organizations, THE System SHALL display an organization selection screen
5. WHEN a user selects an organization, THE System SHALL store the organization ID in sessionStorage
6. WHEN a user has no organizations, THE System SHALL display an error message
7. THE System SHALL invalidate organization queries after selection to refresh context
8. WHEN an organization is selected, THE System SHALL redirect based on user role

### Requirement 3: Role-Based Routing

**User Story:** As the system, I want to enforce role-based access, so that users only access authorized interfaces.

#### Acceptance Criteria

1. WHEN a Cashier (role="cajero") selects an organization, THE System SHALL redirect to /pos
2. WHEN a Manager (role="gerente") selects an organization, THE System SHALL redirect to /dashboard
3. WHEN an unauthenticated user attempts to access protected routes, THE System SHALL redirect to /login
4. THE System SHALL validate the JWT_Token on each route change
5. WHEN the JWT_Token is invalid, THE System SHALL redirect to /login
6. THE System SHALL store intended destination in sessionStorage during authentication redirects

### Requirement 4: Cashier Assignment Download

**User Story:** As a cashier, I want to download my stand assignment when I log in, so that I can start selling at my assigned location.

#### Acceptance Criteria

1. WHEN a Cashier logs in and selects organization, THE System SHALL fetch the active Assignment from `/api/users/{userId}/organization/{orgId}/assignments/active`
2. THE Assignment SHALL include stand identifier, context, and session details
3. WHEN no active Assignment exists, THE System SHALL display an error message
4. THE System SHALL store the Assignment in IndexedDB for offline access
5. THE System SHALL display the Assignment details in the POS interface
6. THE System SHALL use authenticated requests with JWT_Token in Authorization header

### Requirement 5: Product Grid Display

**User Story:** As a cashier, I want to see available products in a grid, so that I can quickly select items for sale.

#### Acceptance Criteria

1. THE POS SHALL fetch products from `/api/users/{userId}/organization/{orgId}/products`
2. THE POS SHALL display products in a 2-column grid on mobile devices
3. WHEN a Product is out of stock, THE System SHALL display it with reduced opacity and "AGOTADO" badge
4. WHEN a Product has stock ≤ 3 and > 0, THE System SHALL display a warning badge with stock count
5. THE System SHALL display product emoji, name, and price for each Product
6. WHEN a Product is in the Cart, THE System SHALL display a badge with quantity
7. THE System SHALL support filtering by category (Todos, Comida, Bebida)
8. WHEN a category filter is selected, THE System SHALL display only products in that category
9. THE System SHALL cache products in IndexedDB for offline access

### Requirement 6: Shopping Cart Management

**User Story:** As a cashier, I want to add and remove products from a cart, so that I can build a customer's order.

#### Acceptance Criteria

1. WHEN a Cashier taps a Product, THE System SHALL add one unit to the Cart
2. WHEN a Cashier taps an out-of-stock Product, THE System SHALL not add it to the Cart
3. THE System SHALL display Cart items with quantity controls (+ and -)
4. WHEN a Cashier taps +, THE System SHALL increment the quantity
5. WHEN a Cashier taps -, THE System SHALL decrement the quantity
6. WHEN quantity reaches 0, THE System SHALL remove the item from the Cart
7. THE System SHALL calculate and display the total price
8. THE System SHALL display the total item count in the Cart button

### Requirement 7: Cash Payment Processing

**User Story:** As a cashier, I want to process cash payments with change calculation, so that I can complete cash transactions accurately.

#### Acceptance Criteria

1. WHEN a Cashier selects Efectivo payment method, THE System SHALL display a cash input field
2. THE System SHALL accept numeric input for amount received
3. WHEN received amount ≥ total, THE System SHALL calculate and display change amount
4. WHEN received amount < total, THE System SHALL display the remaining amount needed
5. WHEN received amount < total, THE System SHALL disable the confirm button
6. WHEN received amount ≥ total, THE System SHALL enable the confirm button
7. WHEN confirmed, THE System SHALL record the sale with payment method "Efectivo"

### Requirement 8: SINPE Payment Processing

**User Story:** As a cashier, I want to process SINPE mobile payments, so that I can accept digital transfers.

#### Acceptance Criteria

1. WHEN a Cashier selects SINPE payment method, THE System SHALL display the SINPE destination number
2. THE System SHALL display the total amount to be transferred
3. THE System SHALL provide instructions to request transfer from customer
4. WHEN confirmed, THE System SHALL record the sale with payment method "SINPE"

### Requirement 9: Card Payment Processing

**User Story:** As a cashier, I want to process card payments, so that I can accept credit and debit cards.

#### Acceptance Criteria

1. WHEN a Cashier selects Tarjeta payment method, THE System SHALL display card payment instructions
2. THE System SHALL display the total amount to charge
3. THE System SHALL provide instructions to use the card terminal
4. WHEN confirmed, THE System SHALL record the sale with payment method "Tarjeta"

### Requirement 10: Sale Recording

**User Story:** As a cashier, I want sales to be recorded immediately, so that inventory and revenue are tracked accurately.

#### Acceptance Criteria

1. WHEN a payment is confirmed, THE System SHALL create a sale record
2. THE sale record SHALL include timestamp, Cart items, quantities, prices, payment method, and Assignment identifier
3. THE System SHALL store the sale in IndexedDB immediately
4. THE System SHALL attempt to POST the sale to `/api/users/{userId}/organization/{orgId}/sales`
5. WHEN sync succeeds, THE System SHALL mark the sale as synced
6. WHEN sync fails, THE System SHALL queue the sale for background sync
7. THE System SHALL display a success screen with sale details
8. THE System SHALL clear the Cart after successful recording
9. THE System SHALL include JWT_Token in Authorization header for API requests

### Requirement 11: Offline Sale Storage

**User Story:** As a cashier, I want sales to be saved locally when offline, so that I can continue selling without internet connectivity.

#### Acceptance Criteria

1. THE System SHALL use Dexie.js to manage IndexedDB storage
2. THE System SHALL store all sales in IndexedDB before attempting Backend sync
3. WHEN the System is offline, THE System SHALL continue accepting sales
4. THE System SHALL display offline status indicator
5. THE System SHALL queue offline sales for background sync
6. WHEN connectivity is restored, THE Service_Worker SHALL sync queued sales
7. THE System SHALL update sync status indicators after successful sync

### Requirement 12: Background Sync

**User Story:** As a cashier, I want sales to sync automatically when connectivity returns, so that data is not lost.

#### Acceptance Criteria

1. THE System SHALL register a Service_Worker with background sync capability
2. WHEN a sale fails to sync, THE Service_Worker SHALL register a sync event
3. WHEN connectivity is restored, THE Service_Worker SHALL retry failed syncs
4. THE Service_Worker SHALL sync sales in chronological order
5. WHEN sync succeeds, THE Service_Worker SHALL update the sale record in IndexedDB
6. WHEN sync fails after retries, THE Service_Worker SHALL log the error
7. THE System SHALL display sync status (online, offline, syncing) in the POS interface

### Requirement 13: Inventory Opening

**User Story:** As a cashier, I want to count and record initial inventory, so that stock levels are accurate at session start.

#### Acceptance Criteria

1. WHEN a Session starts, THE System SHALL prompt the Cashier to count inventory
2. THE System SHALL display a list of all active products
3. THE System SHALL provide input fields for initial stock count per Product
4. WHEN counts are submitted, THE System SHALL POST to `/api/users/{userId}/organization/{orgId}/inventory/opening`
5. THE System SHALL store inventory opening record in IndexedDB
6. THE System SHALL use opening counts to track remaining stock
7. THE System SHALL sync inventory opening to the Backend with JWT_Token authentication

### Requirement 13: Stock Depletion Tracking

**User Story:** As a cashier, I want stock to decrease automatically when I sell products, so that I know when items are running low.

#### Acceptance Criteria

1. WHEN a sale is recorded, THE System SHALL decrement stock for each Product in the sale
2. WHEN stock reaches 0, THE System SHALL mark the Product as out of stock
3. WHEN stock is ≤ 3 and > 0, THE System SHALL display a low stock warning
4. THE System SHALL prevent adding out-of-stock products to the Cart
5. THE System SHALL persist stock levels in IndexedDB

### Requirement 14: Cash Register Closing Flow

**User Story:** As a cashier, I want to close my register at session end, so that I can reconcile my cash drawer.

#### Acceptance Criteria

1. WHEN a Cashier initiates closing, THE System SHALL display a 4-step stepper interface
2. Step 1 SHALL display expected amounts per payment method
3. Step 2 SHALL provide input fields for declared amounts per payment method
4. Step 3 SHALL calculate and display differences between expected and declared
5. Step 4 SHALL provide a notes field for discrepancy justification
6. WHEN differences exist, THE System SHALL require notes before submission
7. WHEN closing is submitted, THE System SHALL create a closing record
8. THE System SHALL sync the closing record to the Backend
9. THE System SHALL mark the Assignment as closed locally

### Requirement 15: Manager Dashboard Real-Time View

**User Story:** As a manager, I want to see real-time sales data from all stands, so that I can monitor operations during a match.

#### Acceptance Criteria

1. THE Dashboard SHALL display summary cards for each active Stand
2. EACH summary card SHALL display total revenue, sales count, and payment method breakdown
3. THE Dashboard SHALL display connection status for each Stand (active, slow, offline)
4. WHEN a Stand has not synced in > 5 minutes, THE System SHALL display "slow" status
5. WHEN a Stand has not synced in > 15 minutes, THE System SHALL display "offline" status
6. THE Dashboard SHALL display last sync time for each Stand
7. THE Dashboard SHALL auto-refresh data every 30 seconds
8. THE Dashboard SHALL provide a manual refresh button
9. THE Dashboard SHALL display global KPIs (total revenue, total sales, average ticket)

### Requirement 16: Product Sales Ranking

**User Story:** As a manager, I want to see which products are selling best, so that I can make inventory decisions.

#### Acceptance Criteria

1. THE Dashboard SHALL display a product ranking table
2. THE ranking SHALL show product name, units sold, and revenue
3. THE ranking SHALL be sorted by units sold in descending order
4. THE System SHALL display visual indicators for top 3 products
5. THE System SHALL display progress bars showing relative sales volume

### Requirement 17: Payment Method Breakdown

**User Story:** As a manager, I want to see payment method distribution, so that I understand customer payment preferences.

#### Acceptance Criteria

1. THE Dashboard SHALL display payment method totals (Efectivo, SINPE, Tarjeta)
2. THE System SHALL display percentage of total for each payment method
3. THE System SHALL display visual progress bars for each payment method
4. THE System SHALL calculate global payment method totals across all stands

### Requirement 18: Session Configuration

**User Story:** As a manager, I want to configure a new session, so that cashiers can start selling.

#### Acceptance Criteria

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

### Requirement 19: Product Management

**User Story:** As a manager, I want to manage products, so that I can update prices and availability.

#### Acceptance Criteria

1. THE System SHALL display a product management table
2. THE table SHALL show product name, category, price, and active status
3. THE System SHALL allow filtering by category (Todos, Comida, Bebida)
4. WHEN a Manager clicks a price, THE System SHALL display an inline edit field
5. WHEN a price is updated, THE System SHALL save the change to the Backend
6. THE System SHALL allow toggling product active/inactive status
7. THE System SHALL allow creating new products with name, emoji, category, and price
8. WHEN a session is active, THE System SHALL prevent price changes
9. THE System SHALL display a success indicator after saving changes

### Requirement 20: User Management

**User Story:** As a manager, I want to create and manage cashier accounts, so that I can control system access.

#### Acceptance Criteria

1. THE System SHALL display a user management interface
2. THE System SHALL allow creating new users with email, name, and role
3. THE System SHALL create users in the Cognito_Pool
4. THE System SHALL allow assigning users to stands
5. THE System SHALL display a list of existing users with their roles
6. THE System SHALL allow deactivating user accounts

### Requirement 21: Stand Management

**User Story:** As a manager, I want to create and configure stands, so that I can organize sales locations.

#### Acceptance Criteria

1. THE System SHALL display a stand management interface
2. THE System SHALL allow creating stands with name and branch (estadio or restaurante)
3. THE System SHALL allow editing stand details
4. THE System SHALL display available contexts per branch
5. THE System SHALL persist stand configuration to the Backend

### Requirement 22: Closing Approval

**User Story:** As a manager, I want to review and approve cashier closings, so that I can verify accuracy.

#### Acceptance Criteria

1. THE Dashboard SHALL display pending closings in a dedicated tab
2. EACH closing SHALL display expected vs declared amounts per payment method
3. THE System SHALL calculate and display differences
4. WHEN differences exist, THE System SHALL display cashier notes
5. THE System SHALL provide "Approve" and "Reject" buttons
6. WHEN approved, THE System SHALL mark the closing as approved in the Backend
7. WHEN rejected, THE System SHALL notify the Cashier
8. THE System SHALL require double confirmation for approval

### Requirement 23: Match Report Generation

**User Story:** As a manager, I want to generate a match report, so that I can document session results.

#### Acceptance Criteria

1. WHEN all closings are approved, THE System SHALL enable report generation
2. THE report SHALL include session details (date, rival/shift name, location)
3. THE report SHALL include per-stand sales breakdown
4. THE report SHALL include product sales summary
5. THE report SHALL include payment method totals
6. THE report SHALL include closing status and discrepancies
7. THE System SHALL provide PDF export functionality
8. THE System SHALL store the report immutably in the Backend
9. THE report SHALL be accessible in the history view

### Requirement 24: Report History

**User Story:** As a manager, I want to view past session reports, so that I can review historical performance.

#### Acceptance Criteria

1. THE System SHALL display a report history list
2. EACH history item SHALL show session name, date, total revenue, and closing status
3. THE System SHALL allow filtering by date range
4. WHEN a Manager clicks a history item, THE System SHALL display the full report
5. THE System SHALL provide export functionality for historical reports

### Requirement 25: Analytics - Product Performance

**User Story:** As a manager, I want to analyze product sales over time, so that I can optimize inventory.

#### Acceptance Criteria

1. THE Analytics module SHALL display product sales data
2. THE System SHALL allow filtering by date range (Hoy, Esta semana, Este mes, Temporada)
3. THE System SHALL display sortable table with product name, units sold, revenue, and sessions
4. THE System SHALL display KPI cards for total revenue, units sold, top product, and top category
5. WHEN a Manager clicks a product row, THE System SHALL display drill-down details
6. THE drill-down SHALL show breakdown by context, branch, and payment method
7. THE System SHALL display visual progress bars for relative performance

### Requirement 26: Analytics - Session Comparison

**User Story:** As a manager, I want to compare sessions, so that I can identify trends.

#### Acceptance Criteria

1. THE Analytics module SHALL display session comparison data
2. THE System SHALL display a bar chart showing revenue trends over time
3. THE System SHALL display a sortable table with session name, type, branch, date, revenue, sales count, and status
4. THE System SHALL display KPI cards for total period revenue, session count, best session, and average per session
5. THE System SHALL allow filtering by session type (partido, turno)
6. THE System SHALL allow filtering by branch (Estadio, Restaurante)

### Requirement 27: Analytics - Vendor Performance

**User Story:** As a manager, I want to analyze cashier performance, so that I can recognize top performers.

#### Acceptance Criteria

1. THE Analytics module SHALL display vendor performance data
2. THE System SHALL display a table with cashier name, role, transaction count, total revenue, average ticket, favorite payment method, and session count
3. THE System SHALL display KPI cards for active vendors, total generated, top vendor, and global average ticket
4. THE System SHALL rank vendors by total revenue
5. THE System SHALL display visual indicators for top performers

### Requirement 28: Analytics - Context and Branch Analysis

**User Story:** As a manager, I want to analyze sales by context and branch, so that I can optimize stand placement.

#### Acceptance Criteria

1. THE Analytics module SHALL display context and branch analysis
2. THE System SHALL display branch totals (Estadio, Restaurante)
3. THE System SHALL display context totals (gradas, mesa, caja)
4. THE System SHALL display KPI cards for total global, best context, highest ticket, and active branches
5. THE System SHALL display visual progress bars for relative performance
6. THE System SHALL calculate and display percentage of total for each segment

### Requirement 29: Data Export

**User Story:** As a manager, I want to export analytics data, so that I can perform external analysis.

#### Acceptance Criteria

1. THE Analytics module SHALL provide an "Export Excel" button
2. WHEN clicked, THE System SHALL generate an Excel file with current filtered data
3. THE System SHALL provide a "Export PDF" button
4. WHEN clicked, THE System SHALL generate a PDF report with current filtered data
5. THE exported data SHALL respect active filters

### Requirement 30: PWA Installation

**User Story:** As a cashier, I want to install the app on my phone, so that I can access it like a native app.

#### Acceptance Criteria

1. THE System SHALL provide a web app manifest
2. THE manifest SHALL include app name, icons, theme color, and display mode
3. THE System SHALL register a Service_Worker for offline functionality
4. WHEN installation criteria are met, THE browser SHALL prompt for installation
5. WHEN installed, THE app SHALL launch in standalone mode
6. THE app SHALL function offline after installation

### Requirement 31: Responsive Design - POS

**User Story:** As a cashier, I want the POS to work well on my phone, so that I can operate it easily.

#### Acceptance Criteria

1. THE POS SHALL use a mobile-first responsive design
2. THE POS SHALL display optimally on screens 360px - 428px wide
3. THE POS SHALL use touch-friendly controls with minimum 44px tap targets
4. THE POS SHALL use large, readable fonts (minimum 14px)
5. THE POS SHALL optimize for portrait orientation

### Requirement 32: Responsive Design - Dashboard

**User Story:** As a manager, I want the dashboard to work well on my laptop, so that I can monitor operations comfortably.

#### Acceptance Criteria

1. THE Dashboard SHALL use a desktop-first responsive design
2. THE Dashboard SHALL display optimally on screens ≥ 1280px wide
3. THE Dashboard SHALL use multi-column layouts for efficient space usage
4. THE Dashboard SHALL support landscape orientation
5. THE Dashboard SHALL degrade gracefully on smaller screens

### Requirement 33: Environment Configuration

**User Story:** As a developer, I want environment-specific configuration, so that the app works in different deployment stages.

#### Acceptance Criteria

1. THE System SHALL read configuration from environment variables
2. THE System SHALL support VITE_AWS_REGION for AWS region
3. THE System SHALL support VITE_AWS_COGNITO_USER_POOL_ID for Cognito pool
4. THE System SHALL support VITE_AWS_COGNITO_CLIENT_ID for Cognito client
5. THE System SHALL support VITE_API_URL for backend API endpoint
6. THE System SHALL support VITE_BASE_DOMAIN for application domain
7. THE System SHALL support VITE_TEMPLATE_NAME for template identifier
8. THE System SHALL support VITE_TEMPLATE_DISPLAY_NAME for display name
9. THE System SHALL support VITE_TEMPLATE_INDUSTRY for industry classification

### Requirement 34: API Integration

**User Story:** As the system, I want to communicate with the backend, so that data is persisted and shared.

#### Acceptance Criteria

1. THE System SHALL use AWS Amplify for API calls
2. THE System SHALL include JWT_Token in all authenticated requests
3. THE System SHALL handle 401 responses by redirecting to login
4. THE System SHALL handle network errors gracefully
5. THE System SHALL retry failed requests with exponential backoff
6. THE System SHALL use React Query for server state management
7. THE System SHALL cache GET requests appropriately
8. THE System SHALL invalidate cache after mutations

### Requirement 35: Error Handling

**User Story:** As a user, I want clear error messages, so that I understand what went wrong.

#### Acceptance Criteria

1. WHEN an error occurs, THE System SHALL display a user-friendly error message
2. THE System SHALL log detailed error information to the console
3. THE System SHALL distinguish between network errors, validation errors, and server errors
4. THE System SHALL provide actionable guidance in error messages
5. THE System SHALL use toast notifications for non-blocking errors
6. THE System SHALL use modal dialogs for blocking errors

### Requirement 36: Loading States

**User Story:** As a user, I want to see loading indicators, so that I know the system is working.

#### Acceptance Criteria

1. WHEN data is loading, THE System SHALL display a loading indicator
2. THE System SHALL use skeleton screens for initial page loads
3. THE System SHALL use spinners for button actions
4. THE System SHALL disable interactive elements during loading
5. THE System SHALL provide loading feedback within 100ms of user action

### Requirement 37: Form Validation

**User Story:** As a user, I want form validation, so that I submit correct data.

#### Acceptance Criteria

1. THE System SHALL use Zod schemas for form validation
2. THE System SHALL validate forms on submit
3. THE System SHALL display field-level error messages
4. THE System SHALL prevent submission of invalid forms
5. THE System SHALL highlight invalid fields visually
6. THE System SHALL validate required fields, data types, and format constraints

### Requirement 38: Accessibility

**User Story:** As a user with disabilities, I want the app to be accessible, so that I can use it effectively.

#### Acceptance Criteria

1. THE System SHALL use semantic HTML elements
2. THE System SHALL provide alt text for images
3. THE System SHALL support keyboard navigation
4. THE System SHALL maintain focus management
5. THE System SHALL use ARIA labels where appropriate
6. THE System SHALL maintain color contrast ratios ≥ 4.5:1
7. THE System SHALL support screen readers

### Requirement 39: Performance

**User Story:** As a user, I want the app to be fast, so that I can work efficiently.

#### Acceptance Criteria

1. THE System SHALL achieve First Contentful Paint < 1.5s
2. THE System SHALL achieve Time to Interactive < 3s
3. THE System SHALL use code splitting for route-based chunks
4. THE System SHALL lazy load non-critical components
5. THE System SHALL optimize images and assets
6. THE System SHALL minimize bundle size
7. THE System SHALL use production builds for deployment

### Requirement 40: Security

**User Story:** As a user, I want my data to be secure, so that unauthorized access is prevented.

#### Acceptance Criteria

1. THE System SHALL store JWT_Token in httpOnly cookies or secure storage
2. THE System SHALL not expose sensitive data in URLs
3. THE System SHALL sanitize user inputs
4. THE System SHALL use HTTPS for all communications
5. THE System SHALL implement CORS policies
6. THE System SHALL validate JWT_Token signatures
7. THE System SHALL implement rate limiting on sensitive operations

### Requirement 41: Organization Template Validation

**User Story:** As the system, I want to validate that an organization has selected the pollos-sales template, so that only authorized organizations can access the POS system.

#### Acceptance Criteria

1. WHEN a user selects an organization, THE System SHALL fetch organization details from `/api/users/{userId}/organization/{orgId}`
2. THE System SHALL verify the organization has `templateName: "pollos-sales"`
3. WHEN the organization does not have the pollos-sales template, THE System SHALL display an error message
4. WHEN the organization does not have the pollos-sales template, THE System SHALL redirect to organization selection
5. THE System SHALL cache template validation result for the session
6. THE System SHALL re-validate template on organization change

### Requirement 42: Organization Role Management

**User Story:** As a manager, I want to manage user roles within my organization, so that I can control access levels.

#### Acceptance Criteria

1. THE Dashboard SHALL display a roles management page at /admin/roles
2. THE System SHALL fetch roles from `/api/users/{userId}/organization/{orgId}/roles`
3. THE System SHALL support creating custom roles with name and permissions
4. THE System SHALL provide default roles: "gerente" (manager), "cajero" (cashier), "supervisor"
5. THE System SHALL allow assigning permissions to roles (view_sales, create_sales, manage_products, manage_users, view_reports, manage_sessions)
6. THE System SHALL allow editing role names and permissions
7. THE System SHALL prevent deletion of roles that are assigned to users
8. THE System SHALL display role assignment count per role

### Requirement 43: User Invitation System

**User Story:** As a manager, I want to invite users to my organization, so that I can add team members.

#### Acceptance Criteria

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

### Requirement 44: Organization Member Management

**User Story:** As a manager, I want to manage organization members, so that I can control team access.

#### Acceptance Criteria

1. THE Dashboard SHALL display organization members at /admin/team
2. THE System SHALL fetch members from `/api/users/{userId}/organization/{orgId}/members`
3. THE System SHALL display member name, email, role, and status
4. THE System SHALL allow changing member roles via PATCH `/api/users/{userId}/organization/{orgId}/members/{memberId}/role`
5. THE System SHALL allow deactivating members via PATCH `/api/users/{userId}/organization/{orgId}/members/{memberId}/status`
6. THE System SHALL prevent removing the organization owner
7. THE System SHALL display member activity (last login, last sale)

### Requirement 45: Branch Management

**User Story:** As a manager, I want to manage branches, so that I can organize multiple sales locations.

#### Acceptance Criteria

1. THE Dashboard SHALL display branch management at /admin/branches
2. THE System SHALL fetch branches from `/api/users/{userId}/organization/{orgId}/branches`
3. THE System SHALL allow creating branches with name, address, phone, and status
4. THE System SHALL allow editing branch details via PATCH `/api/users/{userId}/organization/{orgId}/branches/{branchId}`
5. THE System SHALL allow activating/deactivating branches
6. THE System SHALL display branch statistics (total sales, active terminals, active sessions)
7. THE System SHALL prevent deleting branches with active sessions
8. THE System SHALL support branch-level reporting

### Requirement 46: Terminal Management

**User Story:** As a manager, I want to manage terminals (POS devices), so that I can control which devices can process sales.

#### Acceptance Criteria

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

### Requirement 47: Terminal Registration

**User Story:** As a cashier, I want to register my device as a terminal, so that I can process sales.

#### Acceptance Criteria

1. WHEN a Cashier first accesses the POS, THE System SHALL check for terminal registration
2. WHEN no terminal is registered, THE System SHALL display a registration screen
3. THE System SHALL allow entering a terminal code provided by the manager
4. THE System SHALL validate the terminal code via POST `/api/users/{userId}/organization/{orgId}/terminals/register`
5. WHEN validation succeeds, THE System SHALL store terminal ID in local storage
6. WHEN validation fails, THE System SHALL display an error message
7. THE System SHALL associate all sales with the registered terminal
8. THE System SHALL allow re-registering a terminal if needed

### Requirement 48: Branch-Scoped Sessions

**User Story:** As a manager, I want sessions to be scoped to branches, so that I can manage multiple locations independently.

#### Acceptance Criteria

1. WHEN creating a session, THE System SHALL require branch selection
2. THE System SHALL fetch active sessions per branch from `/api/users/{userId}/organization/{orgId}/branches/{branchId}/sessions`
3. THE System SHALL allow multiple concurrent sessions across different branches
4. THE System SHALL prevent multiple active sessions in the same branch
5. THE System SHALL display branch name in session details
6. THE System SHALL filter reports by branch

### Requirement 49: Template Seed Data

**User Story:** As a developer, I want the pollos-sales template to appear in organization creation, so that users can select it.

#### Acceptance Criteria

1. THE template seed SHALL include pollos-sales template definition
2. THE template definition SHALL include name: "pollos-sales"
3. THE template definition SHALL include displayName: "Pollos Porteños Sales"
4. THE template definition SHALL include description: "Complete POS system for food and beverage sales with offline support"
5. THE template definition SHALL include category: "pos"
6. THE template definition SHALL include thumbnailUrl
7. THE template definition SHALL include isActive: true
8. THE template definition SHALL include sortOrder
9. THE template SHALL appear in organization creation template selection

### Requirement 50: Landing Page (Optional)

**User Story:** As a potential user, I want to see a landing page for the POS system, so that I can learn about features before signing up.

#### Acceptance Criteria

1. THE System MAY provide a public landing page at the root URL
2. IF landing page exists, THE landing page SHALL display system features
3. IF landing page exists, THE landing page SHALL display pricing information
4. IF landing page exists, THE landing page SHALL provide a "Get Started" button linking to registration
5. IF landing page exists, THE landing page SHALL provide a "Login" button linking to authentication
6. IF landing page exists, THE landing page SHALL be accessible without authentication
7. IF no landing page exists, THE root URL SHALL redirect to /login
