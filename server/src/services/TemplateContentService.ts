import { db } from '../config/database';
import { eq, and } from 'drizzle-orm';
import {
  templateThemeSettings,
  templateContactSettings,
  templatePaymentSettings,
  templateShippingSettings,
  templatePages,
  templatePageSections,
  templateSectionContent,
  templateCategories,
  templateProducts,
} from '../entities';

export class TemplateContentService {
  async getTheme(templateId: string) {
    const [theme] = await db
      .select()
      .from(templateThemeSettings)
      .where(eq(templateThemeSettings.templateId, templateId))
      .limit(1);
    return theme || null;
  }

  async getContact(templateId: string) {
    const [contact] = await db
      .select()
      .from(templateContactSettings)
      .where(eq(templateContactSettings.templateId, templateId))
      .limit(1);
    return contact || null;
  }

  async getPayment(templateId: string) {
    const [payment] = await db
      .select()
      .from(templatePaymentSettings)
      .where(eq(templatePaymentSettings.templateId, templateId))
      .limit(1);
    return payment || null;
  }

  async getShipping(templateId: string) {
    const [shipping] = await db
      .select()
      .from(templateShippingSettings)
      .where(eq(templateShippingSettings.templateId, templateId))
      .limit(1);
    return shipping || null;
  }

  async getPages(templateId: string) {
    return await db
      .select()
      .from(templatePages)
      .where(eq(templatePages.templateId, templateId));
  }

  async getPageWithSections(templateId: string, slug: string) {
    const [page] = await db
      .select()
      .from(templatePages)
      .where(and(
        eq(templatePages.templateId, templateId),
        eq(templatePages.slug, slug)
      ))
      .limit(1);

    if (!page) return null;

    const sections = await db
      .select()
      .from(templatePageSections)
      .where(eq(templatePageSections.templatePageId, page.id));

    const sectionsWithContent = await Promise.all(
      sections.map(async (section) => ({
        ...section,
        content: await this.getSectionContent(section.id),
      }))
    );

    return { ...page, sections: sectionsWithContent };
  }

  async getPageSections(templatePageId: string) {
    return await db
      .select()
      .from(templatePageSections)
      .where(eq(templatePageSections.templatePageId, templatePageId));
  }

  async getSectionContent(templateSectionId: string) {
    return await db
      .select()
      .from(templateSectionContent)
      .where(eq(templateSectionContent.templateSectionId, templateSectionId));
  }

  async getCategories(templateId: string) {
    return await db
      .select()
      .from(templateCategories)
      .where(eq(templateCategories.templateId, templateId));
  }

  async getProducts(templateId: string, filters?: any) {
    const conditions = [eq(templateProducts.templateId, templateId)];
    
    if (filters?.isService !== undefined) {
      conditions.push(eq(templateProducts.isService, filters.isService));
    }
    if (filters?.onSale !== undefined) {
      conditions.push(eq(templateProducts.onSale, filters.onSale));
    }
    if (filters?.type) {
      conditions.push(eq(templateProducts.type, filters.type));
    }

    return await db
      .select()
      .from(templateProducts)
      .where(and(...conditions));
  }

  async getAllContent(templateId: string) {
    const [theme, contact, payment, shipping, pages, categories] = await Promise.all([
      this.getTheme(templateId),
      this.getContact(templateId),
      this.getPayment(templateId),
      this.getShipping(templateId),
      this.getPages(templateId),
      this.getCategories(templateId),
    ]);

    // Fetch sections and content for each page
    const pagesWithContent = await Promise.all(
      pages.map(async (page) => {
        const sections = await this.getPageSections(page.id);
        const sectionsWithContent = await Promise.all(
          sections.map(async (section) => ({
            ...section,
            content: await this.getSectionContent(section.id),
          }))
        );
        return { ...page, sections: sectionsWithContent };
      })
    );

    return {
      theme,
      contact,
      payment,
      shipping,
      pages: pagesWithContent,
      categories,
    };
  }
}
