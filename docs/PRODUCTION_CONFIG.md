# Production Configuration Guide

## API URL Configuration for S3 Deployment

When deploying the frontend to S3, you need to configure the API base URL to point to your backend server.

### Current Configuration (Development)
**File:** `client/src/lib/config.ts`
**Line 12-14:** 
```typescript
// API base URL - points to development server for S3 deployment
// CHANGE THIS: Update to your production API URL when moving to production
apiBaseUrl: import.meta.env.DEV ? '' : 'https://rest-express-u28s.replit.app',
```

### For Production Deployment
1. **Replace the URL** in `client/src/lib/config.ts` with your production backend URL
2. **Current setting**: Points to Replit development server
3. **For production**: Change to your actual production API server (e.g., AWS Lambda, Heroku, etc.)

### Example Production Update:
```typescript
apiBaseUrl: import.meta.env.DEV ? '' : 'https://your-production-api.com',
```

### CORS Configuration
Remember to update your backend CORS settings to allow requests from:
- `https://d1taomm62uzhjk.cloudfront.net` (your CloudFront distribution)
- `https://strawberry-page.s3-website.us-east-1.amazonaws.com` (S3 website)

### Environment Variables (Alternative)
You can also use environment variables:
```typescript
apiBaseUrl: import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL || 'https://rest-express-u28s.replit.app',
```

Then set `VITE_API_URL` in your build environment.