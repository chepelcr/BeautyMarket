import { db } from '../config/database';
import { eq, sql } from 'drizzle-orm';
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
      // 1. Clone theme settings (check if exists, then update or insert)
      const [templateTheme] = await tx
        .select()
        .from(templateThemeSettings)
        .where(eq(templateThemeSettings.templateId, templateId))
        .limit(1);

      if (templateTheme) {
        const [existingTheme] = await tx
          .select()
          .from(themeSettings)
          .where(eq(themeSettings.organizationId, targetOrganizationId))
          .limit(1);

        if (existingTheme) {
          // Update existing theme settings
          await tx
            .update(themeSettings)
            .set({
              primaryColor: templateTheme.primaryColor,
              secondaryColor: templateTheme.secondaryColor,
              logoUrl: templateTheme.logoUrl,
              faviconUrl: templateTheme.faviconUrl,
              fontFamily: templateTheme.fontFamily,
            })
            .where(eq(themeSettings.organizationId, targetOrganizationId));
        } else {
          // Insert new theme settings
          await tx.insert(themeSettings).values({
            organizationId: targetOrganizationId,
            primaryColor: templateTheme.primaryColor,
            secondaryColor: templateTheme.secondaryColor,
            logoUrl: templateTheme.logoUrl,
            faviconUrl: templateTheme.faviconUrl,
            fontFamily: templateTheme.fontFamily,
          });
        }
      }

      // 2. Clone contact settings (check if exists, then update or insert)
      const [templateContact] = await tx
        .select()
        .from(templateContactSettings)
        .where(eq(templateContactSettings.templateId, templateId))
        .limit(1);

      if (templateContact) {
        const [existingContact] = await tx
          .select()
          .from(contactSettings)
          .where(eq(contactSettings.organizationId, targetOrganizationId))
          .limit(1);

        if (existingContact) {
          // Update existing contact settings (ALWAYS preserve user's Step 2 data, only add template social media)
          await tx
            .update(contactSettings)
            .set({
              // Keep user's contact info from Step 2 (predominant)
              email: existingContact.email || templateContact.email,
              phone: existingContact.phone || templateContact.phone,
              address: existingContact.address || templateContact.address,
              // Add template's social media and business hours (user didn't provide these in Step 2)
              facebookUrl: templateContact.facebookUrl,
              instagramUrl: templateContact.instagramUrl,
              twitterUrl: templateContact.twitterUrl,
              whatsappNumber: templateContact.whatsappNumber,
              businessHours: templateContact.businessHours ? JSON.stringify(templateContact.businessHours) : null,
            })
            .where(eq(contactSettings.organizationId, targetOrganizationId));
        } else {
          // Insert new contact settings
          await tx.insert(contactSettings).values({
            organizationId: targetOrganizationId,
            email: templateContact.email,
            phone: templateContact.phone,
            address: templateContact.address,
            facebookUrl: templateContact.facebookUrl,
            instagramUrl: templateContact.instagramUrl,
            twitterUrl: templateContact.twitterUrl,
            whatsappNumber: templateContact.whatsappNumber,
            businessHours: templateContact.businessHours ? JSON.stringify(templateContact.businessHours) : null,
          });
        }
      }

      // 3. Clone payment settings (check if exists, then update or insert)
      const [templatePayment] = await tx
        .select()
        .from(templatePaymentSettings)
        .where(eq(templatePaymentSettings.templateId, templateId))
        .limit(1);

      if (templatePayment) {
        const [existingPayment] = await tx
          .select()
          .from(paymentSettings)
          .where(eq(paymentSettings.organizationId, targetOrganizationId))
          .limit(1);

        if (existingPayment) {
          // Update existing payment settings
          await tx
            .update(paymentSettings)
            .set({
              currency: templatePayment.currency,
              cashOnDeliveryEnabled: templatePayment.cashOnDeliveryEnabled,
              bankTransferEnabled: templatePayment.bankTransferEnabled,
              bankAccountDetails: templatePayment.bankAccountDetails,
            })
            .where(eq(paymentSettings.organizationId, targetOrganizationId));
        } else {
          // Insert new payment settings
          await tx.insert(paymentSettings).values({
            organizationId: targetOrganizationId,
            currency: templatePayment.currency,
            stripeEnabled: false,
            cashOnDeliveryEnabled: templatePayment.cashOnDeliveryEnabled,
            bankTransferEnabled: templatePayment.bankTransferEnabled,
            bankAccountDetails: templatePayment.bankAccountDetails,
          });
        }
      }

      // 4. Clone shipping settings (check if exists, then update or insert)
      const [templateShipping] = await tx
        .select()
        .from(templateShippingSettings)
        .where(eq(templateShippingSettings.templateId, templateId))
        .limit(1);

      if (templateShipping) {
        const [existingShipping] = await tx
          .select()
          .from(shippingSettings)
          .where(eq(shippingSettings.organizationId, targetOrganizationId))
          .limit(1);

        if (existingShipping) {
          // Update existing shipping settings (convert numeric strings to integers)
          await tx
            .update(shippingSettings)
            .set({
              freeShippingThreshold: templateShipping.freeShippingThreshold
                ? parseInt(templateShipping.freeShippingThreshold, 10)
                : null,
              defaultShippingCost: templateShipping.defaultShippingCost
                ? parseInt(templateShipping.defaultShippingCost, 10)
                : null,
              enableLocalPickup: templateShipping.enableLocalPickup,
              enableCorreosShipping: templateShipping.enableCorreosShipping,
              enableUberFlash: templateShipping.enableUberFlash,
            })
            .where(eq(shippingSettings.organizationId, targetOrganizationId));
        } else {
          // Insert new shipping settings (convert numeric strings to integers)
          await tx.insert(shippingSettings).values({
            organizationId: targetOrganizationId,
            freeShippingThreshold: templateShipping.freeShippingThreshold
              ? parseInt(templateShipping.freeShippingThreshold, 10)
              : null,
            defaultShippingCost: templateShipping.defaultShippingCost
              ? parseInt(templateShipping.defaultShippingCost, 10)
              : null,
            enableLocalPickup: templateShipping.enableLocalPickup,
            enableCorreosShipping: templateShipping.enableCorreosShipping,
            enableUberFlash: templateShipping.enableUberFlash,
          });
        }
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
              // Set componentId to null - template components don't exist in target organization
              componentId: null,
              key: content.key,
              value: content.value || '',
              valueType: content.valueType || 'text',
              displayName: content.displayName || content.key,
              description: content.description,
              sortOrder: content.sortOrder ?? 0,
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
            description: templateCategory.description || '',
            backgroundColor: templateCategory.backgroundColor || '#000000',
            buttonColor: templateCategory.buttonColor || '#000000',
            image1Url: templateCategory.image1Url,
            image2Url: templateCategory.image2Url,
            isActive: templateCategory.isActive ?? true,
            sortOrder: templateCategory.sortOrder ?? 0,
          });
        }
      }
    });
  }
}
