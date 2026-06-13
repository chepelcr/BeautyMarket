import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { buildUserApiUrl, buildPublicApiUrl, buildOrgApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  role?: { id: string; name: string; displayName: string };
  inviter?: { id: string; email: string; firstName?: string; lastName?: string };
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  organizationId: string | null;
  createdAt: string;
}

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

  // Fetch all invitations for an organization
  const useOrganizationInvitations = (userId: string | undefined, orgId: string | undefined) => {
    return useQuery({
      queryKey: ['org-invitations', userId, orgId],
      queryFn: async () => {
        if (!userId || !orgId) return [];
        const response = await apiRequest('GET', buildOrgApiUrl(userId, orgId, '/invitations'));
        if (!response.ok) throw new Error('Failed to fetch invitations');
        return response.json() as Promise<Invitation[]>;
      },
      enabled: !!userId && !!orgId,
    });
  };

  // Fetch system + org roles
  const useSystemRoles = (userId: string | undefined, orgId: string | undefined) => {
    return useQuery({
      queryKey: ['org-roles', userId, orgId],
      queryFn: async () => {
        if (!userId || !orgId) return [];
        const response = await apiRequest('GET', buildOrgApiUrl(userId, orgId, '/rbac/roles'));
        if (!response.ok) throw new Error('Failed to fetch roles');
        return response.json() as Promise<Role[]>;
      },
      enabled: !!userId && !!orgId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Send invitation
  const inviteMember = useMutation({
    mutationFn: async (data: { userId: string; orgId: string; email: string; roleId: string }) => {
      const response = await apiRequest(
        'POST',
        buildOrgApiUrl(data.userId, data.orgId, '/invitations'),
        { organizationId: data.orgId, email: data.email, roleId: data.roleId, invitedBy: data.userId }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }
      return response.json() as Promise<Invitation>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-invitations', variables.userId, variables.orgId] });
    },
  });

  // Cancel invitation
  const cancelInvitation = useMutation({
    mutationFn: async ({ userId, orgId, invitationId }: { userId: string; orgId: string; invitationId: string }) => {
      const response = await apiRequest(
        'DELETE',
        buildOrgApiUrl(userId, orgId, `/invitations/${invitationId}`)
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel invitation');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-invitations', variables.userId, variables.orgId] });
    },
  });

  // Resend invitation
  const resendInvitation = useMutation({
    mutationFn: async ({ userId, orgId, invitationId }: { userId: string; orgId: string; invitationId: string }) => {
      const response = await apiRequest(
        'POST',
        buildOrgApiUrl(userId, orgId, `/invitations/${invitationId}/resend`)
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend invitation');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-invitations', variables.userId, variables.orgId] });
    },
  });

  return {
    // Queries
    useUserOrganizations,
    useDefaultOrganization,
    useOrganizationInvitations,
    useSystemRoles,

    // Checks
    checkSlugAvailable,
    checkSubdomainAvailable,

    // Mutations
    createOrganization,
    completeOnboardingStep2,
    completeOnboardingStep3,
    inviteMember,
    cancelInvitation,
    resendInvitation,
  };
}
