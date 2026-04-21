# Biller-Apps Branches Service - Code Review & Analysis

**Task**: 3.1 Review existing branches code in biller-apps  
**Date**: 2025-01-28  
**Reviewer**: Kiro AI Agent

## Executive Summary

The biller-apps branches service is a Python-based microservice using AWS Lambda Powertools, SQLAlchemy ORM, and PostgreSQL. It manages taxpayer branches (physical business locations) and terminals (point-of-sale devices) with full CRUD operations, status management, and search capabilities.

**Key Findings**:
- ✅ Well-structured service with clear separation of concerns (controllers, services, repositories, models, DTOs)
- ✅ Comprehensive API with REST endpoints for branches and terminals
- ✅ Advanced search/filter capabilities using custom GenericSpecification pattern
- ✅ Caching layer with Redis integration
- ✅ Proper validation and error handling
- ⚠️ Uses taxpayer-centric model (taxpayer_id) vs organization-centric (organization_id) needed for pollos-sales
- ⚠️ Complex location/residence model with foreign keys to location tables
- ⚠️ Status codes use integers (1=ACTIVE, 2=INACTIVE, 3=REMOVED) vs boolean is_active

---

## 1. Architecture Overview

### Technology Stack
- **Framework**: AWS Lambda Powertools (ALBResolver for routing)
- **ORM**: SQLAlchemy 2.x with typed mappings
- **Database**: PostgreSQL (via RDS)
- **Caching**: Redis (ElastiCache)
- **Validation**: Pydantic v2 for request/response DTOs
- **Logging**: AWS Lambda Powertools Logger with structured logging
- **Tracing**: AWS X-Ray via Lambda Powertools Tracer

### Service Structure
```
branches/
├── app.py                    # Lambda handler entry point
├── controllers/              # HTTP route handlers
│   ├── branch_controller.py
│   └── terminal_controller.py
├── services/                 # Business logic layer
│   ├── branch_service.py
│   └── terminal_service.py
├── repositories/             # Data access layer
│   ├── branch_repository.py
│   └── terminal_repository.py
├── models/                   # SQLAlchemy ORM models
│   ├── branch.py
│   ├── terminal.py
│   ├── location.py
│   └── phone.py
├── dtos/                     # Request/Response DTOs
│   ├── requests/
│   │   ├── branch_request_dto.py
│   │   └── terminal_request_dto.py
│   └── responses/
│       ├── branch_response_dto.py
│       └── terminal_response_dto.py
├── exceptions/               # Custom exceptions
├── enums/                    # Enumerations (status codes, etc.)
└── utils/                    # Utilities (search, cache, response)
```

---

## 2. Data Models

### 2.1 Branch Model

**Table**: `taxpayers_branches`

**SQLAlchemy Model** (`branches/models/branch.py`):
```python
class Branch(Base):
    __tablename__ = "taxpayers_branches"
    
    # Primary Key
    id: Mapped[int]                           # Auto-increment integer
    
    # Required Fields
    taxpayer_id: Mapped[str]                  # Taxpayer identifier (String 100)
    number: Mapped[int]                       # Branch number
    name: Mapped[str]                         # Branch name (String 255)
    status: Mapped[int]                       # 1=ACTIVE, 2=INACTIVE, 3=REMOVED
    
    # Optional Fields
    email: Mapped[Optional[str]]              # Contact email (String 255)
    complete_address: Mapped[Optional[str]]   # Full address (String 500)
    location_id: Mapped[Optional[int]]        # FK to locations table
    
    # Audit Timestamps
    created_on: Mapped[datetime]              # Creation timestamp (UTC)
    updated_on: Mapped[Optional[datetime]]    # Last update timestamp (UTC)
    deleted_on: Mapped[Optional[datetime]]    # Soft delete timestamp (UTC)
    
    # Relationships
    location: Mapped[Optional["Location"]]    # Location details
    phone: Mapped[Optional["Phone"]]          # Phone contact
    terminals: Mapped[list["Terminal"]]       # Child terminals
```

