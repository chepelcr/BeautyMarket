import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubdomain } from '@/lib/subdomain';
import { buildPublicApiUrl } from '@/lib/apiUtils';
import type { Organization } from '@/models';

interface SubdomainContextValue {
  subdomain: string | null;
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
}

const SubdomainContext = createContext<SubdomainContextValue | undefined>(undefined);

export function SubdomainProvider({ children }: { children: ReactNode }) {
  const [subdomain, setSubdomain] = useState<string | null>(null);

  // Detect subdomain on mount
  useEffect(() => {
    const currentSubdomain = getSubdomain();
    setSubdomain(currentSubdomain);
  }, []);

  // Fetch organization by subdomain using React Query
  const { data: organization, isLoading, error } = useQuery<Organization>({
    queryKey: ['organization', 'subdomain', subdomain],
    queryFn: async () => {
      if (!subdomain) return null;
      const response = await fetch(buildPublicApiUrl(`/organizations/by-subdomain/${subdomain}`));
      if (!response.ok) {
        throw new Error('Failed to fetch organization');
      }
      return response.json();
    },
    enabled: !!subdomain,
  });

  const value: SubdomainContextValue = {
    subdomain,
    organization: organization || null,
    isLoading,
    error: error as Error | null,
  };

  return (
    <SubdomainContext.Provider value={value}>
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomainContext() {
  const context = useContext(SubdomainContext);
  if (context === undefined) {
    throw new Error('useSubdomainContext must be used within a SubdomainProvider');
  }
  return context;
}
