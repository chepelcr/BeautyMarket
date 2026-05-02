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
};