**Indexes**:
- `idx_branch_taxpayer_id` on `taxpayer_id`
- `idx_branch_taxpayer_number` on `(taxpayer_id, number)` - Composite unique constraint
- `idx_branch_location_id` on `location_id`
- `idx_branch_status` on `status`

**Key Characteristics**:
- Uses integer auto-increment primary key (not UUID)
- Taxpayer-scoped (taxpayer_id) not organization-scoped
- Soft delete support via deleted_on timestamp
- Complex location relationship via separate locations table
- Status is integer enum (1/2/3) not boolean

---

### 2.2 Terminal Model

**Table**: `taxpayers_terminals`

**SQLAlchemy Model** (`branches/models/terminal.py`):
```python
class Terminal(Base):
    __tablename__ = "taxpayers_terminals"
    
    # Primary Key
    id: Mapped[int]                           # Auto-increment integer
    
    # Foreign Keys
    branch_id: Mapped[int]                    # FK to taxpayers_branches (CASCADE)
    
    # Required Fields
    number: Mapped[int]                       # Terminal number
    name: Mapped[str]                         # Terminal name (String 255)
    status: Mapped[int]                       # 1=ACTIVE, 2=INACTIVE, 3=REMOVED
    
    # Audit Timestamps
    created_on: Mapped[datetime]              # Creation timestamp (UTC)
    updated_on: Mapped[Optional[datetime]]    # Last update timestamp (UTC)
    deleted_on: Mapped[Optional[datetime]]    # Soft delete timestamp (UTC)
    
    # Relationships
    branch: Mapped["Branch"]                  # Parent branch
    consecutives: Mapped[list["Consecutive"]] # Consecutive sequences
```

**Indexes**:
- `idx_terminal_branch_id` on `branch_id`
- `idx_terminal_branch_number` on `(branch_id, number)` - Composite unique constraint
- `idx_terminal_status` on `status`

**Key Characteristics**:
- Uses integer auto-increment primary key (not UUID)
- Branch-scoped (branch_id) with CASCADE delete
- Soft delete support via deleted_on timestamp
- Status is integer enum (1/2/3) not boolean
- Has relationship to consecutives (fiscal document numbering)

---

### 2.3 Supporting Models

#### Location Model
**Table**: `locations`

```python
class Location(Base):
    __tablename__ = "locations"
    
    id: Mapped[int]
    country_code: Mapped[str]                 # FK to countries
    state_id: Mapped[int]
    state_name: Mapped[str]
    county_id: Mapped[int]
    county_name: Mapped[str]
    district_id: Mapped[int]
    district_name: Mapped[str]
    created_on: Mapped[datetime]
```

**Purpose**: Stores hierarchical location data (country > state > county > district) for Costa Rica's administrative divisions.

#### Phone Model
**Table**: `taxpayers_branches_phones`

```python
class Phone(Base):
    __tablename__ = "taxpayers_branches_phones"
    
    id: Mapped[int]
    branch_id: Mapped[int]                    # FK to taxpayers_branches
    country_code: Mapped[str]                 # FK to countries
    phone_number: Mapped[str]
    phone_type: Mapped[int]                   # FK to phone_types
    created_on: Mapped[datetime]
    updated_on: Mapped[Optional[datetime]]
```

**Purpose**: Stores phone contact information for branches.

---

## 3. API Endpoints

### 3.1 Branch Endpoints

**Base Path**: `/taxpayers/{taxpayerId}/branches`

#### Create Branch
```
POST /taxpayers/{taxpayerId}/branches
```

**Request Body**:
```json
{
  "number": 1,
  "name": "Main Office",
  "residence": {
    "stateId": 1,
    "countyId": 10,
    "districtId": 100,
    "address": "123 Main Street, Building A"
  },
  "email": "branch@company.com",
  "phone": {
    "countryCode": "506",
    "areaCode": "2",
    "number": "22001234",
    "description": "Main Office"
  }
}
```

