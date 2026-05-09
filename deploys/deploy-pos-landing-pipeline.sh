#!/bin/bash
# Deploy CodePipeline for pos-landing static site
# Usage: bash deploys/deploy-pos-landing-pipeline.sh [environment] [profile] [s3-bucket] [cf-dist-id]
#
# Before first run:
#   1. Create S3 bucket + CloudFront distribution for pos-landing.jcampos.dev
#      (use setup-template-bucket.js or the AWS console)
#   2. Pass the resulting S3 bucket name and CloudFront distribution ID below
#
# Example:
#   bash deploys/deploy-pos-landing-pipeline.sh dev J-CAMPOS jcampos-pos-landing E1ABC2DEF3GHI

ENVIRONMENT=${1:-dev}
PROFILE=${2:-J-CAMPOS}
S3_BUCKET=${3:-jcampos-pos-landing}
CF_DIST_ID=${4:-""}
STACK_NAME="jcampos-${ENVIRONMENT}-pos-landing-codepipeline"
REGION="us-east-1"

echo "Deploy pos-landing CodePipeline"
echo "  Environment   : $ENVIRONMENT"
echo "  Stack         : $STACK_NAME"
echo "  Profile       : $PROFILE"
echo "  S3 Bucket     : $S3_BUCKET"
echo "  CloudFront ID : ${CF_DIST_ID:-<not set>}"
echo ""

cd "$(dirname "$0")/.."

aws cloudformation deploy \
  --template-file cloudformation/pos-landing-pipeline.yml \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment="$ENVIRONMENT" \
    SourceOwnerParam="chepelcr" \
    SourceRepoParam="BeautyMarket" \
    SourceBranchParam="main" \
    S3BucketParam="$S3_BUCKET" \
    CloudFrontDistributionIdParam="$CF_DIST_ID" \
    SiteDomainParam="pos-landing.jcampos.dev" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --no-fail-on-empty-changeset

if [ $? -ne 0 ]; then
  echo "ERROR: Pipeline stack deploy failed"
  exit 1
fi

echo ""
echo "Done. Pipeline: jcampos-${ENVIRONMENT}-pos-landing-pipeline"
echo ""
echo "Trigger manually:"
echo "  aws codepipeline start-pipeline-execution \\"
echo "    --name jcampos-${ENVIRONMENT}-pos-landing-pipeline \\"
echo "    --profile $PROFILE"
echo ""
echo "Update CloudFront distribution ID after infra is created:"
echo "  bash deploys/deploy-pos-landing-pipeline.sh $ENVIRONMENT $PROFILE $S3_BUCKET <DISTRIBUTION_ID>"
