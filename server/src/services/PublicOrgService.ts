import {
  OrganizationRepository,
  ThemeSettingsRepository,
  ContactSettingsRepository,
  PageRepository,
  PageSectionRepository,
  SectionContentRepository,
} from '../repositories';

export class PublicOrgService {
  constructor(
    private organizationRepository: OrganizationRepository,
    private themeSettingsRepository: ThemeSettingsRepository,
    private contactSettingsRepository: ContactSettingsRepository,
    private pageRepository: PageRepository,
    private pageSectionRepository: PageSectionRepository,
    private sectionContentRepository: SectionContentRepository
  ) {}

  async getOrganization(orgId: string) {
    return await this.organizationRepository.findById(orgId);
  }

  async getTheme(orgId: string) {
    return await this.themeSettingsRepository.findByOrganizationId(orgId);
  }

  async getContact(orgId: string) {
    return await this.contactSettingsRepository.findByOrganizationId(orgId);
  }

  async getPages(orgId: string) {
    const orgPages = await this.pageRepository.findByOrganizationId(orgId);

    const pagesWithContent = await Promise.all(
      orgPages.map(async (page) => {
        const sections = await this.pageSectionRepository.findByPageId(page.id);

        const sectionsWithContent = await Promise.all(
          sections.map(async (section) => ({
            ...section,
            content: await this.sectionContentRepository.findBySectionId(section.id),
          }))
        );

        return { ...page, sections: sectionsWithContent };
      })
    );

    return pagesWithContent;
  }

  async getPageBySlug(orgId: string, slug: string) {
    const page = await this.pageRepository.findBySlugAndOrganizationId(slug, orgId);

    if (!page) return null;

    const sections = await this.pageSectionRepository.findByPageId(page.id);

    const sectionsWithContent = await Promise.all(
      sections.map(async (section) => ({
        ...section,
        content: await this.sectionContentRepository.findBySectionId(section.id),
      }))
    );

    return { ...page, sections: sectionsWithContent };
  }
}