**Response**: `201 Created` with BranchResponseDTO

**Business Logic**:
1. Validates taxpayer exists
2. Validates location exists in locations table
3. Checks branch number doesn't already exist for taxpayer
4. Creates Location entity
5. Creates Branch entity (status always set to ACTIVE=1)
6. Creates Phone entity if provided
7. Returns complete branch with relationships

---

#### Update Branch
```
PUT /taxpayers/{taxpayerId}/branches/{branchNumber}
```

**Request Body**: Same as create (full replacement)

**Response**: `200 OK` with BranchResponseDTO

**Business Logic**:
1. Finds existing branch (active only)
2. Updates name, email, address
3. Updates location if provided
4. Updates or creates phone if provided
5. Sets updated_on timestamp

**Note**: Status cannot be changed via PUT, use PATCH endpoint

---

#### Change Branch Status
```
PATCH /taxpayers/{taxpayerId}/branches/{branchNumber}
```

**Request Body**:
```json
{
  "status": 2
}
```

**Valid Status Values**:
- `1` = ACTIVE
- `2` = INACTIVE
- `3` = REMOVED (only via soft delete, not API)

**Response**: `200 OK` with BranchResponseDTO

**Business Logic**:
1. Validates status is 1 or 2 (3 not allowed via API)
2. Updates branch status
3. **Cascades status change to all child terminals**
4. Returns updated branch

---

#### Get Branch
```
GET /taxpayers/{taxpayerId}/branches/{branchNumber}
```

**Response**: `200 OK` with BranchResponseDTO

**Includes**:
- Branch details
- Location/residence information
- Phone contact
- List of terminals (with consecutive sequences)

**Caching**: Results cached with key `branch-{taxpayer_id}-{branch_number}`

---

#### List Branches (Paginated with Search)
```
GET /taxpayers/{taxpayerId}/branches/all?search={filter}&size={size}&page={page}
```

**Query Parameters**:
- `search` (optional): Search filter string (see Search Syntax below)
- `size` (optional): Page size (default 10)
- `page` (optional): Page number, 0-indexed (default 0)

