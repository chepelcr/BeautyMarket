import { db } from '../config/database';
import { eq } from 'drizzle-orm';
import {
  themeSettings,
  contactSettings,
  paymentSettings,
  shippingSettings,
  pages,
  pageSections,
  sectionContent,
  categoriesTable,
  templateThemeSettings,
  templateContactSettings,
  templatePaymentSettings,
  templateShippingSettings,
  templatePages,
  templatePageSections,
  templateSectionContent,
  templateCategories,
} from '../entities';

export interface CloneToExistingOrgInput {
  templateId: string;
  targetOrganizationId: string;
  includeCategories?: boolean;
}

export class TemplateCloneService {
  async cloneTemplateToExistingOrg(input: CloneToExistingOrgInput): Promise<void> {
    const { templateId, targetOrganizationId, includeCategories = false } = input;

    await db.transaction(async (tx) => {
      // 1. Clone theme settings
      const [templateTheme] = await tx
        .select()
        .from(templateThemeSettings)
        .where(eq(templateThemeSettings.templateId, templateId))
        .limit(1);

      if (templateTheme) {
        await tx.insert(themeSettings).values({
          organizationId: targetOrganizationId,
          primaryColor: templateTheme.primaryColor,
          secondaryColor: templateTheme.secondaryColor,
          logoUrl: templateTheme.logoUrl,
          faviconUrl: templateTheme.faviconUrl,
          fontFamily: templateTheme.fontFamily,
        });
      }

      // 2. Clone contact settings
      const [templateContact] = await tx
        .select()
        .from(templateContactSettings)
        .where(eq(templateContactSettings.templateId, templateId))
        .limit(1);

      if (templateContact) {
        await tx.insert(contactSettings).values({
          organizationId: targetOrganizationId,
          email: templateContact.email,
          phone: templateContact.phone,
          address: templateContact.address,
          facebookUrl: templateContact.facebookUrl,
          instagramUrl: templateContact.instagramUrl,
          twitterUrl: templateContact.twitterUrl,
          whatsappNumber: templateContact.whatsappNumber,
          businessHours: templateContact.businessHours,
        });
      }

      // 3. Clone payment settings
      const [templatePayment] = await tx
        .select()
        .from(templatePaymentSettings)
        .where(eq(templatePaymentSettings.templateId, templateId))
        .limit(1);

      if (templatePayment) {
        await tx.insert(paymentSettings).values({
          organizationId: targetOrganizationId,
          currency: templatePayment.currency,
          stripeEnabled: false,
          cashOnDeliveryEnabled: templatePayment.cashOnDeliveryEnabled,
          bankTransferEnabled: templatePayment.bankTransferEnabled,
          bankAccountDetails: templatePayment.bankAccountDetails,
        });
      }

      // 4. Clone shipping settings
      const [templateShipping] = await tx
        .select()
        .from(templateShippingSettings)
        .where(eq(templateShippingSettings.templateId, templateId))
        .limit(1);

      if (templateShipping) {
        await tx.insert(shippingSettings).values({
          organizationId: targetOrganizationId,
          freeShippingThreshold: templateShipping.freeShippingThreshold,
          defaultShippingCost: templateShipping.defaultShippingCost,
          enableLocalPickup: templateShipping.enableLocalPickup,
          enableCorreosShipping: templateShipping.enableCorreosShipping,
          enableUberFlash: templateShipping.enableUberFlash,
        });
      }

      // 5. Clone pages
      const templatePagesList = await tx
        .select()
        .from(templatePages)
        .where(eq(templatePages.templateId, templateId));

      for (const templatePage of templatePagesList) {
        const [newPage] = await tx.insert(pages).values({
          organizationId: targetOrganizationId,
          templateId: templateId,
          type: templatePage.type,
          slug: templatePage.slug,
          title: templatePage.title,
          metaDescription: templatePage.metaDescription,
          isActive: templatePage.isActive,
          sortOrder: templatePage.sortOrder,
        }).returning();

        // 6. Clone page sections
        const templateSectionsList = await tx
          .select()
          .from(templatePageSections)
          .where(eq(templatePageSections.templatePageId, templatePage.id));

        for (const templateSection of templateSectionsList) {
          const [newSection] = await tx.insert(pageSections).values({
            pageId: newPage.id,
            sectionType: templateSection.sectionType,
            name: templateSection.name,
            sortOrder: templateSection.sortOrder,
            isActive: templateSection.isActive,
          }).returning();

          // 7. Clone section content
          const templateContentList = await tx
            .select()
            .from(templateSectionContent)
            .where(eq(templateSectionContent.templateSectionId, templateSection.id));

          for (const content of templateContentList) {
            await tx.insert(sectionContent).values({
              sectionId: newSection.id,
              componentId: content.componentId,
              key: content.key,
              value: content.value,
              valueType: content.valueType,
              displayName: content.displayName,
              description: content.description,
              sortOrder: content.sortOrder,
            });
          }
        }
      }

      // 8. Clone categories if requested
      if (includeCategories) {
        const templateCategoriesList = await tx
          .select()
          .from(templateCategories)
          .where(eq(templateCategories.templateId, templateId));

        for (const templateCategory of templateCategoriesList) {
          await tx.insert(categoriesTable).values({
            organizationId: targetOrganizationId,
            name: templateCategory.name,
            slug: templateCategory.slug,
            description: templateCategory.description,
            backgroundColor: templateCategory.backgroundColor,
            buttonColor: templateCategory.buttonColor,
            image1Url: templateCategory.image1Url,
            image2Url: templateCategory.image2Url,
            isActive: templateCategory.isActive,
            sortOrder: templateCategory.sortOrder,
          });
        }
      }
    });
  }
}
