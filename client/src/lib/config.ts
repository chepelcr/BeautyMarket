// Configuration for different environments
export const config = {
  // Check if we're running in GitHub Pages or other static hosting
  isStatic: !import.meta.env.DEV && (
    window.location.hostname.includes('github.io') || 
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app') ||
    !window.location.hostname.includes('localhost')
  ),
  
  // API base URL - empty for static builds, backend URL for dynamic
  apiBaseUrl: import.meta.env.DEV ? '' : '',
  
  // Static mode - disables backend features
  staticMode: !import.meta.env.DEV && (
    window.location.hostname.includes('github.io') || 
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app')
  )
};

export default config;