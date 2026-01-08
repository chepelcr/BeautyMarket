// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  ownerId: string;
  isActive: boolean;
  preDeployment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  socialLinks: Record<string, string> | null;
  currency: string;
  acceptedPaymentMethods: string[];
  freeShippingThreshold: number | null;
  defaultShippingCost: number | null;
  createdAt: string;
  updatedAt: string;
}

// Organization Member types
export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  isDefault: boolean;
  joinedAt: string;
  addedBy: string | null;
}

export interface OrganizationMemberWithUser extends OrganizationMember {
  user: User;
  role: Role;
}

// Organization Invitation types
export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
}

export interface OrganizationInvitationWithDetails extends OrganizationInvitation {
  organization: Organization;
  role: Role;
  inviter: User;
}

// RBAC types
export interface Module {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
}

export interface Submodule {
  id: string;
  moduleId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
}

export interface Action {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  moduleId: string;
  submoduleId: string | null;
  actionId: string;
  createdAt: string;
}

export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

export interface ModuleWithSubmodules extends Module {
  submodules: Submodule[];
}

export interface PermissionMatrix {
  [moduleId: string]: {
    [submoduleId: string]: {
      [actionId: string]: boolean;
    };
  };
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  gender: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: string | null;
  stock: number;
  isActive: boolean;
  preDeployment: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  backgroundColor: string | null;
  buttonColor: string | null;
  preDeployment: boolean;
  createdAt: string;
  updatedAt: string;
}

// Deployment types
export interface DeploymentHistory {
  id: string;
  organizationId: string;
  deployedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PreDeployment {
  hasChanges: boolean;
  changedEntities: string[];
}
