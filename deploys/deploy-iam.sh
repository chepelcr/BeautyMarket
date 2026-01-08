#!/bin/bash

# JMarkets IAM Stack Deployment Script

set -e

# Configuration
STACK_NAME="jmarkets-iam-dev"
TEMPLATE_FILE="cloudformation/iam.yml"
REGION="us-east-1"
ENVIRONMENT="dev"
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying JMarkets IAM Stack${NC}"
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

# Check if stack exists FIRST
echo -e "${YELLOW}🔍 Checking if stack exists...${NC}"
set +e
aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE >/dev/null 2>&1
STACK_CHECK_EXIT_CODE=$?
set -e

if [ $STACK_CHECK_EXIT_CODE -eq 0 ]; then
    STACK_EXISTS="true"
    echo "Stack exists - will update"
else
    STACK_EXISTS="false"
    echo "Stack does not exist - will create"
fi

# Only check for existing IAM user if stack doesn't exist
if [ "$STACK_EXISTS" = "false" ]; then
    echo -e "${YELLOW}🔍 Checking if IAM user already exists...${NC}"
    USER_NAME_TO_CREATE="strawberry-be-$ENVIRONMENT"
    set +e
    aws iam get-user --user-name $USER_NAME_TO_CREATE --profile $AWS_PROFILE >/dev/null 2>&1
    USER_EXISTS=$?
    set -e

    if [ $USER_EXISTS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  IAM user '$USER_NAME_TO_CREATE' already exists!${NC}"
    echo ""
    echo "CloudFormation cannot adopt existing resources. You have 3 options:"
    echo "  1. Delete the existing user and let CloudFormation create it"
    echo "  2. Use a different environment name (e.g., 'dev2' instead of 'dev')"
    echo "  3. Cancel deployment"
    echo ""
    read -p "Choose an option (1/2/3): " CHOICE

    case $CHOICE in
        1)
            echo -e "${YELLOW}🗑️  Deleting existing user...${NC}"

            # List and delete access keys
            echo "Deleting access keys..."
            ACCESS_KEYS=$(aws iam list-access-keys --user-name $USER_NAME_TO_CREATE --profile $AWS_PROFILE --query 'AccessKeyMetadata[].AccessKeyId' --output text)
            for KEY in $ACCESS_KEYS; do
                aws iam delete-access-key --user-name $USER_NAME_TO_CREATE --access-key-id $KEY --profile $AWS_PROFILE
                echo "  Deleted access key: $KEY"
            done

            # Detach managed policies
            echo "Detaching managed policies..."
            ATTACHED_POLICIES=$(aws iam list-attached-user-policies --user-name $USER_NAME_TO_CREATE --profile $AWS_PROFILE --query 'AttachedPolicies[].PolicyArn' --output text)
            for POLICY in $ATTACHED_POLICIES; do
                aws iam detach-user-policy --user-name $USER_NAME_TO_CREATE --policy-arn $POLICY --profile $AWS_PROFILE
                echo "  Detached policy: $POLICY"
            done

            # Delete inline policies
            echo "Deleting inline policies..."
            INLINE_POLICIES=$(aws iam list-user-policies --user-name $USER_NAME_TO_CREATE --profile $AWS_PROFILE --query 'PolicyNames[]' --output text)
            for POLICY in $INLINE_POLICIES; do
                aws iam delete-user-policy --user-name $USER_NAME_TO_CREATE --policy-name $POLICY --profile $AWS_PROFILE
                echo "  Deleted inline policy: $POLICY"
            done

            # Delete the user
            aws iam delete-user --user-name $USER_NAME_TO_CREATE --profile $AWS_PROFILE
            echo -e "${GREEN}✅ User deleted successfully${NC}"
            ;;
        2)
            echo ""
            read -p "Enter new environment name (e.g., dev2, staging): " NEW_ENV
            ENVIRONMENT=$NEW_ENV
            STACK_NAME="jmarkets-iam-$ENVIRONMENT"
            USER_NAME_TO_CREATE="strawberry-be-$ENVIRONMENT"
            echo -e "${GREEN}✅ Using environment: $ENVIRONMENT${NC}"
            echo -e "${GREEN}✅ Stack name: $STACK_NAME${NC}"
            echo -e "${GREEN}✅ User name: $USER_NAME_TO_CREATE${NC}"
            ;;
        3)
            echo -e "${YELLOW}🛑 Deployment cancelled${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Deployment cancelled.${NC}"
            exit 1
            ;;
    esac
    echo ""
    fi
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
POLICY_ARN=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`BackendPolicyArn`].OutputValue' --output text)
USER_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`BackendDevUserName`].OutputValue' --output text)
ACCESS_KEY_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`BackendDevUserAccessKeyId`].OutputValue' --output text)
SECRET_KEY=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE --query 'Stacks[0].Outputs[?OutputKey==`BackendDevUserSecretAccessKey`].OutputValue' --output text)

echo ""
echo -e "${GREEN}👤 IAM User Created:${NC}"
echo "User Name: $USER_NAME"
echo "Policy ARN: $POLICY_ARN"

echo ""
echo -e "${GREEN}🔑 Access Credentials (SAVE THESE - Only shown once!):${NC}"
echo "AWS_ACCESS_KEY_ID=\"$ACCESS_KEY_ID\""
echo "AWS_SECRET_ACCESS_KEY=\"$SECRET_KEY\""

echo ""
echo -e "${GREEN}🔧 Server Environment Variables (server/.env):${NC}"
echo "AWS_ACCESS_KEY_ID=\"$ACCESS_KEY_ID\""
echo "AWS_SECRET_ACCESS_KEY=\"$SECRET_KEY\""
echo "AWS_REGION=\"$REGION\""

echo ""
echo -e "${RED}⚠️  SECURITY WARNING:${NC}"
echo -e "${YELLOW}The Secret Access Key is only displayed ONCE!${NC}"
echo -e "${YELLOW}Make sure to copy it to your .env file NOW.${NC}"
echo -e "${YELLOW}Never commit these credentials to git!${NC}"

echo ""
echo -e "${GREEN}✨ JMarkets IAM deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Update server/.env with the credentials above"
echo "  2. Restart your server: ./reboot-server.sh"
echo "  3. Test the API endpoint: curl http://localhost:5000/api/users/{userId}/profile"
echo ""
