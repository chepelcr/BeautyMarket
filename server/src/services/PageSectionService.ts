import type { PageSection, InsertPageSection } from '../entities';
import type { PageSectionRepository } from '../repositories/PageSectionRepository';

export class PageSectionService {
  constructor(private pageSectionRepository: PageSectionRepository) {}

  async getById(id: string): Promise<PageSection | undefined> {
    return await this.pageSectionRepository.getById(id);
  }

  async getByPageId(pageId: string): Promise<PageSection[]> {
    return await this.pageSectionRepository.getByPageId(pageId);
  }

  async getActiveByPageId(pageId: string): Promise<PageSection[]> {
    return await this.pageSectionRepository.getActiveByPageId(pageId);
  }

  async create(data: InsertPageSection): Promise<PageSection> {
    return await this.pageSectionRepository.create(data);
  }

  async update(id: string, data: Partial<InsertPageSection>): Promise<PageSection> {
    const updated = await this.pageSectionRepository.update(id, data);
    if (!updated) {
      throw new Error('Section not found');
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return await this.pageSectionRepository.delete(id);
  }
}
