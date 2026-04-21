# Backend Services Gap Analysis - Design Document

## Overview

This document analyzes the current state of the Pollos Porteños Sales system across all services (frontend, cross-app-be, biller-apps) and identifies missing backend implementations required for full functionality. It also documents the migration of branches/terminals functionality from `biller-apps` into `cross-app-be`.

## High-Level Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Pollos Sales Frontend                     │
│              (BeautyMarket/templates/pollos-sales)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌────────────────┐
│  Markets API  │          │   Orders API   │
│ (BeautyMarket │          │ (cross-app-be) │
│    /server)   │          │                │
└───────────────┘          └────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌───────────────┐          ┌────────────────┐
│   DynamoDB    │          │   DynamoDB     │
│  (Users, Orgs)│          │ (Products, etc)│
└───────────────┘          └────────────────┘

┌─────────────────────────────────────────────┐
│         Branches Service (Legacy)           │
│      (biller-apps/branches)                 │
│   TO BE MIGRATED → cross-app-be             │
└─────────────────────────────────────────────┘
```

### Current State Analysis

#### ✅ What Exists and Works

**Markets API (BeautyMarket/server)**
- ✅ User authentication (Cognito)
- ✅ User profiles: `GET /api/users/{userId}/profile`
- ✅ Organization memberships: `GET /api/users/{userId}/memberships/organizations`
- ✅ Organization CRUD operations

**Orders API (cross-app-be)**
- ✅ Products: `GET /api/organizations/{orgId}/products`
- ✅ Products: `POST /api/organizations/{orgId}/products`
- ✅ Products: `PATCH /api/organizations/{orgId}/products/{productId}`
- ✅ Categories: `GET /api/organizations/{orgId}/categories`

**Frontend (pollos-sales)**
- ✅ Authentication flow
- ✅ Organization selection
- ✅ Products page (reads from Orders API)
- ✅ Dashboard UI (with mock data)

#### ❌ What's Missing

**Template-Specific Endpoints (NOT IMPLEMENTED)**

These endpoints are called by the frontend but don't exist in any backend:

1. **Dashboard Real-Time Data**
   - `GET /api/users/{userId}/organization/{orgId}/dashboard`
   - Returns: stands, totalRevenue, totalSales, avgTicket, productRanking

2. **Cashier Assignments**
   - `GET /api/users/{userId}/organization/{orgId}/assignments`
   - `POST /api/users/{userId}/organization/{orgId}/assignments`
   - Links cashiers to stands for sessions

3. **Sessions Management**
   - `GET /api/users/{userId}/organization/{orgId}/sessions`
   - `POST /api/users/{userId}/organization/{orgId}/sessions`
   - `PATCH /api/users/{userId}/organization/{orgId}/sessions/{sessionId}`
   - Manages match/shift sales periods

4. **Cash Register Closings**
   - `GET /api/users/{userId}/organization/{orgId}/closings`
   - `POST /api/users/{userId}/organization/{orgId}/closings`
   - `PATCH /api/users/{userId}/organization/{orgId}/closings/{closingId}`
   - End-of-session reconciliation

5. **Branches Management** (from biller-apps)
   - `GET /api/users/{userId}/organization/{orgId}/branches`
   - `POST /api/users/{userId}/organization/{orgId}/branches`
   - `PATCH /api/users/{userId}/organization/{orgId}/branches/{branchId}`
   - `DELETE /api/users/{userId}/organization/{orgId}/branches/{branchId}`

6. **Terminals Management** (from biller-apps)
   - `GET /api/users/{userId}/organization/{orgId}/terminals`
   - `POST /api/users/{userId}/organization/{orgId}/terminals`
   - `PATCH /api/users/{userId}/organization/{orgId}/terminals/{terminalId}`
   - `DELETE /api/users/{userId}/organization/{orgId}/terminals/{terminalId}`

7. **Sales/Orders Recording**
   - `POST /api/organizations/{orgId}/orders` (may exist but needs verification)
   - Offline sales sync endpoint

### Branches/Terminals Migration

**Source**: `E:\dev\biller-apps\branches`

**Functionality to Migrate**:
1. Branch CRUD operations
2. Terminal registration and management
3. Terminal-to-branch assignment
4. User-to-branch assignment
5. Sales tracking per branch/terminal

**Target**: `E:\dev\cross-app-be` (Orders API)

**Migration Strategy**:
- Copy branch/terminal data models
- Adapt API routes to match pollos-sales patterns
- Integrate with existing organization structure
- Maintain backward compatibility if biller-apps still uses it

## Low-Level Design

### Data Models

#### Branch
```typescript
interface Branch {
  branch_id: string;              // UUID
  organization_id: string;        // FK to organization
  name: string;                   // "Puesto 1", "Restaurante Centro"
  code: string;                   // Short code: "P1", "RC"
  type: 'stand' | 'restaurant';   // Branch type
  is_active: boolean;
  address?: string;
  phone?: string;
  created_at: string;             // ISO timestamp
  updated_at: string;
  created_by: string;             // user_id
}
```

#### Terminal
```typescript
interface Terminal {
  terminal_id: string;            // UUID
  organization_id: string;        // FK to organization
  branch_id: string;              // FK to branch
  name: string;                   // "Terminal 1", "Caja Principal"
  code: string;                   // Short code: "T1", "CP"
  device_id?: string;             // Physical device identifier
  is_active: boolean;
  registered_at: string;          // ISO timestamp
  last_seen_at?: string;          // Last heartbeat
  created_at: string;
  updated_at: string;
}
```

#### Assignment
```typescript
interface Assignment {
  assignment_id: string;          // UUID
  organization_id: string;
  session_id: string;             // FK to session
  user_id: string;                // Cashier user_id
  branch_id: string;              // FK to branch
  terminal_id?: string;           // Optional FK to terminal
  role: 'cashier' | 'supervisor';
  start_time: string;             // ISO timestamp
  end_time?: string;              // ISO timestamp (null if active)
  is_active: boolean;
  created_at: string;
  created_by: string;             // Manager user_id
}
```

#### Session
```typescript
interface Session {
  session_id: string;             // UUID
  organization_id: string;
  branch_id?: string;             // Optional: session for specific branch
  name: string;                   // "Partido vs Herediano", "Turno Mañana"
  type: 'match' | 'shift';
  context: 'gradas' | 'mesa' | 'caja';
  start_time: string;             // ISO timestamp
  end_time?: string;              // ISO timestamp (null if active)
  is_active: boolean;
  expected_revenue?: number;
  actual_revenue?: number;
  created_at: string;
  created_by: string;             // Manager user_id
}
```

#### Closing
```typescript
interface Closing {
  closing_id: string;             // UUID
  organization_id: string;
  session_id: string;             // FK to session
  assignment_id: string;          // FK to assignment
  branch_id: string;              // FK to branch
  terminal_id?: string;
  cashier_id: string;             // user_id
  
