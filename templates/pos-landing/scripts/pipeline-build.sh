#!/bin/bash
# Phase 1 — Build the Vite app for pos-landing
# Must be run from repo root (CodeBuild CWD)
set -euo pipefail

ENVIRONMENT="${ENVIRONMENT:-dev}"

echo "=== pos-landing Build Phase ==="
echo "  Environment : $ENVIRONMENT"
echo "  Node version: $(node --version)"

# Already cd'd into templates/pos-landing in buildspec-build.yml install phase
# but if run from repo root, handle both
if [ -f "package.json" ] && grep -q '"name": "pos-landing"' package.json 2>/dev/null; then
  echo "  Working dir : templates/pos-landing (already here)"
else
  echo "  Working dir : switching to templates/pos-landing"
  cd templates/pos-landing
fi

# Run the Vite build
npm run build

echo ""
echo "Build complete. Output: ../../dist/templates/pos-landing/"
ls -lh ../../dist/templates/pos-landing/ 2>/dev/null | head -10 || \
  ls -lh dist/templates/pos-landing/ 2>/dev/null | head -10 || true
