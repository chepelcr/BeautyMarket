import { z } from "zod";

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  invitedBy: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface InsertOrganizationInvitation {
  organizationId: string;
  email: string;
  roleId: string;
}

// Extended type with details for UI
export interface OrganizationInvitationWithDetails extends OrganizationInvitation {
  role: {
    id: string;
    name: string;
    displayName: string;
  };
  invitedByUser: {
    id: string;
    username: string;
    email: string;
  };
}

export const insertOrganizationInvitationSchema = z.object({
  email: z.string().email("Email inválido"),
  roleId: z.string().min(1, "El rol es requerido"),
});
