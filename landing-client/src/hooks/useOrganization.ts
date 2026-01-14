import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { buildUserApiUrl, buildPublicApiUrl } from '@/lib/apiUtils';

// Simplified types for landing page
export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

async function authenticatedRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.warn('No auth session available');
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  // The URL is already complete from buildUserApiUrl/buildPublicApiUrl, no need to prepend base URL
  return fetch(url, config);
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
        const response = await authenticatedRequest(
          'GET',
          buildUserApiUrl(userId, '/memberships/organizations')
        );
        if (!response.ok) throw new Error('Failed to fetch organizations');
        return response.json() as Promise<Organization[]>;
      },
      enabled: !!userId,
    });
  };

  // Check slug availability (public endpoint)
  const checkSlugAvailable = async (slug: string): Promise<boolean> => {
    const response = await authenticatedRequest(
      'GET',
      buildPublicApiUrl(`/organizations/check-slug/${slug}`)
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.available;
  };

  // Check subdomain availability (public endpoint)
  const checkSubdomainAvailable = async (subdomain: string): Promise<boolean> => {
    const response = await authenticatedRequest(
      'GET',
      buildPublicApiUrl(`/organizations/check-subdomain/${subdomain}`)
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.available;
  };

  // Create organization mutation (Step 1 - draft)
  const createOrganization = useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      const response = await authenticatedRequest(
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
      const response = await authenticatedRequest(
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
    },
  });

  // Complete onboarding step 3 (apply template)
  const completeOnboardingStep3 = useMutation({
    mutationFn: async (data: CompleteStep3Data) => {
      const { organizationId, userId, templateId, includeCategories } = data;
      const response = await authenticatedRequest(
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
    },
  });

  return {
    // Queries
    useUserOrganizations,

    // Checks
    checkSlugAvailable,
    checkSubdomainAvailable,

    // Mutations
    createOrganization,
    completeOnboardingStep2,
    completeOnboardingStep3,
  };
}
