// Client-side image URL utilities for CloudFront and S3 integration

const CLOUDFRONT_DOMAIN = 'd1taomm62uzhjk.cloudfront.net';

/**
 * Convert any image URL to use CloudFront for consistent delivery
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If already a CloudFront URL, return as is
  if (url.includes(CLOUDFRONT_DOMAIN)) {
    return url;
  }
  
  // If it's an S3 URL, extract the key and use CloudFront
  if (url.includes('.s3.') && url.includes('.amazonaws.com/')) {
    const key = url.split('.amazonaws.com/')[1];
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  }
  
  // If it's a relative path or key, prepend CloudFront domain
  if (!url.startsWith('http')) {
    const cleanKey = url.startsWith('/') ? url.slice(1) : url;
    return `https://${CLOUDFRONT_DOMAIN}/${cleanKey}`;
  }
  
  // For other URLs, return as is (external images)
  return url;
}

/**
 * Extract S3 key from any image URL
 */
export function extractS3Key(url: string): string | null {
  if (!url) return null;
  
  // From CloudFront URL
  if (url.includes(CLOUDFRONT_DOMAIN)) {
    return url.split(`${CLOUDFRONT_DOMAIN}/`)[1] || null;
  }
  
  // From S3 URL
  if (url.includes('.s3.') && url.includes('.amazonaws.com/')) {
    return url.split('.amazonaws.com/')[1] || null;
  }
  
  return null;
}

/**
 * Check if a URL is an image stored in our S3/CloudFront system
 */
export function isS3Image(url: string): boolean {
  if (!url) return false;
  return url.includes(CLOUDFRONT_DOMAIN) || 
         (url.includes('.s3.') && url.includes('.amazonaws.com/'));
}