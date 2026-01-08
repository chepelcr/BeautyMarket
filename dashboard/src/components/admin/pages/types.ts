// Page types
export type PageType = 'home' | 'products' | 'categories' | 'about' | 'contact' | 'cart' | 'checkout';

export interface Page {
  id: string;
  organizationId: string;
  templateId?: string;
  type: PageType;
  slug: string;
  title: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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

// Content value types
export type ValueType = 'text' | 'color' | 'image' | 'boolean' | 'json' | 'background';

export interface SectionContent {
  id: string;
  sectionId: string;
  componentId?: string;
  key: string;
  value: string;
  valueType: ValueType;
  displayName: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Component {
  id: string;
  type: string;
  displayName: string;
  description?: string;
  defaultConfig?: {
    fields: Array<{
      key: string;
      displayName: string;
      description?: string;
      valueType: ValueType;
      defaultValue?: string;
      sortOrder?: number;
    }>;
  };
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form types for creating/updating
export interface CreateSectionInput {
  sectionType: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSectionInput {
  sectionType?: string;
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ContentInput {
  key: string;
  value: string;
  valueType: ValueType;
  displayName: string;
  description?: string;
  componentId?: string;
  sortOrder?: number;
}
