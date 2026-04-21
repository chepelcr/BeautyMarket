# Backend Services Gap Analysis - Implementation Tasks

> **Note**: Work continuously through all tasks until completion. No checkpoints or pauses between phases - proceed from Phase 1 through Phase 11 in sequence until all tasks are finished.

## Phase 1: Database Schema Setup

### Task 1: Create PostgreSQL Migration Files
- [x] 1.1 Create migration for `branches` table
- [x] 1.2 Create migration for `terminals` table
- [x] 1.3 Create migration for `sessions` table
- [x] 1.4 Create migration for `assignments` table
- [x] 1.5 Create migration for `closings` table
- [x] 1.6 Create migration for `updated_at` trigger function
- [x] 1.7 Test migrations in local PostgreSQL instance

### Task 2: Create TypeScript Data Models
- [x] 2.1 Create `Branch` interface with snake_case fields
- [x] 2.2 Create `Terminal` interface with snake_case fields
- [x] 2.3 Create `Session` interface with snake_case fields
- [x] 2.4 Create `Assignment` interface with snake_case fields
- [x] 2.5 Create `Closing` interface with snake_case fields
- [x] 2.6 Create `DashboardData` interface with snake_case fields
- [x] 2.7 Create validation schemas using Zod

## Phase 2: Branches Management (Migrate from biller-apps)

### Task 3: Analyze biller-apps/branches Implementation
- [x] 3.1 Review existing branches code in biller-apps
- [x] 3.2 Document current API contracts
- [x] 3.3 Identify dependencies and integrations
- [x] 3.4 Map data models to new PostgreSQL schema

### Task 4: Implement Branches Handler
- [x] 4.1 Create `branches-handler` Lambda function
- [x] 4.2 Implement GET `/branches` endpoint
- [x] 4.3 Implement POST `/branches` endpoint
- [x] 4.4 Implement PATCH `/branches/{branch_id}` endpoint
- [x] 4.5 Implement DELETE `/branches/{branch_id}` endpoint
- [x] 4.6 Add organization-scoped authorization
- [x] 4.7 Add input validation
- [x] 4.8 Add error handling
- [x] 4.9 Write unit tests
- [x] 4.10 Write integration tests

## Phase 3: Terminals Management (Migrate from biller-apps)

### Task 5: Implement Terminals Handler
- [x] 5.1 Create `terminals-handler` Lambda function
- [x] 5.2 Implement GET `/terminals` endpoint
- [x] 5.3 Implement POST `/terminals` endpoint
- [x] 5.4 Implement PATCH `/terminals/{terminal_id}` endpoint
- [x] 5.5 Implement DELETE `/terminals/{terminal_id}` endpoint
- [x] 5.6 Add branch relationship validation
- [x] 5.7 Add device_id uniqueness validation
- [x] 5.8 Add organization-scoped authorization
- [x] 5.9 Write unit tests
- [x] 5.10 Write integration tests

## Phase 4: Sessions Management

### Task 6: Implement Sessions Handler
- [x] 6.1 Create `sessions-handler` Lambda function
- [x] 6.2 Implement GET `/sessions` endpoint with filters
- [x] 6.3 Implement POST `/sessions` endpoint
- [x] 6.4 Implement PATCH `/sessions/{session_id}` endpoint
- [x] 6.5 Add session activation/deactivation logic
- [x] 6.6 Add branch relationship validation
- [x] 6.7 Add organization-scoped authorization
- [x] 6.8 Write unit tests
- [x] 6.9 Write integration tests

## Phase 5: Assignments Management

### Task 7: Implement Assignments Handler
- [x] 7.1 Create `assignments-handler` Lambda function
- [x] 7.2 Implement GET `/assignments` endpoint with filters
- [x] 7.3 Implement POST `/assignments` endpoint
- [x] 7.4 Add validation: user exists and is org member
- [x] 7.5 Add validation: branch exists and belongs to org
- [x] 7.6 Add validation: session exists and is active
- [x] 7.7 Add validation: user has no other active assignments
- [x] 7.8 Add organization-scoped authorization
- [x] 7.9 Write unit tests
- [x] 7.10 Write integration tests

## Phase 6: Closings Management

