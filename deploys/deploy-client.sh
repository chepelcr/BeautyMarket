#!/bin/bash

# Deploy Client Application
# 1. Deploy S3 + CloudFront stack (if needed)
# 2. Build and upload React app
# 3. Invalidate CloudFront cache

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="jmarkets-static-website"
TEMPLATE_FILE="cloudformation/static-website.yml"
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}
BUCKET_NAME="jmarkets-app"

echo -e "${BLUE}=== JMarkets Client Deployment ===${NC}"
echo ""

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}Error: Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity --profile $AWS_PROFILE > /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ AWS credentials invalid${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials valid${NC}"
echo ""

# Check if stack exists
echo -e "${YELLOW}Checking CloudFormation stack...${NC}"
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    2>/dev/null || echo "false")

if [ "$STACK_EXISTS" = "false" ]; then
    echo -e "${YELLOW}Stack does not exist. Deploying...${NC}"
    aws cloudformation deploy \
        --template-file $TEMPLATE_FILE \
        --stack-name $STACK_NAME \
        --parameter-overrides BucketName=$BUCKET_NAME \
        --region $AWS_REGION \
        --profile $AWS_PROFILE
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Stack deployment failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Stack deployed${NC}"
else
    echo -e "${GREEN}✓ Stack exists${NC}"
fi
echo ""

# Get stack outputs
echo -e "${YELLOW}Getting stack outputs...${NC}"
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text --profile $AWS_PROFILE)
CLOUDFRONT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text --profile $AWS_PROFILE)
CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" --output text --profile $AWS_PROFILE)

echo -e "${GREEN}✓ Configuration loaded${NC}"
echo -e "${BLUE}Bucket:${NC} $S3_BUCKET"
echo -e "${BLUE}CloudFront:${NC} $CLOUDFRONT_ID"
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Clean previous build
echo -e "${YELLOW}Cleaning previous build...${NC}"
rm -rf dist/client
echo -e "${GREEN}✓ Cleaned${NC}"

# Build client
echo -e "${YELLOW}Building React application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

if [ ! -d "dist/client" ]; then
    echo -e "${RED}✗ Build output not found at dist/client${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Upload to S3 with correct content types
echo -e "${YELLOW}Uploading to S3...${NC}"
aws s3 sync dist/client/ s3://$S3_BUCKET --delete --profile $AWS_PROFILE

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ S3 upload failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Uploaded to S3${NC}"

# Set correct content types and cache headers
echo -e "${YELLOW}Setting content types and cache headers...${NC}"
aws s3 cp dist/client/ s3://$S3_BUCKET --recursive --exclude "*" --include "*.html" --content-type "text/html" --cache-control "no-cache" --metadata-directive REPLACE --profile $AWS_PROFILE
aws s3 cp dist/client/ s3://$S3_BUCKET --recursive --exclude "*" --include "*.css" --content-type "text/css" --cache-control "max-age=31536000" --metadata-directive REPLACE --profile $AWS_PROFILE
aws s3 cp dist/client/ s3://$S3_BUCKET --recursive --exclude "*" --include "*.js" --content-type "application/javascript" --cache-control "max-age=31536000" --metadata-directive REPLACE --profile $AWS_PROFILE
aws s3 cp dist/client/ s3://$S3_BUCKET --recursive --exclude "*" --include "*.json" --content-type "application/json" --cache-control "no-cache" --metadata-directive REPLACE --profile $AWS_PROFILE

echo -e "${GREEN}✓ Cache headers set${NC}"

# Invalidate CloudFront cache
if [ ! -z "$CLOUDFRONT_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*" --profile $AWS_PROFILE
fi

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "${BLUE}S3 Bucket:${NC} $S3_BUCKET"
echo -e "${BLUE}CloudFront URL:${NC} $CLOUDFRONT_URL"
echo ""
echo -e "${YELLOW}Access your app:${NC} $CLOUDFRONT_URL"
echo ""
