#!/bin/bash

# Build script for Artisan Crafts template
# This script installs dependencies and builds the template

set -e  # Exit on error

echo "🎨 Building Artisan Crafts Template..."
echo ""

# Navigate to template directory
cd templates/artisan-crafts

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the template
echo "🔨 Building template..."
npm run build

# Verify build output
if [ -d "../../dist/templates/artisan-crafts" ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📁 Output: dist/templates/artisan-crafts"
    echo ""
    echo "Build contents:"
    ls -lh ../../dist/templates/artisan-crafts
else
    echo ""
    echo "❌ Build failed - output directory not found"
    exit 1
fi

echo ""
echo "🎉 Artisan Crafts template is ready for deployment!"
echo "Live URL: https://artisan-crafts-example.jmarkets.jcampos.dev"
