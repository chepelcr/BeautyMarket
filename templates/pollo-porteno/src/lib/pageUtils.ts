import type { PageResponse, PageSectionResponse, PageSectionContentRow } from '@/services/storefrontApi';

export type SectionContent = Record<string, unknown>;

export interface ParsedSection {
  id: string;
  sectionType: string;
  name: string;
  sortOrder: number;
  content: SectionContent;
}

function parseRow(row: PageSectionContentRow): unknown {
  if (row.valueType === 'json' && typeof row.value === 'string') {
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  }
  if (row.valueType === 'number') return Number(row.value);
  return row.value;
}

export function parseSection(section: PageSectionResponse): ParsedSection {
  const content: SectionContent = {};
  if (section.content && Array.isArray(section.content)) {
    for (const row of section.content) {
      content[row.key] = parseRow(row);
    }
  }
  return {
    id: section.id,
    sectionType: section.sectionType,
    name: section.name,
    sortOrder: section.sortOrder,
    content,
  };
}

export function parsePageSections(page?: PageResponse | null): ParsedSection[] {
  if (!page?.sections) return [];
  return page.sections.map(parseSection);
}

export function getSectionContent(sections: ParsedSection[], type: string): SectionContent {
  return sections.find((s) => s.sectionType === type)?.content ?? {};
}
