import type { Organization, InsertOrganization, OrganizationSettings } from "../entities";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { OrganizationMemberRepository } from "../repositories/OrganizationMemberRepository";
import type { RBACRepository } from "../repositories/RBACRepository";

export interface IOrganizationService {
  getById(id: string): Promise<Organization | null>;
  getBySlug(slug: string): Promise<Organization | null>;
  getBySubdomain(subdomain: string): Promise<Organization | null>;
  getByCustomDomain(customDomain: string): Promise<Organization | null>;
  getAll(): Promise<Organization[]>;
  create(data: InsertOrganization, ownerId: string): Promise<Organization>;
  update(id: string, data: Partial<InsertOrganization>): Promise<Organization | null>;
  delete(id: string): Promise<boolean>;
  checkSubdomainAvailable(subdomain: string, excludeId?: string): Promise<boolean>;
  checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
  updateSettings(id: string, settings: OrganizationSettings): Promise<Organization | null>;
  verifyDomain(id: string): Promise<Organization | null>;
}

export class OrganizationService implements IOrganizationService {
  constructor(
    private organizationRepo: OrganizationRepository,
    private memberRepo: OrganizationMemberRepository,
    private rbacRepo: RBACRepository
  ) {}

  async getById(id: string): Promise<Organization | null> {
    return this.organizationRepo.findById(id);
  }

  async getBySlug(slug: string): Promise<Organization | null> {
    return this.organizationRepo.findBySlug(slug);
  }

  async getBySubdomain(subdomain: string): Promise<Organization | null> {
    return this.organizationRepo.findBySubdomain(subdomain);
  }

  async getByCustomDomain(customDomain: string): Promise<Organization | null> {
    return this.organizationRepo.findByCustomDomain(customDomain);
  }

  async getAll(): Promise<Organization[]> {
    return this.organizationRepo.findAll();
  }

  async create(data: InsertOrganization, ownerId: string): Promise<Organization> {
    // Check slug availability
    const slugAvailable = await this.checkSlugAvailable(data.slug);
    if (!slugAvailable) {
      throw new Error("El slug ya está en uso");
    }

    // Check subdomain availability if provided
    if (data.subdomain) {
      const subdomainAvailable = await this.checkSubdomainAvailable(data.subdomain);
      if (!subdomainAvailable) {
        throw new Error("El subdominio ya está en uso");
      }
    }

    // Create organization
    const organization = await this.organizationRepo.create(data);

    // Get owner role
    const ownerRole = await this.rbacRepo.findRoleByName("owner", null);
    if (!ownerRole) {
      throw new Error("Role 'owner' not found. Please run RBAC seed.");
    }

    // Add creator as owner
    await this.memberRepo.create({
      organizationId: organization.id,
      userId: ownerId,
      roleId: ownerRole.id,
      isDefault: true,
      invitedBy: ownerId,
    });

    return organization;
  }

  async update(id: string, data: Partial<InsertOrganization>): Promise<Organization | null> {
    // Check slug availability if updating
    if (data.slug) {
      const slugAvailable = await this.checkSlugAvailable(data.slug, id);
      if (!slugAvailable) {
        throw new Error("El slug ya está en uso");
      }
    }

    // Check subdomain availability if updating
    if (data.subdomain) {
      const subdomainAvailable = await this.checkSubdomainAvailable(data.subdomain, id);
      if (!subdomainAvailable) {
        throw new Error("El subdominio ya está en uso");
      }
    }

    return this.organizationRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    // Check if organization has members (besides owner)
    const memberCount = await this.memberRepo.countByOrganization(id);
    if (memberCount > 1) {
      throw new Error("No se puede eliminar una organización con miembros activos");
    }

    return this.organizationRepo.delete(id);
  }

  async checkSubdomainAvailable(subdomain: string, excludeId?: string): Promise<boolean> {
    // Reserved subdomains
    const reserved = ["www", "app", "api", "admin", "mail", "ftp", "blog", "shop", "store"];
    if (reserved.includes(subdomain.toLowerCase())) {
      return false;
    }

    return this.organizationRepo.checkSubdomainAvailable(subdomain, excludeId);
  }

  async checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    return this.organizationRepo.checkSlugAvailable(slug, excludeId);
  }

  async updateSettings(id: string, settings: OrganizationSettings): Promise<Organization | null> {
    const org = await this.organizationRepo.findById(id);
    if (!org) return null;

    // Merge with existing settings
    const mergedSettings = {
      ...((org.settings as OrganizationSettings) || {}),
      ...settings,
    };

    return this.organizationRepo.update(id, { settings: mergedSettings as any });
  }

  async verifyDomain(id: string): Promise<Organization | null> {
    return this.organizationRepo.verifyDomain(id);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await this.memberRepo.findByUserId(userId);
    const orgs: Organization[] = [];

    for (const membership of memberships) {
      const org = await this.organizationRepo.findById(membership.organizationId);
      if (org) orgs.push(org);
    }

    return orgs;
  }
}
