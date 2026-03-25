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
  const distPath = path.join(process.cwd(), 'dist', 'public');
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html generated');
    
    // Create error.html as a copy of index.html for S3 routing
    const errorPath = path.join(distPath, 'error.html');
    fs.copyFileSync(indexPath, errorPath);
    console.log('✅ error.html created for S3 SPA routing');
    
    // Create 404.html as a copy of index.html for S3 routing  
    const notFoundPath = path.join(distPath, '404.html');
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✅ 404.html created for S3 SPA routing');
    
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