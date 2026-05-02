import { anonymousApi, buildQuery } from '@/lib/api';
import type {
  Organization,
  Product,
  ProductListResponse,
  Category,
  ThemeSettings,
  ContactSettings,
} from '@/types';

/**
 * Public storefront API.
 *
 * All calls go to `/api/public/...` with anonymous Cognito guest credentials
 * (see `lib/api.ts`). The backend uses the configured `organizationId` to
 * scope the response to the current store.
 */

function orgBase(organizationId: string): string {
  return `/api/public/organizations/${organizationId}`;
}

export interface PageSectionContentRow {
  key: string;
  value: string;
  valueType: 'string' | 'text' | 'number' | 'json' | 'image_url';
}

export interface PageSectionResponse {
  id: string;
  sectionType: string;
  name: string;
  sortOrder: number;
  content?: PageSectionContentRow[];
}

export interface PageResponse {
  id: string;
  slug: string;
  title: string;
  sections?: PageSectionResponse[];
}

export const storefrontApi = {
  getOrganization: (organizationId: string) =>
    anonymousApi.get<Organization>(orgBase(organizationId)),

  getTheme: (organizationId: string) =>
    anonymousApi.get<ThemeSettings>(`${orgBase(organizationId)}/theme`),

  getContact: (organizationId: string) =>
    anonymousApi.get<ContactSettings>(`${orgBase(organizationId)}/contact`),

  getCategories: (organizationId: string) =>
    anonymousApi.get<Category[]>(`${orgBase(organizationId)}/categories`),

  getProducts: (organizationId: string, filters?: Record<string, unknown>) =>
    anonymousApi.get<ProductListResponse>(
      `${orgBase(organizationId)}/products${buildQuery(filters)}`
    ),

  getProduct: (organizationId: string, productId: string) =>
    anonymousApi.get<Product>(`${orgBase(organizationId)}/products/${productId}`),

  getPage: (organizationId: string, slug: string) =>
    anonymousApi.get<PageResponse>(`${orgBase(organizationId)}/pages/${slug}`),
};
