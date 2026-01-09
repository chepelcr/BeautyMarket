#!/bin/bash

# JMarkets - Lambda Deployment Script (Simple CloudFormation)
STACK_NAME="jmarkets-lambda"
PROFILE="J-CAMPOS"
REGION="us-east-1"

echo "🚀 JMarkets Lambda Deployment (Simple CloudFormation)"

# Check AWS credentials
echo "Checking AWS credentials..."
aws sts get-caller-identity --profile $PROFILE --region $REGION
if [ $? -ne 0 ]; then
    echo "❌ AWS credentials invalid. Please run: aws configure --profile $PROFILE"
    exit 1
fi

# Build and package Lambda function
echo "📦 Building and packaging Lambda function..."
cd "$(dirname "$0")/.."
npm run package:lambda

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Lambda package"
    exit 1
fi

# Check if lambda-package.zip exists
if [ ! -f "lambda-package.zip" ]; then
    echo "❌ lambda-package.zip not found"
    exit 1
fi

echo "✅ Lambda package created: $(du -h lambda-package.zip | cut -f1)"

# Load environment variables
if [ ! -f ".env" ]; then
    echo "❌ Missing .env file with required variables"
    exit 1
fi

# Extract variables from .env file
SESSION_SECRET=$(grep '^SESSION_SECRET=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
DATABASE_URL=$(grep '^NEW_DATABASE_URL=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
CLOUDFRONT_URL=$(grep '^AWS_CLOUDFRONT_URL=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
COGNITO_USER_POOL_ID=$(grep '^AWS_COGNITO_USER_POOL_ID=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
COGNITO_CLIENT_ID=$(grep '^AWS_COGNITO_CLIENT_ID=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
SES_SMTP_USERNAME=$(grep '^SES_SMTP_USERNAME=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
SES_SMTP_PASSWORD=$(grep '^SES_SMTP_PASSWORD=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

# Check if we should use external IAM policy
IAM_POLICY_ARN=""
if aws cloudformation describe-stacks --stack-name jmarkets-iam-dev --profile $PROFILE --region $REGION &> /dev/null; then
    IAM_POLICY_ARN=$(aws cloudformation describe-stacks \
        --stack-name jmarkets-iam-dev \
        --profile $PROFILE \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`BackendPolicyArn`].OutputValue' \
        --output text)
    echo "✅ Found IAM policy: $IAM_POLICY_ARN"
fi

# Deploy lambda stack with environment variables
echo "🚀 Deploying $STACK_NAME..."
aws cloudformation deploy \
    --template-file cloudformation/lambda.yml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        SessionSecretParam="$SESSION_SECRET" \
        DatabaseURLParam="$DATABASE_URL" \
        CloudfrontURLParam="$CLOUDFRONT_URL" \
        CognitoUserPoolIdParam="$COGNITO_USER_POOL_ID" \
        CognitoClientIdParam="$COGNITO_CLIENT_ID" \
        SesSmtpUsernameParam="$SES_SMTP_USERNAME" \
        SesSmtpPasswordParam="$SES_SMTP_PASSWORD" \
        IAMPolicyArn="$IAM_POLICY_ARN" \
    --profile $PROFILE \
    --region $REGION

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy lambda stack"
    exit 1
fi
echo "✅ $STACK_NAME deployed successfully!"

# Update Lambda function code with the actual package
echo "🔄 Updating Lambda function code..."
aws lambda update-function-code \
    --function-name jmarkets-api-handler \
    --zip-file fileb://lambda-package.zip \
    --region $REGION \
    --profile $PROFILE >/dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Failed to update Lambda code"
    exit 1
fi

echo "✅ Lambda code updated successfully!"
echo ""
echo "✅ Lambda deployment completed!"
echo "📝 Run ./deploys/deploy-api-gateway.sh to deploy API Gateway"
