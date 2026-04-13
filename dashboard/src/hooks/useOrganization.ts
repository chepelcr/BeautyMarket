import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { buildUserApiUrl, buildPublicApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';

// Simplified types for landing page
export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  ownerId: string;
  onboardingStep?: number;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Types for the hook
interface CreateOrganizationData {
  name: string;
  slug: string;
  subdomain?: string;
  ownerId: string;
}

interface CompleteStep2Data {
  organizationId: string;
  userId: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CompleteStep3Data {
  organizationId: string;
  userId: string;
  templateId?: string;
  includeCategories?: boolean;
}

export function useOrganization() {
  const queryClient = useQueryClient();

  // Get user's organizations
  const useUserOrganizations = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['user-organizations', userId],
      queryFn: async () => {
        if (!userId) return [];
        const response = await apiRequest(
          'GET',
          buildUserApiUrl(userId, '/memberships/organizations')
        );
        if (!response.ok) throw new Error('Failed to fetch organizations');
        return response.json() as Promise<Organization[]>;
      },
      enabled: !!userId,
      staleTime: Infinity, // org list never goes stale — invalidated only on mutations
      gcTime: Infinity,
    });
  };

  // Get the currently selected organization.
  // Shares the same cache as useUserOrganizations (same query key).
  // Returns the org stored in sessionStorage['selectedOrgId'], or the only org when there's just one.
  const useDefaultOrganization = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['user-organizations', userId],
      queryFn: async () => {
        if (!userId) return [];
        const response = await apiRequest(
          'GET',
          buildUserApiUrl(userId, '/memberships/organizations')
        );
        if (!response.ok) throw new Error('Failed to fetch organizations');
        return response.json() as Promise<Organization[]>;
      },
      select: (orgs) => {
        const selectedId = sessionStorage.getItem('selectedOrgId');
        if (selectedId) {
          return orgs.find((o) => o.id === selectedId) ?? orgs[0] ?? null;
        }
        return orgs[0] ?? null;
      },
      enabled: !!userId,
      staleTime: Infinity, // org list never goes stale — invalidated only on mutations
      gcTime: Infinity,
    });
  };

  // Check slug availability (public endpoint)
  // Memoized to prevent infinite loops when used in useEffect dependencies
  const checkSlugAvailable = useCallback(async (slug: string): Promise<boolean> => {
    const response = await apiRequest(
      'GET',
      buildPublicApiUrl(`/organizations/check-slug/${slug}`)
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.available;
  }, []);

  // Check subdomain availability (public endpoint)
  // Memoized to prevent infinite loops when used in useEffect dependencies
  const checkSubdomainAvailable = useCallback(async (subdomain: string): Promise<boolean> => {
    const response = await apiRequest(
      'GET',
      buildPublicApiUrl(`/organizations/check-subdomain/${subdomain}`)
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.available;
  }, []);

  // Create organization mutation (Step 1 - draft)
  const createOrganization = useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      const response = await apiRequest(
        'POST',
        buildUserApiUrl(data.ownerId, '/organizations'),
        data
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create organization');
      }
      return response.json() as Promise<Organization>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
    },
  });

  // Complete onboarding step 2 (contact info)
  const completeOnboardingStep2 = useMutation({
    mutationFn: async (data: CompleteStep2Data) => {
      const { organizationId, userId, ...contactSettings } = data;
      const response = await apiRequest(
        'POST',
        buildUserApiUrl(userId, `/organizations/${organizationId}/onboarding/step2`),
        contactSettings
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save contact information');
      }
      return response.json() as Promise<Organization>;
    },
    // Don't invalidate during onboarding - wait until completion
  });

  // Complete onboarding step 3 (apply template)
  const completeOnboardingStep3 = useMutation({
    mutationFn: async (data: CompleteStep3Data) => {
      const { organizationId, userId, templateId, includeCategories } = data;
      const response = await apiRequest(
        'POST',
        buildUserApiUrl(userId, `/organizations/${organizationId}/onboarding/step3`),
        { templateId, includeCategories }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply template');
      }
      return response.json() as Promise<Organization>;
    },
    // Invalidate only after final step completes
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
    },
  });

  return {
    // Queries
    useUserOrganizations,
    useDefaultOrganization,

    // Checks
    checkSlugAvailable,
    checkSubdomainAvailable,

    // Mutations
    createOrganization,
    completeOnboardingStep2,
    completeOnboardingStep3,
  };
}
