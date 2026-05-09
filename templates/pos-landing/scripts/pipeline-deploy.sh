#!/bin/bash
# Phase 2 — Deploy pos-landing to S3 + invalidate CloudFront
# Must be run from repo root (CodeBuild CWD)
# Inputs:
#   SourceCode (PrimarySource) — contains this script and config.json
#   BuildOutput (secondary)    — contains the built static files
set -euo pipefail

S3_BUCKET="${S3_BUCKET:-}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
SITE_DOMAIN="${SITE_DOMAIN:-pos-landing.jcampos.dev}"
REGION="${REGION:-us-east-1}"

if [ -z "$S3_BUCKET" ]; then
  echo "ERROR: S3_BUCKET env var is required"
  exit 1
fi

# BuildOutput is extracted by CodeBuild into $CODEBUILD_SRC_DIR_BuildOutput
BUILD_DIR="${CODEBUILD_SRC_DIR_BuildOutput:-}"

if [ -z "$BUILD_DIR" ] || [ ! -d "$BUILD_DIR" ]; then
  echo "ERROR: BuildOutput directory not found at: $BUILD_DIR"
  echo "  Make sure the CodePipeline stage declares PrimarySource: SourceCode"
  exit 1
fi

echo "=== pos-landing Deploy Phase ==="
echo "  Site       : https://$SITE_DOMAIN"
echo "  S3 bucket  : $S3_BUCKET"
echo "  Build dir  : $BUILD_DIR"
echo "  CloudFront : ${CLOUDFRONT_DISTRIBUTION_ID:-<not set — skipping invalidation>}"

# ── Sync static files to S3 ───────────────────────────────────────────────

echo ""
echo "Syncing to s3://$S3_BUCKET ..."

# HTML — no cache (always check for updates)
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
  --region "$REGION" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate"

# JS/CSS assets — long cache (content-hashed filenames)
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
  --region "$REGION" \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable"

# config.json — no cache (editable at runtime)
if [ -f "$BUILD_DIR/config.json" ]; then
  aws s3 cp "$BUILD_DIR/config.json" "s3://$S3_BUCKET/config.json" \
    --region "$REGION" \
    --cache-control "no-cache, no-store, must-revalidate"
fi

echo "S3 sync complete."

# ── CloudFront invalidation ───────────────────────────────────────────────

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo ""
  echo "Creating CloudFront invalidation for $CLOUDFRONT_DISTRIBUTION_ID ..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)
  echo "Invalidation created: $INVALIDATION_ID"
  echo "  (Propagation takes 1–5 minutes. Not waiting — pipeline returns immediately.)"
else
  echo "CloudFront distribution ID not set — skipping invalidation."
  echo "  Set CloudFrontDistributionIdParam in the pipeline CFN stack after infra is created."
fi

echo ""
echo "Deploy complete: https://$SITE_DOMAIN"
