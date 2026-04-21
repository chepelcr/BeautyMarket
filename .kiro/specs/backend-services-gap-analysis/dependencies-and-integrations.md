# Dependencies and Integrations Document

**Task**: 3.3 Identify dependencies and integrations  
**Date**: 2025-01-28  
**Spec**: Backend Services Gap Analysis

## Executive Summary

This document identifies all dependencies and integrations required to implement the branches/terminals functionality in cross-app-be for the Pollos Porteños Sales system. The analysis covers external services, database dependencies, internal service integrations, and infrastructure requirements.

**Key Findings**:
- ✅ Data models already exist in cross-app-be (Branch, Terminal, Session, Assignment, Closing)
- ❌ Controllers, services, and repositories need to be implemented
- ✅ PostgreSQL database with SQLAlchemy ORM already configured
- ✅ FastAPI framework with Mangum for AWS Lambda already in place
- ⚠️ Integration with Markets API (BeautyMarket/server) required for user/organization validation
- ⚠️ Integration with existing Orders API for dashboard calculations

---

## 1. External Service Dependencies

### 1.1 Markets API (BeautyMarket/server)

**Location**: `E:\dev\BeautyMarket\server`  
**Technology**: Node.js + Express + PostgreSQL (via Drizzle ORM)  
**Purpose**: User authentication and organization management

#### Required Integrations

