import { useEffect } from 'react';

/**
 * Custom hook to set the document title dynamically
 *
 * @param title - The page title to set
 * @param suffix - Optional suffix (defaults to " | Dashboard")
 *
 * @example
 * usePageTitle('Products'); // Sets title to "Products | Dashboard"
 * usePageTitle('Settings', ' | Admin Panel'); // Sets title to "Settings | Admin Panel"
 * usePageTitle('Home', ''); // Sets title to just "Home"
 */
export function usePageTitle(title: string, suffix: string = ' | Dashboard') {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title}${suffix}`;

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
}

/**
 * Hook variant that accepts organization name for multi-tenant context
 *
 * @param title - The page title
 * @param organizationName - Optional organization name to include
 *
 * @example
 * usePageTitleWithOrg('Products', 'Acme Inc'); // "Products | Acme Inc | Dashboard"
 */
export function usePageTitleWithOrg(title: string, organizationName?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const parts = [title];

    if (organizationName) {
      parts.push(organizationName);
    }

    parts.push('Dashboard');
    document.title = parts.join(' | ');

    return () => {
      document.title = previousTitle;
    };
  }, [title, organizationName]);
}
