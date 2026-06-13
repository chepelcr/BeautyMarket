export interface SectionContent {
  id: string;
  sectionId: string;
  key: string;
  value: string;
  valueType: string;
  displayName: string;
  description?: string;
  sortOrder: number;
}

export interface ContentSection {
  [key: string]: SectionContent;
}

export interface PageSection {
  id: string;
  pageId: string;
  sectionType: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  organizationId: string;
  type: string;
  slug: string;
  title: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
