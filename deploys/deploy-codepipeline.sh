#!/bin/bash
# Deploy JMarkets CodePipeline stack
# Usage: bash deploys/deploy-codepipeline.sh [environment] [profile]

ENVIRONMENT=${1:-dev}
PROFILE=${2:-J-CAMPOS}
STACK_NAME="jmarkets-${ENVIRONMENT}-codepipeline"
REGION="us-east-1"

echo "Deploy CodePipeline — JMarkets"
echo "  Environment : $ENVIRONMENT"
echo "  Stack       : $STACK_NAME"
echo "  Profile     : $PROFILE"
echo ""

cd "$(dirname "$0")/.."

aws cloudformation deploy \
  --template-file cloudformation/codepipeline.yml \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
      Environment="$ENVIRONMENT" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --no-fail-on-empty-changeset

if [ $? -ne 0 ]; then
  echo "ERROR: Pipeline stack deploy failed"
  exit 1
fi

echo ""
echo "Done. Pipeline: jmarkets-${ENVIRONMENT}-pipeline"
echo ""
echo "Trigger manually:"
echo "  aws codepipeline start-pipeline-execution \\"
echo "    --name jmarkets-${ENVIRONMENT}-pipeline \\"
echo "    --profile $PROFILE"
