#!/bin/bash

# Deploy CodePipeline Stack
# Configures CI/CD pipeline with GitHub and CodeBuild integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="jmarkets-codepipeline"
TEMPLATE_FILE="cloudformation/codepipeline.yml"
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}

echo -e "${BLUE}=== JMarkets CodePipeline Stack ===${NC}"
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

# Verify pipeline-roles stack exists
echo -e "${YELLOW}Checking for pipeline-roles stack...${NC}"
PIPELINE_ROLES_STACK=$(aws cloudformation describe-stacks \
    --stack-name "jmarkets-pipeline-roles" \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    2>/dev/null || echo "")

if [ -z "$PIPELINE_ROLES_STACK" ]; then
    echo -e "${RED}✗ Pipeline roles stack 'jmarkets-pipeline-roles' not found${NC}"
    echo -e "${YELLOW}Please run: ./deploys/deploy-pipeline-roles.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pipeline roles stack found${NC}"
echo ""

# Pipeline Configuration
PIPELINE_NAME=$(read_input "Pipeline Name" "jmarkets-pipeline")
CODEBUILD_PROJECT_NAME=$(read_input "CodeBuild Project Name" "jmarkets-build")
echo ""

# GitHub Configuration
echo -e "${YELLOW}GitHub Configuration:${NC}"
echo "Note: You must create a GitHub CodeStar connection in AWS Console first"
echo "Go to: https://console.aws.amazon.com/codesuite/connections"
echo ""
GITHUB_CONNECTION_ARN=$(read_input "GitHub CodeStar Connection ARN")
echo ""

GITHUB_REPO=$(read_input "GitHub Repository (owner/repo)" "chepelcr/BeautyMarket")
echo ""

# Lambda Configuration
if [ -z "$LAMBDA_FUNCTION_NAME" ]; then
    LAMBDA_FUNCTION_NAME=$(read_input "Lambda Function Name" "jmarkets-api-handler")
    echo ""
else
    echo -e "${GREEN}✓ Using Lambda Function Name from .env${NC}"
    echo "  $LAMBDA_FUNCTION_NAME"
    echo ""
fi

# Summary
echo ""
echo -e "${GREEN}=== Configuration Summary ===${NC}"
echo -e "${BLUE}Pipeline Name:${NC} $PIPELINE_NAME"
echo -e "${BLUE}CodeBuild Project:${NC} $CODEBUILD_PROJECT_NAME"
echo -e "${BLUE}GitHub Repository:${NC} $GITHUB_REPO"
echo -e "${BLUE}GitHub Connection:${NC} (configured)"
echo -e "${BLUE}Lambda Function:${NC} $LAMBDA_FUNCTION_NAME"
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
            ParameterKey=CodePipelineNameParam,ParameterValue=$PIPELINE_NAME \
            ParameterKey=GitHubConnectionParam,ParameterValue=$GITHUB_CONNECTION_ARN \
            ParameterKey=GitHubRepositoryParam,ParameterValue=$GITHUB_REPO \
            ParameterKey=CodeBuildProjectNameParam,ParameterValue=$CODEBUILD_PROJECT_NAME \
            ParameterKey=CodeBuildDescriptionParam,ParameterValue="Build project for JMarkets Lambda function" \
            ParameterKey=PipelineRolesStackName,ParameterValue="jmarkets-pipeline-roles" \
            ParameterKey=LambdaFunctionName,ParameterValue=$LAMBDA_FUNCTION_NAME \
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
            ParameterKey=CodePipelineNameParam,ParameterValue=$PIPELINE_NAME \
            ParameterKey=GitHubConnectionParam,ParameterValue=$GITHUB_CONNECTION_ARN \
            ParameterKey=GitHubRepositoryParam,ParameterValue=$GITHUB_REPO \
            ParameterKey=CodeBuildProjectNameParam,ParameterValue=$CODEBUILD_PROJECT_NAME \
            ParameterKey=CodeBuildDescriptionParam,ParameterValue="Build project for JMarkets Lambda function" \
            ParameterKey=PipelineRolesStackName,ParameterValue="jmarkets-pipeline-roles" \
            ParameterKey=LambdaFunctionName,ParameterValue=$LAMBDA_FUNCTION_NAME \
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
CODEPIPELINE_NAME=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="CodePipelineName") | .OutputValue')
CODEBUILD_PROJECT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="CodeBuildProjectName") | .OutputValue')

echo -e "${BLUE}CodePipeline Name:${NC}"
echo "  $CODEPIPELINE_NAME"
echo ""
echo -e "${BLUE}CodeBuild Project:${NC}"
echo "  $CODEBUILD_PROJECT"

# Update .env
if [ -f ".env" ]; then
    sed -i '' "s|CODEPIPELINE_NAME=.*|CODEPIPELINE_NAME=$CODEPIPELINE_NAME|" .env 2>/dev/null || echo "CODEPIPELINE_NAME=$CODEPIPELINE_NAME" >> .env
    sed -i '' "s|CODEBUILD_PROJECT_NAME=.*|CODEBUILD_PROJECT_NAME=$CODEBUILD_PROJECT|" .env 2>/dev/null || echo "CODEBUILD_PROJECT_NAME=$CODEBUILD_PROJECT" >> .env
else
    cat > .env << EOF
CODEPIPELINE_NAME=$CODEPIPELINE_NAME
CODEBUILD_PROJECT_NAME=$CODEBUILD_PROJECT
EOF
fi

echo ""
echo -e "${GREEN}✓ Updated .env file${NC}"
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo -e "${YELLOW}CI/CD Pipeline is ready!${NC}"
echo ""
echo -e "${YELLOW}How it works:${NC}"
echo "1. Push code to main branch on GitHub"
echo "2. CodePipeline automatically triggers"
echo "3. CodeBuild runs buildspec.yml"
echo "4. Lambda function is updated with new code"
echo ""
echo -e "${YELLOW}Monitor pipeline:${NC}"
echo "AWS Console → CodePipeline → $CODEPIPELINE_NAME"
echo ""
echo -e "${YELLOW}View build logs:${NC}"
echo "AWS Console → CodeBuild → $CODEBUILD_PROJECT"
echo ""
