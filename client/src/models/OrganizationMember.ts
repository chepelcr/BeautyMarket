export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  isDefault: boolean | null;
  invitedBy: string | null;
  joinedAt: Date;
}

export interface InsertOrganizationMember {
  organizationId: string;
  userId: string;
  roleId: string;
  isDefault?: boolean;
  invitedBy?: string;
}

// Extended type with user details for UI
export interface OrganizationMemberWithUser extends OrganizationMember {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  role: {
    id: string;
    name: string;
    displayName: string;
  };
}
