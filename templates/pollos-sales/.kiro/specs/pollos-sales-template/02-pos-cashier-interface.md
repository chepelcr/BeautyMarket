# POS Cashier Interface Requirements

## Requirement 4: Cashier Assignment Download

**User Story:** As a cashier, I want to download my stand assignment when I log in, so that I can start selling at my assigned location.

### Acceptance Criteria

1. WHEN a Cashier logs in and selects organization, THE System SHALL fetch the active Assignment from `/api/users/{userId}/organization/{orgId}/assignments/active`
2. THE Assignment SHALL include stand identifier, context, and session details
3. WHEN no active Assignment exists, THE System SHALL display an error message
4. THE System SHALL store the Assignment in IndexedDB for offline access
5. THE System SHALL display the Assignment details in the POS interface
6. THE System SHALL use authenticated requests with JWT_Token in Authorization header

## Requirement 5: Product Grid Display

**User Story:** As a cashier, I want to see available products in a grid, so that I can quickly select items for sale.

### Acceptance Criteria

1. THE POS SHALL fetch products from `/api/users/{userId}/organization/{orgId}/products`
2. THE POS SHALL display products in a 2-column grid on mobile devices
3. WHEN a Product is out of stock, THE System SHALL display it with reduced opacity and "AGOTADO" badge
4. WHEN a Product has stock ≤ 3 and > 0, THE System SHALL display a warning badge with stock count
5. THE System SHALL display product emoji, name, and price for each Product
6. WHEN a Product is in the Cart, THE System SHALL display a badge with quantity
7. THE System SHALL support filtering by category (Todos, Comida, Bebida)
8. WHEN a category filter is selected, THE System SHALL display only products in that category
9. THE System SHALL cache products in IndexedDB for offline access

## Requirement 6: Shopping Cart Management

**User Story:** As a cashier, I want to add and remove products from a cart, so that I can build a customer's order.

### Acceptance Criteria

1. WHEN a Cashier taps a Product, THE System SHALL add one unit to the Cart
2. WHEN a Cashier taps an out-of-stock Product, THE System SHALL not add it to the Cart
3. THE System SHALL display Cart items with quantity controls (+ and -)
4. WHEN a Cashier taps +, THE System SHALL increment the quantity
5. WHEN a Cashier taps -, THE System SHALL decrement the quantity
6. WHEN quantity reaches 0, THE System SHALL remove the item from the Cart
7. THE System SHALL calculate and display the total price
8. THE System SHALL display the total item count in the Cart button

## Requirement 7: Cash Payment Processing

**User Story:** As a cashier, I want to process cash payments with change calculation, so that I can complete cash transactions accurately.

### Acceptance Criteria

1. WHEN a Cashier selects Efectivo payment method, THE System SHALL display a cash input field
2. THE System SHALL accept numeric input for amount received
3. WHEN received amount ≥ total, THE System SHALL calculate and display change amount
4. WHEN received amount < total, THE System SHALL display the remaining amount needed
5. WHEN received amount < total, THE System SHALL disable the confirm button
6. WHEN received amount ≥ total, THE System SHALL enable the confirm button
7. WHEN confirmed, THE System SHALL record the sale with payment method "Efectivo"

## Requirement 8: SINPE Payment Processing

**User Story:** As a cashier, I want to process SINPE mobile payments, so that I can accept digital transfers.

### Acceptance Criteria

1. WHEN a Cashier selects SINPE payment method, THE System SHALL display the SINPE destination number
2. THE System SHALL display the total amount to be transferred
3. THE System SHALL provide instructions to request transfer from customer
4. WHEN confirmed, THE System SHALL record the sale with payment method "SINPE"

## Requirement 9: Card Payment Processing

**User Story:** As a cashier, I want to process card payments, so that I can accept credit and debit cards.

### Acceptance Criteria

1. WHEN a Cashier selects Tarjeta payment method, THE System SHALL display card payment instructions
2. THE System SHALL display the total amount to charge
3. THE System SHALL provide instructions to use the card terminal
4. WHEN confirmed, THE System SHALL record the sale with payment method "Tarjeta"

## Requirement 13: Inventory Opening

**User Story:** As a cashier, I want to count and record initial inventory, so that stock levels are accurate at session start.

### Acceptance Criteria

1. WHEN a Session starts, THE System SHALL prompt the Cashier to count inventory
2. THE System SHALL display a list of all active products
3. THE System SHALL provide input fields for initial stock count per Product
4. WHEN counts are submitted, THE System SHALL POST to `/api/users/{userId}/organization/{orgId}/inventory/opening`
5. THE System SHALL store inventory opening record in IndexedDB
6. THE System SHALL use opening counts to track remaining stock
7. THE System SHALL sync inventory opening to the Backend with JWT_Token authentication

## Requirement 14: Stock Depletion Tracking

**User Story:** As a cashier, I want stock to decrease automatically when I sell products, so that I know when items are running low.

### Acceptance Criteria

1. WHEN a sale is recorded, THE System SHALL decrement stock for each Product in the sale
2. WHEN stock reaches 0, THE System SHALL mark the Product as out of stock
3. WHEN stock is ≤ 3 and > 0, THE System SHALL display a low stock warning
4. THE System SHALL prevent adding out-of-stock products to the Cart
5. THE System SHALL persist stock levels in IndexedDB

## Requirement 15: Cash Register Closing Flow

**User Story:** As a cashier, I want to close my register at session end, so that I can reconcile my cash drawer.

### Acceptance Criteria

1. WHEN a Cashier initiates closing, THE System SHALL display a 4-step stepper interface
2. Step 1 SHALL display expected amounts per payment method
3. Step 2 SHALL provide input fields for declared amounts per payment method
4. Step 3 SHALL calculate and display differences between expected and declared
5. Step 4 SHALL provide a notes field for discrepancy justification
6. WHEN differences exist, THE System SHALL require notes before submission
7. WHEN closing is submitted, THE System SHALL create a closing record
8. THE System SHALL sync the closing record to the Backend
9. THE System SHALL mark the Assignment as closed locally
