import { db } from '../config/database';
import { pageSections, type PageSection, type InsertPageSection } from '../entities';
import { eq, and } from 'drizzle-orm';

export class PageSectionRepository {
  async getAll(): Promise<PageSection[]> {
    return await db
      .select()
      .from(pageSections)
      .orderBy(pageSections.sortOrder);
  }

  async getById(id: string): Promise<PageSection | undefined> {
    const [result] = await db
      .select()
      .from(pageSections)
      .where(eq(pageSections.id, id));
    return result;
  }

  async getByPageId(pageId: string): Promise<PageSection[]> {
    return await db
      .select()
      .from(pageSections)
      .where(eq(pageSections.pageId, pageId))
      .orderBy(pageSections.sortOrder);
  }

  async getActiveByPageId(pageId: string): Promise<PageSection[]> {
    return await db
      .select()
      .from(pageSections)
      .where(
        and(
          eq(pageSections.pageId, pageId),
          eq(pageSections.isActive, true)
        )
      )
      .orderBy(pageSections.sortOrder);
  }

  async getBySectionType(
    pageId: string,
    sectionType: string
  ): Promise<PageSection | undefined> {
    const [result] = await db
      .select()
      .from(pageSections)
      .where(
        and(
          eq(pageSections.pageId, pageId),
          eq(pageSections.sectionType, sectionType)
        )
      );
    return result;
  }

  async create(data: InsertPageSection): Promise<PageSection> {
    const [newPageSection] = await db
      .insert(pageSections)
      .values(data)
      .returning();
    return newPageSection;
  }

  async update(
    id: string,
    data: Partial<InsertPageSection>
  ): Promise<PageSection | undefined> {
    const [updatedPageSection] = await db
      .update(pageSections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pageSections.id, id))
      .returning();
    return updatedPageSection;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(pageSections)
      .where(eq(pageSections.id, id))
      .returning();
    return result.length > 0;
  }
}
