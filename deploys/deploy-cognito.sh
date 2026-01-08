#!/bin/bash

# JMarkets Cognito Stack Deployment Script

set -e

# Configuration
STACK_NAME="jmarkets-cognito"
TEMPLATE_FILE="cloudformation/cognito.yml"
REGION="us-east-1"
ENVIRONMENT="dev"
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying JMarkets Cognito Stack${NC}"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Validate CloudFormation template
echo -e "${YELLOW}🔍 Validating CloudFormation template...${NC}"
aws cloudformation validate-template --template-body file://$TEMPLATE_FILE --region $REGION --profile $AWS_PROFILE --output text --query 'Description' >/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Template validation successful${NC}"
else
    echo -e "${RED}❌ Template validation failed${NC}"
    exit 1
fi

# Check if stack exists
echo -e "${YELLOW}🔍 Checking if stack exists...${NC}"
set +e
aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE >/dev/null 2>&1
STACK_CHECK_EXIT_CODE=$?
set -e

if [ $STACK_CHECK_EXIT_CODE -eq 0 ]; then
    STACK_EXISTS="true"
    echo "Stack exists"
else
    STACK_EXISTS="false"
    echo "Stack does not exist"
fi

if [ "$STACK_EXISTS" = "true" ]; then
    echo -e "${YELLOW}📝 Stack exists. Updating...${NC}"
    OPERATION="update-stack"
else
    echo -e "${YELLOW}🆕 Stack does not exist. Creating...${NC}"
    OPERATION="create-stack"
fi

# Deploy the stack
echo -e "${YELLOW}🔄 Deploying stack...${NC}"
aws cloudformation $OPERATION \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --parameters \
        ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        ParameterKey=Region,ParameterValue=$REGION \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region $REGION --profile $AWS_PROFILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Stack deployment initiated successfully${NC}"
else
    echo -e "${RED}❌ Stack deployment failed${NC}"
    exit 1
fi

# Wait for stack operation to complete
echo -e "${YELLOW}⏳ Waiting for stack operation to complete...${NC}"
if [ "$OPERATION" = "create-stack" ]; then
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE
else
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Stack operation completed successfully!${NC}"
else
    echo -e "${RED}❌ Stack operation failed or timed out${NC}"
    exit 1
fi

# Get stack outputs
echo -e "${YELLOW}📋 Retrieving stack outputs...${NC}"
OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs' --output table)

echo ""
echo -e "${GREEN}📊 Stack Outputs:${NC}"
echo "$OUTPUTS"

# Extract specific values for .env file
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' --output text)
USER_POOL_ARN=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`UserPoolArn`].OutputValue' --output text)
CLIENT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' --output text)
IDENTITY_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' --output text)

echo ""
echo -e "${GREEN}🔧 Server Environment Variables (.env):${NC}"
echo "AWS_REGION=\"$REGION\""
echo "AWS_COGNITO_USER_POOL_ID=\"$USER_POOL_ID\""
echo "AWS_COGNITO_USER_POOL_ARN=\"$USER_POOL_ARN\""

echo ""
echo -e "${GREEN}🔧 Client Environment Variables (.env):${NC}"
echo "VITE_AWS_REGION=\"$REGION\""
echo "VITE_AWS_COGNITO_USER_POOL_ID=\"$USER_POOL_ID\""
echo "VITE_AWS_COGNITO_CLIENT_ID=\"$CLIENT_ID\""
echo "VITE_AWS_COGNITO_IDENTITY_POOL_ID=\"$IDENTITY_POOL_ID\""

echo ""
echo -e "${GREEN}✨ JMarkets Cognito deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Don't forget to update your .env file with the values above.${NC}"
