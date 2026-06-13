import { useEffect } from 'react';
import { useCmsContent } from './use-cms-content';

export function useDynamicTitle(pageTitle?: string) {
  const { getContent } = useCmsContent();

  useEffect(() => {
    const siteTitle = getContent('site', 'title', 'Strawberry Essentials');
    
    // Update document title
    if (pageTitle) {
      document.title = `${pageTitle} | ${siteTitle}`;
    } else {
      document.title = siteTitle;
    }

    // Update favicon if available
    const favicon = getContent('site', 'favicon', '');
    if (favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = favicon;
      }
    }
  }, [getContent, pageTitle]);
}