**Response**: `200 OK` with PageResponseDTO
```json
{
  "content": [...],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 25,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

**Caching**: Results cached with key `branch-list-{taxpayer_id}-{search}-{size}-{page}`

---

### 3.2 Terminal Endpoints

**Base Path**: `/taxpayers/{taxpayerId}/branches/{branchNumber}/terminals`

#### Create Terminal
```
POST /taxpayers/{taxpayerId}/branches/{branchNumber}/terminals
```

**Request Body**:
```json
{
  "number": 1,
  "name": "Cash Register 1"
}
```

**Response**: `201 Created` with TerminalResponseDTO

**Business Logic**:
1. Validates branch exists and is active
2. Checks branch is not INACTIVE (BranchNotAvailableException)
3. Checks terminal number doesn't already exist for branch
4. Creates Terminal entity (status always set to ACTIVE=1)
5. Returns terminal

---

#### Change Terminal Status
```
PATCH /taxpayers/{taxpayerId}/branches/{branchNumber}/terminals/{terminalNumber}
```

**Request Body**:
```json
{
  "status": 2
}
```

**Valid Status Values**: 1 (ACTIVE) or 2 (INACTIVE)

**Response**: `200 OK` with TerminalResponseDTO

---

#### Get Terminal
```
GET /taxpayers/{taxpayerId}/branches/{branchNumber}/terminals/{terminalNumber}
```

**Response**: `200 OK` with TerminalResponseDTO

**Includes**:
- Terminal details
- Consecutive sequences (fiscal document numbering)

**Caching**: Results cached with key `terminals-{taxpayer_id}-{branch_number}-{terminal_number}`

---

#### List Terminals (Paginated with Search)
```
GET /taxpayers/{taxpayerId}/branches/{branchNumber}/terminals/all?search={filter}&size={size}&page={page}
```

**Query Parameters**: Same as branches list

**Response**: `200 OK` with PageResponseDTO

**Caching**: Results cached with key `branch-terminals-list-{taxpayer_id}-{branch_number}-{search}-{size}-{page}`

---

## 4. Search/Filter Syntax

The service implements a powerful GenericSpecification-like pattern for dynamic filtering.

### 4.1 Search Operators

| Operator | Meaning | Example | SQL Equivalent |
|----------|---------|---------|----------------|
| `:` | Equal | `name:MainBranch` | `name = 'MainBranch'` |
| `!` | Not equal | `status!1` | `status != 1` |
| `<` | Less than | `number<5` | `number < 5` |
| `>` | Greater than | `number>1` | `number > 1` |
| `~` | Contains | `name~ana` | `name LIKE '%ana%'` |

### 4.2 Wildcards

| Pattern | Meaning | Example | SQL Equivalent |
|---------|---------|---------|----------------|
| `*text*` | Contains | `name:*ana*` | `name LIKE '%ana%'` |
| `text*` | Starts with | `name:Al*` | `name LIKE 'Al%'` |
| `*text` | Ends with | `name:*son` | `name LIKE '%son'` |

### 4.3 Logical Operators

- **AND**: Filters separated by comma outside parentheses (default)
  - Example: `name:MainBranch,status:1` → `name='MainBranch' AND status=1`

- **OR**: Filters inside parentheses
  - Example: `(name:A,name:B)` → `name='A' OR name='B'`

- **Mixed**: Combine AND/OR
  - Example: `name:branch,(number:2,number:3)` → `name='branch' AND (number=2 OR number=3)`

### 4.4 Ordering

- **Ascending**: `orderBy>field`
  - Example: `orderBy>number` → `ORDER BY number ASC`

- **Descending**: `orderBy<field`
  - Example: `orderBy<number` → `ORDER BY number DESC`

**Sortable Fields**:
- Branches: `number`
- Terminals: `number`

### 4.5 Search Variables

**Branches**:
- `name`: Branch name (case-insensitive, always uses LIKE)
- `number`: Branch number
- `status`: Status (1=ACTIVE, 2=INACTIVE, 3=REMOVED)
- `state`: State/Province ID (requires location join)

**Terminals**:
- `name`: Terminal name (case-insensitive, always uses LIKE)
- `number`: Terminal number
- `status`: Status (1=ACTIVE, 2=INACTIVE, 3=REMOVED)

### 4.6 Example Queries

```
# Simple AND
name:MainBranch,status:1

# Simple OR
(name:A,name:B)

# Mixed AND/OR
name:branch,(number:2,number:3)

# Wildcard search with ordering
name:*ana*,orderBy>number

# Status filter
status:1,orderBy<number

# Greater than
number>5,status:1
```

---

## 5. Business Logic Patterns

### 5.1 Status Management

**Status Codes** (from `enums/status_codes.py`):
```python
class StatusCodes:
    ACTIVE = 1      # Active and operational
    INACTIVE = 2    # Temporarily disabled
    REMOVED = 3     # Soft deleted (not accessible via API)
```

**Status Transition Rules**:
1. **Creation**: Always sets status to ACTIVE (1)
2. **API Changes**: Only ACTIVE (1) ↔ INACTIVE (2) allowed via PATCH
3. **Soft Delete**: Sets status to REMOVED (3) and deleted_on timestamp
4. **Cascade**: Changing branch status cascades to all child terminals

**Validation**:
- `is_valid_status(status)`: Checks if status is 1, 2, or 3
- `is_changeable_status(status)`: Checks if status is 1 or 2 (API-allowed)

---

### 5.2 Caching Strategy

**Cache Decorator** (`utils/cache_utils.py`):
```python
@cached_for("branch-{taxpayer_id}-{branch_number}")
def get_branch(taxpayer_id, branch_number):
    ...

