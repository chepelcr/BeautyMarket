#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const buildDir = 'dist/public';
const repoName = process.argv[2] || 'strawberry-essentials';

console.log('🍓 Building Strawberry Essentials for GitHub Pages...');

// Build the static version
console.log('📦 Building static assets...');
execSync('npx vite build', { stdio: 'inherit' });

// Copy attached assets to the build directory
console.log('📸 Copying assets...');
if (fs.existsSync('attached_assets')) {
  if (!fs.existsSync(path.join(buildDir, 'attached_assets'))) {
    fs.mkdirSync(path.join(buildDir, 'attached_assets'), { recursive: true });
  }
  execSync(`cp -r attached_assets/* ${buildDir}/attached_assets/`, { stdio: 'inherit' });
}

// Create CNAME file if needed (uncomment and modify for custom domain)
// fs.writeFileSync(path.join(buildDir, 'CNAME'), 'your-domain.com');

// Update index.html for GitHub Pages routing
const indexPath = path.join(buildDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Add GitHub Pages routing script
const routingScript = `
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
    <meta name="description" content="Tu tienda virtual de confianza para productos de belleza. Ofrecemos lo mejor en maquillaje, skincare y accesorios." />
    <meta property="og:title" content="Strawberry Essentials - Productos de Belleza" />
    <meta property="og:description" content="Tu tienda virtual de confianza para productos de belleza. Ofrecemos lo mejor en maquillaje, skincare y accesorios." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="./attached_assets/image_1755019713048.png" />
    <title>Strawberry Essentials - Productos de Belleza</title>
`;

// Insert the routing script and meta tags before closing head tag
indexContent = indexContent.replace('</head>', routingScript + '</head>');

fs.writeFileSync(indexPath, indexContent);

// Create a deployment-ready message
console.log('✅ Static build completed!');
console.log('\n🚀 To deploy to GitHub Pages:');
console.log('1. Push your code to GitHub');
console.log('2. Go to repository Settings > Pages');
console.log('3. Select "GitHub Actions" as the source');
console.log('4. The site will be available at: https://[username].github.io/' + repoName);
console.log('\n📁 Build files are in:', buildDir);