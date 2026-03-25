# AWS Lambda Deployment Guide

This guide covers deploying the Strawberry Essentials API to AWS Lambda using both Serverless Framework and Docker.

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **Node.js 20+** installed
3. **Docker** (for container deployment)
4. **Serverless Framework** globally installed: `npm install -g serverless`

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Object Storage (optional)
PRIVATE_OBJECT_DIR=/your-bucket/private
PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket/public,/your-bucket/assets
```

## Deployment Methods

### Method 1: Serverless Framework (Recommended)

#### 1. Install Dependencies
```bash
npm install -g serverless
npm install
```

#### 2. Configure AWS Credentials
```bash
# Option A: AWS CLI
aws configure

# Option B: Environment variables
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
```

#### 3. Deploy to Development
```bash
npm run deploy:lambda:dev
```

#### 4. Deploy to Production
```bash
npm run deploy:lambda:prod
```

#### 5. Test Locally
```bash
npm run lambda:local
```

### Method 2: Docker + AWS Lambda Container Images

#### 1. Build Docker Image
```bash
npm run docker:build
```

#### 2. Test Locally
```bash
npm run docker:run
# API available at http://localhost:9000/2015-03-31/functions/function/invocations
```

#### 3. Deploy to AWS ECR and Lambda
```bash
# Create ECR repository
aws ecr create-repository --repository-name strawberry-essentials-api --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push image
docker tag strawberry-essentials-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/strawberry-essentials-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/strawberry-essentials-api:latest

# Create Lambda function
aws lambda create-function \
  --function-name strawberry-essentials-api \
  --package-type Image \
  --code ImageUri=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/strawberry-essentials-api:latest \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role
```

## API Gateway Configuration

The Lambda function will be accessible through API Gateway with the following endpoints:

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/logout` - User logout  
- `GET /api/user` - Get current user

### Product Management (Admin Only)
- `GET /api/products` - List products (requires API key)
- `POST /api/products` - Create product (requires admin auth)
- `PUT /api/products/{id}` - Update product (requires admin auth)
- `DELETE /api/products/{id}` - Delete product (requires admin auth)

### Content Management (Admin Only)
- `GET /api/home-content` - Get CMS content
- `POST /api/home-content/bulk` - Bulk update content (requires admin auth)
- `POST /api/deploy` - Auto-deploy to S3 (requires admin auth)

### Public Endpoints
- `POST /api/orders` - Create order
- `GET /api/categories` - List categories (requires API key)
- `GET /api/locations/provinces` - Costa Rica locations

### Documentation
- `GET /docs` - Swagger UI documentation
- `GET /api/docs/openapi.json` - OpenAPI specification

## Authentication

### Admin Authentication
Use JWT Bearer token in Authorization header:
```
Authorization: Bearer your-jwt-token
```

### Public API Authentication
Use API key in header:
```
X-API-Key: sk-test123
```

## Monitoring and Logs

### CloudWatch Logs
View logs in AWS CloudWatch:
```bash
aws logs tail /aws/lambda/strawberry-essentials-api-dev-api --follow
```

### Performance Monitoring
- **Memory**: 1024 MB (configurable in serverless.yml)
- **Timeout**: 30 seconds
- **Cold Start**: ~2-3 seconds first request
- **Warm Start**: ~100-200ms subsequent requests

## Scaling Configuration

The Lambda function automatically scales based on demand:
- **Concurrent Executions**: 1000 (AWS default)
- **Reserved Concurrency**: Configure as needed
- **Provisioned Concurrency**: Optional for consistent performance

## Security Considerations

### IAM Permissions
The Lambda function needs:
- S3 read/write access for file uploads
- RDS/Aurora access for database connections
- CloudWatch Logs for monitoring

### Network Security
- VPC configuration for database access (if required)
- Security groups for network isolation
- Environment variable encryption

## Cost Optimization

### Lambda Pricing
- **Requests**: $0.20 per 1M requests
- **Duration**: $0.0000166667 per GB-second
- **Free Tier**: 1M requests + 400,000 GB-seconds per month

### Estimated Costs (1000 req/day)
- Monthly Requests: ~30,000
- Duration (1024MB, 500ms avg): ~15,000 GB-seconds
- **Monthly Cost**: ~$2-3 USD

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Increase Lambda timeout
   - Configure VPC properly
   - Use connection pooling

2. **Cold Start Performance**
   - Enable Provisioned Concurrency
   - Optimize bundle size
   - Use lightweight dependencies

3. **Memory Errors**
   - Increase memory allocation
   - Optimize image processing
   - Use streaming for large responses

### Debug Commands

```bash
# View function logs
serverless logs -f api -t

# Invoke function directly
serverless invoke -f api --data '{"httpMethod":"GET","path":"/api/products"}'

# Check function configuration
aws lambda get-function --function-name strawberry-essentials-api-dev-api
```

## Custom Domain Setup

### 1. Create Certificate
```bash
aws acm request-certificate --domain-name api.strawberry-essentials.com --validation-method DNS
```

### 2. Configure Custom Domain
Add to serverless.yml:
```yaml
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: api.strawberry-essentials.com
    stage: prod
    createRoute53Record: true
```

### 3. Deploy with Custom Domain
```bash
serverless create_domain
serverless deploy
```

## API Testing

### Test Authentication
```bash
curl -X POST https://your-api-gateway-url/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Public Endpoint
```bash
curl -X GET https://your-api-gateway-url/api/products \
  -H "X-API-Key: sk-test123"
```

### Test Admin Endpoint
```bash
curl -X POST https://your-api-gateway-url/api/products \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","price":29.99,"category":"skincare"}'
```

## Support

For deployment issues:
1. Check CloudWatch logs
2. Verify environment variables
3. Test database connectivity
4. Review IAM permissions

The API is now ready for serverless deployment with full authentication, CMS capabilities, and automatic documentation!