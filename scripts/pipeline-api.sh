#!/bin/bash
# Phase 3 — Refresh swagger + regenerate SAM template + deploy API Gateway
set -euo pipefail

ENVIRONMENT="${ENVIRONMENT:-dev}"
REGION="${REGION:-us-east-1}"
API_DOMAIN="${API_DOMAIN:-markets-api.jcampos.dev}"
ROOT_DOMAIN="${ROOT_DOMAIN:-jcampos.dev}"

echo "=== JMarkets API Gateway Update ==="
echo "  Environment : $ENVIRONMENT"
echo "  Region      : $REGION"
echo "  API Domain  : $API_DOMAIN"
echo ""

# Resolve Route53 hosted zone
echo "Resolving hosted zone for ${ROOT_DOMAIN}..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='${ROOT_DOMAIN}.'].Id" \
  --output text | sed 's|/hostedzone/||')

if [ -z "$HOSTED_ZONE_ID" ]; then
  echo "ERROR: Could not resolve hosted zone for $ROOT_DOMAIN"
  exit 1
fi
echo "  Hosted Zone : $HOSTED_ZONE_ID"
echo ""

# Step 1: Refresh swagger spec
echo "Generating swagger spec..."
npm run generate:swagger

# Step 2: Generate SAM template from swagger
echo "Generating api-gateway/template.yml..."
python3 scripts/gen_api_template.py

# Step 3: SAM deploy
echo "Deploying API Gateway..."
sam deploy \
  --template-file api-gateway/template.yml \
  --config-file api-gateway/samconfig.toml \
  --config-env "$ENVIRONMENT" \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --region "$REGION" \
  --parameter-overrides \
    "Environment=$ENVIRONMENT" \
    "DomainName=$API_DOMAIN" \
    "HostedZoneId=$HOSTED_ZONE_ID"

echo ""
echo "API Gateway update complete."
