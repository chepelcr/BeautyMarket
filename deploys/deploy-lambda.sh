#!/bin/bash

# Deploy Lambda Function with SAM
# Builds and deploys Lambda using AWS SAM CLI

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
STACK_NAME="jmarkets-lambda"
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}

echo -e "${BLUE}=== JMarkets Lambda Deployment (SAM) ===${NC}"
echo -e "${BLUE}Stack: ${STACK_NAME}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
echo ""

# Check SAM CLI
if ! command -v sam &> /dev/null; then
    echo -e "${RED}✗ SAM CLI not installed${NC}"
    echo "Install: brew install aws-sam-cli"
    exit 1
fi

# Load .env
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi
source .env

# Build with SAM
echo -e "${YELLOW}Building with SAM...${NC}"
sam build --template cloudformation/template.yaml --profile $AWS_PROFILE

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ SAM build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Deploy with SAM
echo -e "${YELLOW}Deploying with SAM...${NC}"
sam deploy \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    --no-confirm-changeset \
    --parameter-overrides \
        SessionSecretParam=$SESSION_SECRET \
        DatabaseURLParam=$NEW_DATABASE_URL \
        CloudfrontURLParam=$AWS_CLOUDFRONT_URL \
        CognitoUserPoolIdParam=$AWS_COGNITO_USER_POOL_ID \
        CognitoClientIdParam=$AWS_COGNITO_CLIENT_ID \
        SesSmtpUsernameParam=$SES_SMTP_USERNAME \
        SesSmtpPasswordParam=$SES_SMTP_PASSWORD

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ SAM deploy failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Lambda deployed successfully${NC}"
echo ""
echo -e "${YELLOW}Next: Deploy API Gateway${NC}"
echo "  ./deploys/deploy-api-gateway.sh"
echo ""
