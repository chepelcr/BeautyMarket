import type { SectionContent, InsertSectionContent } from '../entities';
import type { SectionContentRepository } from '../repositories/SectionContentRepository';

export class SectionContentService {
  constructor(private sectionContentRepository: SectionContentRepository) {}

  async getById(id: string): Promise<SectionContent | undefined> {
    return await this.sectionContentRepository.getById(id);
  }

  async getBySectionId(sectionId: string): Promise<SectionContent[]> {
    return await this.sectionContentRepository.getBySectionId(sectionId);
  }

  async create(data: InsertSectionContent): Promise<SectionContent> {
    return await this.sectionContentRepository.create(data);
  }

  async update(id: string, data: Partial<InsertSectionContent>): Promise<SectionContent> {
    const updated = await this.sectionContentRepository.update(id, data);
    if (!updated) {
      throw new Error('Content not found');
    }
    return updated;
  }

  async bulkUpsert(contentList: InsertSectionContent[]): Promise<SectionContent[]> {
    return await this.sectionContentRepository.bulkUpsertSectionContent(contentList);
  }

  async bulkUpsertMultipleSections(
    updates: { sectionId: string; content: Partial<InsertSectionContent>[] }[]
  ): Promise<number> {
    let totalUpdated = 0;

    for (const update of updates) {
      const contentWithSection = update.content.map((item) => ({
        ...item,
        sectionId: update.sectionId,
      } as InsertSectionContent));

      const upserted = await this.bulkUpsert(contentWithSection);
      totalUpdated += upserted.length;
    }

    return totalUpdated;
  }

  async delete(id: string): Promise<boolean> {
    return await this.sectionContentRepository.delete(id);
  }

  async deleteBySectionId(sectionId: string): Promise<boolean> {
    return await this.sectionContentRepository.deleteBySectionId(sectionId);
  }
}
