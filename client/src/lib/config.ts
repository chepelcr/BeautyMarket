// Configuration for different environments
export const config = {
  // Check if we're running in GitHub Pages or other static hosting
  isStatic:
    !import.meta.env.DEV &&
    (window.location.hostname.includes("github.io") ||
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("vercel.app") ||
      !window.location.hostname.includes("localhost")),

  // API base URL - points to development server for S3 deployment
  // CHANGE THIS: Update to your production API URL when moving to production
  apiBaseUrl: import.meta.env.DEV
    ? ""
    : "https://888b848e-d46c-4244-bfa1-a77e867c3da2-00-g5w40pnom46x.worf.replit.dev",

  // Static mode - disables backend features
  staticMode:
    !import.meta.env.DEV &&
    (window.location.hostname.includes("github.io") ||
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("vercel.app")) ||
        //cloudfront.net
    window.location.hostname.includes("cloudfront.net"),
};

export default config;
