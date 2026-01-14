import { buildOrgApiUrl, buildPublicApiUrl } from './apiUtils';
import { useSubdomainContext } from '../contexts/SubdomainContext';

/**
 * Fetch template content (demo mode)
 */
async function fetchTemplateContent(templateId: string, endpoint: string, filters?: Record<string, any>) {
  let url = buildPublicApiUrl(`/templates/${templateId}${endpoint}`);
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    url = `${url}?${params.toString()}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch template ${endpoint}`);
  return res.json();
}

/**
 * Fetch organization content (org mode)
 */
async function fetchOrgContent(orgId: string, endpoint: string, filters?: Record<string, any>) {
  let url = buildPublicApiUrl(`/public/organizations/${orgId}${endpoint}`);
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    url = `${url}?${params.toString()}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch org ${endpoint}`);
  return res.json();
}

/**
 * Create API client with mode and id
 */
function createApiClient(mode: string, id: string) {
  return {
    async getTheme() {
      if (mode === 'demo') {
        return fetchTemplateContent(id, '/theme');
      }
      return fetchOrgContent(id, '/theme');
    },

    async getContact() {
      if (mode === 'demo') {
        return fetchTemplateContent(id, '/contact');
      }
      return fetchOrgContent(id, '/contact');
    },

    async getCategories() {
      if (mode === 'demo') {
        return fetchTemplateContent(id, '/categories');
      }
      return fetchOrgContent(id, '/categories');
    },

    async getPages() {
      if (mode === 'demo') {
        return fetchTemplateContent(id, '/pages');
      }
      return fetchOrgContent(id, '/pages');
    },

    async getProducts(filters?: Record<string, any>) {
      if (mode === 'demo') {
        return fetchTemplateContent(id, '/products', filters);
      }
      return fetchOrgContent(id, '/products', filters);
    },

    async getPage(slug: string) {
      if (mode === 'demo') {
        return fetchTemplateContent(id, `/pages/${slug}`);
      }
      return fetchOrgContent(id, `/pages/${slug}`);
    },
  };
}

// Export factory function
export function getApiClient(mode: string, id: string) {
  return createApiClient(mode, id);
}

// Legacy export for backward compatibility
export const api = {
  getTheme: () => { throw new Error('Use getApiClient instead'); },
  getContact: () => { throw new Error('Use getApiClient instead'); },
  getCategories: () => { throw new Error('Use getApiClient instead'); },
  getPages: () => { throw new Error('Use getApiClient instead'); },
  getProducts: () => { throw new Error('Use getApiClient instead'); },
};
