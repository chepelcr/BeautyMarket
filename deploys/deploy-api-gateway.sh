#!/bin/bash

# Deploy API Gateway Stack with Custom Domain
# Integrates Lambda function with REST API and configures custom domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="jmarkets-api-gateway"
TEMPLATE_FILE="cloudformation/api-gateway.yml"
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}

echo -e "${BLUE}=== JMarkets API Gateway Stack ===${NC}"
echo -e "${BLUE}Stack Name: ${STACK_NAME}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}Error: Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Load existing .env
if [ -f ".env" ]; then
    source .env
fi

# Function to read input with optional default
read_input() {
    local prompt="$1"
    local default="$2"

    if [ -n "$default" ]; then
        echo -n -e "${BLUE}${prompt} [${default}]:${NC} "
    else
        echo -n -e "${BLUE}${prompt}:${NC} "
    fi

    read value

    if [ -z "$value" ] && [ -n "$default" ]; then
        echo "$default"
    else
        echo "$value"
    fi
}

echo -e "${YELLOW}=== Configuration Prompts ===${NC}"
echo ""

# Lambda Stack Name
LAMBDA_STACK_NAME=$(read_input "Lambda Stack Name" "jmarkets-lambda")
echo ""

# Domain Configuration
DOMAIN_NAME=$(read_input "API Domain Name" "api.jmarkets.jcampos.dev")
echo ""

# Get Route53 Hosted Zone ID for jcampos.dev
echo -e "${YELLOW}Fetching Route53 Hosted Zone ID...${NC}"
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
    --dns-name "jcampos.dev" \
    --query "HostedZones[0].Id" \
    --output text \
    --profile $AWS_PROFILE | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo -e "${RED}✗ Could not find hosted zone for jcampos.dev${NC}"
    HOSTED_ZONE_ID=$(read_input "Route53 Hosted Zone ID")
    echo ""
else
    echo -e "${GREEN}✓ Found Hosted Zone ID: ${HOSTED_ZONE_ID}${NC}"
    echo ""
fi

# API Name
API_NAME=$(read_input "API Gateway Name" "jmarkets-api")
echo ""

# Summary
echo ""
echo -e "${GREEN}=== Configuration Summary ===${NC}"
echo -e "${BLUE}Lambda Stack:${NC} $LAMBDA_STACK_NAME"
echo -e "${BLUE}Domain Name:${NC} $DOMAIN_NAME"
echo -e "${BLUE}Hosted Zone ID:${NC} $HOSTED_ZONE_ID"
echo -e "${BLUE}API Name:${NC} $API_NAME"
echo ""

read -p "$(echo -e ${YELLOW}Proceed with deployment? \(y/N\): ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 1
fi

# Validate CloudFormation template
echo ""
echo -e "${YELLOW}Validating CloudFormation template...${NC}"
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $AWS_REGION \
    --profile $AWS_PROFILE > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Template validation passed${NC}"
else
    echo -e "${RED}✗ Template validation failed${NC}"
    exit 1
fi

# Check if stack exists
echo ""
echo -e "${YELLOW}Checking if stack exists...${NC}"
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    2>/dev/null || echo "false")

if [ "$STACK_EXISTS" != "false" ]; then
    ACTION="UPDATE"
    echo -e "${GREEN}✓ Stack exists - will update${NC}"
else
    ACTION="CREATE"
    echo -e "${GREEN}✓ Stack does not exist - will create${NC}"
fi

# Deploy stack
echo ""
echo -e "${YELLOW}Deploying stack (${ACTION})...${NC}"

if [ "$ACTION" = "CREATE" ]; then
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=LambdaStackName,ParameterValue=$LAMBDA_STACK_NAME \
            ParameterKey=ApiName,ParameterValue=$API_NAME \
            ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
            ParameterKey=HostedZoneId,ParameterValue=$HOSTED_ZONE_ID \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --tags Key=Environment,Value=$ENVIRONMENT Key=Project,Value=JMarkets

    WAIT_CONDITION="stack-create-complete"
else
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=LambdaStackName,ParameterValue=$LAMBDA_STACK_NAME \
            ParameterKey=ApiName,ParameterValue=$API_NAME \
            ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
            ParameterKey=HostedZoneId,ParameterValue=$HOSTED_ZONE_ID \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --tags Key=Environment,Value=$ENVIRONMENT Key=Project,Value=JMarkets

    WAIT_CONDITION="stack-update-complete"
fi

# Wait for stack operation to complete
echo -e "${YELLOW}Waiting for stack operation to complete...${NC}"
aws cloudformation wait $WAIT_CONDITION \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --profile $AWS_PROFILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Stack deployment completed successfully${NC}"
else
    echo -e "${RED}✗ Stack deployment failed${NC}"
    exit 1
fi

# Get stack outputs
echo ""
echo -e "${YELLOW}Retrieving stack outputs...${NC}"

OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    --query 'Stacks[0].Outputs' \
    --output json)

echo ""
echo -e "${GREEN}=== Stack Outputs ===${NC}"

# Extract outputs
API_GATEWAY_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ApiGatewayId") | .OutputValue')
API_GATEWAY_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ApiGatewayUrl") | .OutputValue')
CUSTOM_DOMAIN_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="CustomDomainUrl") | .OutputValue')

echo -e "${BLUE}API Gateway ID:${NC}"
echo "  $API_GATEWAY_ID"
echo ""
echo -e "${BLUE}API Gateway URL:${NC}"
echo "  $API_GATEWAY_URL"
echo ""
echo -e "${BLUE}Custom Domain URL:${NC}"
echo "  $CUSTOM_DOMAIN_URL"

# Update .env
if [ -f ".env" ]; then
    sed -i '' "s|API_GATEWAY_ID=.*|API_GATEWAY_ID=$API_GATEWAY_ID|" .env 2>/dev/null || echo "API_GATEWAY_ID=$API_GATEWAY_ID" >> .env
    sed -i '' "s|API_GATEWAY_URL=.*|API_GATEWAY_URL=$API_GATEWAY_ENDPOINT|" .env 2>/dev/null || echo "API_GATEWAY_URL=$API_GATEWAY_ENDPOINT" >> .env
    sed -i '' "s|API_DOMAIN_NAME=.*|API_DOMAIN_NAME=$API_CUSTOM_DOMAIN_URL|" .env 2>/dev/null || echo "API_DOMAIN_NAME=$API_CUSTOM_DOMAIN_URL" >> .env
else
    cat > .env << EOF
API_GATEWAY_ID=$API_GATEWAY_ID
API_GATEWAY_URL=$API_GATEWAY_ENDPOINT
API_DOMAIN_NAME=$API_CUSTOM_DOMAIN_URL
EOF
fi

echo ""
echo -e "${YELLOW}⚠️  ACM Certificate Validation Required${NC}"
echo "A new ACM certificate has been created for: $DOMAIN_NAME"
echo "You must validate this certificate by adding DNS records to your Route53 hosted zone."
echo ""
echo -e "${YELLOW}Steps:${NC}"
echo "1. Go to AWS Certificate Manager Console"
echo "2. Find the certificate for: $DOMAIN_NAME"
echo "3. Click 'Create records in Route53' to auto-validate"
echo "4. Wait 5-10 minutes for validation to complete"
echo "5. The custom domain will be available once validated"
echo ""
echo -e "${GREEN}✓ Updated .env file${NC}"
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Validate ACM certificate (see above)"
echo "2. Deploy Static Website: ./deploys/deploy-static-website.sh"
echo "3. Deploy CodePipeline: ./deploys/deploy-pipeline.sh"
echo ""