  // Expected amounts (from system)
  expected_cash: number;
  expected_sinpe: number;
  expected_card: number;
  expected_total: number;
  
  // Declared amounts (from cashier)
  declared_cash: number;
  declared_sinpe: number;
  declared_card: number;
  declared_total: number;
  
  // Differences
  cash_difference: number;
  sinpe_difference: number;
  card_difference: number;
  total_difference: number;
  
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;           // Manager user_id
  reviewed_at?: string;           // ISO timestamp
  
  created_at: string;
}
```

#### DashboardData (Computed)
```typescript
interface DashboardData {
  stands: Array<{
    id: string;                   // branch_id
    name: string;
    cashier_name: string;
    context: string;
    total_revenue: number;
    sales_count: number;
    cash: number;
    sinpe: number;
    card: number;
    last_sync_at: number;         // timestamp
  }>;
  total_revenue: number;
  total_sales: number;
  avg_ticket: number;
  product_ranking: Array<{
    name: string;
    emoji: string;
    units: number;
    revenue: number;
  }>;
}
```

### API Endpoints Specification

#### 1. Dashboard Endpoint

**GET** `/api/users/{userId}/organization/{orgId}/dashboard`

**Query Parameters**:
- `sessionId` (optional): Filter by specific session

**Response**: `DashboardData`

**Logic**:
1. Get active session(s) for organization
2. Get all active assignments for session(s)
3. For each assignment:
   - Get branch info
   - Get cashier info
   - Aggregate sales from orders table
   - Calculate payment method breakdown
   - Get last sync timestamp
4. Calculate product ranking from orders
5. Return aggregated dashboard data

**PostgreSQL Queries**:
```sql
-- Get active sessions
SELECT * FROM sessions 
WHERE organization_id = $1 AND is_active = true;

