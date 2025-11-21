import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import type {
  Organization,
  OrganizationMember,
  OrganizationInvitation,
  Role
} from '@/models';
import { buildOrgApiUrl, buildUserApiUrl, buildPublicApiUrl } from '@/lib/apiUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

interface InviteMemberData {
  organizationId: string;
  email: string;
  roleId: string;
  invitedBy: string;
}

interface UpdateMemberRoleData {
  memberId: string;
  roleId: string;
  updatedBy: string;
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

  // Get default organization
  const useDefaultOrganization = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['default-organization', userId],
      queryFn: async () => {
        if (!userId) return null;
        const response = await authenticatedRequest(
          'GET',
          buildUserApiUrl(userId, '/memberships/default')
        );
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error('Failed to fetch default organization');
        }
        return response.json() as Promise<Organization>;
      },
      enabled: !!userId,
    });
  };

  // Get organization by ID
  const useOrganizationById = (userId: string | undefined, id: string | undefined) => {
    return useQuery({
      queryKey: ['organization', userId, id],
      queryFn: async () => {
        if (!userId || !id) return null;
        const response = await authenticatedRequest(
          'GET',
          buildUserApiUrl(userId, `/organizations/${id}`)
        );
        if (!response.ok) throw new Error('Failed to fetch organization');
        return response.json() as Promise<Organization>;
      },
      enabled: !!userId && !!id,
    });
  };

  // Get organization members
  const useOrganizationMembers = (userId: string | undefined, organizationId: string | undefined) => {
    return useQuery({
      queryKey: ['organization-members', userId, organizationId],
      queryFn: async () => {
        if (!userId || !organizationId) return [];
        const response = await authenticatedRequest(
          'GET',
          buildUserApiUrl(userId, `/memberships/organization/${organizationId}/members`)
        );
        if (!response.ok) throw new Error('Failed to fetch members');
        return response.json() as Promise<OrganizationMember[]>;
      },
      enabled: !!userId && !!organizationId,
    });
  };

  // Get organization invitations
  const useOrganizationInvitations = (userId: string | undefined, organizationId: string | undefined) => {
    return useQuery({
      queryKey: ['organization-invitations', userId, organizationId],
      queryFn: async () => {
        if (!userId || !organizationId) return [];
        const response = await authenticatedRequest(
          'GET',
          buildOrgApiUrl(userId, organizationId, '/invitations')
        );
        if (!response.ok) throw new Error('Failed to fetch invitations');
        return response.json() as Promise<OrganizationInvitation[]>;
      },
      enabled: !!userId && !!organizationId,
    });
  };

  // Get system roles
  const useSystemRoles = (userId: string | undefined, organizationId: string | undefined) => {
    return useQuery({
      queryKey: ['system-roles', userId, organizationId],
      queryFn: async () => {
        if (!userId || !organizationId) return [];
        const response = await authenticatedRequest(
          'GET',
          buildOrgApiUrl(userId, organizationId, '/rbac/roles')
        );
        if (!response.ok) throw new Error('Failed to fetch roles');
        return response.json() as Promise<Role[]>;
      },
      enabled: !!userId && !!organizationId,
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

  // Get organization by subdomain (public endpoint for tenant resolution)
  const useOrganizationBySubdomain = (subdomain: string | null) => {
    return useQuery({
      queryKey: ['organization-by-subdomain', subdomain],
      queryFn: async () => {
        if (!subdomain) return null;
        const response = await fetch(
          `${API_BASE_URL}${buildPublicApiUrl(`/organizations/by-subdomain/${subdomain}`)}`
        );
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error('Failed to fetch organization');
        }
        return response.json() as Promise<Organization>;
      },
      enabled: !!subdomain,
      staleTime: 10 * 60 * 1000, // 10 minutes - subdomain mapping rarely changes
    });
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
      queryClient.invalidateQueries({ queryKey: ['default-organization'] });
    },
  });

  // Update organization mutation
  const updateOrganization = useMutation({
    mutationFn: async ({ userId, id, data }: { userId: string; id: string; data: Partial<Organization> }) => {
      const response = await authenticatedRequest(
        'PUT',
        buildUserApiUrl(userId, `/organizations/${id}`),
        data
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization');
      }
      return response.json() as Promise<Organization>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.userId, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
    },
  });

  // Set default organization mutation
  const setDefaultOrganization = useMutation({
    mutationFn: async ({ userId, organizationId }: { userId: string; organizationId: string }) => {
      const response = await authenticatedRequest(
        'PUT',
        buildUserApiUrl(userId, `/memberships/default/${organizationId}`)
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set default organization');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['default-organization', variables.userId] });
    },
  });

  // Invite member mutation
  const inviteMember = useMutation({
    mutationFn: async ({ userId, organizationId, email, roleId, invitedBy }: InviteMemberData & { userId: string }) => {
      const response = await authenticatedRequest(
        'POST',
        buildOrgApiUrl(userId, organizationId, '/invitations'),
        { organizationId, email, roleId, invitedBy }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }
      return response.json() as Promise<OrganizationInvitation>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations', variables.userId, variables.organizationId] });
    },
  });

  // Cancel invitation mutation
  const cancelInvitation = useMutation({
    mutationFn: async ({ userId, id, organizationId }: { userId: string; id: string; organizationId: string }) => {
      const response = await authenticatedRequest(
        'DELETE',
        buildOrgApiUrl(userId, organizationId, `/invitations/${id}`)
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel invitation');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations', variables.userId, variables.organizationId] });
    },
  });

  // Resend invitation mutation
  const resendInvitation = useMutation({
    mutationFn: async ({ userId, id, organizationId }: { userId: string; id: string; organizationId: string }) => {
      const response = await authenticatedRequest(
        'POST',
        buildOrgApiUrl(userId, organizationId, `/invitations/${id}/resend`)
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend invitation');
      }
      return response.json();
    },
  });

  // Update member role mutation
  const updateMemberRole = useMutation({
    mutationFn: async ({ userId, memberId, roleId, updatedBy, organizationId }: UpdateMemberRoleData & { userId: string; organizationId: string }) => {
      const response = await authenticatedRequest(
        'PUT',
        buildUserApiUrl(userId, `/memberships/${memberId}/role`),
        { roleId, updatedBy }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update member role');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', variables.userId, variables.organizationId] });
    },
  });

  // Remove member mutation
  const removeMember = useMutation({
    mutationFn: async ({
      userId,
      organizationId,
      removedBy
    }: { userId: string; organizationId: string; removedBy: string }) => {
      const response = await authenticatedRequest(
        'DELETE',
        buildUserApiUrl(userId, `/memberships/organization/${organizationId}`),
        { removedBy }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', variables.userId, variables.organizationId] });
    },
  });

  // Provision infrastructure mutation
  const provisionInfrastructure = useMutation({
    mutationFn: async ({ userId, organizationId }: { userId: string; organizationId: string }) => {
      const response = await authenticatedRequest(
        'POST',
        buildUserApiUrl(userId, `/organizations/${organizationId}/provision`)
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to provision infrastructure');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.userId, variables.organizationId] });
    },
  });

  // Get domain status
  const useDomainStatus = (userId: string | undefined, organizationId: string | undefined) => {
    return useQuery({
      queryKey: ['domain-status', userId, organizationId],
      queryFn: async () => {
        if (!userId || !organizationId) return null;
        const response = await authenticatedRequest(
          'GET',
          buildUserApiUrl(userId, `/organizations/${organizationId}/domain-status`)
        );
        if (!response.ok) throw new Error('Failed to fetch domain status');
        return response.json();
      },
      enabled: !!userId && !!organizationId,
      refetchInterval: 30000, // Poll every 30 seconds
    });
  };

  // Update organization settings mutation
  const updateOrganizationSettings = useMutation({
    mutationFn: async ({ userId, id, settings }: { userId: string; id: string; settings: any }) => {
      const response = await authenticatedRequest(
        'PUT',
        buildUserApiUrl(userId, `/organizations/${id}/settings`),
        settings
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization settings');
      }
      return response.json() as Promise<Organization>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.userId, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
    },
  });

  return {
    // Queries
    useUserOrganizations,
    useDefaultOrganization,
    useOrganizationById,
    useOrganizationBySubdomain,
    useOrganizationMembers,
    useOrganizationInvitations,
    useSystemRoles,
    useDomainStatus,

    // Checks
    checkSlugAvailable,
    checkSubdomainAvailable,

    // Mutations
    createOrganization,
    updateOrganization,
    updateOrganizationSettings,
    setDefaultOrganization,
    inviteMember,
    cancelInvitation,
    resendInvitation,
    updateMemberRole,
    removeMember,
    provisionInfrastructure,
  };
}
