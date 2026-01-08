import type { Page, InsertPage, PageType } from '../entities';
import type { PageRepository } from '../repositories/PageRepository';

export class PageService {
  constructor(private pageRepository: PageRepository) {}

  async getAll(): Promise<Page[]> {
    return await this.pageRepository.getAll();
  }

  async getById(id: string): Promise<Page | undefined> {
    return await this.pageRepository.getById(id);
  }

  async getByOrganizationId(organizationId: string): Promise<Page[]> {
    return await this.pageRepository.getByOrganizationId(organizationId);
  }

  async getByOrganizationAndType(
    organizationId: string,
    type: PageType
  ): Promise<Page | undefined> {
    return await this.pageRepository.getByOrganizationAndType(organizationId, type);
  }

  async getByOrganizationAndSlug(
    organizationId: string,
    slug: string
  ): Promise<Page | undefined> {
    return await this.pageRepository.getByOrganizationAndSlug(organizationId, slug);
  }

  async getActiveByOrganization(organizationId: string): Promise<Page[]> {
    return await this.pageRepository.getActiveByOrganization(organizationId);
  }

  async create(data: InsertPage): Promise<Page> {
    // Validate slug is unique within organization
    const existing = await this.pageRepository.getByOrganizationAndSlug(
      data.organizationId,
      data.slug
    );
    if (existing) {
      throw new Error('Page slug already exists for this organization');
    }

    // Validate page type is unique within organization if it's a system page
    const systemPageTypes: PageType[] = ['home', 'products', 'categories', 'cart', 'checkout'];
    if (systemPageTypes.includes(data.type as PageType)) {
      const existingType = await this.pageRepository.getByOrganizationAndType(
        data.organizationId,
        data.type as PageType
      );
      if (existingType) {
        throw new Error(`A ${data.type} page already exists for this organization`);
      }
    }

    return await this.pageRepository.create(data);
  }

  async update(id: string, data: Partial<InsertPage>): Promise<Page> {
    const existing = await this.pageRepository.getById(id);
    if (!existing) {
      throw new Error('Page not found');
    }

    // If slug is being updated, validate it's unique within organization
    if (data.slug) {
      const existingSlug = await this.pageRepository.getByOrganizationAndSlug(
        existing.organizationId,
        data.slug
      );
      if (existingSlug && existingSlug.id !== id) {
        throw new Error('Page slug already exists for this organization');
      }
    }

    const updated = await this.pageRepository.update(id, data);
    if (!updated) {
      throw new Error('Page not found');
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return await this.pageRepository.delete(id);
  }

  async activate(id: string): Promise<Page> {
    return await this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<Page> {
    return await this.update(id, { isActive: false });
  }

  async findHomePageByOrganization(organizationId: string): Promise<Page | undefined> {
    return await this.pageRepository.getByOrganizationAndType(organizationId, 'home');
  }
}
