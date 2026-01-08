import { db } from '../config/database';
import { sectionContent, type SectionContent, type InsertSectionContent } from '../entities';
import { eq, and } from 'drizzle-orm';

export class SectionContentRepository {
  async getAll(): Promise<SectionContent[]> {
    return await db
      .select()
      .from(sectionContent)
      .orderBy(sectionContent.sortOrder);
  }

  async getById(id: string): Promise<SectionContent | undefined> {
    const [result] = await db
      .select()
      .from(sectionContent)
      .where(eq(sectionContent.id, id));
    return result;
  }

  async getBySectionId(sectionId: string): Promise<SectionContent[]> {
    return await db
      .select()
      .from(sectionContent)
      .where(eq(sectionContent.sectionId, sectionId))
      .orderBy(sectionContent.sortOrder);
  }

  async getBySectionIdAndKey(
    sectionId: string,
    key: string
  ): Promise<SectionContent | undefined> {
    const [result] = await db
      .select()
      .from(sectionContent)
      .where(
        and(
          eq(sectionContent.sectionId, sectionId),
          eq(sectionContent.key, key)
        )
      );
    return result;
  }

  async getByComponentId(componentId: string): Promise<SectionContent[]> {
    return await db
      .select()
      .from(sectionContent)
      .where(eq(sectionContent.componentId, componentId))
      .orderBy(sectionContent.sortOrder);
  }

  async create(data: InsertSectionContent): Promise<SectionContent> {
    const [newSectionContent] = await db
      .insert(sectionContent)
      .values(data)
      .returning();
    return newSectionContent;
  }

  async update(
    id: string,
    data: Partial<InsertSectionContent>
  ): Promise<SectionContent | undefined> {
    const [updatedSectionContent] = await db
      .update(sectionContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sectionContent.id, id))
      .returning();
    return updatedSectionContent;
  }

  async bulkUpsertSectionContent(
    contentList: InsertSectionContent[]
  ): Promise<SectionContent[]> {
    const results: SectionContent[] = [];

    for (const content of contentList) {
      // Check if content exists
      const existing = await this.getBySectionIdAndKey(content.sectionId, content.key);

      if (existing) {
        // Update existing content
        const updated = await this.update(existing.id, content);
        if (updated) results.push(updated);
      } else {
        // Create new content
        const created = await this.create(content);
        results.push(created);
      }
    }

    return results;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(sectionContent)
      .where(eq(sectionContent.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteBySectionId(sectionId: string): Promise<boolean> {
    const result = await db
      .delete(sectionContent)
      .where(eq(sectionContent.sectionId, sectionId))
      .returning();
    return result.length > 0;
  }
}
