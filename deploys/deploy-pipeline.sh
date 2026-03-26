#!/bin/bash
# Deploy (create or update) the JMarkets CodePipeline CloudFormation stack.
# Usage: bash deploys/deploy-pipeline.sh [environment] [profile]

set -euo pipefail

ENVIRONMENT="${1:-dev}"
PROFILE="${2:-J-CAMPOS}"
REGION="us-east-1"

STACK_NAME="jmarkets-${ENVIRONMENT}-codepipeline"
TEMPLATE_FILE="cloudformation/codepipeline.yml"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}=== JMarkets CodePipeline Deploy ===${NC}"
echo "  Stack       : $STACK_NAME"
echo "  Environment : $ENVIRONMENT"
echo "  Profile     : $PROFILE"
echo "  Region      : $REGION"
echo ""

# ── Pre-flight checks ─────────────────────────────────────────────────────────

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo -e "${RED}ERROR: $TEMPLATE_FILE not found${NC}"
  exit 1
fi

# Verify pipeline-roles stack is deployed (required cross-stack imports)
ROLES_STATUS=$(aws cloudformation describe-stacks \
  --stack-name "jcampos-${ENVIRONMENT}-pipeline-roles" \
  --profile "$PROFILE" --region "$REGION" \
  --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo "MISSING")

if [[ "$ROLES_STATUS" == "MISSING" || "$ROLES_STATUS" == *"ROLLBACK"* || "$ROLES_STATUS" == *"FAILED"* ]]; then
  echo -e "${RED}ERROR: jcampos-${ENVIRONMENT}-pipeline-roles stack not ready (status: $ROLES_STATUS)${NC}"
  echo "       Run: cd E:/dev/biller-apps/Infrastructure/policies && bash build-iam.sh $ENVIRONMENT"
  exit 1
fi
echo -e "${GREEN}✓ Pipeline-roles stack: $ROLES_STATUS${NC}"

# ── Validate template ─────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}Validating template...${NC}"
aws cloudformation validate-template \
  --template-body "file://${TEMPLATE_FILE}" \
  --profile "$PROFILE" --region "$REGION" > /dev/null
echo -e "${GREEN}✓ Template valid${NC}"

# ── Deploy ────────────────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}Deploying stack...${NC}"

aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE_FILE" \
  --parameter-overrides \
    "Environment=${ENVIRONMENT}" \
    "FrontendDomainParam=j-markets.jcampos.dev" \
    "RootDomainParam=jcampos.dev" \
    "ApiDomainParam=markets-api.jcampos.dev" \
    "SourceBranchParam=develop" \
  --capabilities CAPABILITY_IAM \
  --profile "$PROFILE" \
  --region "$REGION" \
  --no-fail-on-empty-changeset

echo ""
echo -e "${GREEN}✓ Stack deployed: $STACK_NAME${NC}"

# ── Show outputs ──────────────────────────────────────────────────────────────

PIPELINE=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --profile "$PROFILE" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='PipelineName'].OutputValue" \
  --output text)

echo ""
echo -e "${GREEN}=== Done ===${NC}"
echo "  Pipeline : $PIPELINE"
echo "  Monitor  : https://console.aws.amazon.com/codesuite/codepipeline/pipelines/${PIPELINE}/view"
