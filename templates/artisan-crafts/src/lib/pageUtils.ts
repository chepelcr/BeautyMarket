export interface SectionContent {
  [key: string]: any;
}

export interface PageSection {
  id: string;
  sectionType: string;
  name: string;
  sortOrder: number;
  content: SectionContent;
}

export function parseSectionContent(section: any): PageSection {
  const content: SectionContent = {};
  
  if (section.content && Array.isArray(section.content)) {
    section.content.forEach((item: any) => {
      let value = item.value;
      
      if (item.valueType === 'json' && typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
      } else if (item.valueType === 'number') {
        value = Number(value);
      }
      
      content[item.key] = value;
    });
  }
  
  return {
    id: section.id,
    sectionType: section.sectionType,
    name: section.name,
    sortOrder: section.sortOrder,
    content,
  };
}

export function parsePageSections(page: any): PageSection[] {
  if (!page?.sections) return [];
  return page.sections.map(parseSectionContent);
}

export function getSectionByType(sections: PageSection[], type: string): PageSection | undefined {
  return sections.find(s => s.sectionType === type);
}
