import { db } from '../config/database';
import { pages, type Page, type InsertPage, type PageType } from '../entities';
import { eq, and } from 'drizzle-orm';

export class PageRepository {
  async getAll(): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .orderBy(pages.sortOrder);
  }

  async getById(id: string): Promise<Page | undefined> {
    const [result] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id));
    return result;
  }

  async getByOrganizationId(organizationId: string): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .where(eq(pages.organizationId, organizationId))
      .orderBy(pages.sortOrder);
  }

  async getByOrganizationAndType(
    organizationId: string,
    type: PageType
  ): Promise<Page | undefined> {
    const [result] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.organizationId, organizationId),
          eq(pages.type, type)
        )
      );
    return result;
  }

  async getByOrganizationAndSlug(
    organizationId: string,
    slug: string
  ): Promise<Page | undefined> {
    const [result] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.organizationId, organizationId),
          eq(pages.slug, slug)
        )
      );
    return result;
  }

  async getActiveByOrganization(organizationId: string): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.organizationId, organizationId),
          eq(pages.isActive, true)
        )
      )
      .orderBy(pages.sortOrder);
  }

  async create(data: InsertPage): Promise<Page> {
    const [newPage] = await db
      .insert(pages)
      .values(data)
      .returning();
    return newPage;
  }

  async update(
    id: string,
    data: Partial<InsertPage>
  ): Promise<Page | undefined> {
    const [updatedPage] = await db
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return updatedPage;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(pages)
      .where(eq(pages.id, id))
      .returning();
    return result.length > 0;
  }
}