-- Get assignments for session
SELECT a.*, u.name as cashier_name, b.name as branch_name
FROM assignments a
JOIN users u ON a.user_id = u.user_id
JOIN branches b ON a.branch_id = b.branch_id
WHERE a.session_id = $1 AND a.is_active = true;

-- Aggregate sales by assignment
SELECT 
  a.assignment_id,
  a.branch_id,
  COUNT(o.order_id) as sales_count,
  SUM(o.total) as total_revenue,
  SUM(CASE WHEN o.payment_method = 'cash' THEN o.total ELSE 0 END) as cash,
  SUM(CASE WHEN o.payment_method = 'sinpe' THEN o.total ELSE 0 END) as sinpe,
  SUM(CASE WHEN o.payment_method = 'card' THEN o.total ELSE 0 END) as card,
  MAX(o.created_at) as last_sync_at
FROM assignments a
LEFT JOIN orders o ON o.assignment_id = a.assignment_id
WHERE a.session_id = $1
GROUP BY a.assignment_id, a.branch_id;

-- Product ranking
SELECT 
  p.name,
  p.image_url as emoji,
  SUM(oi.quantity) as units,
  SUM(oi.quantity * oi.unit_price) as revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.session_id = $1
GROUP BY p.product_id, p.name, p.image_url
ORDER BY revenue DESC
LIMIT 10;
```

---

#### 2. Assignments Endpoints

**GET** `/api/users/{userId}/organization/{orgId}/assignments`

**Query Parameters**:
- `sessionId` (optional): Filter by session
- `branchId` (optional): Filter by branch
- `isActive` (optional): Filter active/inactive

**Response**: `Assignment[]`

---

**POST** `/api/users/{userId}/organization/{orgId}/assignments`

**Request Body**:
```json
{
  "session_id": "uuid",
  "user_id": "uuid",
  "branch_id": "uuid",
  "terminal_id": "uuid",
  "role": "cashier"
}
```

**Response**: `Assignment`

**Validation**:
- User must exist and be member of organization
- Branch must exist and belong to organization
- Session must exist and be active
- User cannot have multiple active assignments

---

#### 3. Sessions Endpoints

**GET** `/api/users/{userId}/organization/{orgId}/sessions`

**Query Parameters**:
- `is_active` (optional): Filter active/inactive
- `branch_id` (optional): Filter by branch
- `type` (optional): Filter by type (match/shift)

**Response**: `Session[]`

---

**POST** `/api/users/{userId}/organization/{orgId}/sessions`

**Request Body**:
```json
{
  "name": "Partido vs Herediano",
  "type": "match",
  "context": "gradas",
  "branch_id": "uuid",
  "start_time": "2024-03-20T19:00:00Z"
}
```

**Response**: `Session`

---

**PATCH** `/api/users/{userId}/organization/{orgId}/sessions/{sessionId}`

**Request Body**:
```json
{
  "end_time": "2024-03-20T22:00:00Z",
  "is_active": false,
  "actual_revenue": 1500000
}
```

**Response**: `Session`

---

#### 4. Closings Endpoints

**GET** `/api/users/{userId}/organization/{orgId}/closings`

**Query Parameters**:
- `session_id` (optional): Filter by session
- `status` (optional): Filter by status
- `branch_id` (optional): Filter by branch

**Response**: `Closing[]`

---

**POST** `/api/users/{userId}/organization/{orgId}/closings`

**Request Body**:
```json
{
  "session_id": "uuid",
  "assignment_id": "uuid",
  "declared_cash": 500000,
  "declared_sinpe": 300000,
  "declared_card": 200000,
  "notes": "Todo correcto"
}
```

**Response**: `Closing`

**Logic**:
1. Get assignment details
2. Calculate expected amounts from orders
3. Calculate differences
4. Create closing record with status 'pending'

---

**PATCH** `/api/users/{userId}/organization/{orgId}/closings/{closingId}`

**Request Body**:
```json
{
  "status": "approved",
  "reviewed_by": "user_id"
}
```

**Response**: `Closing`

**Authorization**: Only managers can approve/reject

---

#### 5. Branches Endpoints

**GET** `/api/users/{userId}/organization/{orgId}/branches`

**Response**: `Branch[]`

---

**POST** `/api/users/{userId}/organization/{orgId}/branches`

**Request Body**:
```json
{
  "name": "Puesto 1",
  "code": "P1",
  "type": "stand",
  "address": "Estadio Lito Pérez"
}
```

**Response**: `Branch`

---

**PATCH** `/api/users/{userId}/organization/{orgId}/branches/{branchId}`

**Request Body**: Partial `Branch`

**Response**: `Branch`

---

**DELETE** `/api/users/{userId}/organization/{orgId}/branches/{branchId}`

**Response**: `{ success: boolean }`

**Validation**: Cannot delete if has active terminals or sessions

---

#### 6. Terminals Endpoints

**GET** `/api/users/{userId}/organization/{orgId}/terminals`

**Query Parameters**:
- `branch_id` (optional): Filter by branch

**Response**: `Terminal[]`

---

**POST** `/api/users/{userId}/organization/{orgId}/terminals`

**Request Body**:
```json
{
  "branch_id": "uuid",
  "name": "Terminal 1",
  "code": "T1",
  "device_id": "device-123"
}
```

**Response**: `Terminal`

---

**PATCH** `/api/users/{userId}/organization/{orgId}/terminals/{terminalId}`

**Request Body**: Partial `Terminal`

**Response**: `Terminal`

---

**DELETE** `/api/users/{userId}/organization/{orgId}/terminals/{terminalId}`

**Response**: `{ success: boolean }`

**Validation**: Cannot delete if has active assignments

---

### PostgreSQL Database Schema

#### Table: `branches`

```sql
CREATE TABLE branches (
  branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('stand', 'restaurant')),
  is_active BOOLEAN DEFAULT true,
  address TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  UNIQUE(organization_id, code),
  INDEX idx_branches_org (organization_id),
  INDEX idx_branches_active (organization_id, is_active)
);
```

#### Table: `terminals`

```sql
CREATE TABLE terminals (
  terminal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  device_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, code),
  UNIQUE(device_id),
  INDEX idx_terminals_branch (branch_id),
  INDEX idx_terminals_org (organization_id),
  INDEX idx_terminals_active (organization_id, is_active)
);
```

#### Table: `sessions`

```sql
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(branch_id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('match', 'shift')),
  context VARCHAR(50) NOT NULL CHECK (context IN ('gradas', 'mesa', 'caja')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  expected_revenue DECIMAL(12, 2),
  actual_revenue DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  INDEX idx_sessions_org (organization_id),
  INDEX idx_sessions_active (organization_id, is_active),
  INDEX idx_sessions_branch (branch_id),
  INDEX idx_sessions_time (start_time DESC)
);
```

#### Table: `assignments`

```sql
CREATE TABLE assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
  terminal_id UUID REFERENCES terminals(terminal_id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('cashier', 'supervisor')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(user_id),
  
  INDEX idx_assignments_session (session_id),
  INDEX idx_assignments_user (user_id),
  INDEX idx_assignments_branch (branch_id),
  INDEX idx_assignments_active (session_id, is_active),
  
  -- Constraint: User can only have one active assignment at a time
  UNIQUE(user_id, is_active) WHERE is_active = true
);
```

#### Table: `closings`

```sql
CREATE TABLE closings (
  closing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
  terminal_id UUID REFERENCES terminals(terminal_id) ON DELETE SET NULL,
  cashier_id UUID NOT NULL REFERENCES users(user_id),
  
  -- Expected amounts (from system)
  expected_cash DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expected_sinpe DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expected_card DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expected_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Declared amounts (from cashier)
  declared_cash DECIMAL(12, 2) NOT NULL,
  declared_sinpe DECIMAL(12, 2) NOT NULL,
  declared_card DECIMAL(12, 2) NOT NULL,
  declared_total DECIMAL(12, 2) NOT NULL,
  
  -- Differences (calculated)
  cash_difference DECIMAL(12, 2) GENERATED ALWAYS AS (declared_cash - expected_cash) STORED,
  sinpe_difference DECIMAL(12, 2) GENERATED ALWAYS AS (declared_sinpe - expected_sinpe) STORED,
  card_difference DECIMAL(12, 2) GENERATED ALWAYS AS (declared_card - expected_card) STORED,
  total_difference DECIMAL(12, 2) GENERATED ALWAYS AS (declared_total - expected_total) STORED,
  
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(user_id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_closings_session (session_id),
  INDEX idx_closings_status (organization_id, status),
  INDEX idx_closings_branch (branch_id),
  INDEX idx_closings_cashier (cashier_id),
  
  -- Constraint: One closing per assignment
  UNIQUE(assignment_id)
);
```

#### Triggers for `updated_at`

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terminals_updated_at BEFORE UPDATE ON terminals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Lambda Functions

#### 1. `dashboard-handler`
- **Trigger**: API Gateway GET `/dashboard`
- **Logic**: Aggregate real-time sales data using PostgreSQL queries
- **Dependencies**: Orders table, Assignments table, Sessions table

#### 2. `assignments-handler`
- **Trigger**: API Gateway `/assignments`
- **Methods**: GET, POST
- **Logic**: CRUD for cashier assignments with PostgreSQL

#### 3. `sessions-handler`
- **Trigger**: API Gateway `/sessions`
- **Methods**: GET, POST, PATCH
- **Logic**: CRUD for sales sessions with PostgreSQL

#### 4. `closings-handler`
- **Trigger**: API Gateway `/closings`
- **Methods**: GET, POST, PATCH
- **Logic**: Cash register closing workflow with PostgreSQL

#### 5. `branches-handler`
- **Trigger**: API Gateway `/branches`
- **Methods**: GET, POST, PATCH, DELETE
- **Logic**: Branch management (migrated from biller-apps) with PostgreSQL

#### 6. `terminals-handler`
- **Trigger**: API Gateway `/terminals`
- **Methods**: GET, POST, PATCH, DELETE
- **Logic**: Terminal management (migrated from biller-apps) with PostgreSQL

---

### Migration Plan: biller-apps/branches → cross-app-be

**Phase 1: Analysis**
1. ✅ Document current biller-apps/branches implementation
2. ✅ Identify data models and API contracts
3. ✅ Map to pollos-sales requirements

**Phase 2: Data Model Migration**
1. Create PostgreSQL table schemas in cross-app-be
2. Define indexes for query optimization
3. Create TypeScript interfaces with snake_case

**Phase 3: Lambda Functions**
1. Copy branch/terminal handlers from biller-apps
2. Adapt to cross-app-be structure
3. Update API routes to match pollos-sales patterns
4. Add organization-scoped authorization

**Phase 4: Testing**
1. Unit tests for each handler
2. Integration tests with PostgreSQL
3. End-to-end tests with frontend

**Phase 5: Deployment**
1. Deploy to dev environment
2. Update frontend to use new endpoints
3. Verify functionality
4. Deploy to production

---

## Implementation Checklist

### Backend (cross-app-be)

- [ ] Create PostgreSQL tables: branches, terminals, sessions, assignments, closings
- [ ] Create database migrations
- [ ] Implement `branches-handler` Lambda
- [ ] Implement `terminals-handler` Lambda
- [ ] Implement `sessions-handler` Lambda
- [ ] Implement `assignments-handler` Lambda
- [ ] Implement `closings-handler` Lambda
- [ ] Implement `dashboard-handler` Lambda
- [ ] Add API Gateway routes
- [ ] Add IAM permissions
- [ ] Write unit tests
- [ ] Write integration tests with PostgreSQL

### Frontend (pollos-sales)

- [ ] Remove mock data from DashboardPage
- [ ] Implement real dashboard API integration
- [ ] Implement sessions management UI
- [ ] Implement assignments management UI
- [ ] Implement closings workflow UI
- [ ] Implement branches management UI
- [ ] Implement terminals management UI
- [ ] Add error handling for new endpoints
- [ ] Update loading states

### Migration (biller-apps → cross-app-be)

- [ ] Extract branch/terminal code from biller-apps
- [ ] Adapt to cross-app-be patterns
- [ ] Test backward compatibility
- [ ] Document migration process
- [ ] Update biller-apps to use new endpoints (if needed)

---

## Next Steps

1. **Review this design** with the team
2. **Create requirements document** (derived from this design)
3. **Create implementation tasks** for each component
4. **Prioritize tasks** based on frontend dependencies
5. **Begin implementation** starting with branches/terminals migration



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Entity Persistence Round-Trip

*For any* valid entity (branch, terminal, session, assignment, closing), creating the entity and then retrieving it by ID SHALL return an equivalent entity with all fields preserved.

**Validates: Requirements 1.1, 2.1, 3.1, 4.1**

### Property 2: Organization-Scoped Data Isolation

*For any* organization and entity type, querying entities for that organization SHALL return only entities belonging to that organization and SHALL NOT return entities from other organizations.

**Validates: Requirements 1.2, 2.2, 3.2, 4.2, 5.4, 6.2**

### Property 3: Automatic Timestamp Updates

*For any* entity with an updated_at field, modifying the entity SHALL result in the updated_at timestamp being greater than its previous value.

**Validates: Requirements 1.3, 2.3, 9.8**

### Property 4: Enum Field Validation

*For any* entity with enumerated type fields (branch type, session type, session context, assignment role, closing status), attempting to create or update the entity with invalid enum values SHALL fail with a validation error.

**Validates: Requirements 1.7, 3.4, 3.5, 4.7, 9.4**

### Property 5: Foreign Key Referential Integrity

*For any* entity with foreign key relationships, attempting to create the entity with a non-existent foreign key value SHALL fail with a validation error.

**Validates: Requirements 2.7, 3.6, 4.4, 4.5, 9.1**

### Property 6: Uniqueness Constraint Enforcement

*For any* entity with uniqueness constraints (branch code per org, terminal code per org, device_id globally, active assignment per user, closing per assignment), attempting to create a duplicate SHALL fail with a constraint violation error.

**Validates: Requirements 1.6, 2.5, 2.6, 4.6, 5.8, 9.2, 9.3, 9.6**

### Property 7: Closing Difference Calculation

*For any* closing with declared and expected amounts, the calculated differences (cash_difference, sinpe_difference, card_difference, total_difference) SHALL equal declared minus expected for each payment method.

**Validates: Requirements 5.2, 9.5**

### Property 8: Entity State Transitions

*For any* entity with state fields (session is_active, closing status), transitioning the state SHALL update all related fields consistently (e.g., ending a session sets end_time and is_active=false; approving a closing sets status, reviewed_by, and reviewed_at).

**Validates: Requirements 3.3, 5.3, 5.5, 5.6**

### Property 9: API Response Field Naming Convention

*For any* API response, all field names SHALL use snake_case convention and all timestamp fields SHALL be in ISO 8601 format with timezone information.

**Validates: Requirements 7.2, 10.6, 10.7**

### Property 10: HTTP Status Code Consistency

*For any* API request, the response SHALL use appropriate HTTP status codes: 200/201 for success, 400 for validation errors, 403 for authorization failures, 404 for not found, 500 for server errors.

**Validates: Requirements 10.1, 10.2, 10.4**

### Property 11: Product Ranking Result Limit

*For any* dashboard query requesting product rankings, the result SHALL contain at most 10 products ordered by revenue descending.

**Validates: Requirement 11.5**

### Property 12: Query Filter Combinations

*For any* entity type supporting multiple optional filters (sessions by is_active/branch_id/type, assignments by session_id/branch_id/is_active, closings by session_id/status/branch_id, terminals by branch_id), applying any combination of filters SHALL return only entities matching all specified filter criteria.

**Validates: Requirements 2.2, 3.2, 4.2, 5.4**
