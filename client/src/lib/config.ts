// Configuration for different environments
export const config = {
  // Check if we're running in GitHub Pages or other static hosting
  isStatic: !import.meta.env.DEV && (
    window.location.hostname.includes('github.io') || 
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app') ||
    !window.location.hostname.includes('localhost')
  ),
  
  // API base URL - points to development server for S3 deployment
  // CHANGE THIS: Update to your production API URL when moving to production
  apiBaseUrl: import.meta.env.DEV ? '' : 'https://rest-express-u28s.replit.app',
  
  // Static mode - disables backend features
  staticMode: !import.meta.env.DEV && (
    window.location.hostname.includes('github.io') || 
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app')
  )
};

export default config;