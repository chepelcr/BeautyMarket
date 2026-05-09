#!/bin/bash
# Deploy pos-landing static files to S3 + invalidate CloudFront.
# Works in two modes:
#   - Integrated (main pipeline): build output is at dist/templates/pos-landing/ (local)
#   - Standalone (old pos-landing-pipeline): build output is in $CODEBUILD_SRC_DIR_BuildOutput
#
# Environment variables (set by CodeBuild project or calling buildspec):
#   POS_LANDING_S3_BUCKET       — S3 bucket name (required)
#   POS_LANDING_CF_DIST_ID      — CloudFront distribution ID (optional; skips invalidation if empty)
#   POS_LANDING_DOMAIN          — Site domain for display (default: pos-landing.jcampos.dev)
#   REGION                      — AWS region (default: us-east-1)
set -euo pipefail

S3_BUCKET="${POS_LANDING_S3_BUCKET:-}"
CF_DIST_ID="${POS_LANDING_CF_DIST_ID:-}"
SITE_DOMAIN="${POS_LANDING_DOMAIN:-pos-landing.jcampos.dev}"
REGION="${REGION:-us-east-1}"

if [ -z "$S3_BUCKET" ]; then
  echo "ERROR: POS_LANDING_S3_BUCKET is not set"
  exit 1
fi

# Resolve build directory:
#   Integrated pipeline  → local dist/templates/pos-landing/
#   Standalone pipeline  → $CODEBUILD_SRC_DIR_BuildOutput (secondary artifact)
if [ -n "${CODEBUILD_SRC_DIR_BuildOutput:-}" ] && [ -d "${CODEBUILD_SRC_DIR_BuildOutput}" ]; then
  BUILD_DIR="$CODEBUILD_SRC_DIR_BuildOutput"
  echo "Mode: standalone (secondary artifact)"
else
  BUILD_DIR="dist/templates/pos-landing"
  echo "Mode: integrated (local build output)"
fi

if [ ! -d "$BUILD_DIR" ]; then
  echo "ERROR: Build directory not found: $BUILD_DIR"
  echo "  Make sure 'npm run build' ran before this script."
  exit 1
fi

echo "=== pos-landing Deploy ==="
echo "  Site       : https://$SITE_DOMAIN"
echo "  S3 bucket  : $S3_BUCKET"
echo "  Build dir  : $BUILD_DIR"
echo "  CloudFront : ${CF_DIST_ID:-<not set — skipping invalidation>}"
echo ""

# ── HTML files — no cache ──────────────────────────────────────────────────
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
  --region "$REGION" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate"

# ── JS / CSS assets — immutable (content-hashed) ──────────────────────────
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
  --region "$REGION" \
  --exclude "*.html" \
  --exclude "config.json" \
  --cache-control "public, max-age=31536000, immutable"

# ── config.json — no cache (editable via local dashboard) ─────────────────
if [ -f "$BUILD_DIR/config.json" ]; then
  aws s3 cp "$BUILD_DIR/config.json" "s3://$S3_BUCKET/config.json" \
    --region "$REGION" \
    --cache-control "no-cache, no-store, must-revalidate"
fi

echo "S3 sync complete."

# ── CloudFront invalidation ────────────────────────────────────────────────
if [ -n "$CF_DIST_ID" ]; then
  echo "Creating CloudFront invalidation for $CF_DIST_ID ..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)
  echo "Invalidation created: $INVALIDATION_ID"
else
  echo "CloudFront distribution ID not set — skipping invalidation."
  echo "  Set PosLandingCfDistIdParam in deploy-codepipeline.sh after infra is created."
fi

echo ""
echo "Deploy complete: https://$SITE_DOMAIN"
