#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Building static version for deployment...');

// Set environment for static build
process.env.VITE_BUILD_TARGET = 'static';

try {
  // Run Vite build
  execSync('vite build', { stdio: 'inherit', cwd: process.cwd() });
  
  console.log('✅ Static build completed successfully');
  
  // Check if index.html was generated
  const distPath = path.join(process.cwd(), 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html generated');
  } else {
    console.warn('⚠️ index.html not found in dist folder');
  }
  
  // List generated files
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log('📦 Generated files:', files);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}