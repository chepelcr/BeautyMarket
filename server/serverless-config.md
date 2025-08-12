# Serverless Authentication Configuration

## Overview
The system has been configured with JWT-based authentication suitable for serverless deployment. All session data is stored in the database rather than server memory.

## API Key Configuration

### Default Public API Key
For testing purposes, a default API key has been created:
- **API Key**: `sk-test123`
- **Usage**: Include in requests as:
  - Header: `X-API-Key: sk-test123`
  - Query parameter: `?api_key=sk-test123`

### Creating New API Keys
To create new API keys programmatically, use the `createApiKey` function from the serverless auth module.

## Protected Endpoints

### Admin-Only Endpoints (Require JWT Authentication)
- `POST /api/products` - Create products
- `PUT /api/products/:id` - Update products  
- `DELETE /api/products/:id` - Delete products
- `POST /api/categories` - Create categories
- `PUT /api/categories/:id` - Update categories
- `DELETE /api/categories/:id` - Delete categories
- `POST /api/upload/presigned` - S3 upload URLs
- `POST /api/deploy` - Auto-deployment
- `GET /api/deploy/status` - Deployment status
- `POST /api/objects/upload` - Object storage uploads

### Public Endpoints (Require API Key)
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `GET /api/orders` - List orders (if public)

### Unauthenticated Endpoints
- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user (returns 401 if not authenticated)
- `GET /api/home-content` - Public home page content

## Database Tables

### user_sessions
Stores JWT session data with token hashes for security.

### api_keys  
Stores API key configurations with permissions and rate limiting.

### users
Enhanced with `is_active` and `last_login` fields for better session management.

## Rate Limiting
- Default: 1000 requests per 15 minutes per IP
- Configurable per API key in the `api_keys` table

## Security Features
- JWT tokens with database-level validation
- API key authentication for public endpoints
- Rate limiting to prevent abuse
- Session invalidation on logout
- Automatic cleanup of expired sessions
- IP and user agent tracking for security auditing

## Deployment Notes
This configuration is fully compatible with serverless environments as:
- No server-side session storage required
- All authentication state is in the database
- Stateless JWT validation
- Horizontal scaling support