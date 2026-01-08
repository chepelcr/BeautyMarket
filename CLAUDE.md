# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Security Guidelines

**CRITICAL: Never include sensitive information in code or documentation**

- ❌ **DO NOT** hardcode credentials, API keys, tokens, or passwords in code
- ❌ **DO NOT** commit sensitive values to git (use .env files which are gitignored)
- ❌ **DO NOT** include specific credentials in documentation (README, CLAUDE.md, CHANGES.md, etc.)
- ❌ **DO NOT** expose User Pool IDs, Client IDs, database URLs, or AWS account IDs in commits
- ✅ **DO** use environment variables for all sensitive configuration
- ✅ **DO** reference that credentials exist in .env files without showing actual values
- ✅ **DO** use placeholder examples like `your-key-here` or `xxxxx` in documentation
- ✅ **DO** validate that .env files are in .gitignore before committing

**Example - Bad:**
```md
User Pool ID: us-east-1_BUlvy0W4q
Database URL: postgresql://user:pass@host.com/db
```

**Example - Good:**
```md
User Pool ID: Available in .env as AWS_COGNITO_USER_POOL_ID
Database URL: Configure in .env as NEW_DATABASE_URL
```

### Authentication & Email Verification

**📘 See [AUTH_FLOW.md](./AUTH_FLOW.md)** for complete authentication flow documentation.

**Security measures:**
- ✅ Email verification required before accessing the system
- ✅ Verification status checked on every profile fetch
- ✅ Unverified users automatically logged out
- ✅ Automatic user sync from Cognito to database for verified users
- ✅ Cognito is the single source of truth for authentication

**Validation flow:**
1. User logs in via AWS Cognito
2. Backend checks email verification status in Cognito
3. If unverified → Return 403 with `needsVerification: true`
4. If verified but not in DB → Auto-sync from Cognito
5. If verified and in DB → Return user profile

## Development Commands

### Server Management (Background Mode)

The server can run in **background mode** (silent, terminal stays available):

```bash
# Start server in background
./reboot-server.sh           # Kills existing processes, starts server in background
                             # Output redirected to logs/server.log
                             # Terminal immediately available

# View server logs
./view-logs.sh               # Real-time log viewing (tail -f logs/server.log)
tail -f logs/server.log      # Alternative direct command

# Stop server
./stop-server.sh             # Gracefully stop background server
pkill -f "tsx server"        # Alternative direct command

# Check server status
ps aux | grep "tsx server"   # View running server process
```

**How it works:**
- `reboot-server.sh` uses `nohup` and redirects output to `logs/server.log`
- Process continues even if terminal is closed
- Logs directory is gitignored automatically
- Shows process ID and helpful commands on startup

### NPM Scripts

```bash
# Development
npm run dev              # Start backend server (port 5000)
npm run dev:landing      # Start landing page client (port 3001)
npm run dev:all          # Start both backend and landing client concurrently

# Building
npm run build            # Build all: store client, landing client, and server
npm run build:store      # Build store management dashboard (Vite → dist/public)
npm run build:landing    # Build landing page (Vite → dist/landing)
npm run build:server     # Build Express server (esbuild → dist/index.js)
npm run build:lambda     # Build Lambda function (esbuild → dist/lambda.js)

# Type Checking
npm run check            # TypeScript type checking without emitting files

# Database Migrations (Drizzle ORM)
npm run db:push          # Push schema changes to database (⚠️ destructive in dev)
npm run db:generate      # Generate migration files from schema
npm run db:migrate       # Run pending migrations
```

### Deployment Scripts

```bash
# Infrastructure
./deploys/deploy-all.sh              # Full infrastructure deployment (15-25 min)
./deploys/deploy-iam.sh              # Deploy IAM users and policies
./deploys/deploy-cognito.sh          # Deploy Cognito authentication stack
./deploys/deploy-lambda.sh           # Deploy Lambda function with SAM
./deploys/deploy-api-gateway.sh      # Deploy API Gateway + custom domain
./deploys/deploy-client.sh           # Deploy static website (S3 + CloudFront)
./deploys/deploy-pipeline.sh         # Deploy CI/CD pipeline

# Utilities
./deploys/add-ses-emails.sh          # Add/verify emails in SES for development
```

## Multi-Tenant Architecture

This application uses a sophisticated multi-tenant architecture where each organization gets isolated data and optional custom domains/subdomains.

### Organization Context Resolution

The `organizationContext` middleware (`server/src/middleware/organizationContext.ts`) resolves which organization a request belongs to by checking **5 sources in priority order**:

