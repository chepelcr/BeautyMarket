import type { OrganizationInvitation } from "../entities";
import type { OrganizationInvitationRepository, OrganizationInvitationWithDetails } from "../repositories/OrganizationInvitationRepository";
import type { OrganizationMemberRepository } from "../repositories/OrganizationMemberRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { RBACRepository } from "../repositories/RBACRepository";
import type { EmailService } from "./EmailService";
import { generateInvitationEmailHtml } from "../templates/emails";
import { appConfig } from "../config/appConfig";

export interface CreateInvitationData {
  organizationId: string;
  email: string;
  roleId: string;
  invitedBy: string;
}

export interface IInvitationService {
  getById(id: string): Promise<OrganizationInvitation | null>;
  getByToken(token: string): Promise<OrganizationInvitation | null>;
  getOrganizationInvitations(organizationId: string): Promise<OrganizationInvitationWithDetails[]>;
  getPendingByEmail(email: string): Promise<OrganizationInvitation[]>;
  create(data: CreateInvitationData): Promise<OrganizationInvitation>;
  accept(token: string, userId: string): Promise<boolean>;
  cancel(id: string): Promise<boolean>;
  resend(id: string): Promise<OrganizationInvitation | null>;
  expireOld(): Promise<number>;
}

export class InvitationService implements IInvitationService {
  constructor(
    private invitationRepo: OrganizationInvitationRepository,
    private memberRepo: OrganizationMemberRepository,
    private userRepo: UserRepository,
    private rbacRepo: RBACRepository,
    private emailService: EmailService,
    private orgRepo: OrganizationRepository
  ) {}

  async getById(id: string): Promise<OrganizationInvitation | null> {
    return this.invitationRepo.findById(id);
  }

  async getByToken(token: string): Promise<OrganizationInvitation | null> {
    return this.invitationRepo.findByToken(token);
  }

  async getOrganizationInvitations(organizationId: string): Promise<OrganizationInvitationWithDetails[]> {
    return this.invitationRepo.findByOrganizationId(organizationId);
  }

  async getPendingByEmail(email: string): Promise<OrganizationInvitation[]> {
    return this.invitationRepo.findPendingByEmail(email);
  }

  async create(data: CreateInvitationData): Promise<OrganizationInvitation> {
    // Check if user is already a member
    const existingUser = await this.userRepo.getUserByEmail(data.email);
    if (existingUser) {
      const existingMembership = await this.memberRepo.findByUserAndOrganization(
        existingUser.id,
        data.organizationId
      );
      if (existingMembership) {
        throw new Error("Este usuario ya es miembro de la organización");
      }
    }

    // Check for existing pending invitation
    const pendingInvitations = await this.invitationRepo.findPendingByEmail(data.email);
    const existingInvite = pendingInvitations.find(inv => inv.organizationId === data.organizationId);
    if (existingInvite) {
      throw new Error("Ya existe una invitación pendiente para este email");
    }

    // Validate role
    const role = await this.rbacRepo.findRoleById(data.roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    // Create invitation
    const invitation = await this.invitationRepo.create({
      organizationId: data.organizationId,
      email: data.email,
      roleId: data.roleId,
      invitedBy: data.invitedBy,
    });

    // Send invitation email
    await this.sendInvitationEmail(invitation);

    return invitation;
  }

  async accept(token: string, userId: string): Promise<boolean> {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new Error("Esta invitación ya no es válida");
    }

    if (new Date() > invitation.expiresAt) {
      await this.invitationRepo.updateStatus(invitation.id, "expired");
      throw new Error("Esta invitación ha expirado");
    }

    // Get user to verify email matches
    const user = await this.userRepo.getUser(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error("Esta invitación no es para tu email");
    }

    // Check if already a member
    const existingMembership = await this.memberRepo.findByUserAndOrganization(
      userId,
      invitation.organizationId
    );
    if (existingMembership) {
      await this.invitationRepo.updateStatus(invitation.id, "accepted");
      throw new Error("Ya eres miembro de esta organización");
    }

    // Add user to organization
    await this.memberRepo.create({
      organizationId: invitation.organizationId,
      userId: userId,
      roleId: invitation.roleId,
      invitedBy: invitation.invitedBy,
      isDefault: false,
    });

    // Mark invitation as accepted
    await this.invitationRepo.updateStatus(invitation.id, "accepted");

    return true;
  }

  async cancel(id: string): Promise<boolean> {
    const invitation = await this.invitationRepo.findById(id);
    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden cancelar invitaciones pendientes");
    }

    await this.invitationRepo.updateStatus(id, "cancelled");
    return true;
  }

  async resend(id: string): Promise<OrganizationInvitation | null> {
    const invitation = await this.invitationRepo.findById(id);
    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden reenviar invitaciones pendientes");
    }

    // Send email again
    await this.sendInvitationEmail(invitation);

    return invitation;
  }

  async expireOld(): Promise<number> {
    return this.invitationRepo.expireOldInvitations();
  }

  private async sendInvitationEmail(invitation: OrganizationInvitation): Promise<void> {
    const dashboardUrl = await appConfig.getKey('dashboard.url', 'https://admin.j-markets.jcampos.dev') ?? 'https://admin.j-markets.jcampos.dev';
    const inviteUrl = `${dashboardUrl}/join/${invitation.token}`;

    const org = await this.orgRepo.findById(invitation.organizationId);
    const orgName = org?.name ?? "JMarkets";

    await this.emailService.sendEmail({
      to: invitation.email,
      subject: `Invitación para unirte a ${orgName}`,
      htmlBody: generateInvitationEmailHtml(inviteUrl, orgName, 'es'),
      textBody: `Has recibido una invitación para unirte a ${orgName}. Accedé al siguiente enlace para aceptarla: ${inviteUrl}\n\nEsta invitación expira en 7 días.`,
    });
  }
}
