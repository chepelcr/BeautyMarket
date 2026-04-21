# Pollos Porteños Sales - Requirements Index

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

## Requirements Documents

The requirements have been split into logical modules for easier navigation and implementation:

### 1. Authentication and Routing
**File**: `01-authentication-and-routing.md`
- User Authentication (Req 1)
- Organization Selection (Req 2)
- Role-Based Routing (Req 3)
- Organization Template Validation (Req 41)

### 2. POS Cashier Interface
**File**: `02-pos-cashier-interface.md`
- Cashier Assignment Download (Req 4)
- Product Grid Display (Req 5)
- Shopping Cart Management (Req 6)
- Cash Payment Processing (Req 7)
- SINPE Payment Processing (Req 8)
- Card Payment Processing (Req 9)
- Inventory Opening (Req 13)
- Stock Depletion Tracking (Req 14)
- Cash Register Closing Flow (Req 15)

### 3. Offline Capabilities and Sync
**File**: `03-offline-and-sync.md`
- Sale Recording (Req 10)
- Offline Sale Storage (Req 11)
- Background Sync (Req 12)
- PWA Installation (Req 30)

### 4. Manager Dashboard
**File**: `04-manager-dashboard.md`
- Manager Dashboard Real-Time View (Req 16)
- Product Sales Ranking (Req 17)
- Payment Method Breakdown (Req 18)
- Closing Approval (Req 22)

### 5. Session and Product Management
**File**: `05-session-and-product-management.md`
- Session Configuration (Req 19)
- Product Management (Req 20)
- Branch-Scoped Sessions (Req 48)

### 6. Reports and Analytics
**File**: `06-reports-and-analytics.md`
- Match Report Generation (Req 23)
- Report History (Req 24)
- Analytics - Product Performance (Req 25)
- Analytics - Session Comparison (Req 26)
- Analytics - Vendor Performance (Req 27)
- Analytics - Context and Branch Analysis (Req 28)
- Data Export (Req 29)

### 7. User and Organization Management
**File**: `07-user-and-organization-management.md`
- User Management (Req 21)
- Organization Role Management (Req 42)
- User Invitation System (Req 43)
- Organization Member Management (Req 44)
- Branch Management (Req 45)
- Terminal Management (Req 46)
- Terminal Registration (Req 47)

### 8. Technical Requirements
**File**: `08-technical-requirements.md`
- Responsive Design - POS (Req 31)
- Responsive Design - Dashboard (Req 32)
- Environment Configuration (Req 33)
- API Integration (Req 34)
- Error Handling (Req 35)
- Loading States (Req 36)
- Form Validation (Req 37)
- Accessibility (Req 38)
- Performance (Req 39)
- Security (Req 40)
- Template Seed Data (Req 49)
- Landing Page (Req 50)

## Implementation Priority

### Phase 1: Core POS Functionality (MVP)
- Authentication and Routing (File 01)
- POS Cashier Interface (File 02)
- Offline Capabilities (File 03)

### Phase 2: Manager Tools
- Manager Dashboard (File 04)
- Session and Product Management (File 05)

### Phase 3: Advanced Features
- Reports and Analytics (File 06)
- User and Organization Management (File 07)

### Phase 4: Polish and Optimization
- Technical Requirements (File 08)

## API Endpoints Reference

### Markets API (`VITE_API_URL`)
- User authentication and profiles
- Organization management
- Memberships

### Orders API (`VITE_ORDERS_API_URL`)
- Products: `/api/organizations/{orgId}/products`
- Orders/Sales: `/api/organizations/{orgId}/orders`
- Inventory: `/api/organizations/{orgId}/inventory`
- Categories: `/api/organizations/{orgId}/categories`

### Template-Specific Endpoints (To Be Implemented)
- Assignments: `/api/users/{userId}/organization/{orgId}/assignments`
- Sessions: `/api/users/{userId}/organization/{orgId}/sessions`
- Closings: `/api/users/{userId}/organization/{orgId}/closings`
- Dashboard: `/api/users/{userId}/organization/{orgId}/dashboard`
- Branches: `/api/users/{userId}/organization/{orgId}/branches`
- Terminals: `/api/users/{userId}/organization/{orgId}/terminals`

## Notes

- The original monolithic requirements file has been preserved as `requirements.md`
- Each split file contains complete requirement specifications with user stories and acceptance criteria
- Files are numbered for logical reading order
- Cross-references between requirements are maintained within each file
