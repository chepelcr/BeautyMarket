import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import {
  organizations,
  themeSettings,
  contactSettings,
  categoriesTable,
  products,
  pages,
  pageSections,
  sectionContent,
} from '../entities';

export class PublicOrgService {
  constructor(private db: PostgresJsDatabase<any>) {}

  async getOrganization(orgId: string) {
    const [org] = await this.db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    return org;
  }

  async getTheme(orgId: string) {
    const [theme] = await this.db.select().from(themeSettings).where(eq(themeSettings.organizationId, orgId)).limit(1);
    return theme;
  }

  async getContact(orgId: string) {
    const [contact] = await this.db.select().from(contactSettings).where(eq(contactSettings.organizationId, orgId)).limit(1);
    return contact;
  }

  async getCategories(orgId: string) {
    return await this.db.select().from(categoriesTable).where(eq(categoriesTable.organizationId, orgId));
  }

  async getProducts(orgId: string, filters: { isService?: boolean; onSale?: boolean; type?: string }) {
    const conditions = [eq(products.organizationId, orgId)];
    
    if (filters.isService !== undefined) {
      conditions.push(eq(products.isService, filters.isService));
    }
    if (filters.onSale !== undefined) {
      conditions.push(eq(products.onSale, filters.onSale));
    }
    if (filters.type) {
      conditions.push(eq(products.type, filters.type));
    }

    return await this.db.select().from(products).where(and(...conditions));
  }

  async getPages(orgId: string) {
    const orgPages = await this.db
      .select()
      .from(pages)
      .where(eq(pages.organizationId, orgId));

    const pagesWithContent = await Promise.all(
      orgPages.map(async (page) => {
        const sections = await this.db
          .select()
          .from(pageSections)
          .where(eq(pageSections.pageId, page.id));

        const sectionsWithContent = await Promise.all(
          sections.map(async (section) => ({
            ...section,
            content: await this.db
              .select()
              .from(sectionContent)
              .where(eq(sectionContent.sectionId, section.id)),
          }))
        );

        return { ...page, sections: sectionsWithContent };
      })
    );

    return pagesWithContent;
  }

  async getPageBySlug(orgId: string, slug: string) {
    const [page] = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.organizationId, orgId), eq(pages.slug, slug)))
      .limit(1);

    if (!page) return null;

    const sections = await this.db
      .select()
      .from(pageSections)
      .where(eq(pageSections.pageId, page.id));

    const sectionsWithContent = await Promise.all(
      sections.map(async (section) => ({
        ...section,
        content: await this.db
          .select()
          .from(sectionContent)
          .where(eq(sectionContent.sectionId, section.id)),
      }))
    );

    return { ...page, sections: sectionsWithContent };
  }
}