1. **Route parameters**: `/api/user/:userId/organization/:orgId` → Direct orgId lookup
2. **X-Organization-ID header**: Explicit organization selection
3. **Subdomain**: `storename.jmarkets.jcampos.dev` → Organization lookup by subdomain
4. **Custom domain**: `www.customstore.com` → Organization lookup by custom domain
5. **Query parameter**: `?organizationId=xyz` → For testing/development only

Once resolved, the middleware populates the request object:
```typescript
req.organization      // Full organization object
req.organizationId    // Organization ID
req.userRole          // User's role in this organization
req.isOwner           // Boolean: is user the owner?
req.isAdmin           // Boolean: is user owner or admin?
```

### Frontend Subdomain Detection

The client detects subdomains using `client/src/lib/subdomain.ts`:
- `getSubdomain()` extracts subdomain from `window.location.hostname`
- `SubdomainProvider` in `App.tsx` calls `/api/organizations/by-subdomain/:subdomain`
- Organization context flows to all components via `useSubdomainContext()`

## API Route Structure

The backend uses a **three-tier URL structure** for multi-tenant isolation:

### Organization-Scoped Routes
```
/api/users/:userId/organization/:orgId/...
```

Requires authentication and organization membership. Examples:
- `/api/users/123/organization/456/products` - Product management
- `/api/users/123/organization/456/categories` - Category management
- `/api/users/123/organization/456/orders` - Order management
- `/api/users/123/organization/456/home-content` - CMS content
- `/api/users/123/organization/456/deployments` - Deployment history
- `/api/users/123/organization/456/upload` - S3 file uploads
- `/api/users/123/organization/456/rbac` - RBAC management

**Security Model (Lambda/API Gateway)**:
- ✅ **API Gateway** validates JWT signature and token expiration
- ✅ **API Gateway** validates `userId` in path matches JWT `sub` claim
- ✅ **Database queries** enforce user-scoping via WHERE clauses
- ❌ **No Express middleware** for auth (handled at infrastructure layer)

**Local Development**: Authentication still validated via `requireAuth` middleware

### User-Scoped Routes
```
/api/users/:userId/...
```

Requires authentication, no specific organization. Examples:
- `/api/users/123/profile` - User profile (auto-syncs from Cognito if verified)
- `/api/users/123/verify-email-complete` - Complete email verification
- `/api/users/123/organizations` - User's organizations
- `/api/users/123/memberships` - Organization memberships

**Security Model**: Same as organization-scoped routes (API Gateway validates userId)

### Public Routes
```
/api/...
```

No authentication required. Examples:
- `/api/health` - Health check
- `/api/organizations/check-slug/:slug` - Slug availability
- `/api/organizations/by-subdomain/:subdomain` - Organization lookup
- `/api/invitations/token/:token` - Get invitation details
- `/api/invitations/accept/:token` - Accept organization invitation

## Backend Architecture

### Three-Tier Pattern

The server follows strict separation of concerns:

```
Controllers (server/src/controllers/)
    ↓ (receive HTTP requests, validate input)
Services (server/src/services/)
    ↓ (business logic, orchestration)
Repositories (server/src/repositories/)
    ↓ (data access, Drizzle ORM queries)
Database (PostgreSQL via Supabase)
```

### Dependency Injection

All dependencies are wired in `server/src/dependency_injection.ts` using manual singleton pattern:

```typescript
// 1. Create repositories
const productRepository = new ProductRepository();

// 2. Create services with injected repositories
const productService = new ProductService(productRepository, categoryRepository);

// 3. Create controllers with injected services
const productController = new ProductController(productService, preDeploymentService);

// 4. Export for use in routes
export { productController };
```

### RBAC System

**Hierarchical permission model**: `Role → Module → Submodule → Action`

- **Modules**: Top-level features (products, orders, customers, etc.)
- **Submodules**: Feature subdivisions (e.g., products.inventory, products.pricing)
- **Actions**: Operations (create, read, update, delete, export, etc.)
- **Roles**: Organization-scoped or system-wide (owner, admin, member)

**Permission checking** (`server/src/middleware/permissions.ts`):
```typescript
requirePermission('products', 'create', 'inventory')
requireAnyPermission([...permissions])
requireAllPermissions([...permissions])
```

**Role-based guards**:
- `requireOrganizationOwner()` - Owner role only
- `requireOrganizationAdmin()` - Admin or owner
- `requireOrganizationMembership()` - Any member

## Frontend Architecture

### Dual Client Setup

This project has **two separate React applications**:

