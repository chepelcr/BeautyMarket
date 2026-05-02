import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '@/services/storefrontApi';
import { useOrganization } from '@/contexts/OrganizationContext';
import { parsePageSections, getSectionContent, type SectionContent } from '@/lib/pageUtils';

/**
 * Fetches the configured organization's `home` page (with all sections) and
 * returns each section's content keyed by section type. When no organization
 * is configured (e.g. the demo bucket without a config.json) the content map
 * is empty so the LandingPage falls back to BRAND defaults.
 */
export function useHomeContent() {
  const { organizationId, isConfigLoading } = useOrganization();

  const query = useQuery({
    queryKey: ['page', 'home', organizationId],
    queryFn: () => storefrontApi.getPage(organizationId!, 'home'),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });

  const sections = parsePageSections(query.data);

  const get = (type: string): SectionContent => getSectionContent(sections, type);

  return {
    sections,
    hero: get('hero'),
    benefits: get('benefits'),
    cta: get('cta'),
    testimonials: get('testimonials'),
    featured: get('featured'),
    newsletter: get('newsletter'),
    isLoading: isConfigLoading || query.isLoading,
    error: query.error as Error | null,
    isFromApi: !!organizationId && !!query.data,
  };
}
