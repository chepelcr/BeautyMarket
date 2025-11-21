#!/bin/bash

# Deploy Pipeline Roles and S3 Artifacts Bucket
# This stack must be deployed before CodePipeline and CodeBuild

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="jmarkets-pipeline-roles"
TEMPLATE_FILE="cloudformation/pipeline-roles.yml"
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}

echo -e "${BLUE}=== JMarkets Pipeline Roles Stack ===${NC}"
echo -e "${BLUE}Stack Name: ${STACK_NAME}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}Error: Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Validate CloudFormation template
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
        --parameters ParameterKey=EnvironmentParam,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --tags Key=Environment,Value=$ENVIRONMENT Key=Project,Value=JMarkets

    WAIT_CONDITION="stack-create-complete"
else
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters ParameterKey=EnvironmentParam,ParameterValue=$ENVIRONMENT \
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

# Extract and display outputs
CODE_BUILD_ROLE_ARN=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="CodeBuildRoleArn") | .OutputValue')
CODE_PIPELINE_ROLE_ARN=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="CodePipelineRoleArn") | .OutputValue')
ARTIFACTS_BUCKET_NAME=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ArtifactsBucketName") | .OutputValue')
ARTIFACTS_BUCKET_ARN=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ArtifactsBucketArn") | .OutputValue')

echo -e "${BLUE}CodeBuild Role ARN:${NC}"
echo "  $CODE_BUILD_ROLE_ARN"
echo ""
echo -e "${BLUE}CodePipeline Role ARN:${NC}"
echo "  $CODE_PIPELINE_ROLE_ARN"
echo ""
echo -e "${BLUE}Artifacts Bucket Name:${NC}"
echo "  $ARTIFACTS_BUCKET_NAME"
echo ""
echo -e "${BLUE}Artifacts Bucket ARN:${NC}"
echo "  $ARTIFACTS_BUCKET_ARN"

# Save outputs to file for reference
OUTPUTS_FILE=".pipeline-roles-outputs"
cat > $OUTPUTS_FILE << EOF
# Pipeline Roles Stack Outputs
# Generated: $(date)

CODE_BUILD_ROLE_ARN=$CODE_BUILD_ROLE_ARN
CODE_PIPELINE_ROLE_ARN=$CODE_PIPELINE_ROLE_ARN
ARTIFACTS_BUCKET_NAME=$ARTIFACTS_BUCKET_NAME
ARTIFACTS_BUCKET_ARN=$ARTIFACTS_BUCKET_ARN
STACK_NAME=$STACK_NAME
AWS_REGION=$AWS_REGION
ENVIRONMENT=$ENVIRONMENT
EOF

echo ""
echo -e "${GREEN}✓ Outputs saved to $OUTPUTS_FILE${NC}"
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Use the CodeBuild and CodePipeline role ARNs in subsequent stack deployments"
echo "2. Configure CodePipeline to use the role ARN from above"
echo "3. Deploy Lambda function: ./deploys/deploy-lambda.sh"
echo ""
