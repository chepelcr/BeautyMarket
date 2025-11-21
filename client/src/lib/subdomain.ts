/**
 * Subdomain detection utility for multi-tenant SaaS
 *
 * Examples:
 * - jmarkets.jcampos.dev -> null (main domain)
 * - mi-tienda.jmarkets.jcampos.dev -> "mi-tienda"
 * - localhost:3000 -> null
 * - mi-tienda.localhost:3000 -> "mi-tienda"
 */

// Base domain configuration
const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN || 'jmarkets.jcampos.dev';

/**
 * Get the current subdomain from the hostname
 * Returns null if on the main domain or localhost without subdomain
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  // Handle .localhost development (e.g., mi-tienda.localhost)
  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.replace('.localhost', '');
    return subdomain || null;
  }

  // Handle production domains
  const baseDomainParts = BASE_DOMAIN.split('.');
  const hostnameParts = hostname.split('.');

  // If hostname has more parts than base domain, extract subdomain
  if (hostnameParts.length > baseDomainParts.length) {
    // Get the subdomain part(s)
    const subdomainParts = hostnameParts.slice(0, hostnameParts.length - baseDomainParts.length);
    const subdomain = subdomainParts.join('.');

    // Verify the rest matches base domain
    const remainingParts = hostnameParts.slice(hostnameParts.length - baseDomainParts.length);
    if (remainingParts.join('.') === BASE_DOMAIN) {
      return subdomain;
    }
  }

  return null;
}

/**
 * Check if we're on the main domain (no subdomain)
 */
export function isMainDomain(): boolean {
  return getSubdomain() === null;
}

/**
 * Check if we're on a tenant subdomain
 */
export function isSubdomain(): boolean {
  return getSubdomain() !== null;
}

/**
 * Build a URL for a specific subdomain
 */
export function buildSubdomainUrl(subdomain: string, path: string = '/'): string {
  const protocol = window.location.protocol;
  const port = window.location.port;

  // Handle localhost development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//${subdomain}.localhost${portPart}${path}`;
  }

  return `${protocol}//${subdomain}.${BASE_DOMAIN}${path}`;
}

/**
 * Build a URL for the main domain
 */
export function buildMainDomainUrl(path: string = '/'): string {
  const protocol = window.location.protocol;
  const port = window.location.port;

  // Handle localhost development
  if (window.location.hostname.includes('localhost')) {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//localhost${portPart}${path}`;
  }

  return `${protocol}//${BASE_DOMAIN}${path}`;
}

export { BASE_DOMAIN };
