import { db } from '../config/database';
import { homePageContent, type HomePageContent } from '../entities';
import type { InsertHomePageContent } from '../models';
import { eq, and } from 'drizzle-orm';
import type { IHomePageContentRepository } from '../types';

export class HomePageContentRepository implements IHomePageContentRepository {
  async getHomePageContent(): Promise<HomePageContent[]> {
    return await db
      .select()
      .from(homePageContent)
      .orderBy(homePageContent.section, homePageContent.sortOrder);
  }

  async getHomePageContentBySection(section: string): Promise<HomePageContent[]> {
    return await db
      .select()
      .from(homePageContent)
      .where(eq(homePageContent.section, section))
      .orderBy(homePageContent.sortOrder);
  }

  async getHomePageContentByKey(
    section: string,
    key: string
  ): Promise<HomePageContent | undefined> {
    const [content] = await db
      .select()
      .from(homePageContent)
      .where(
        and(
          eq(homePageContent.section, section),
          eq(homePageContent.key, key)
        )
      );
    return content;
  }

  async createHomePageContent(content: InsertHomePageContent): Promise<HomePageContent> {
    const [newContent] = await db
      .insert(homePageContent)
      .values(content)
      .returning();
    return newContent;
  }

  async updateHomePageContent(
    id: string,
    content: Partial<InsertHomePageContent>
  ): Promise<HomePageContent | undefined> {
    const [updatedContent] = await db
      .update(homePageContent)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(homePageContent.id, id))
      .returning();
    return updatedContent;
  }

  async bulkUpsertHomePageContent(
    contentList: InsertHomePageContent[]
  ): Promise<HomePageContent[]> {
    const results: HomePageContent[] = [];

    for (const content of contentList) {
      // Check if content exists
      const existing = await this.getHomePageContentByKey(content.section, content.key);

      if (existing) {
        // Update existing content
        const updated = await this.updateHomePageContent(existing.id, content);
        if (updated) results.push(updated);
      } else {
        // Create new content
        const created = await this.createHomePageContent(content);
        results.push(created);
      }
    }

    return results;
  }

  async deleteHomePageContent(id: string): Promise<boolean> {
    const result = await db
      .delete(homePageContent)
      .where(eq(homePageContent.id, id))
      .returning();
    return result.length > 0;
  }
}
