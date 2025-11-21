import type { OrganizationMember, InsertOrganizationMember, Organization } from "../entities";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { OrganizationMemberRepository, OrganizationMemberWithDetails } from "../repositories/OrganizationMemberRepository";
import type { RBACRepository } from "../repositories/RBACRepository";

export interface IMembershipService {
  getMemberById(id: string): Promise<OrganizationMember | null>;
  getOrganizationMembers(organizationId: string): Promise<OrganizationMemberWithDetails[]>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  getUserMembership(userId: string, organizationId: string): Promise<OrganizationMember | null>;
  getDefaultOrganization(userId: string): Promise<Organization | null>;
  addMember(data: InsertOrganizationMember): Promise<OrganizationMember>;
  updateMemberRole(memberId: string, roleId: string, updatedBy: string): Promise<OrganizationMember | null>;
  removeMember(userId: string, organizationId: string, removedBy: string): Promise<boolean>;
  setDefaultOrganization(userId: string, organizationId: string): Promise<OrganizationMember | null>;
  getMemberCount(organizationId: string): Promise<number>;
}

export class MembershipService implements IMembershipService {
  constructor(
    private memberRepo: OrganizationMemberRepository,
    private organizationRepo: OrganizationRepository,
    private rbacRepo: RBACRepository
  ) {}

  async getMemberById(id: string): Promise<OrganizationMember | null> {
    return this.memberRepo.findById(id);
  }

  async getOrganizationMembers(organizationId: string): Promise<OrganizationMemberWithDetails[]> {
    return this.memberRepo.findByOrganizationId(organizationId);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await this.memberRepo.findByUserId(userId);
    const organizations: Organization[] = [];

    for (const membership of memberships) {
      const org = await this.organizationRepo.findById(membership.organizationId);
      if (org && org.isActive) {
        organizations.push(org);
      }
    }

    return organizations;
  }

  async getUserMembership(userId: string, organizationId: string): Promise<OrganizationMember | null> {
    return this.memberRepo.findByUserAndOrganization(userId, organizationId);
  }

  async getDefaultOrganization(userId: string): Promise<Organization | null> {
    const defaultMembership = await this.memberRepo.findUserDefaultOrganization(userId);
    if (!defaultMembership) {
      // Fall back to first organization
      const memberships = await this.memberRepo.findByUserId(userId);
      if (memberships.length === 0) return null;

      const org = await this.organizationRepo.findById(memberships[0].organizationId);
      return org;
    }

    return this.organizationRepo.findById(defaultMembership.organizationId);
  }

  async addMember(data: InsertOrganizationMember): Promise<OrganizationMember> {
    // Check if user is already a member
    const existing = await this.memberRepo.findByUserAndOrganization(data.userId, data.organizationId);
    if (existing) {
      throw new Error("El usuario ya es miembro de esta organización");
    }

    // Validate role exists
    const role = await this.rbacRepo.findRoleById(data.roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    // Check if this is the user's first organization
    const userMemberships = await this.memberRepo.findByUserId(data.userId);
    const isFirst = userMemberships.length === 0;

    return this.memberRepo.create({
      ...data,
      isDefault: isFirst || data.isDefault,
    });
  }

  async updateMemberRole(memberId: string, roleId: string, updatedBy: string): Promise<OrganizationMember | null> {
    const member = await this.memberRepo.findById(memberId);
    if (!member) {
      throw new Error("Miembro no encontrado");
    }

    // Validate role exists
    const role = await this.rbacRepo.findRoleById(roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    // Check if trying to demote the last owner
    const currentRole = await this.rbacRepo.findRoleById(member.roleId);
    if (currentRole?.name === "owner" && role.name !== "owner") {
      // Count owners in organization
      const members = await this.memberRepo.findByOrganizationId(member.organizationId);
      const ownerCount = members.filter(m => {
        // This is simplified - should check actual role name
        return m.role.name === "owner";
      }).length;

      if (ownerCount <= 1) {
        throw new Error("No se puede cambiar el rol del único propietario");
      }
    }

    return this.memberRepo.updateRole(memberId, roleId);
  }

  async removeMember(userId: string, organizationId: string, removedBy: string): Promise<boolean> {
    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    if (!membership) {
      throw new Error("Miembro no encontrado");
    }

    // Check if trying to remove an owner
    const role = await this.rbacRepo.findRoleById(membership.roleId);
    if (role?.name === "owner") {
      // Count owners in organization
      const members = await this.memberRepo.findByOrganizationId(organizationId);
      const ownerMembers = await Promise.all(
        members.map(async (m) => {
          const r = await this.rbacRepo.findRoleById(m.roleId);
          return r?.name === "owner";
        })
      );
      const ownerCount = ownerMembers.filter(Boolean).length;

      if (ownerCount <= 1) {
        throw new Error("No se puede eliminar al único propietario de la organización");
      }
    }

    // Cannot remove yourself if you're the remover
    if (userId === removedBy && role?.name === "owner") {
      throw new Error("No puedes eliminarte a ti mismo siendo el propietario");
    }

    return this.memberRepo.deleteByUserAndOrganization(userId, organizationId);
  }

  async setDefaultOrganization(userId: string, organizationId: string): Promise<OrganizationMember | null> {
    // Verify membership exists
    const membership = await this.memberRepo.findByUserAndOrganization(userId, organizationId);
    if (!membership) {
      throw new Error("No eres miembro de esta organización");
    }

    return this.memberRepo.setDefault(userId, organizationId);
  }

  async getMemberCount(organizationId: string): Promise<number> {
    return this.memberRepo.countByOrganization(organizationId);
  }
}
