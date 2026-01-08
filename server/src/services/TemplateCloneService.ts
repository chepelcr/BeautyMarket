import { db } from '../config/database';
import {
  organizations,
  themeSettings,
  contactSettings,
  paymentSettings,
  shippingSettings,
  pages,
  pageSections,
  sectionContent,
  categoriesTable,
  type Organization,
  type InsertOrganization,
} from '../entities';
import type { OrganizationRepository } from '../repositories/OrganizationRepository';
import type { ThemeSettingsRepository } from '../repositories/ThemeSettingsRepository';
import type { ContactSettingsRepository } from '../repositories/ContactSettingsRepository';
import type { PaymentSettingsRepository } from '../repositories/PaymentSettingsRepository';
import type { ShippingSettingsRepository } from '../repositories/ShippingSettingsRepository';
import type { PageRepository } from '../repositories/PageRepository';
import type { PageSectionRepository } from '../repositories/PageSectionRepository';
import type { SectionContentRepository } from '../repositories/SectionContentRepository';
import type { CategoryRepository } from '../repositories/CategoryRepository';

export interface CloneTemplateInput {
  templateOrganizationId: string;
  newOrgData: InsertOrganization;
  includeCategories?: boolean;
}

export class TemplateCloneService {
  constructor(
    private organizationRepo: OrganizationRepository,
    private themeSettingsRepo: ThemeSettingsRepository,
    private contactSettingsRepo: ContactSettingsRepository,
    private paymentSettingsRepo: PaymentSettingsRepository,
    private shippingSettingsRepo: ShippingSettingsRepository,
    private pageRepo: PageRepository,
    private pageSectionRepo: PageSectionRepository,
    private sectionContentRepo: SectionContentRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async cloneTemplate(input: CloneTemplateInput): Promise<Organization> {
    const { templateOrganizationId, newOrgData, includeCategories = false } = input;

    // Verify template organization exists
    const templateOrg = await this.organizationRepo.findById(templateOrganizationId);
    if (!templateOrg) {
      throw new Error('Template organization not found');
    }

    // Use transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // 1. Create new organization
      const [newOrg] = await tx
        .insert(organizations)
        .values({
          ...newOrgData,
          clonedFromOrganizationId: templateOrganizationId,
        })
        .returning();

      // 2. Clone theme settings
      const templateTheme = await this.themeSettingsRepo.getByOrganizationId(templateOrganizationId);
      if (templateTheme) {
        await tx.insert(themeSettings).values({
          organizationId: newOrg.id,
          primaryColor: templateTheme.primaryColor,
          secondaryColor: templateTheme.secondaryColor,
          logoUrl: templateTheme.logoUrl,
          faviconUrl: templateTheme.faviconUrl,
          fontFamily: templateTheme.fontFamily,
        });
      }

      // 3. Clone contact settings
      const templateContact = await this.contactSettingsRepo.getByOrganizationId(templateOrganizationId);
      if (templateContact) {
        await tx.insert(contactSettings).values({
          organizationId: newOrg.id,
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

      // 4. Clone payment settings
      const templatePayment = await this.paymentSettingsRepo.getByOrganizationId(templateOrganizationId);
      if (templatePayment) {
        await tx.insert(paymentSettings).values({
          organizationId: newOrg.id,
          currency: templatePayment.currency,
          stripeEnabled: false, // Don't copy Stripe credentials
          cashOnDeliveryEnabled: templatePayment.cashOnDeliveryEnabled,
          bankTransferEnabled: templatePayment.bankTransferEnabled,
          bankAccountDetails: templatePayment.bankAccountDetails,
        });
      }

      // 5. Clone shipping settings
      const templateShipping = await this.shippingSettingsRepo.getByOrganizationId(templateOrganizationId);
      if (templateShipping) {
        await tx.insert(shippingSettings).values({
          organizationId: newOrg.id,
          freeShippingThreshold: templateShipping.freeShippingThreshold,
          defaultShippingCost: templateShipping.defaultShippingCost,
          enableLocalPickup: templateShipping.enableLocalPickup,
          enableCorreosShipping: templateShipping.enableCorreosShipping,
          enableUberFlash: templateShipping.enableUberFlash,
        });
      }

      // 6. Clone pages
      const templatePages = await this.pageRepo.getByOrganizationId(templateOrganizationId);
      const pageIdMap = new Map<string, string>(); // Map old page ID to new page ID

      for (const templatePage of templatePages) {
        const [newPage] = await tx.insert(pages).values({
          organizationId: newOrg.id,
          templateId: templatePage.templateId,
          type: templatePage.type,
          slug: templatePage.slug,
          title: templatePage.title,
          metaDescription: templatePage.metaDescription,
          isActive: templatePage.isActive,
          sortOrder: templatePage.sortOrder,
        }).returning();

        pageIdMap.set(templatePage.id, newPage.id);

        // 7. Clone page sections for this page
        const templateSections = await this.pageSectionRepo.getByPageId(templatePage.id);
        const sectionIdMap = new Map<string, string>(); // Map old section ID to new section ID

        for (const templateSection of templateSections) {
          const [newSection] = await tx.insert(pageSections).values({
            pageId: newPage.id,
            sectionType: templateSection.sectionType,
            name: templateSection.name,
            sortOrder: templateSection.sortOrder,
            isActive: templateSection.isActive,
          }).returning();

          sectionIdMap.set(templateSection.id, newSection.id);

          // 8. Clone section content for this section
          const templateContent = await this.sectionContentRepo.getBySectionId(templateSection.id);

          for (const content of templateContent) {
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

      // 9. Clone categories if requested (but NOT products)
      if (includeCategories) {
        const allCategories = await this.categoryRepo.getCategories();
        const templateCategories = allCategories.filter(
          (cat) => cat.organizationId === templateOrganizationId
        );

        for (const templateCategory of templateCategories) {
          await tx.insert(categoriesTable).values({
            organizationId: newOrg.id,
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

      return newOrg;
    });
  }
}