@invalidate_cache("branch-*", "branch-list-*")
def save_branch(taxpayer_id, request):
    ...
```

**Cache Key Patterns**:
- `branch-{taxpayer_id}-{branch_number}`: Single branch
- `branch-list-{taxpayer_id}-{search}-{size}-{page}`: Branch list
- `terminals-{taxpayer_id}-{branch_number}-{terminal_number}`: Single terminal
- `branch-terminals-list-{taxpayer_id}-{branch_number}-*`: Terminal list

**Invalidation Strategy**:
- Wildcard invalidation on mutations (e.g., `branch-*` invalidates all branch caches)
- Cascading invalidation (updating branch invalidates terminal caches)

---

### 5.3 Error Handling

**Custom Exceptions** (`exceptions/`):
- `BranchNotFoundException`: Branch not found (404)
- `BranchFoundException`: Branch already exists (409)
- `BranchNotAvailableException`: Branch is INACTIVE (400)
- `BranchRequestException`: General branch operation error (500)
- `TerminalNotFoundException`: Terminal not found (404)
- `TerminalFoundException`: Terminal already exists (409)
- `TerminalNotAvailableException`: Terminal is INACTIVE (400)
- `TerminalRequestException`: General terminal operation error (500)
- `TaxpayerNotFoundException`: Taxpayer not found (404)
- `BadLocationException`: Invalid location data (400)
- `StatusNotFoundException`: Invalid status value (400)

**Exception Handling**:
- Centralized exception handlers registered in `PowertoolsConfig`
- Automatic HTTP status code mapping
- Structured error responses with error codes

---

### 5.4 Validation

**Request Validation** (Pydantic):
```python
class BranchRequestDTO(BaseModel):
    number: int = Field(..., ge=1)
    name: str = Field(..., min_length=1, max_length=200)
    residence: ResidenceRequestDTO
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[PhoneRequestDTO]
    
    @field_validator("name")
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name cannot be empty")
        return v
    
    @field_validator("email")
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v and not EMAIL_PATTERN.match(v):
            raise ValueError("Invalid email format")
        return v