### Task 8: Implement Closings Handler
- [x] 8.1 Create `closings-handler` Lambda function
- [x] 8.2 Implement GET `/closings` endpoint with filters
- [ ] 8.3 Implement POST `/closings` endpoint
  - [x] 8.3.1 Calculate expected amounts from orders
  - [x] 8.3.2 Calculate differences automatically
  - [x] 8.3.3 Set status to 'pending'
- [ ] 8.4 Implement PATCH `/closings/{closing_id}` endpoint
  - [x] 8.4.1 Add manager-only authorization for approval/rejection
  - [x] 8.4.2 Update reviewed_by and reviewed_at fields
- [x] 8.5 Add organization-scoped authorization
- [x] 8.6 Write unit tests
- [x] 8.7 Write integration tests

## Phase 7: Dashboard Real-Time Data

### Task 9: Implement Dashboard Handler
- [x] 9.1 Create `dashboard-handler` Lambda function
- [x] 9.2 Implement query: Get active sessions for organization
- [x] 9.3 Implement query: Get active assignments for sessions
- [x] 9.4 Implement query: Aggregate sales by assignment
  - [x] 9.4.1 Calculate total_revenue per stand
  - [x] 9.4.2 Calculate sales_count per stand
  - [x] 9.4.3 Calculate payment method breakdown (cash, sinpe, card)
  - [x] 9.4.4 Get last_sync_at timestamp
- [x] 9.5 Implement query: Calculate product ranking
- [x] 9.6 Implement query: Calculate global KPIs
  - [x] 9.6.1 Calculate total_revenue
  - [x] 9.6.2 Calculate total_sales
  - [x] 9.6.3 Calculate avg_ticket
- [x] 9.7 Add organization-scoped authorization
- [x] 9.8 Add optional session_id filter
- [x] 9.9 Write unit tests
- [x] 9.10 Write integration tests

## Phase 8: API Gateway Configuration

### Task 10: Configure API Routes
- [x] 10.1 Add `/branches` routes to API Gateway
- [x] 10.2 Add `/terminals` routes to API Gateway
- [x] 10.3 Add `/sessions` routes to API Gateway
- [x] 10.4 Add `/assignments` routes to API Gateway
- [x] 10.5 Add `/closings` routes to API Gateway
- [x] 10.6 Add `/dashboard` route to API Gateway
- [x] 10.7 Configure CORS for all routes
- [x] 10.8 Configure request/response models
- [x] 10.9 Configure rate limiting

### Task 11: Configure IAM Permissions
- [x] 11.1 Add PostgreSQL connection permissions
- [x] 11.2 Add CloudWatch Logs permissions
- [x] 11.3 Add API Gateway invoke permissions
- [x] 11.4 Configure VPC access for Lambda functions
- [x] 11.5 Test permissions in dev environment

## Phase 9: Frontend Integration

### Task 12: Update Frontend API Calls
- [x] 12.1 Remove mock data from DashboardPage
- [x] 12.2 Integrate real dashboard API endpoint
- [x] 12.3 Update error handling for dashboard
- [x] 12.4 Update loading states for dashboard

### Task 13: Implement Sessions Management UI
- [ ] 13.1 Create SessionConfig component API integration
- [ ] 13.2 Add session creation form
- [ ] 13.3 Add session list view
- [ ] 13.4 Add session activation/deactivation
- [ ] 13.5 Add error handling and validation

### Task 14: Implement Assignments Management UI
- [ ] 14.1 Create assignments management page
- [ ] 14.2 Add assignment creation form
- [ ] 14.3 Add assignment list view
- [ ] 14.4 Add cashier-to-stand assignment flow
- [ ] 14.5 Add error handling and validation

### Task 15: Implement Closings Workflow UI
- [ ] 15.1 Update closing submission in POSPage
- [ ] 15.2 Update closing approval in DashboardPage
- [ ] 15.3 Add closing details view
- [ ] 15.4 Add closing rejection flow
- [ ] 15.5 Add error handling and validation

### Task 16: Implement Branches Management UI
- [ ] 16.1 Create branches management page
- [ ] 16.2 Add branch creation form
- [ ] 16.3 Add branch list view
- [ ] 16.4 Add branch edit form
- [ ] 16.5 Add branch deletion with confirmation
- [ ] 16.6 Add error handling and validation

