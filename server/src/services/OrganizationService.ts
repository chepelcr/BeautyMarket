import type { Organization, InsertOrganization, OrganizationSettings, InsertContactSettings } from "../entities";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { OrganizationMemberRepository } from "../repositories/OrganizationMemberRepository";
import type { RBACRepository } from "../repositories/RBACRepository";
import type { OrganizationModuleRepository } from "../repositories/OrganizationModuleRepository";
import type { ContactSettingsRepository } from "../repositories/ContactSettingsRepository";
import { DEFAULT_ORG_MODULE_NAMES } from "../seeds/rbac-seed";
import type { TemplateCloneService } from "./TemplateCloneService";
import type { OrganizationEventPublisher } from "./OrganizationEventPublisher";

export interface IOrganizationService {
  getById(id: string): Promise<Organization | null>;
  getBySlug(slug: string): Promise<Organization | null>;
  getBySubdomain(subdomain: string): Promise<Organization | null>;
  getByCustomDomain(customDomain: string): Promise<Organization | null>;
  getAll(): Promise<Organization[]>;
  create(data: InsertOrganization, ownerId: string, contactSettings?: Omit<InsertContactSettings, 'organizationId'>): Promise<Organization>;
  update(id: string, data: Partial<InsertOrganization>): Promise<Organization | null>;
  delete(id: string): Promise<boolean>;
  checkSubdomainAvailable(subdomain: string, excludeId?: string): Promise<boolean>;
  checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
  updateSettings(id: string, settings: OrganizationSettings): Promise<Organization | null>;
  verifyDomain(id: string): Promise<Organization | null>;
  completeOnboardingStep2(id: string, contactSettings: Omit<InsertContactSettings, 'organizationId'>): Promise<Organization | null>;
  completeOnboardingStep3(id: string, templateId: string, includeCategories: boolean): Promise<Organization | null>;
}

export class OrganizationService implements IOrganizationService {
  constructor(
    private organizationRepo: OrganizationRepository,
    private memberRepo: OrganizationMemberRepository,
    private rbacRepo: RBACRepository,
    private orgModuleRepo: OrganizationModuleRepository,
    private contactSettingsRepo: ContactSettingsRepository,
    private templateCloneService: TemplateCloneService,
    private eventPublisher?: OrganizationEventPublisher
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

  async create(data: InsertOrganization, ownerId: string, contactSettings?: Omit<InsertContactSettings, 'organizationId'>): Promise<Organization> {
    const slugAvailable = await this.checkSlugAvailable(data.slug);
    if (!slugAvailable) {
      throw new Error("El slug ya está en uso");
    }

    if (data.subdomain) {
      const subdomainAvailable = await this.checkSubdomainAvailable(data.subdomain);
      if (!subdomainAvailable) {
        throw new Error("El subdominio ya está en uso");
      }
    }

    const organization = await this.organizationRepo.create({
      ...data,
      ownerId,
      onboardingStep: 1
    });

    if (contactSettings) {
      await this.contactSettingsRepo.create({
        ...contactSettings,
        organizationId: organization.id,
      });
    }

    const ownerRole = await this.rbacRepo.findRoleByName("owner", null);
    if (!ownerRole) {
      throw new Error("Role 'owner' not found. Please run RBAC seed.");
    }

    await this.memberRepo.create({
      organizationId: organization.id,
      userId: ownerId,
      roleId: ownerRole.id,
      isDefault: true,
      invitedBy: ownerId,
    });

    // Assign the default module set (RBAC org-module assignment; fire-and-forget —
    // a platform admin can repair via POST /api/admin/organizations/:orgId/modules/apply-defaults)
    try {
      const moduleIds: string[] = [];
      for (const moduleName of DEFAULT_ORG_MODULE_NAMES) {
        const module = await this.rbacRepo.findModuleByName(moduleName);
        if (module) moduleIds.push(module.id);
      }
      await this.orgModuleRepo.insertMissing(organization.id, moduleIds, null);
    } catch (err) {
      console.error('[OrganizationService] Failed to assign default modules:', err);
      // intentionally swallowed — org creation has already succeeded
    }

    // Publish domain event to trigger infrastructure provisioning (fire-and-forget)
    try {
      await this.eventPublisher?.publishOrganizationRegistered({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        domain: organization.customDomain ?? undefined,
        subdomain: organization.subdomain ?? undefined,
      });
    } catch (err) {
      console.error('[OrganizationService] Failed to publish OrganizationRegistered:', err);
      // intentionally swallowed — org creation has already succeeded
    }

    return organization;
  }

  async update(id: string, data: Partial<InsertOrganization>): Promise<Organization | null> {
    if (data.slug) {
      const slugAvailable = await this.checkSlugAvailable(data.slug, id);
      if (!slugAvailable) {
        throw new Error("El slug ya está en uso");
      }
    }

    if (data.subdomain) {
      const subdomainAvailable = await this.checkSubdomainAvailable(data.subdomain, id);
      if (!subdomainAvailable) {
        throw new Error("El subdominio ya está en uso");
      }
    }

    return this.organizationRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    const memberCount = await this.memberRepo.countByOrganization(id);
    if (memberCount > 1) {
      throw new Error("No se puede eliminar una organización con miembros activos");
    }

    return this.organizationRepo.delete(id);
  }

  async checkSubdomainAvailable(subdomain: string, excludeId?: string): Promise<boolean> {
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

  async completeOnboardingStep2(
    id: string,
    contactSettings: Omit<InsertContactSettings, 'organizationId'>
  ): Promise<Organization | null> {
    const org = await this.organizationRepo.findById(id);
    if (!org) return null;

    const existingSettings = await this.contactSettingsRepo.getByOrganizationId(id);
    if (existingSettings) {
      await this.contactSettingsRepo.update(id, contactSettings);
    } else {
      await this.contactSettingsRepo.create({
        ...contactSettings,
        organizationId: id,
      });
    }

    return this.organizationRepo.update(id, { onboardingStep: 2 });
  }

  async completeOnboardingStep3(id: string, templateId: string, includeCategories: boolean): Promise<Organization | null> {
    const org = await this.organizationRepo.findById(id);
    if (!org) return null;

    // Clone template content from template_* tables to organization tables
    await this.templateCloneService.cloneTemplateToExistingOrg({
      templateId,
      targetOrganizationId: id,
      includeCategories
    });

    // Save templateId and mark onboarding complete
    return this.organizationRepo.update(id, { templateId, onboardingStep: 3 });
  }
}