```

**Business Validation**:
- Taxpayer existence check
- Location existence check (via LocationDAO)
- Uniqueness checks (taxpayer+branch_number, branch+terminal_number)
- Status transition validation
- Branch availability check for terminal operations

---

## 6. Response DTOs

### 6.1 BranchResponseDTO

```json
{
  "id": 1,
  "number": 1,
  "name": "Main Office",
  "residence": {
    "id": 1,
    "countryCode": "CR",
    "countryName": "Costa Rica",
    "stateId": 1,
    "stateName": "San Jose",
    "countyId": 10,
    "countyName": "Central",
    "districtId": 100,
    "districtName": "Carmen",
    "address": "123 Main Street, Building A"
  },
  "email": "branch@company.com",
  "phone": {
    "countryCode": "506",
    "areaCode": "2",
    "number": "22001234",
    "description": "Main Office"
  },
  "createdOn": "2024-01-15T10:30:00Z",
  "updatedOn": "2024-01-16T14:45:00Z",
  "deletedOn": null,
  "status": 1,
  "terminals": [
    {
      "terminalId": 1,
      "branchNumber": 1,
      "name": "Cash Register 1",
      "number": 1,
      "status": 1,
      "consecutiveSequence": [...]
    }
  ]
}
```

**Field Naming Convention**: camelCase (via Pydantic alias)

**Timestamp Format**: ISO 8601 with timezone (e.g., `2024-01-15T10:30:00Z`)

**Null Handling**: 
- `deletedOn` only included when not null (matches Java `@JsonInclude(NON_NULL)`)
- Optional fields omitted when null

---

### 6.2 TerminalResponseDTO

```json
{
  "terminalId": 1,
  "branchNumber": 1,
  "name": "Cash Register 1",
  "number": 1,
  "consecutiveSequence": [
    {
      "documentType": 1,
      "branchName": "Main Office",
      "branchNumber": 1,
      "terminalName": "Cash Register 1",
      "terminalNumber": 1,
      "number": 1001
    }
  ],
  "createdOn": "2024-01-15T10:30:00Z",
  "updatedOn": "2024-01-16T14:45:00Z",
  "status": 1
}
```

**Note**: `consecutiveSequence` contains fiscal document numbering information (Costa Rica tax compliance)

---

## 7. Migration Considerations

### 7.1 Schema Differences

| Aspect | biller-apps | cross-app-be (target) |
|--------|-------------|------------------------|
| **Primary Keys** | Integer auto-increment | UUID |
| **Scoping** | taxpayer_id (String) | organization_id (UUID) |
| **Status** | Integer enum (1/2/3) | Boolean is_active |
| **Timestamps** | created_on, updated_on, deleted_on | created_at, updated_at |
| **Field Naming** | snake_case in DB, camelCase in API | snake_case everywhere |
| **Location** | Separate locations table with FK | Embedded address field |
| **Phone** | Separate phones table with FK | Optional embedded field |

### 7.2 Simplification Opportunities

**For pollos-sales migration**:

1. **Remove Location Complexity**:
   - Replace `location_id` FK with simple `address` text field
   - Remove dependency on locations table
   - Remove LocationDAO and location validation

2. **Remove Phone Complexity**:
   - Replace `phone` relationship with simple `phone` text field
   - Remove phones table and PhoneRepository

3. **Simplify Status**:
   - Replace integer status (1/2/3) with boolean `is_active`
   - Remove REMOVED status (use hard delete or separate deleted_on)

4. **Change Scoping**:
   - Replace `taxpayer_id` with `organization_id`
   - Update all queries and indexes

5. **Standardize Naming**:
   - Rename `created_on` → `created_at`
   - Rename `updated_on` → `updated_at`
   - Use snake_case in API responses (not camelCase)

6. **Remove Consecutives**:
   - Remove consecutive sequences (fiscal document numbering)
   - Not needed for pollos-sales use case

---

### 7.3 Core Functionality to Preserve

✅ **Keep**:
- CRUD operations for branches and terminals
- Pagination support
- Search/filter capabilities (simplified)
- Status management (simplified to boolean)
- Cascade status changes (branch → terminals)
- Soft delete support
- Audit timestamps
- Caching strategy
- Error handling patterns
- Service/Repository/Controller separation

❌ **Remove**:
- Location table relationship
- Phone table relationship
- Consecutive sequences
- Taxpayer validation
- Complex search operators (simplify to basic filters)

---

## 8. API Contract Summary

### 8.1 Branch Operations

| Method | Endpoint | Purpose | Status Codes |
|--------|----------|---------|--------------|
| POST | `/taxpayers/{taxpayerId}/branches` | Create branch | 201, 400, 409 |
| PUT | `/taxpayers/{taxpayerId}/branches/{branchNumber}` | Update branch | 200, 400, 404 |
| PATCH | `/taxpayers/{taxpayerId}/branches/{branchNumber}` | Change status | 200, 400, 404 |
| GET | `/taxpayers/{taxpayerId}/branches/{branchNumber}` | Get branch | 200, 404 |
| GET | `/taxpayers/{taxpayerId}/branches/all` | List branches | 200, 400 |

### 8.2 Terminal Operations

| Method | Endpoint | Purpose | Status Codes |
|--------|----------|---------|--------------|
| POST | `/taxpayers/{taxpayerId}/branches/{branchNumber}/terminals` | Create terminal | 201, 400, 404, 409 |
| PATCH | `/taxpayers/{taxpayerId}/branches/{branchNumber}/terminals/{terminalNumber}` | Change status | 200, 400, 404 |
| GET | `/taxpayers/{taxpayerId}/branches/{branchNumber}/terminals/{terminalNumber}` | Get terminal | 200, 404 |
| GET | `/taxpayers/{taxpayerId}/branches/{branchNumber}/terminals/all` | List terminals | 200, 400, 404 |

---

## 9. Recommended Migration Path

### Phase 1: Schema Adaptation
1. Create simplified PostgreSQL schema in cross-app-be
2. Replace taxpayer_id with organization_id (UUID)
3. Replace integer status with boolean is_active
4. Remove location_id FK, add address text field
5. Remove phone relationship, add phone text field
6. Rename timestamp fields (created_on → created_at)

### Phase 2: Model Migration
1. Copy Branch and Terminal models
2. Adapt to new schema (UUID PKs, organization_id, is_active)
3. Remove Location and Phone relationships
4. Update field types and names

### Phase 3: Repository Migration
1. Copy BranchRepository and TerminalRepository
2. Update queries for new schema
3. Simplify search/filter logic (remove complex operators)
4. Update pagination logic

### Phase 4: Service Migration
1. Copy BranchService and TerminalService
2. Remove taxpayer validation
3. Remove location validation
4. Simplify status management (boolean)
5. Update caching keys

### Phase 5: Controller Migration
1. Copy BranchController and TerminalController
2. Update route patterns (organization_id instead of taxpayer_id)
3. Update request/response DTOs
4. Simplify search parameters

### Phase 6: Testing
1. Unit tests for repositories
2. Unit tests for services
3. Integration tests with PostgreSQL
4. API endpoint tests

---

## 10. Key Takeaways

### Strengths
✅ Clean architecture with separation of concerns  
✅ Comprehensive error handling  
✅ Advanced search/filter capabilities  
✅ Proper caching strategy  
✅ Well-documented code  
✅ Type-safe with Pydantic and SQLAlchemy 2.x  

### Challenges for Migration
⚠️ Complex location/phone relationships need simplification  
⚠️ Taxpayer-centric model needs organization-centric adaptation  
⚠️ Integer status codes need boolean conversion  
⚠️ CamelCase API responses need snake_case conversion  
⚠️ Consecutive sequences not needed for pollos-sales  

### Estimated Migration Effort
- **Schema Design**: 1 day
- **Model Migration**: 1 day
- **Repository Migration**: 1 day
- **Service Migration**: 2 days
- **Controller Migration**: 1 day
- **Testing**: 2 days
- **Total**: ~8 days (1.5 weeks)

---

## Appendix A: File Locations

### Models
- `branches/models/branch.py` - Branch ORM model
- `branches/models/terminal.py` - Terminal ORM model
- `branches/models/location.py` - Location ORM model
- `branches/models/phone.py` - Phone ORM model

### Controllers
- `branches/controllers/branch_controller.py` - Branch HTTP endpoints
- `branches/controllers/terminal_controller.py` - Terminal HTTP endpoints

### Services
- `branches/services/branch_service.py` - Branch business logic
- `branches/services/terminal_service.py` - Terminal business logic

### Repositories
- `branches/repositories/branch_repository.py` - Branch data access
- `branches/repositories/terminal_repository.py` - Terminal data access

### DTOs
- `branches/dtos/requests/branch_request_dto.py` - Branch request DTO
- `branches/dtos/responses/branch_response_dto.py` - Branch response DTO
- `branches/dtos/requests/terminal_request_dto.py` - Terminal request DTO
- `branches/dtos/responses/terminal_response_dto.py` - Terminal response DTO

### Utilities
- `branches/utils/search_utils.py` - Search/filter implementation
- `branches/utils/cache_utils.py` - Caching decorators
- `branches/utils/response_utils.py` - Response formatting

### Entry Point
- `branches/app.py` - Lambda handler and route registration

---

**End of Review Document**
