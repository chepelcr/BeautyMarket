import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HomePageContent } from '@shared/schema';

export function useDynamicTitle(pageTitle?: string) {
  const { data: homeContent } = useQuery<HomePageContent[]>({
    queryKey: ["/api/home-content"],
  });

  useEffect(() => {
    const siteContent = homeContent?.filter(item => item.section === 'site') || [];
    const siteTitle = siteContent.find(item => item.key === 'title')?.value || 'Strawberry Essentials';
    
    // Update document title
    if (pageTitle) {
      document.title = `${pageTitle} | ${siteTitle}`;
    } else {
      document.title = siteTitle;
    }

    // Update favicon if available
    const favicon = siteContent.find(item => item.key === 'favicon')?.value;
    if (favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = favicon;
      }
    }
  }, [homeContent, pageTitle]);
}