**User Validation**
- **Endpoint**: `GET /api/users/{userId}/profile`
- **Purpose**: Validate user exists when creating assignments
- **Authentication**: JWT token from AWS Cognito
- **Response Format**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "cognito_sub": "cognito-uuid"
}
```

**Organization Membership Validation**
- **Endpoint**: `GET /api/users/{userId}/memberships/organizations`
- **Purpose**: Verify user is member of organization before creating assignments
- **Authentication**: JWT token from AWS Cognito
- **Response Format**:
```json
[
  {
    "organization_id": "uuid",
    "organization_name": "Pollos Porteños",
    "role": "manager",
    "status": "active"
  }
]
```

**Organization Details**
- **Endpoint**: `GET /api/organizations/{organizationId}`
- **Purpose**: Validate organization exists when creating branches
- **Authentication**: JWT token from AWS Cognito
- **Response Format**:
```json
{
  "organization_id": "uuid",
  "name": "Pollos Porteños",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Integration Method

**HTTP Client**: Use `httpx` library (already in requirements.txt)

**Implementation Pattern**:
```python
import httpx
from typing import Optional

class MarketsApiClient:
    def __init__(self, base_url: str, timeout: float = 10.0):
        self.base_url = base_url
        self.timeout = timeout
    
    async def get_user_profile(self, user_id: str, token: str) -> Optional[dict]:
        """Fetch user profile from Markets API"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/users/{user_id}/profile",
                headers={"Authorization": f"Bearer {token}"},
                timeout=self.timeout
            )
            if response.status_code == 200:
                return response.json()
            return None
    
    async def get_user_organizations(self, user_id: str, token: str) -> list[dict]:
        """Fetch user's organization memberships"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/users/{user_id}/memberships/organizations",
                headers={"Authorization": f"Bearer {token}"},
                timeout=self.timeout
            )
            if response.status_code == 200:
                return response.json()
            return []
    
    async def verify_organization_membership(
        self, user_id: str, organization_id: str, token: str
    ) -> bool:
        """Verify user is member of organization"""
        orgs = await self.get_user_organizations(user_id, token)
        return any(org["organization_id"] == organization_id for org in orgs)
```

**Configuration**:
- Environment variable: `MARKETS_API_URL` (e.g., `https://api.jcampos.dev`)
- Timeout: 10 seconds (configurable)
- Retry strategy: Use `tenacity` library (already in requirements.txt) for transient failures

---

### 1.2 AWS Cognito

**Purpose**: User authentication and JWT token validation

#### Required Integration

**JWT Token Validation**
- **Library**: `python-jose[cryptography]` (needs to be added to requirements.txt)
- **Purpose**: Validate JWT tokens from frontend requests
- **Configuration**:
  - Cognito User Pool ID: From environment variable `COGNITO_USER_POOL_ID`
  - Cognito Region: From environment variable `AWS_REGION`
  - Cognito App Client ID: From environment variable `COGNITO_CLIENT_ID`

**Implementation Pattern**:
```python
from jose import jwt, JWTError
import httpx
from functools import lru_cache

class CognitoValidator:
    def __init__(self, user_pool_id: str, region: str, client_id: str):
        self.user_pool_id = user_pool_id
        self.region = region
        self.client_id = client_id
        self.jwks_url = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
    
    @lru_cache(maxsize=1)
    def get_jwks(self) -> dict:
        """Fetch and cache JWKS from Cognito"""
        response = httpx.get(self.jwks_url)
        return response.json()
    
    def validate_token(self, token: str) -> dict:
        """Validate JWT token and return claims"""
        jwks = self.get_jwks()
        # Implementation details for JWT validation
        # Returns decoded token with user_id, email, etc.
        pass
```

**Dependency**: Add to requirements.txt:
```
python-jose[cryptography]>=3.3.0
```

---

### 1.3 AWS Services

#### AWS Lambda
- **Purpose**: Serverless compute for API handlers
- **Configuration**: Already configured via `mangum` library
- **Handler**: `app.main.lambda_handler`

#### AWS API Gateway
- **Purpose**: HTTP API routing to Lambda functions
- **Configuration**: `cross-app-be/api-gateway/template.yml`
- **Routes**: Need to add new routes for branches, terminals, sessions, assignments, closings, dashboard

#### AWS RDS PostgreSQL
- **Purpose**: Primary database for all entities
- **Configuration**: Connection string from environment variable `DATABASE_URL`
- **Current Schema**: Already has tables for branches, terminals, sessions, assignments, closings (models exist)

#### AWS Secrets Manager (Optional)
- **Purpose**: Store sensitive configuration (database credentials, API keys)
- **Library**: `boto3` (already in requirements.txt)
- **Usage**: Retrieve secrets at Lambda cold start

---

## 2. Database Dependencies

### 2.1 PostgreSQL Database

**Connection**: Via SQLAlchemy 2.0 (already configured)

**Existing Tables** (models already defined):
- `branches` - Physical sales locations
- `terminals` - Point-of-sale devices
- `sales_sessions` - Time-bounded sales periods
- `assignments` - Cashier-to-branch-to-session links
- `closings` - End-of-session reconciliations

**Required Tables** (need to verify existence):
- `products` - Product catalog (already exists based on ProductsController)
- `categories` - Product categories (already exists based on CategoriesController)
- `orders` - Sales orders (already exists based on OrdersController)
- `order_lines` - Order line items (model exists: `order_line.py`)
- `organizations` - Organization master data (model exists: `organization.py`)

**Database Migrations**:
- **Tool**: Alembic (already configured)
- **Location**: `cross-app-be/alembic/versions/`
- **Action Required**: Create migration for branches/terminals tables if not already migrated

### 2.2 Required Indexes

**Already Defined in Models**:
- `idx_branches_org` - Organization lookup
- `idx_branches_active` - Active branches filter
- `idx_branches_org_code` - Unique constraint on organization + code
- `idx_terminals_branch` - Terminals by branch
- `idx_terminals_org` - Terminals by organization
- `idx_terminals_active` - Active terminals filter
- `idx_terminals_org_code` - Unique constraint on organization + code
- `idx_terminals_device_id` - Unique device ID
- `idx_sessions_org` - Sessions by organization
- `idx_sessions_active` - Active sessions filter
- `idx_sessions_branch` - Sessions by branch
- `idx_sessions_time` - Time-based queries
- `idx_assignments_session` - Assignments by session
- `idx_assignments_user` - Assignments by user
- `idx_assignments_branch` - Assignments by branch
- `idx_assignments_active` - Active assignments filter
- `idx_closings_session` - Closings by session
- `idx_closings_status` - Closings by status
- `idx_closings_branch` - Closings by branch
- `idx_closings_cashier` - Closings by cashier

### 2.3 Foreign Key Relationships

**Already Defined**:
- `terminals.branch_id` → `branches.branch_id` (CASCADE)
- `sales_sessions.branch_id` → `branches.branch_id` (SET NULL)
- `assignments.session_id` → `sales_sessions.session_id` (CASCADE)
- `assignments.branch_id` → `branches.branch_id` (CASCADE)
- `assignments.terminal_id` → `terminals.terminal_id` (SET NULL)
- `closings.session_id` → `sales_sessions.session_id` (CASCADE)
- `closings.assignment_id` → `assignments.assignment_id` (CASCADE)
- `closings.branch_id` → `branches.branch_id` (CASCADE)
- `closings.terminal_id` → `terminals.terminal_id` (SET NULL)

**Missing Foreign Keys** (need to add to orders table):
- `orders.assignment_id` → `assignments.assignment_id` (for dashboard calculations)
- `orders.session_id` → `sales_sessions.session_id` (for dashboard calculations)

---

## 3. Internal Service Integrations

### 3.1 Existing Controllers/Services in cross-app-be

**Already Implemented**:
- `CategoriesController` - Product categories CRUD
- `ClientsController` - Client management
- `ConfirmationsController` - Order confirmations
- `DepartmentsController` - Department management
- `OrdersController` - Order management
- `ProductsController` - Product catalog CRUD
- `StoresController` - Store management

**Need to Implement**:
- `BranchesController` - Branch CRUD operations
- `TerminalsController` - Terminal CRUD operations
- `SessionsController` - Session management
- `AssignmentsController` - Cashier assignment management
- `ClosingsController` - Cash register closing workflow
- `DashboardController` - Real-time dashboard aggregations

### 3.2 Service Layer Dependencies

**Pattern**: Each controller depends on a service, which depends on a repository

**Example Structure**:
```
BranchesController
  ↓
BranchService
  ↓
BranchRepository
  ↓
SQLAlchemy Session → PostgreSQL
```

**Cross-Service Dependencies**:

**BranchService**:
- `OrganizationRepository` - Validate organization exists
- `MarketsApiClient` - Validate user permissions

**TerminalService**:
- `BranchRepository` - Validate branch exists
- `OrganizationRepository` - Validate organization exists

**SessionService**:
- `BranchRepository` - Validate branch exists (optional)
- `OrganizationRepository` - Validate organization exists

**AssignmentService**:
- `SessionRepository` - Validate session exists and is active
- `BranchRepository` - Validate branch exists
- `TerminalRepository` - Validate terminal exists (optional)
- `MarketsApiClient` - Validate user exists and is member of organization

**ClosingService**:
- `AssignmentRepository` - Get assignment details
- `OrderRepository` - Calculate expected amounts from orders
- `SessionRepository` - Validate session

**DashboardService**:
- `SessionRepository` - Get active sessions
- `AssignmentRepository` - Get assignments for session
- `BranchRepository` - Get branch details
- `OrderRepository` - Aggregate sales data
- `ProductRepository` - Get product details for ranking
- `MarketsApiClient` - Get user names for cashiers

### 3.3 Repository Layer Dependencies

**Database Session Management**:
- Use SQLAlchemy async session
- Pattern: Dependency injection via FastAPI `Depends()`

**Example**:
```python
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

async def get_db_session() -> AsyncSession:
    """Dependency to get database session"""
    async with async_session_maker() as session:
        yield session

class BranchRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, branch: Branch) -> Branch:
        self.session.add(branch)
        await self.session.commit()
        await self.session.refresh(branch)
        return branch
```

---

## 4. Infrastructure Dependencies

### 4.1 AWS CloudFormation

**Template Location**: `cross-app-be/cloudformation/template.yml`

**Required Resources**:
- Lambda function for API handlers
- API Gateway HTTP API
- RDS PostgreSQL instance (already exists)
- IAM roles and policies
- CloudWatch log groups

**Action Required**: Update CloudFormation template to include new API routes

### 4.2 API Gateway Routes

**Current Routes** (from `cross-app-be/api-gateway/endpoints.json`):
- `/api/organizations/{orgId}/products`
- `/api/organizations/{orgId}/categories`
- `/api/organizations/{orgId}/orders`
- (other existing routes)

**New Routes Required**:
```
# Branches
GET    /api/users/{userId}/organization/{orgId}/branches
POST   /api/users/{userId}/organization/{orgId}/branches
PATCH  /api/users/{userId}/organization/{orgId}/branches/{branchId}
DELETE /api/users/{userId}/organization/{orgId}/branches/{branchId}

# Terminals
GET    /api/users/{userId}/organization/{orgId}/terminals
POST   /api/users/{userId}/organization/{orgId}/terminals
PATCH  /api/users/{userId}/organization/{orgId}/terminals/{terminalId}
DELETE /api/users/{userId}/organization/{orgId}/terminals/{terminalId}

# Sessions
GET    /api/users/{userId}/organization/{orgId}/sessions
POST   /api/users/{userId}/organization/{orgId}/sessions
PATCH  /api/users/{userId}/organization/{orgId}/sessions/{sessionId}

# Assignments
GET    /api/users/{userId}/organization/{orgId}/assignments
POST   /api/users/{userId}/organization/{orgId}/assignments

# Closings
GET    /api/users/{userId}/organization/{orgId}/closings
POST   /api/users/{userId}/organization/{orgId}/closings
PATCH  /api/users/{userId}/organization/{orgId}/closings/{closingId}

# Dashboard
GET    /api/users/{userId}/organization/{orgId}/dashboard
```

### 4.3 Environment Variables

**Required Configuration**:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# Markets API Integration
MARKETS_API_URL=https://api.jcampos.dev

# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxx
AWS_REGION=us-east-1

# AWS Services
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx

# Application
ENVIRONMENT=production
LOG_LEVEL=INFO
```

**Configuration File**: `cross-app-be/.env` (local) or AWS Lambda environment variables (production)

---

## 5. Python Package Dependencies

### 5.1 Current Dependencies (requirements.txt)

✅ Already installed:
- `fastapi>=0.115.0` - Web framework
- `uvicorn[standard]>=0.34.0` - ASGI server
- `sqlalchemy>=2.0.0` - ORM
- `psycopg[binary]>=3.1.0` - PostgreSQL driver
- `alembic>=1.13.0` - Database migrations
- `boto3>=1.34.0` - AWS SDK
- `mangum>=0.17.0` - AWS Lambda adapter
- `httpx>=0.27.0` - HTTP client for API calls
- `tenacity>=8.0.0` - Retry logic
- `python-dotenv>=1.0.0` - Environment variables
- `jinja2>=3.1.0` - Template engine
- `openpyxl>=3.1.5` - Excel file handling
- `pdfkit>=1.0.0` - PDF generation

### 5.2 Missing Dependencies

❌ Need to add:
```
python-jose[cryptography]>=3.3.0  # JWT token validation
pydantic>=2.0.0                    # Data validation (if not already included with FastAPI)
```

**Action Required**: Update `requirements.txt` with missing dependencies

---

## 6. Frontend Integration Dependencies

### 6.1 Pollos Sales Frontend

**Location**: `BeautyMarket/templates/pollos-sales`  
**Technology**: React + TypeScript + Vite

**API Client Configuration**:
- Base URL: Environment variable `VITE_ORDERS_API_URL`
- Authentication: JWT token from Cognito (stored in localStorage)
- HTTP Client: `fetch` or `axios`

**Required API Calls**:
- Dashboard page: `GET /api/users/{userId}/organization/{orgId}/dashboard`
- Branches management: CRUD operations on branches
- Terminals management: CRUD operations on terminals
- Sessions management: CRUD operations on sessions
- Assignments management: CRUD operations on assignments
- Closings workflow: CRUD operations on closings

### 6.2 Authentication Flow

1. User logs in via Cognito (handled by Markets API)
2. Frontend receives JWT token
3. Frontend includes token in `Authorization: Bearer {token}` header
4. cross-app-be validates token via Cognito
5. cross-app-be extracts user_id from token claims
6. cross-app-be validates user has access to organization via Markets API

---

## 7. Testing Dependencies

### 7.1 Unit Testing

**Framework**: pytest (needs to be added to requirements.txt)

**Required Packages**:
```
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-cov>=4.1.0
httpx>=0.27.0  # Already installed, used for testing
```

**Mock Libraries**:
```
pytest-mock>=3.11.0
faker>=19.0.0  # For generating test data
```

### 7.2 Integration Testing

**Database**: Use PostgreSQL test database or SQLite in-memory

**Required Setup**:
- Test database connection string
- Alembic migrations applied to test database
- Fixtures for test data

**Example Test Structure**:
```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.models.branch import Branch

@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with AsyncSession(engine) as session:
        yield session

@pytest.mark.asyncio
async def test_create_branch(db_session):
    branch = Branch(
        organization_id="test-org",
        name="Test Branch",
        code="TB1",
        type="stand",
        created_by="test-user"
    )
    db_session.add(branch)
    await db_session.commit()
    assert branch.branch_id is not None
```

---

## 8. Deployment Dependencies

### 8.1 AWS SAM (Serverless Application Model)

**Configuration**: `cross-app-be/samconfig.toml`

**Build Process**:
1. Package Python dependencies
2. Build Lambda deployment package
3. Upload to S3
4. Deploy via CloudFormation

**Build Script**: `cross-app-be/scripts/build-lambda.sh`

### 8.2 CI/CD Pipeline

**AWS CodePipeline**: Configured in `cross-app-be/cloudformation/codepipeline.yml`

**Build Specs**:
- `buildspec-build.yml` - Build Lambda package
- `buildspec-api.yml` - Deploy API Gateway
- `buildspec-update.yml` - Update Lambda function

**Deployment Stages**:
1. Source: GitHub repository
2. Build: Package Lambda function
3. Deploy: Update CloudFormation stack

---

## 9. Migration Dependencies (biller-apps)

### 9.1 Source Code Location

**biller-apps branches service**: `E:\dev\biller-apps\branches`

**Technology Stack**:
- Python + AWS Lambda Powertools
- SQLAlchemy ORM
- PostgreSQL
- Redis (ElastiCache) for caching

### 9.2 Code to Migrate

**Models**:
- ✅ Branch model - Already migrated (simplified)
- ✅ Terminal model - Already migrated (simplified)
- ❌ Location model - Not needed (simplified to address field)
- ❌ Phone model - Not needed (simplified to phone field)

**Controllers**:
- ❌ BranchController - Need to implement
- ❌ TerminalController - Need to implement

**Services**:
- ❌ BranchService - Need to implement
- ❌ TerminalService - Need to implement

**Repositories**:
- ❌ BranchRepository - Need to implement
- ❌ TerminalRepository - Need to implement

**Utilities**:
- ❌ Search/filter logic - Need to implement (simplified)
- ❌ Caching decorators - Optional (can use FastAPI caching)

### 9.3 Schema Differences

| Aspect | biller-apps | cross-app-be |
|--------|-------------|--------------|
| Primary Keys | Integer auto-increment | UUID |
| Scoping | taxpayer_id (String) | organization_id (String) |
| Status | Integer enum (1/2/3) | Boolean is_active |
| Timestamps | created_on, updated_on | created_at, updated_at |
| Location | Separate table with FK | Embedded address field |
| Phone | Separate table with FK | Embedded phone field |

**Migration Strategy**: Adapt biller-apps logic to cross-app-be patterns (UUID, boolean status, embedded fields)

---

## 10. Summary of Dependencies

### External Services
- ✅ AWS Cognito - JWT authentication
- ✅ Markets API (BeautyMarket/server) - User/organization validation
- ✅ AWS Lambda - Serverless compute
- ✅ AWS API Gateway - HTTP routing
- ✅ AWS RDS PostgreSQL - Database
- ✅ AWS CloudFormation - Infrastructure as code

### Database
- ✅ PostgreSQL 13+ - Primary database
- ✅ SQLAlchemy 2.0 - ORM
- ✅ Alembic - Migrations
- ✅ psycopg - PostgreSQL driver

### Python Packages
- ✅ FastAPI - Web framework
- ✅ Mangum - Lambda adapter
- ✅ httpx - HTTP client
- ✅ tenacity - Retry logic
- ❌ python-jose - JWT validation (need to add)
- ❌ pytest - Testing (need to add)

### Internal Services
- ❌ BranchesController/Service/Repository - Need to implement
- ❌ TerminalsController/Service/Repository - Need to implement
- ❌ SessionsController/Service/Repository - Need to implement
- ❌ AssignmentsController/Service/Repository - Need to implement
- ❌ ClosingsController/Service/Repository - Need to implement
- ❌ DashboardController/Service - Need to implement

### Infrastructure
- ✅ API Gateway routes - Need to add new routes
- ✅ CloudFormation template - Need to update
- ✅ Environment variables - Need to configure

---

## 11. Implementation Priorities

### Phase 1: Core Dependencies (Week 1)
1. Add missing Python packages (python-jose, pytest)
2. Implement MarketsApiClient for user/organization validation
3. Implement JWT token validation middleware
4. Create database migration for branches/terminals tables (if not exists)

### Phase 2: Repository Layer (Week 1)
1. Implement BranchRepository
2. Implement TerminalRepository
3. Implement SessionRepository
4. Implement AssignmentRepository
5. Implement ClosingRepository

### Phase 3: Service Layer (Week 2)
1. Implement BranchService
2. Implement TerminalService
3. Implement SessionService
4. Implement AssignmentService
5. Implement ClosingService
6. Implement DashboardService

### Phase 4: Controller Layer (Week 2)
1. Implement BranchesController
2. Implement TerminalsController
3. Implement SessionsController
4. Implement AssignmentsController
5. Implement ClosingsController
6. Implement DashboardController

### Phase 5: Infrastructure (Week 3)
1. Update API Gateway routes
2. Update CloudFormation template
3. Configure environment variables
4. Deploy to dev environment
5. Integration testing with frontend

### Phase 6: Testing & Documentation (Week 3)
1. Write unit tests for all services
2. Write integration tests
3. Update API documentation
4. Update deployment documentation

---

## 12. Risk Assessment

### High Risk
- **Markets API Integration**: Dependency on external service for user validation
  - **Mitigation**: Implement caching, retry logic, fallback mechanisms
  
- **Database Schema Changes**: Potential conflicts with existing data
  - **Mitigation**: Use Alembic migrations, test in dev environment first

### Medium Risk
- **JWT Token Validation**: Security-critical component
  - **Mitigation**: Use well-tested library (python-jose), implement comprehensive tests

- **Dashboard Performance**: Complex aggregation queries
  - **Mitigation**: Use database indexes, implement caching, optimize queries

### Low Risk
- **API Route Conflicts**: New routes may conflict with existing routes
  - **Mitigation**: Follow consistent naming convention, test thoroughly

---

## 13. Next Steps

1. ✅ Review this dependencies document with team
2. ⬜ Add missing Python packages to requirements.txt
3. ⬜ Implement MarketsApiClient
4. ⬜ Implement JWT validation middleware
5. ⬜ Create/verify database migrations
6. ⬜ Begin repository layer implementation
7. ⬜ Update API Gateway configuration
8. ⬜ Configure environment variables

---

**Document Status**: Complete  
**Last Updated**: 2025-01-28  
**Next Review**: Before Phase 1 implementation begins
