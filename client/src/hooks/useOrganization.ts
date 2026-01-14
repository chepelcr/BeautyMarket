import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { buildUserApiUrl, buildPublicApiUrl } from '@/lib/apiUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Simplified types for landing page
export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  ownerId: string;
  onboardingStep?: number; // 0 = not started, 1 = basic info, 2 = contact info, 3 = completed
  createdAt: string;
  updatedAt: string;
}

async function authenticatedRequest(
  method: string,
  endpoint: string,
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

  return fetch(`${API_BASE_URL}${endpoint}`, config);
}

// Types for the hook
interface CreateOrganizationData {
  name: string;
  slug: string;
  subdomain?: string;
  ownerId: string;
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

  // Get user's default organization (first one in the list)
  const useDefaultOrganization = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['default-organization', userId],
      queryFn: async () => {
        if (!userId) return null;
        const response = await authenticatedRequest(
          'GET',
          buildUserApiUrl(userId, '/memberships/organizations')
        );
        if (!response.ok) return null;
        const orgs = await response.json() as Organization[];
        return orgs.length > 0 ? orgs[0] : null;
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

  // Create organization mutation
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

  return {
    // Queries
    useUserOrganizations,
    useDefaultOrganization,

    // Checks
    checkSlugAvailable,
    checkSubdomainAvailable,

    // Mutations
    createOrganization,
  };
}
