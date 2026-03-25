#!/bin/bash
# Phase 2 — Update Lambda function code from lambda-package.zip artifact
set -euo pipefail

ENVIRONMENT="${ENVIRONMENT:-dev}"
REGION="${REGION:-us-east-1}"
FUNCTION_NAME="jmarkets-${ENVIRONMENT}-api-handler"

echo "=== JMarkets Lambda Update ==="
echo "  Function    : ${FUNCTION_NAME}"
echo "  Region      : ${REGION}"
echo ""

# Verify artifact is present
if [ ! -f "lambda-package.zip" ]; then
  echo "ERROR: lambda-package.zip not found in workspace"
  exit 1
fi

# Check function exists
if ! aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
  echo "[SKIP] Function ${FUNCTION_NAME} does not exist — deploy Lambda stack first"
  exit 0
fi

# Update with retry (throttle protection)
UPDATED=false
for attempt in 1 2 3; do
  echo "Attempt ${attempt}: updating ${FUNCTION_NAME}..."
  if aws lambda update-function-code \
      --function-name "$FUNCTION_NAME" \
      --zip-file fileb://lambda-package.zip \
      --region "$REGION" \
      --output text --query 'FunctionArn'; then
    UPDATED=true
    break
  fi
  echo "  Retrying in 10s..."
  sleep 10
done

if [ "$UPDATED" = "false" ]; then
  echo "ERROR: Failed to update ${FUNCTION_NAME} after 3 attempts"
  exit 1
fi

echo ""
echo "Updated: ${FUNCTION_NAME}"
echo "Update complete."
