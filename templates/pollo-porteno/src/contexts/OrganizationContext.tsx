import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '@/services/storefrontApi';
import type { Organization, ThemeSettings, ContactSettings } from '@/types';

/**
 * Storefront config loaded from `/config.json` (served from the
 * deployment bucket). The visitor is an external customer that does NOT
 * belong to the organization — the orgId in this file is the only thing
 * that scopes the anonymous API calls to the right store.
 *
 * Example `public/config.json`:
 * {
 *   "organizationId": "org_abc123",
 *   "mode": "prod"
 * }
 */
export interface StorefrontConfig {
  organizationId?: string;
  templateId?: string;
  mode?: 'prod' | 'demo';
}

interface OrganizationContextValue {
  config: StorefrontConfig | null;
  organizationId: string | null;
  organization: Organization | null;
  theme: ThemeSettings | null;
  contact: ContactSettings | null;
  isLoading: boolean;
  isConfigLoading: boolean;
  error: Error | null;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

async function loadStorefrontConfig(): Promise<StorefrontConfig> {
  // 1) Try config.json (the canonical source for deployed buckets).
  try {
    const res = await fetch('/config.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = (await res.json()) as StorefrontConfig;
      if (data.organizationId || data.templateId) return data;
    }
  } catch {
    // ignore, fall through to env/query
  }

  // 2) Fall back to env variable (build-time injection).
  if (import.meta.env.VITE_ORGANIZATION_ID) {
    return { organizationId: String(import.meta.env.VITE_ORGANIZATION_ID), mode: 'prod' };
  }

  // 3) Fall back to query param (useful for local testing).
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('organizationId');
  if (fromQuery) return { organizationId: fromQuery, mode: 'prod' };

  return {};
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadStorefrontConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .finally(() => {
        if (!cancelled) setIsConfigLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const organizationId = config?.organizationId ?? null;

  const orgQuery = useQuery<Organization>({
    queryKey: ['org', organizationId],
    queryFn: () => storefrontApi.getOrganization(organizationId!),
    enabled: !!organizationId,
  });

  const themeQuery = useQuery<ThemeSettings>({
    queryKey: ['org-theme', organizationId],
    queryFn: () => storefrontApi.getTheme(organizationId!),
    enabled: !!organizationId,
  });

  const contactQuery = useQuery<ContactSettings>({
    queryKey: ['org-contact', organizationId],
    queryFn: () => storefrontApi.getContact(organizationId!),
    enabled: !!organizationId,
  });

  // Apply remote theme to CSS variables (overrides defaults).
  useEffect(() => {
    const theme = themeQuery.data;
    if (!theme) return;
    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--pollo-red', theme.primaryColor);
    if (theme.secondaryColor) root.style.setProperty('--pollo-yellow', theme.secondaryColor);
    if (theme.faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (link) link.href = theme.faviconUrl;
    }
  }, [themeQuery.data]);

  const value: OrganizationContextValue = {
    config,
    organizationId,
    organization: orgQuery.data ?? null,
    theme: themeQuery.data ?? null,
    contact: contactQuery.data ?? null,
    isConfigLoading,
    isLoading:
      isConfigLoading || orgQuery.isLoading || themeQuery.isLoading || contactQuery.isLoading,
    error: (orgQuery.error || themeQuery.error || contactQuery.error) as Error | null,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used inside OrganizationProvider');
  return ctx;
}