### Task 17: Implement Terminals Management UI
- [ ] 17.1 Create terminals management page
- [ ] 17.2 Add terminal registration form
- [ ] 17.3 Add terminal list view (grouped by branch)
- [ ] 17.4 Add terminal edit form
- [ ] 17.5 Add terminal deletion with confirmation
- [ ] 17.6 Add error handling and validation

## Phase 10: Testing & Deployment

### Task 18: End-to-End Testing
- [ ] 18.1 Test complete dashboard flow
- [ ] 18.2 Test session creation and management
- [ ] 18.3 Test assignment creation and management
- [ ] 18.4 Test closing submission and approval
- [ ] 18.5 Test branches CRUD operations
- [ ] 18.6 Test terminals CRUD operations
- [ ] 18.7 Test error scenarios
- [ ] 18.8 Test authorization rules

### Task 19: Performance Optimization
- [x] 19.1 Add database indexes for common queries
- [ ] 19.2 Optimize dashboard aggregation queries
- [ ] 19.3 Add query result caching where appropriate
- [ ] 19.4 Test with realistic data volumes
- [ ] 19.5 Profile and optimize slow queries

### Task 20: Documentation
- [ ] 20.1 Document API endpoints in OpenAPI/Swagger
- [ ] 20.2 Create database schema documentation
- [ ] 20.3 Create deployment guide
- [ ] 20.4 Create migration guide from biller-apps
- [ ] 20.5 Update frontend README with new endpoints

### Task 21: Deployment
- [ ] 21.1 Deploy database migrations to dev
- [ ] 21.2 Deploy Lambda functions to dev
- [ ] 21.3 Deploy API Gateway changes to dev
- [ ] 21.4 Test in dev environment
- [ ] 21.5 Deploy to staging
- [ ] 21.6 Test in staging environment
- [ ] 21.7 Deploy to production
- [ ] 21.8 Monitor production deployment

## Phase 11: Migration & Cleanup

### Task 22: Migrate Existing Data (if applicable)
- [ ] 22.1 Export existing branches data from biller-apps
- [ ] 22.2 Transform data to new schema format
- [ ] 22.3 Import data to PostgreSQL
- [ ] 22.4 Verify data integrity
- [ ] 22.5 Update foreign key relationships

### Task 23: Update biller-apps (if needed)
- [ ] 23.1 Update biller-apps to use new endpoints
- [ ] 23.2 Test backward compatibility
- [ ] 23.3 Deploy biller-apps updates
- [ ] 23.4 Monitor for issues

### Task 24: Cleanup
- [ ] 24.1 Remove deprecated code from biller-apps
- [ ] 24.2 Archive old branches service
- [ ] 24.3 Update documentation
- [ ] 24.4 Celebrate! 🎉

---

## Task Dependencies

```
Phase 1 (Database) → Phase 2-7 (Handlers) → Phase 8 (API Gateway) → Phase 9 (Frontend) → Phase 10 (Testing) → Phase 11 (Migration)

Critical Path:
1 → 2 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 18 → 21
```

## Estimated Timeline

- **Phase 1**: 2-3 days
- **Phase 2-3**: 3-4 days (Branches & Terminals migration)
- **Phase 4-6**: 4-5 days (Sessions, Assignments, Closings)
- **Phase 7**: 3-4 days (Dashboard aggregation)
- **Phase 8**: 1-2 days (API Gateway)
- **Phase 9**: 5-7 days (Frontend integration)
- **Phase 10**: 3-4 days (Testing & optimization)
- **Phase 11**: 2-3 days (Migration & cleanup)

**Total**: ~24-35 days (5-7 weeks)

## Priority Order

1. **High Priority** (Blocking frontend functionality):
   - Task 1: Database schema
   - Task 4: Branches handler
   - Task 5: Terminals handler
   - Task 6: Sessions handler
   - Task 9: Dashboard handler

2. **Medium Priority** (Core features):
   - Task 7: Assignments handler
   - Task 8: Closings handler
   - Task 12-17: Frontend integration

3. **Low Priority** (Polish & optimization):
   - Task 19: Performance optimization
   - Task 20: Documentation
   - Task 22-24: Migration & cleanup
