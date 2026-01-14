import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubdomain } from '@/lib/subdomain';
import { buildPublicApiUrl } from '@/lib/apiUtils';
import type { Organization } from '@/models';

interface BucketConfig {
  templateId?: string;
  orgId?: string;
  mode: 'demo' | 'prod';
}

interface SubdomainContextValue {
  subdomain: string | null;
  organization: Organization | null;
  config: BucketConfig | null;
  isLoading: boolean;
  error: Error | null;
}

const SubdomainContext = createContext<SubdomainContextValue | undefined>(undefined);

export function SubdomainProvider({ children }: { children: ReactNode }) {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [config, setConfig] = useState<BucketConfig | null>(null);

  useEffect(() => {
    const currentSubdomain = getSubdomain();
    setSubdomain(currentSubdomain);

    fetch('/config.json')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  const { data: organization, isLoading, error } = useQuery<Organization>({
    queryKey: ['organization', config?.mode, config?.orgId, config?.templateId],
    queryFn: async () => {
      if (!config) return null;
      
      if (config.mode === 'prod' && config.orgId) {
        const response = await fetch(buildPublicApiUrl(`/organizations/${config.orgId}`));
        if (!response.ok) throw new Error('Failed to fetch organization');
        return response.json();
      }
      
      if (config.mode === 'demo' && config.templateId) {
        const response = await fetch(buildPublicApiUrl(`/templates/${config.templateId}`));
        if (!response.ok) throw new Error('Failed to fetch template');
        return response.json();
      }
      
      return null;
    },
    enabled: !!config && (!!config.orgId || !!config.templateId),
  });

  const value: SubdomainContextValue = {
    subdomain,
    organization: organization || null,
    config,
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