1. **landing-client/** - Marketing site + authentication flows
   - Port: 3001 in development
   - Routes: Landing, login, register, verify email, forgot/reset password, create organization
   - Purpose: Public-facing site and auth before store access
   - Build output: `dist/landing/`

2. **client/** - Store management dashboard
   - Port: 5173 in development (Vite default)
   - Routes: Admin dashboard, products, categories, orders, CMS, settings
   - Purpose: Store owners manage their organization
   - Build output: `dist/public/`

Both use the same tech stack (React 18, Vite, Wouter, Tailwind, Radix UI) but serve different purposes.

### Frontend Standards & Patterns

**📘 See [FRONTEND_STANDARDS.md](./FRONTEND_STANDARDS.md) for comprehensive frontend patterns including:**
- Translation system (i18n with LanguageContext)
- Styling standards (Tailwind CSS + CSS variables)
- Component architecture patterns
- Form validation patterns (React Hook Form + Zod)
- State management guidelines
- Custom hooks patterns
- Complete code examples

**Key highlights:**
- **Translation**: Custom LanguageContext in landing-client (840+ keys), client needs standardization
- **Styling**: Tailwind CSS with HSL-based CSS variables for theming, dark mode via class-based approach
- **Forms**: React Hook Form + Zod validation for all forms
- **Components**: Shadcn/ui component library based on Radix UI primitives
- **State**: React Query (server), Zustand (client persistent), Context (UI global), useState (local)

### State Management

**Server State**: TanStack React Query (`client/src/lib/queryClient.ts`)
- 5-minute stale time for queries
- Automatic AWS Cognito token injection via custom `queryFn`
- Mutations invalidate related queries on success

**Client State**: Zustand for cart (`client/src/store/cart.ts`)
- Persisted to localStorage
- Actions: addToCart, removeFromCart, updateQuantity, clearCart

### Custom Hooks

- `useAuth()` (`client/src/hooks/useAuth.ts`) - Authentication lifecycle with AWS Cognito
  - **📘 See [AUTH_FLOW.md](./AUTH_FLOW.md)** for complete authentication flow documentation
  - Handles login, registration, email verification, and user profile management
  - Automatic user sync from Cognito to database
  - Email verification validation on every profile fetch
- `useOrganization()` (`client/src/hooks/useOrganization.ts`) - Organization CRUD, members, invitations
- `useCmsContent()` (`client/src/hooks/use-cms-content.tsx`) - Dynamic CMS content loading
- `useSubdomainContext()` - Access current tenant organization from context

### API Integration Pattern

URL builders in `client/src/lib/apiUtils.ts` construct the three-tier API structure:

```typescript
buildOrgApiUrl(userId, orgId, '/products')
  → '/api/user/123/organization/456/products'

buildUserApiUrl(userId, '/organizations')
  → '/api/user/123/organizations'

buildPublicApiUrl('/organizations/check-slug/my-org')
  → '/api/organizations/check-slug/my-org'
```

All requests automatically include AWS Cognito JWT tokens via React Query's `queryFn`.

## Database (Drizzle ORM)

### Schema Location
All entity definitions are in `server/src/entities/`:
- `Organization.ts` - Multi-tenant store representation
- `Product.ts`, `Category.ts`, `Order.ts` - Core commerce entities
- `User.ts`, `OrganizationMember.ts` - User and membership
- `Role.ts`, `RolePermission.ts`, `Module.ts`, `Action.ts` - RBAC entities
- `HomePageContent.ts` - CMS content

### Migration Workflow

**Configuration**: `drizzle.config.ts` points to `server/src/entities/index.ts`

```bash
# Development: Push schema changes directly (⚠️ can lose data)
npm run db:push

# Production: Generate migration files
npm run db:generate  # Creates migrations/*.sql
# Then manually review and apply migrations
```

### Key Relationships

```
User ←→ OrganizationMember ←→ Organization
                ↓
              Role → RolePermission → Module/Action

Organization → Product → Category
Organization → Order
Organization → HomePageContent
```

## AWS Deployment Architecture

### CloudFormation Stack Order

**CRITICAL**: Stacks must be deployed in this exact order due to cross-stack dependencies:

1. **IAM** (`cloudformation/iam.yml`) - **Deploy FIRST**
   - Managed policy with all backend permissions (Cognito, S3, SES, CloudFront, etc.)
   - IAM user for local development (`strawberry-be-{env}`)
   - Access keys for development
   - Outputs: Policy ARN (imported by Lambda), Access credentials
   - **Usage**: `./deploys/deploy-iam.sh`
   - **Note**: Displays access credentials ONCE - save immediately!

2. **Cognito** (`cloudformation/cognito.yml`)
   - User Pool, User Pool Client, Identity Pool
   - SES email configuration for verification emails
   - Outputs: UserPoolId, UserPoolClientId used by Lambda

3. **Pipeline Roles** (`cloudformation/pipeline-roles.yml`)
   - CodeBuild role, CodePipeline role, S3 artifacts bucket
   - Outputs: Role ARNs used by CodePipeline stack

4. **Lambda** (`cloudformation/template.yaml` - SAM format)
   - Node.js 20.x Lambda function for API backend
   - Imports managed policy ARN from IAM stack (or uses inline policies)
   - Requires Cognito outputs, database URL, SES credentials
   - Outputs: Lambda ARN used by API Gateway

5. **API Gateway** (`cloudformation/api-gateway.yml`)
   - REST API with Lambda proxy integration
   - JWT authorizer validates Cognito tokens
   - ACM certificate + custom domain (api.jmarkets.jcampos.dev)
   - Route53 DNS records

6. **Static Website** (`cloudformation/static-website.yml`)
   - S3 bucket + CloudFront distribution
   - SPA error handling (404/403 → index.html)

7. **CodePipeline** (`cloudformation/codepipeline.yml`)
   - GitHub integration via CodeStar Connection
   - CodeBuild for automated Lambda updates
   - Triggered on push to main branch

### Deployment Scripts

**Master orchestrator**: `./deploys/deploy-all.sh` runs all 7 stacks sequentially with validation.

**IAM Policy Management**:
- Local development uses IAM user credentials from `deploy-iam.sh`
- Lambda function imports the same managed policy ARN (shared permissions)
- Policy includes: Cognito (with `ListUsers`), S3, SES, CloudFront, Route53, Secrets Manager
- See `cloudformation/IAM_DEPLOYMENT.md` for detailed deployment guide

**Individual deployment**: Each stack has its own script (`deploy-cognito.sh`, `deploy-lambda.sh`, etc.)

**CI/CD Flow**:
```
Git push to main
  → GitHub webhook triggers CodePipeline
  → CodeBuild runs buildspec.yml
    → npm ci
    → sam build
    → sam deploy
  → Lambda function updated
```

## Important Patterns to Understand

### Security-at-the-Edges Pattern

**Lambda + API Gateway Deployment:**
- ✅ API Gateway validates JWT and enforces `userId` path matching
- ✅ Database queries enforce user/organization scoping in WHERE clauses
- ❌ No Express middleware for authentication (handled at infrastructure layer)
- ✅ Business logic focuses purely on data operations

**Local Development:**
- ✅ `requireAuth` middleware validates JWT tokens
- ✅ Optional: `organizationContext` and `userContext` middleware (currently removed)
- ✅ Consistent security model via database query scoping

**Migration Note**: Authentication middleware (`requireAuth`, `organizationContextMiddleware`, `userContextMiddleware`) were removed in favor of infrastructure-layer security (API Gateway). The `organizationContext.ts` file remains for reference but is not actively used in routes.

Located in: `server/src/middleware/organizationContext.ts` (historical reference only)

### Permission Checking Pattern

RBAC permissions are checked at the route level:

```typescript
router.post(
  '/',
  permissionMiddleware.requirePermission('products', 'create'),
  productController.create.bind(productController)
);
```

Special roles:
- `platform_admin` - Has all permissions globally
- `owner` - Full control within organization
- `admin` - Management privileges within organization

Located in: `server/src/middleware/permissions.ts`

### Frontend Auth Token Injection

React Query automatically injects AWS Cognito tokens into all API requests:

1. Custom `queryFn` in `queryClient.ts` wraps all queries
2. Calls `fetchAuthSession()` from aws-amplify/auth
3. Extracts ID token from session
4. Adds `Authorization: Bearer <token>` header
5. Backend validates token via Cognito

Located in: `client/src/lib/queryClient.ts`

### Subdomain-to-Organization Resolution

**Frontend flow** (Active):
1. App loads → `getSubdomain()` detects subdomain from hostname
2. `SubdomainProvider` calls public API: `/api/organizations/by-subdomain/:subdomain`
3. Organization data stored in React context
4. Components access via `useSubdomainContext()`
5. All organization-scoped API calls include orgId from context

**Backend flow** (Simplified):
1. Controllers receive `orgId` from route path (`/api/users/:userId/organization/:orgId/...`)
2. Services use `orgId` directly in database queries with user-scoping
3. No middleware resolution needed (orgId is explicit in URL)

**Legacy approach**: Previously used `organizationContext` middleware to auto-detect org from subdomain/header/query. Now frontend passes orgId explicitly in URL path for clarity.

Located in:
- Frontend: `client/src/lib/subdomain.ts`, `client/src/App.tsx`
- Backend: Controllers receive orgId via path params
